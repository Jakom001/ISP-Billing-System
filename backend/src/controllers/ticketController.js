import Ticket from "../models/ticketModel.js";
import Auth from "../models/authModel.js";
import mongoose from "mongoose";

import { ticketSchema } from "../middlewares/validator.js";
const allTickets = async (req, res) =>{
    try{
        const tickets = await Ticket.find().sort({createdAt:-1})

        res.status(200).json({
            length: tickets.length,
            success: true,
            message: "Tickets fetched successfully",
            data: {
                tickets
            }

        })
    }catch (error) {
        console.log("Tickets errors", error)
        res.status(404).json({
            error: "Error occurred while fetching users",
            success: false
        })
    }
}

const singleTicket = async (req, res) =>{
    try{
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ error: 'Invalid  ID format' });
        }

        const ticket = await Ticket.findById(id)

        if (!ticket){
            return res.status(404).json({
                success: false,
                error: "Ticket not found"
            })
        }
        res.status(200).json({
            status:true,
            message: "Ticket fetched successfully",
            data: {
                ticket
            }
        });
    }catch (error){
        console.log("Single Ticket Error", error)
        res.status(404).json({
            success:false,
            error: "Error fetching the ticket"
        })
    }
}

const searchTickets = async (req, res) =>{
    try {
        const searchTerm = req.query.q

        if (!searchTerm){
            return res.status(400).json({
                success:false,
                error: "Search query is required"
            })
        }

        const searchRegex = new RegExp(searchTerm, 'i');

        const tickets = await Ticket.find({
            $or: [
                {name: searchRegex},
                {description: searchRegex}
            ]
        }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            length: tickets.length,
            message: "Tickets Search Completed",
            data: {
                tickets
            }
        })
    }catch (error){
        console.log("Search Ticket error", error);
      res.status(500).json({
        status: 'false',
        error: "Error searching for tickets"
      });
    }
}

const addTicket = async (req, res) =>{
    try{
        const {name, type, priority, ticket, assigned, description, userId, status} = req.body

        const {error} = ticketSchema.validate({name, type, status, priority, ticket, assigned, description, userId})
        
        if (error){
            return res.status(400).json({
                success:false,
                error: error.details[0].message
            })
        }

        // ID validations
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        const loginUser = await Auth.findById(userId)
        if(!loginUser) {
            return res.status(404).json({success: false, error: "Invalid login user"})
        }

        const newTicket = await Ticket.create({name, type, status, priority, ticket, assigned, description, user:userId})
        res.status(201).json({
            status: 'true', 
            message: 'Ticket created successfully',
            data: {
                ticket: newTicket
            }
        });
    }catch (error) {
        console.log("Create Ticket error", error);
        res.status(400).json({
            status: 'false',
            error: "Error creating the Ticket"
        });
    }
}

const updateTicket = async (req, res) =>{
    try{
        const {name, type, priority, status, ticket, assigned, description, userId} = req.body

        const {error} = ticketSchema.validate({name, type, priority, ticket, assigned, description, userId})
        
        if (error){
            return res.status(400).json({
                success:false,
                error: error.details[0].message
            })
        }

        // ID validations
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        const loginUser = await Auth.findById(userId)
        if(!loginUser) {
            return res.status(404).json({success: false, error: "Invalid login user"})
        }

        const updateTicket = await Ticket.findByIdAndUpdate(request.params.id,
            {name, type, priority, ticket, assigned, status, description, user:userId},
            {
                new:true,
                runValidators:true
            }
        );

        if(!updateTicket){
            return res.status(404).json({
                success:false,
                error: "Ticket not found"
            })
        }
        res.status(200).json({
            status: 'true', 
            message: 'Ticket updated successfully',
            data: {
                ticket:updateTicket
            }
        });
    }catch (error) {
        console.log("Update Ticket error", error);
        res.status(400).json({
            status: 'false',
            error: "Error updating the Ticket"
        });
    }
}

const deleteTicket = async (req, res) => {
    try {
        const result = await Ticket.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: "Ticket not found"
            });
        }
        res.status(204).json({
            status: 'true', message: "Ticket deleted successfully",
            data: null
        });
    } catch (error) {
        console.log("Delete Ticket erro", error);
        res.status(404).json({
            status: 'false',
            error: "Error deleting the Ticket"
        });
    }
}

export { allTickets, addTicket, singleTicket, updateTicket, searchTickets, deleteTicket };