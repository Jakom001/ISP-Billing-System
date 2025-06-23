import Feature from "../models/featureModel.js";
import Auth from "../models/authModel.js";
import mongoose from "mongoose";
import { featureSchema } from "../middlewares/validator.js";

const allFeatures = async (req, res) =>{
    try{
        const features = await Feature.find({ user: req.user.userId }).sort({createdAt:-1}).populate({
            path: 'user',
            select: 'firstName'
        });
        res.status(200).json({
            length: features.length,
            status: 'true',
            message: "Features fetched successfully",
            data: {
                features
            }

        })
    }catch (error) {
        console.log("Features errors", error)
        res.status(404).json({
            error: "Error occurred while fetching users",
            status: 'false'
        })
    }
}
const allAdminFeatures = async (req, res) =>{
    try{
        const features = await Feature.find().sort({createdAt:-1}).populate({
            path: 'user',
            select: 'firstName'
        });
        res.status(200).json({
            length: features.length,
            status: 'true',
            message: "Features fetched successfully",
            data: {
                features
            }

        })
    }catch (error) {
        console.log("Features errors", error)
        res.status(404).json({
            error: "Error occurred while fetching users",
            status: 'false'
        })
    }
}

const singleFeature = async (req, res) =>{
    try{
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ error: 'Invalid  ID format' });
        }

        const feature = await Feature.findById({
            _id:id,
            user: req.user.userId
        })

        if (!feature){
            return res.status(404).json({
                status: 'false',
                error: "Feature not found"
            })
        }
        res.status(200).json({
            status:true,
            message: "Feature fetched successfully",
            data: {
                feature
            }
        });
    }catch (error){
        console.log("Single Feature Error", error)
        res.status(404).json({
            status:'false',
            error: "Error fetching the feature"
        })
    }
}

const searchFeatures = async (req, res) =>{
    try {
        const searchTerm = req.query.q

        if (!searchTerm){
            return res.status(400).json({
                status:'false',
                error: "Search query is required"
            })
        }

        const searchRegex = new RegExp(searchTerm, 'i');

        const features = await Feature.find({
            user: req.user.userId,
            $or: [
                {name: searchRegex},
                {description: searchRegex}
            ]
        }).sort({ createdAt: -1 })

        res.status(200).json({
            status: 'true',
            length: features.length,
            message: "Features Search Completed",
            data: {
                features
            }
        })
    }catch (error){
        console.log("Search Featured error", error);
      res.status(500).json({
        status: 'false',
        error: "Error searching for features"
      });
    }
}

const addFeature = async (req, res) =>{
    try{
        const {name, type, priority, image, description, userId, status} = req.body

        const {error} = featureSchema.validate({name, type, status, priority, image, description, userId})
        
        if (error){
            return res.status(400).json({
                status:'false',
                error: error.details[0].message
            })
        }

        // ID validations
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        const loginUser = await Auth.findById(userId)
        if(!loginUser) {
            return res.status(404).json({status: 'false', error: "Invalid login user"})
        }

        const newFeature = await Feature.create({name, type, status, priority, image, description, user:userId})
        res.status(201).json({
            status: 'true', 
            message: 'Feature created successfully',
            data: {
                feature: newFeature
            }
        });
    }catch (error) {
        console.log("Create Feature error", error);
        res.status(400).json({
            status: 'false',
            error: "Error creating the Feature"
        });
    }
}

const updateFeature = async (req, res) =>{
    try{
        const {name, type, priority, status, image, description, userId} = req.body

        const {error} = featureSchema.validate({name, type, status, priority, image, description, userId})
        
        if (error){
            return res.status(400).json({
                status:'false',
                error: error.details[0].message
            })
        }

        // ID validations
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        const loginUser = await Auth.findById(userId)
        if(!loginUser) {
            return res.status(404).json({status: 'false', error: "Invalid login user"})
        }

        
        const feature = await Feature.findOneAndUpdate(
            { 
                _id:req.params.id,
                user: req.user.userId
            }, 
            {name, type, priority, image, status, description, user:userId},
            {
                new:true,
                runValidators:true
            }
        );

        if(!feature){
            return res.status(404).json({
                status:'false',
                error: "Feature not found"
            })
        }
        res.status(200).json({
            status: 'true', 
            message: 'Feature updated successfully',
            data: {
                feature
            }
        });
    }catch (error) {
        console.log("Update Feature error", error);
        res.status(400).json({
            status: 'false',
            error: "Error updating the Feature"
        });
    }
}

const deleteFeature = async (req, res) => {
    try {
        const result = await Feature.findOneAndDelete({ 
            _id: req.params.id,
            user: req.user.userId
        });

        if (!result) {
            return res.status(404).json({
                status: 'false',
                error: "Feature not found"
            });
        }
        res.status(204).json({
            status: 'true', message: "Feature deleted successfully",
            data: null
        });
    } catch (error) {
        console.log("Delete Feature erro", error);
        res.status(404).json({
            status: 'false',
            error: "Error deleting the Feature"
        });
    }
}

export { allFeatures, addFeature, singleFeature, updateFeature, searchFeatures, deleteFeature, allAdminFeatures};