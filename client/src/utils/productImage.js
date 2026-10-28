import { PLACEHOLDER_IMAGE } from "./placeholder";

// Sample images that ship with the app (client/src/assets). Vite bundles them and gives us their URLs.
const bundled = import.meta.glob("../assets/*.{png,jpg,jpeg,webp,svg}", { eager: true, query: "?url", import: "default" });
const byFileName = new Map(Object.entries(bundled).map(([path, url]) => [path.split("/").pop().toLowerCase(), url]));

/**
 * Turns whatever is stored in a product's `image` field into a URL the browser can load.
 *  - real URL (Cloudinary etc.)           -> used as is
 *  - bare file name / old local path      -> matched to the bundled sample image
 *    ("potato_image_1.png", "/src/assets/potato_image_1.png", "/assets/potato_image_1-Ab3dE9xZ.png")
 *  - anything else (objects, empty, junk) -> placeholder
 */
export const resolveImage = (value) => {
    if (typeof value !== "string" || !value.trim()) return PLACEHOLDER_IMAGE;
    const raw = value.trim();

    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;

    const file = raw.split(/[?#]/)[0].split(/[\\/]/).pop().toLowerCase();
    if (byFileName.has(file)) return byFileName.get(file);

    // Vite adds a content hash in production builds: name-AbCd1234.png
    const unhashed = file.replace(/-[a-z0-9_-]{6,12}(\.[a-z0-9]+)$/i, "$1");
    if (byFileName.has(unhashed)) return byFileName.get(unhashed);

    return PLACEHOLDER_IMAGE;
};
