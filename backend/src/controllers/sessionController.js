import Session from '../models/sessionModel.js';
import { sessionSchema } from '../middlewares/validator.js';
import Auth from '../models/authModel.js'
import Enterprise from '../models/enterpriseModel.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Helper function to process uploaded files and return URLs
const processUploadedFiles = (files, enterpriseName) => {
    const fileUrls = {
        attendanceSheetImage: '',
        actionPhotos: [],
        workingToolsPhotos: []
    };

    // Sanitize enterprise name for URL construction
    const sanitizedEnterpriseName = enterpriseName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    if (files) {
        // Process attendance sheet image (single file)
        if (files.attendanceSheetImage && files.attendanceSheetImage[0]) {
            const file = files.attendanceSheetImage[0];
            fileUrls.attendanceSheetImage = `/uploads/${sanitizedEnterpriseName}/sessions/attendance/${file.filename}`;
        }

        // Process action photos (multiple files)
        if (files.actionPhotos && files.actionPhotos.length > 0) {
            fileUrls.actionPhotos = files.actionPhotos.map(file => 
                `/uploads/${sanitizedEnterpriseName}/sessions/action-photos/${file.filename}`
            );
        }

        // Process working tools photos (multiple files)
        if (files.workingToolsPhotos && files.workingToolsPhotos.length > 0) {
            fileUrls.workingToolsPhotos = files.workingToolsPhotos.map(file => 
                `/uploads/${sanitizedEnterpriseName}/sessions/working-tools/${file.filename}`
            );
        }
    }

    return fileUrls;
};

// Helper function to get all uploaded file paths for cleanup
const getAllUploadedFiles = (files) => {
    const allFiles = [];
    
    if (files.attendanceSheetImage && files.attendanceSheetImage[0]) {
        allFiles.push(files.attendanceSheetImage[0].path);
    }
    
    if (files.actionPhotos) {
        files.actionPhotos.forEach(file => allFiles.push(file.path));
    }
    
    if (files.workingToolsPhotos) {
        files.workingToolsPhotos.forEach(file => allFiles.push(file.path));
    }
    
    return allFiles;
};

// Helper function to delete files from filesystem
const deleteFiles = (filePaths) => {
    filePaths.forEach(filePath => {
        if (filePath && typeof filePath === 'string') {
            // Handle both URL paths and direct file paths
            let fullPath;
            if (filePath.startsWith('/uploads/')) {
                // URL path - convert to file system path
                fullPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
            } else {
                // Direct file path from multer
                fullPath = filePath;
            }
            
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }
    });
};

const allSessions = async (req, res) => {
    try {
        const sessions = await Session.find().populate(
            {
            path: 'enterprise',
            select: 'name'
        });
        res.status(200).json({
            status: true,
            length: sessions.length,
            message: 'Sessions fetched successfully',
            data: {
                sessions
            }
        });
    } catch (error) {
        console.log("All Sessions error", error);
        res.status(404).json({
            status: false,
            error: "Error getting the sessions"
        });
    }
}

const searchSessions = async (req, res) => {
    try {
      const searchTerm = req.query.q;
      
      if (!searchTerm) {
        return res.status(400).json({
          status: 'false',
          error: 'Search query is required'
        });
      }
  
      // Create a regex for case-insensitive search
      const searchRegex = new RegExp(searchTerm, 'i');
      
      // Search in both name and description
      const sessions = await Session.find({
        $or: [
          { name: searchRegex },
        ]
      }).sort({ createdAt: -1 }).populate({
        path: 'user',
        select: 'firstName'
      });
      
      res.status(200).json({
        status: true,
        length: sessions.length,
        message: 'Sessions search completed',
        data: sessions
      });
    } catch (error) {
      console.log("Search Sessions error", error);
      res.status(500).json({
        status: 'false',
        error: "Error searching for sessions"
      });
    }
};

