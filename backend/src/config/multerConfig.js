// config/multerConfig.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Enterprise from '../models/enterpriseModel.js';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Helper function to sanitize enterprise name for folder creation
const sanitizeEnterpriseName = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Configure storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const enterpriseId = req.body.enterpriseId;
            
            if (!enterpriseId) {
                return cb(new Error('Enterprise ID is required'), null);
            }

            // Get enterprise details
            const enterprise = await Enterprise.findById(enterpriseId);
            if (!enterprise) {
                return cb(new Error('Enterprise not found'), null);
            }

            // Sanitize enterprise name for folder creation
            const sanitizedEnterpriseName = sanitizeEnterpriseName(enterprise.name);
            
            let uploadPath = '';
            
            // Determine upload path based on field name and enterprise
            switch (file.fieldname) {
                case 'attendanceSheetImage':
                    uploadPath = `uploads/${sanitizedEnterpriseName}/sessions/attendance/`;
                    break;
                case 'actionPhotos':
                    uploadPath = `uploads/${sanitizedEnterpriseName}/sessions/action-photos/`;
                    break;
                case 'workingToolsPhotos':
                    uploadPath = `uploads/${sanitizedEnterpriseName}/sessions/working-tools/`;
                    break;
                default:
                    uploadPath = `uploads/${sanitizedEnterpriseName}/sessions/misc/`;
            }
            
            // Ensure directory exists 
            ensureDirectoryExists(uploadPath);
            
            cb(null, uploadPath);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp and random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const baseName = file.fieldname;
        cb(null, baseName + '-' + uniqueSuffix + fileExtension);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 20 // Maximum 20 files total
    }
});

// Configure different upload scenarios
export const uploadSessionImages = upload.fields([
    { name: 'attendanceSheetImage', maxCount: 1 },     // Single image
    { name: 'actionPhotos', maxCount: 10 },            // Multiple images (max 10)
    { name: 'workingToolsPhotos', maxCount: 10 }       // Multiple images (max 10)
]);

export default upload;