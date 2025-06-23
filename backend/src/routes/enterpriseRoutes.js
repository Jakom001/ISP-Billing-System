import express from 'express';
import { allEnterprises, addEnterprise, singleEnterprise, updateEnterprise, searchEnterprises, deleteEnterprise } 
        from '../controllers/enterpriseController.js';

const router = express.Router();

router.get('/all-enterprises',  allEnterprises);

router.post('/add-enterprise',  addEnterprise);

router.get('/single-enterprise/:id',  singleEnterprise);

router.put('/update-enterprise/:id',  updateEnterprise);

router.delete('/delete-enterprise/:id',  deleteEnterprise);
router.get('/search', searchEnterprises);

export default router;
