import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per image

export const upload = multer({
    storage: multer.diskStorage({}),
    limits: { fileSize: MAX_FILE_SIZE, files: 4 },
    fileFilter: (req, file, cb) => {
        if (/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) return cb(null, true);
        cb(new Error('Only PNG, JPG, WEBP or GIF images are allowed'));
    },
});
