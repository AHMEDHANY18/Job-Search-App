import multer from 'multer';
import { nanoid } from 'nanoid';

export const multerLocal = () => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads');
        },
        filename: function (req, file, cb) {
            cb(null, nanoid(5) + '-' + file.originalname);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type, only PDFs and images are allowed'), false);
        }
    };

    const upload = multer({ storage, fileFilter });
    return upload;
};
