import Trainee from '../models/traineeModel.js';
import { traineeSchema } from '../middlewares/validator.js';
import Auth from '../models/authModel.js'
import Enterprise from '../models/enterpriseModel.js';
import mongoose from 'mongoose';

const allTrainees = async (req, res) => {
    try {
        const trainees = await Trainee.find().sort({createdAt:-1}).populate(
            {
            path: 'enterprise',
            select: 'name'
        });
        res.status(200).json({
            status: true,
            length: trainees.length,
            message: 'Participants fetched successfully',
            data: {
                trainees
            }
        });
    } catch (error) {
        console.log("All Trainees error", error);
        res.status(404).json({
            status: false,
            error: "Error getting the participants"
        });
    }
}

const searchTrainees = async (req, res) => {
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
      const trainees = await Trainee.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { phone: searchRegex }
        ]
      }).sort({ createdAt: -1 }).populate({
        path: 'enterprise',
        select: 'name'
      });
      
      res.status(200).json({
        status: true,
        length: trainees.length,
        message: 'Participants search completed',
        data: trainees
      });
    } catch (error) {
      console.log("Search Participants error", error);
      res.status(500).json({
        status: 'false',
        error: "Error searching for participants"
      });
    }
  };


const addTrainee = async (req, res) => {
    const {firstName,lastName,email,phone,position,gender,ageBracket,enterpriseId} = req.body
    const userId = req.user.userId;

    try {
        const { error } = traineeSchema.validate({firstName,lastName,email,phone,position,gender,ageBracket,enterpriseId});
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        
        if (!mongoose.Types.ObjectId.isValid(enterpriseId)) {
            return res.status(400).json({ error: 'Invalid enterprise ID format' });
        }

        if (await Trainee.findOne({email})) {
            return res.status(400).json({ error: 'Participant already exists' });
        }
        
        const checkEnterprise = await Enterprise.findById(enterpriseId);

        if (!checkEnterprise){
            return res.status(404).json({success:false, error: "invalid enterprise Id"})
        }

        const newTrainee = await Trainee.create({firstName,lastName,email,phone,position,gender,ageBracket, enterprise: enterpriseId, user:userId});
        res.status(201).json({
            status: 'true', 
            message: 'Participant created successfully',
            data: {
                trainee: newTrainee
            }
        });

    } catch (error) {
        console.log("Create Trainee error", error);
        res.status(400).json({
            status: 'false',
            error: "Error creating the trainee"
        });
    }
}

const singleTrainee = async (req, res) => {
    try {
        const id  = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid  ID format' });
        }
        const trainee = await Trainee.findById(id).populate(
            {
            path: 'enterprise',
            select: 'name'
        });
        
        if (!trainee) {
            return res.status(404).json({
                status: 'false',
                error: "Participant not found"
            });
        }
        res.status(200).json({
            status: true,
            message: 'Participant fetched successfully',
            data: {
                trainee
            }
        });
    } catch (error) {
        console.log("Single Trainee error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the trainee"
        });
    }
}

const updateTrainee = async (req, res) => {
    const { firstName,lastName,email,phone,position,gender,ageBracket,enterpriseId} = req.body;
    const userId = req.user.userId;

    try {
        const { error } = traineeSchema.validate({ firstName,lastName,email,phone,position,gender,ageBracket,enterpriseId});
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
       
        if (!mongoose.Types.ObjectId.isValid(enterpriseId)) {
            return res.status(400).json({ error: 'Invalid enterprise ID format' });
        }

       
        const checkEnterprise = await Enterprise.findById(enterpriseId);

        if (!checkEnterprise){
            return res.status(404).json({success:false, error: "invalid enterprise Id"})
        }

        const trainee = await Trainee.findByIdAndUpdate(req.params
            .id, {firstName,lastName,email,phone,position,gender,ageBracket, enterprise:enterpriseId, user: userId}, {
                new: true,
                runValidators: true
            });
        
            if (!trainee) {
            return res.status(404).json({
                status: 'false',
                error: "Participant not found"
            });
        }
        res.status(200).json({
            status: 'true', 
            message: "Participant updated successfully",
            data: {
                trainee
            }
        });
    }
    catch (error) {
        console.log("Update Trainee error", error);
        res.status(404).json({
            status: 'false',
            error: "Error updating the Participant"
        });
    }
}

const deleteTrainee = async (req, res) => {
    try {
        const result = await Trainee.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                status: 'false',
                error: "Trainee not found"
            });
        }
        res.status(204).json({
            status: 'true', message: "Participant deleted successfully",
            data: null
        });
    } catch (error) {
        console.log("Delete Trainee erro", error);
        res.status(404).json({
            status: 'false',
            error: "Error deleting the participant"
        });
    }
}

export { allTrainees, addTrainee, singleTrainee, updateTrainee, searchTrainees, deleteTrainee };