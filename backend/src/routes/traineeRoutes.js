import express from 'express';
import { allTrainees, addTrainee, singleTrainee, updateTrainee, searchTrainees, deleteTrainee } 
        from '../controllers/traineeController.js';

const router = express.Router();

router.get('/all-trainees',  allTrainees);

router.post('/add-trainee',  addTrainee);

router.get('/single-trainee/:id',  singleTrainee);

router.put('/update-trainee/:id',  updateTrainee);

router.delete('/delete-trainee/:id',  deleteTrainee);
router.get('/search', searchTrainees);

export default router;
