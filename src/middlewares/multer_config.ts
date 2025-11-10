import { Request} from "express";   
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req: Request, file, cb) => {
        // Aceptar solo imágenes (jpg, jpeg, png)
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'));
        }
    }
});

export const middlewareDeSubida = upload.single('foto');


// --- 2. Configuración para ALMACENAMIENTO LOCAL (DiskStorage) ---
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const disk_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

const upload_local = multer({
    storage: disk_storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req: Request, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

export const middlewareDeSubidaLocal = upload_local.single('foto');
