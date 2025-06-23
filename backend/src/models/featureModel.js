import mongoose from "mongoose";

const featureSchema = new mongoose.Schema({
    name :{
        type: String,
        trim: true,
        required : [true,'name is Required']
    },
    type: {
        type: String,
        enum:['feature','bugFix', 'improvement', 'other' ],
        default: 'feature'
    },
    priority:{
        type: String,
        enum:['High', 'Medium', 'Low'],
        default: 'Medium',
    },
    image:{
        type: String,
        trim: true
    },
    description:{
        type: String,
        trim:true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auth',
            required: true,
        },
},{
    timestamps: true
}
)

const Feature = mongoose.model('Feature', featureSchema)

export default Feature