const addSession = async (req, res) => {
    const { enterpriseId, name, objectives, duration, rating, date, outcome, comment } = req.body;
    const userId = req.user.userId;

    try {
        // First validate enterprise exists and get enterprise details
        if (!mongoose.Types.ObjectId.isValid(enterpriseId)) {
            // Delete uploaded files if enterprise ID is invalid
            if (req.files) {
                const allFiles = getAllUploadedFiles(req.files);
                deleteFiles(allFiles);
            }
            return res.status(400).json({ error: 'Invalid enterprise ID format' });
        }

        const checkEnterprise = await Enterprise.findById(enterpriseId);
        if (!checkEnterprise) {
            // Delete uploaded files if enterprise doesn't exist
            if (req.files) {
                const allFiles = getAllUploadedFiles(req.files);
                deleteFiles(allFiles);
            }
            return res.status(404).json({ success: false, error: "Invalid enterprise ID" });
        }

        // Process uploaded files with enterprise name
        const fileUrls = processUploadedFiles(req.files, checkEnterprise.name);

        // Prepare data for validation and saving
        const sessionData = {
            enterpriseId,
            name,
            objectives,
            attendanceSheetImage: fileUrls.attendanceSheetImage,
            duration,
            rating,
            date,
            actionPhotos: fileUrls.actionPhotos,
            workingToolsPhotos: fileUrls.workingToolsPhotos,
            outcome,
            comment
        };

        // Validate the session data
        const { error } = sessionSchema.validate(sessionData);
        if (error) {
            // Delete uploaded files if validation fails
            const allFiles = [
                fileUrls.attendanceSheetImage,
                ...fileUrls.actionPhotos,
                ...fileUrls.workingToolsPhotos
            ].filter(Boolean);
            deleteFiles(allFiles);
            
            return res.status(400).json({ error: error.details[0].message });
        }

        if (await Session.findOne({ name })) {
            // Delete uploaded files if session name already exists
            const allFiles = [
                fileUrls.attendanceSheetImage,
                ...fileUrls.actionPhotos,
                ...fileUrls.workingToolsPhotos
            ].filter(Boolean);
            deleteFiles(allFiles);
            
            return res.status(400).json({ error: 'Session name already exists' });
        }

        const newSession = await Session.create({
            name,
            objectives,
            attendanceSheetImage: fileUrls.attendanceSheetImage,
            duration,
            rating,
            date,
            actionPhotos: fileUrls.actionPhotos,
            workingToolsPhotos: fileUrls.workingToolsPhotos,
            outcome,
            comment,
            enterprise: enterpriseId,
            user: userId
        });

        res.status(201).json({
            status: 'true',
            message: 'Session created successfully',
            data: {
                session: newSession
            }
        });

    } catch (error) {
        console.log("Create Session error", error);
        
        // Delete uploaded files if there's an error
        if (req.files) {
            const allFiles = getAllUploadedFiles(req.files);
            deleteFiles(allFiles);
        }
        
        res.status(400).json({
            status: 'false',
            error: "Error creating the session"
        });
    }
}

const singleSession = async (req, res) => {
    try {
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const session = await Session.findById(id).populate(
            {
            path: 'enterprise',
            select: 'name'
        });
        
        if (!session) {
            return res.status(404).json({
                status: 'false',
                error: "Session not found"
            });
        }
        res.status(200).json({
            status: true,
            message: 'Session fetched successfully',
            data: {
                session
            }
        });
    } catch (error) {
        console.log("Single Session error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the session"
        });
    }
}

