import Enterprise from '../models/enterpriseModel.js';
import { enterpriseSchema } from '../middlewares/validator.js';
import mongoose from 'mongoose'
const allEnterprises = async (req, res) => {
    try {
        const enterprises = await Enterprise.find().sort({createdAt:-1})
        res.status(200).json({
            status: 'true',
            length: enterprises.length,
            message: 'Enterprises fetched successfully',
            data: {
                enterprises
            }
        });
    } catch (error) {
        console.log("All Enterprises error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the enterprises"
        });
    }
}

const searchEnterprises = async (req, res) => {
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
      const enterprises = await Enterprise.find({
        $or: [
          { name: searchRegex },
          { phone: searchRegex },
          { email: searchRegex }
        ]
      }).sort({ createdAt: -1 })
      
      res.status(200).json({
        status: 'true',
        length: enterprises.length,
        message: 'Enterprises search completed',
        data: enterprises
      });
    } catch (error) {
      console.log("Search Enterprises error", error);
      res.status(500).json({
        status: 'false',
        error: "Error searching for enterprises"
      });
    }
  };
const singleEnterprise = async (req, res) => {
    try {
        const id  = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid  ID format' });
        }
        const enterprise = await Enterprise.findById(id);
        
        if (!enterprise) {
            return res.status(404).json({
                status: 'false',
                error: "Enterprise not found"
            });
        }
        res.status(200).json({
            status: 'true',
            message: 'Enterprise fetched successfully',
            data: {
                enterprise
            }
        });
    } catch (error) {
        console.log("Single Enterprise error", error);
        res.status(404).json({
            status: 'false',
            error: "Error getting the enterprise"
        });
    }
}

const addEnterprise = async (req, res) => {
    const {name, address, industry, website, noStaff, yearsExistence, phone, email, city} = req.body
    const userId = req.user.userId;

    
    try {
        const { error } = enterpriseSchema.validate({name, address, industry, website, noStaff, yearsExistence, phone, email, city});
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        
        if (await Enterprise.findOne({name })) {
            return res.status(400).json({ error: 'Enterprise name already exists' });
        }
        
        
        const newEnterprise = await Enterprise.create({name, address, industry, website, noStaff, yearsExistence, phone, email, city, user:userId});
        res.status(201).json({
            status: 'true', 
            message: 'Enterprise created successfully',
            data: {
                enterprise: newEnterprise
            }
        });
    } catch (error) {
        console.log("Create Enterprise error", error);
        res.status(400).json({
            status: 'false',
            error: "Error creating the enterprise"
        });
    }
}



const updateEnterprise = async (req, res) => {
    const { name, address, industry, website, noStaff, yearsExistence, phone, email, city } = req.body;
    const userId = req.user.userId;

    try {
        const { error } = enterpriseSchema.validate({ name, address, industry, website, noStaff, yearsExistence, phone, email, city});
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        
        const enterprise = await Enterprise.findByIdAndUpdate(req.params
            .id, {name, address, industry, website, noStaff, yearsExistence, phone, email, city, user: userId}, {
                new: true,
                runValidators: true
            });
        
            if (!enterprise) {
            return res.status(404).json({
                status: 'false',
                error: "Enterprise not found"
            });
        }
        res.status(200).json({
            status: 'true', 
            message: "Enterprise updated successfully",
            data: {
                enterprise
            }
        });
    }
    catch (error) {
        console.log("Update Enterprise error", error);
        res.status(404).json({
            status: 'false',
            error: "Error updating the enterprise"
        });
    }
}

const deleteEnterprise = async (req, res) => {
    try {
        const result = await Enterprise.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                status: 'false',
                error: "Enterprise not found"
            });
        }
        res.status(204).json({
            status: 'true', message: "Enterprise deleted successfully",
            data: null
        });
    } catch (error) {
        console.log("Delete Enterprise erro", error);
        res.status(404).json({
            status: 'false',
            error: "Error deleting the enterprise"
        });
    }
}
export { allEnterprises, addEnterprise, singleEnterprise, updateEnterprise, searchEnterprises, deleteEnterprise };