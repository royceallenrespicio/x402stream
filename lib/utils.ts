import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizePlaintext(text: string): string {
  let cleaned = text.trim();
  
  // 1. Remove markdown code blocks if any (e.g. ```json ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)\n```/g, '$1');
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ''); // strip any remaining
  
  cleaned = cleaned.trim();
  
  // 2. If it still looks like a JSON block (starts with { or [), try to parse it
  if ((cleaned.startsWith('{') && cleaned.endsWith('}')) || (cleaned.startsWith('[') && cleaned.endsWith(']'))) {
    try {
      const parsed = JSON.parse(cleaned);
      if (typeof parsed === 'string') {
        cleaned = parsed;
      } else if (Array.isArray(parsed)) {
        cleaned = parsed.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join('\n');
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Extract values from the object
        const values = Object.values(parsed).map(val => typeof val === 'object' ? JSON.stringify(val) : String(val));
        cleaned = values.join('\n');
      }
    } catch {
      // Keep original string if parsing fails
    }
  }

  // 3. Remove quotes around the whole string
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  
  return cleaned.trim();
}
