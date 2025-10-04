import { collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, query, where, arrayUnion, arrayRemove, writeBatch, serverTimestamp, runTransaction } from 'firebase/firestore';
import { getFirebase } from '@/firebase';
import { isOnlyEmojis } from "./utils";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  emojiAvatar?: string;
  following: string[]; // array of user ids
};

export type Badge = {
  id: string;
  name: string;
  emojis: string;
  tokens: number;
  ownerId: string; 
  owners: string[]; 
  followers: string[];
  createdAt: number;
};

export type ShareLink = {
    linkId: string;
    badgeId: string;
    ownerId: string; 
    used: boolean;
    claimedBy: string | null;
};

export type Notification = {
    id: string;
    userId: string; 
    type: 'BADGE_REQUEST' | 'BADGE_RECEIVED';
    fromUserId: string; 
    badgeId: string;
    createdAt: number;
    read: boolean;
};

// --- Data Access Functions ---

export const getBadgeById = async (id: string): Promise<Badge | undefined> => {
    const { firestore } = getFirebase();
    const docRef = doc(firestore, 'badges', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Badge;
    }
    return undefined;
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    const { firestore } = getFirebase();
    const docRef = doc(firestore, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return undefined;
};


// --- Data Mutation Functions ---

export const createBadge = async (data: Omit<Badge, 'id' | 'ownerId' | 'owners' | 'followers' | 'createdAt'>, creatorId: string): Promise<{newBadge: Badge, initialLinks: ShareLink[]}> => {
  if (!isOnlyEmojis(data.emojis)) {
    throw new Error('Please use only emojis for the badge.');
  }

  const { firestore } = getFirebase();
  
  const badgesRef = collection(firestore, 'badges');
  const nameQuery = query(badgesRef, where("name", "==", data.name.trim()));
  const emojiQuery = query(badgesRef, where("emojis", "==", data.emojis));

  const nameSnapshot = await getDocs(nameQuery);
  if (!nameSnapshot.empty) {
      throw new Error('A badge with this name already exists.');
  }

  const emojiSnapshot = await getDocs(emojiQuery);
  if (!emojiSnapshot.empty) {
      throw new Error('A badge with these emojis already exists.');
  }

  const newBadgeRef = doc(collection(firestore, "badges"));
  
  const newBadge: Omit<Badge, 'id'> = {
    ...data,
    ownerId: creatorId,
    owners: [creatorId],
    followers: [],
    createdAt: Date.now(),
  };

  setDoc(newBadgeRef, newBadge).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: newBadgeRef.path,
      operation: 'create',
      requestResourceData: newBadge,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
  
  const createdBadge = { id: newBadgeRef.id, ...newBadge };
  const initialLinks = await createShareLinks(createdBadge.id, creatorId, 5);

  return { newBadge: createdBadge, initialLinks };
};

export const followBadge = async (badgeId: string, userId: string) => {
    const { firestore } = getFirebase();
    const badgeRef = doc(firestore, 'badges', badgeId);
    const badge = await getDoc(badgeRef);
    const isFollowing = badge.data()?.followers.includes(userId);

    const operation = isFollowing ? 'update' : 'create';
    const payload = { followers: isFollowing ? arrayRemove(userId) : arrayUnion(userId) };

    updateDoc(badgeRef, payload).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: badgeRef.path,
          operation,
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

export const toggleFollowUser = async (currentUserId: string, targetUserId: string) => {
    if (currentUserId === targetUserId) throw new Error("You cannot follow yourself.");
    const { firestore } = getFirebase();
    const userRef = doc(firestore, 'users', currentUserId);
    const userDoc = await getDoc(userRef);
    const isFollowing = userDoc.data()?.following.includes(targetUserId);

    const operation = isFollowing ? 'update' : 'create';
    const payload = { following: isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId) };

    updateDoc(userRef, payload).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation,
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

export const claimBadge = async (badgeId: string, userId: string, linkId: string): Promise<{ badge: Badge, newLinks: ShareLink[] }> => {
    const { firestore } = getFirebase();

    return runTransaction(firestore, async (transaction) => {
        const badgeRef = doc(firestore, 'badges', badgeId);
        const linkRef = doc(firestore, 'shareLinks', linkId);

        const badgeDoc = await transaction.get(badgeRef);
        const linkDoc = await transaction.get(linkRef);

        if (!badgeDoc.exists()) throw new Error('Badge not found');
        if (!linkDoc.exists() || linkDoc.data().used) throw new Error('This invitation code is invalid or has already been used.');
        
        const badge = { id: badgeDoc.id, ...badgeDoc.data() } as Badge;
        const link = { linkId: linkDoc.id, ...linkDoc.data() } as ShareLink;

        if (badge.owners.length >= badge.tokens) throw new Error('No badges left to claim');
        if (badge.owners.includes(userId)) throw new Error('User already owns this badge');
        if (link.ownerId === userId) throw new Error("You cannot use a code you generated yourself.");

        // Update badge and link within the transaction
        transaction.update(badgeRef, { owners: arrayUnion(userId) });
        transaction.update(linkRef, { used: true, claimedBy: userId });

        // Notifications and new link generation are done outside the transaction for simplicity,
        // but could be included for stronger consistency if needed.
        
        const newBadgeState = { ...badge, owners: [...badge.owners, userId] };
        
        // After transaction succeeds, create notification
        await createNotification({
            userId: userId,
            type: 'BADGE_RECEIVED',
            fromUserId: link.ownerId,
            badgeId: badgeId,
        });

        const newLinks = await createShareLinks(badgeId, userId, 3);
        
        return { badge: newBadgeState, newLinks };
    });
}


export const transferBadgeOwnership = async (badgeId: string, currentOwnerId: string, newOwnerId: string) => {
    const { firestore } = getFirebase();
    const badgeRef = doc(firestore, 'badges', badgeId);
    
    const payload = { ownerId: newOwnerId };

    updateDoc(badgeRef, payload).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: badgeRef.path,
          operation: 'update',
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

export const updateUserAvatar = async (userId: string, emoji: string) => {
    const { firestore } = getFirebase();
    const userRef = doc(firestore, 'users', userId);
    
    if (!isOnlyEmojis(emoji)) {
        throw new Error("Invalid emoji provided.");
    }
    const firstEmoji = [...emoji][0];
    
    const payload = { emojiAvatar: firstEmoji };

    updateDoc(userRef, payload).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}


// --- Share Link Simulation ---

export const createShareLinks = async (badgeId: string, ownerId: string, count: number): Promise<ShareLink[]> => {
    const { firestore } = getFirebase();
    const badge = await getBadgeById(badgeId);
    if (!badge) throw new Error("Badge not found");

    const linksColRef = collection(firestore, 'shareLinks');
    
    const newLinks: ShareLink[] = [];
    const batch = writeBatch(firestore);

    for (let i = 0; i < count; i++) {
        const linksQuery = query(linksColRef, where('badgeId', '==', badgeId), where('used', '==', false));
        const existingLinksSnap = await getDocs(linksQuery);
        const existingLinksCount = existingLinksSnap.size;

        const availableTokens = badge.tokens - badge.owners.length - existingLinksCount;
        if (availableTokens <= 0) break; 

        const newLinkRef = doc(collection(firestore, "shareLinks"));
        
        const newLinkData: Omit<ShareLink, 'linkId'> = {
            badgeId: badgeId,
            ownerId: ownerId,
            used: false,
            claimedBy: null,
        };

        batch.set(newLinkRef, newLinkData);
        newLinks.push({ linkId: newLinkRef.id, ...newLinkData });
    }
    
    await batch.commit();
    return newLinks;
}

export const getShareLink = async (linkId: string): Promise<ShareLink | undefined> => {
    const { firestore } = getFirebase();
    const docRef = doc(firestore, 'shareLinks', linkId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { linkId: docSnap.id, ...docSnap.data() } as ShareLink;
    }
    return undefined;
}

export const getShareLinksForUser = async (badgeId: string, userId: string): Promise<ShareLink[]> => {
    const { firestore } = getFirebase();
    const q = query(
        collection(firestore, 'shareLinks'), 
        where('badgeId', '==', badgeId), 
        where('ownerId', '==', userId), 
        where('used', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ linkId: doc.id, ...doc.data() } as ShareLink));
}

// --- Notification System ---

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
    const { firestore } = getFirebase();
    const notifRef = doc(firestore, `users/${userId}/notifications`, notificationId);
    updateDoc(notifRef, { read: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: notifRef.path,
          operation: 'update',
          requestResourceData: { read: true },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

export const createNotification = async (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const { firestore } = getFirebase();
    const notifRef = doc(collection(firestore, `users/${data.userId}/notifications`));
    const newNotif = {
        ...data,
        createdAt: Date.now(),
        read: false,
    };
    setDoc(notifRef, newNotif).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: notifRef.path,
          operation: 'create',
          requestResourceData: newNotif,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

export const requestBadgeCode = async (badgeId: string, fromUserId: string) => {
    const badge = await getBadgeById(badgeId);
    if (!badge) throw new Error("Badge not found.");

    // Create a notification for each owner of the badge
    const promises = badge.owners.map(ownerId => {
        if (ownerId === fromUserId) return; // Don't notify the person who made the request
        return createNotification({
            userId: ownerId,
            type: 'BADGE_REQUEST',
            fromUserId: fromUserId,
            badgeId: badgeId,
        });
    });

    await Promise.all(promises);
    return { success: true };
}
