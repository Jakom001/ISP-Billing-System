import express from 'express';
import { allSessions, addSession, singleSession, updateSession, searchSessions, deleteSession } 
        from '../controllers/sessionController.js';
import { uploadSessionImages } from '../config/multerConfig.js';


const router = express.Router();

router.get('/all-sessions',  allSessions);

router.post('/add-session',  uploadSessionImages, addSession);

router.get('/single-session/:id',  singleSession);

router.put('/update-session/:id', uploadSessionImages,  updateSession);

router.delete('/delete-session/:id',  deleteSession);
router.get('/search', searchSessions);

export default router;
