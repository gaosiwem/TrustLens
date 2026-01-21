/**
 * Checks if an email address belongs to a corporate domain.
 * Rejects common personal email providers.
 */
export const personalDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "me.com",
  "live.com",
  "aol.com",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
  "mail.com",
];

export function isCorporateEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    return false;
  }

  return !personalDomains.includes(domain);
}
