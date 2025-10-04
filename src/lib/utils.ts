import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFirstEmoji(emojiString: string) {
  if (!emojiString) return '';
  // Use spread syntax to handle multi-character emojis
  const emojiArray = [...emojiString];
  return emojiArray[0] || '';
}

export function isOnlyEmojis(str: string) {
  if (!str) return false;
  // This regex checks for most common emoji presentations.
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\s)+$/u;
  return emojiRegex.test(str);
}
