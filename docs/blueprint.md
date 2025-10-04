# **App Name**: EmojiBadge

## Core Features:

- User Authentication: Secure sign-up and login system using email/phone and password.
- Badge Creation: Allow users to create unique badges using multiple emojis, a badge name, and a token amount.
- Badge Sharing: Generate three unique shareable links with QR codes for each badge to allow others to join, works only once.
- Badge Joining: Enable users to join badges using a share link and a secret code, adding them as followers.
- Token Transfer: Allow badge owners to transfer a badge to another user using their user ID and a secret code.
- Token Increase Voting: Implement a voting system for badge creators to request a token increase, limited to 9% per badge once.
- Trending badge discovery: The LLM should be used as a tool to analyze badge join metrics to discover the trending badges that have been shared the most times.

## Style Guidelines:

- Primary color: Light indigo (#7986CB) for a clean, modern feel.
- Background color: Very light gray (#F5F5F5) to provide a soft backdrop and make emojis pop.
- Accent color: Soft orange (#FFB74D) for interactive elements like buttons and share links.
- Font pairing: 'Poppins' (sans-serif) for headlines and 'PT Sans' (sans-serif) for body text. 'Poppins' provides a modern look, while 'PT Sans' offers better readability for longer text.
- Use minimalist, flat icons for navigation and actions. Ensure icons are distinct and easily recognizable.
- Design a responsive layout adapting to both mobile and PC, with a bottom navigation bar on mobile and a sidebar menu on PC. Maximize emoji visibility in badge displays.
- Incorporate subtle transitions and animations to enhance user engagement. Animate the appearance of badges in the feed and the confirmation of actions (e.g., joining, voting).