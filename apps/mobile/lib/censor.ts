// Redacts any private contact information that users should not exchange
// directly — all communication must stay in-platform.

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const URL_RE = /https?:\/\/\S+|www\.\S+/gi;
// Phone: optional country code + at least 7 digits allowing spaces, dashes, dots, parens
const PHONE_RE = /(\+?[\d][\d\s\-().]{6,}\d)/g;
// Bare social handles like @username (but not email addresses already caught above)
const HANDLE_RE = /(?<!\S)@[\w.]+/g;

const REPLACEMENTS = {
  email: "[\u00e9mail supprimé]",
  url: "[lien supprimé]",
  phone: "[numéro supprimé]",
  handle: "[contact supprimé]",
} as const;

export function censorMessage(text: string): string {
  return text
    .replace(EMAIL_RE, REPLACEMENTS.email)
    .replace(URL_RE, REPLACEMENTS.url)
    .replace(PHONE_RE, REPLACEMENTS.phone)
    .replace(HANDLE_RE, REPLACEMENTS.handle);
}

// Returns true if the original text was modified (i.e. contained censored content).
export function hasCensoredContent(original: string, censored: string): boolean {
  return original !== censored;
}
