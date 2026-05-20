const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const URL_RE = /https?:\/\/\S+|www\.\S+/gi;
const PHONE_RE = /(\+?\d[\d\s().-]{6,}\d)/g;
const HANDLE_RE = /(?<!\S)@[\w.]+/g;

const REPLACEMENTS = {
  email: "[email supprimé]",
  url: "[lien supprimé]",
  phone: "[numéro supprimé]",
  handle: "[contact supprimé]",
} as const;

export function censorMessage(text: string): string {
  return text
    .replaceAll(EMAIL_RE, REPLACEMENTS.email)
    .replaceAll(URL_RE, REPLACEMENTS.url)
    .replaceAll(PHONE_RE, REPLACEMENTS.phone)
    .replaceAll(HANDLE_RE, REPLACEMENTS.handle);
}
