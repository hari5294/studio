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