const updateSession = async (req, res) => {
    const { enterpriseId, name, objectives, duration, rating, date, outcome, comment } = req.body;
    const userId = req.user.userId;

    try {
        // Get existing session to preserve old images if no new ones are uploaded
        const existingSession = await Session.findById(req.params.id);
        if (!existingSession) {
            if (req.files) {
                const allFiles = getAllUploadedFiles(req.files);
                deleteFiles(allFiles);
            }
            return res.status(404).json({
                status: 'false',
                error: "Session not found"
            });
        }

        // Validate enterprise exists and get enterprise details
        if (!mongoose.Types.ObjectId.isValid(enterpriseId)) {
            if (req.files) {
                const allFiles = getAllUploadedFiles(req.files);
                deleteFiles(allFiles);
            }
            return res.status(400).json({ error: 'Invalid enterprise ID format' });
        }

        const checkEnterprise = await Enterprise.findById(enterpriseId);
        if (!checkEnterprise) {
            if (req.files) {
                const allFiles = getAllUploadedFiles(req.files);
                deleteFiles(allFiles);
            }
            return res.status(404).json({ success: false, error: "Invalid enterprise ID" });
        }

        // Process uploaded files with enterprise name
        const fileUrls = processUploadedFiles(req.files, checkEnterprise.name);

        // Use existing image URLs if no new files are uploaded
        const sessionData = {
            enterpriseId,
            name,
            objectives,
            attendanceSheetImage: fileUrls.attendanceSheetImage || existingSession.attendanceSheetImage,
            duration,
            rating,
            date,
            actionPhotos: fileUrls.actionPhotos.length > 0 ? fileUrls.actionPhotos : existingSession.actionPhotos,
            workingToolsPhotos: fileUrls.workingToolsPhotos.length > 0 ? fileUrls.workingToolsPhotos : existingSession.workingToolsPhotos,
            outcome,
            comment
        };

        const { error } = sessionSchema.validate(sessionData);
        if (error) {
            // Delete new uploaded files if validation fails
            if (req.files) {
                const allFiles = getAllUploadedFiles(req.files);
                deleteFiles(allFiles);
            }
            
            return res.status(400).json({ error: error.details[0].message });
        }

        // Store old file paths for cleanup
        const oldFiles = [];
        if (fileUrls.attendanceSheetImage && existingSession.attendanceSheetImage) {
            oldFiles.push(existingSession.attendanceSheetImage);
        }
        if (fileUrls.actionPhotos.length > 0) {
            oldFiles.push(...existingSession.actionPhotos);
        }
        if (fileUrls.workingToolsPhotos.length > 0) {
            oldFiles.push(...existingSession.workingToolsPhotos);
        }

        const session = await Session.findByIdAndUpdate(
            req.params.id,
            {
                name,
                objectives,
                attendanceSheetImage: sessionData.attendanceSheetImage,
                duration,
                rating,
                date,
                actionPhotos: sessionData.actionPhotos,
                workingToolsPhotos: sessionData.workingToolsPhotos,
                outcome,
                comment,
                enterprise: enterpriseId,
                user: userId
            },
            {
                new: true,
                runValidators: true
            }
        );

        // Delete old files only after successful update
        if (oldFiles.length > 0) {
            deleteFiles(oldFiles);
        }

        res.status(200).json({
            status: 'true',
            message: "Session updated successfully",
            data: {
                session
            }
        });
    } catch (error) {
        console.log("Update Session error", error);
        
        // Delete new uploaded files if there's an error
        if (req.files) {
            const allFiles = getAllUploadedFiles(req.files);
            deleteFiles(allFiles);
        }
        
        res.status(404).json({
            status: 'false',
            error: "Error updating the session"
        });
    }
}

const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        
        if (!session) {
            return res.status(404).json({
                status: 'false',
                error: "Session not found"
            });
        }

        // Collect all file paths for deletion
        const filesToDelete = [
            session.attendanceSheetImage,
            ...session.actionPhotos,
            ...session.workingToolsPhotos
        ].filter(Boolean);

        // Delete the session from database
        await Session.findByIdAndDelete(req.params.id);

        // Delete associated files
        deleteFiles(filesToDelete);

        res.status(204).json({
            status: 'true',
            message: "Session deleted successfully",
            data: null
        });
    } catch (error) {
        console.log("Delete Session error", error);
        res.status(404).json({
            status: 'false',
            error: "Error deleting the session"
        });
    }
}

export { allSessions, addSession, singleSession, updateSession, searchSessions, deleteSession };