import express from 'express';
import { allTickets, addTicket, singleTicket, updateTicket, searchTickets, deleteTicket } 
        from '../controllers/ticketController.js';

const router = express.Router();

router.get('/all-tickets',  allTickets);

router.post('/add-ticket',  addTicket);

router.get('/single-ticket/:id',  singleTicket);

router.put('/update-ticket/:id',  updateTicket);

router.delete('/delete-ticket/:id',  deleteTicket);
router.get('/search', searchTickets);

export default router;
