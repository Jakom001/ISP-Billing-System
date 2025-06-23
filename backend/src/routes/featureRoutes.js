import express from 'express';
import { allFeatures,allAdminFeatures, addFeature, singleFeature, updateFeature, searchFeatures, deleteFeature } 
        from '../controllers/featureController.js';
import { checkRole } from '../middlewares/authenticateUser.js';
const router = express.Router();

router.get('/all-features',  allFeatures);
router.get('/all-proposed-features',  allAdminFeatures);

router.post('/add-feature',  addFeature);

router.get('/single-feature/:id',  singleFeature);

router.put('/update-feature/:id',  updateFeature);

router.delete('/delete-feature/:id',  deleteFeature);

router.get('/search', checkRole('admin'), searchFeatures);

export default router;
