// Shown when a product image URL is missing or fails to load (inline SVG: no extra request)
export const PLACEHOLDER_IMAGE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#e8f7f0"/><g fill="none" stroke="#4fbf8b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M100 150c-30-10-45-40-35-75 25 0 45 15 50 40"/><path d="M100 150c30-10 45-40 35-75-25 0-45 15-50 40"/><path d="M100 150V95"/></g></svg>`
    );

// onError handler: swap in the placeholder once (no infinite loop)
export const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = PLACEHOLDER_IMAGE;
};
