import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/profile");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = /jpeg|jpg|png|webp/;

    const isValid =
        allowedTypes.test(file.mimetype) &&
        allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (isValid) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter
});

export default upload;
