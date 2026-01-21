export const isPersonalEmail = (email: string): boolean => {
  const personalDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "me.com",
    "live.com",
    "mail.com",
    "aol.com",
    "protonmail.com",
    "zoho.com",
    "yandex.com",
    "gmx.com",
    "hubspot.com", // Often used for testing but treated as catch-all
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return personalDomains.includes(domain);
};
