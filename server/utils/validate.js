// Small validation helpers (no extra dependency needed)
export const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;
export const ZIP_REGEX = /^[A-Za-z0-9\- ]{3,10}$/;

export const isObjectId = (value) => typeof value === 'string' && OBJECT_ID_REGEX.test(value);

// Returns a trimmed string, or '' if the value is not a string
export const str = (value) => (typeof value === 'string' ? value.trim() : '');
