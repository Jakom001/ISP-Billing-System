import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true
    },
    enterprise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enterprise",
        required: true,
    },
    name: {
        type: String,
        trim: true,
    },
    objectives: {
        type: String,
        trim: true,
    },
    rating:{
        type: Number,
        required:true,
    },
    duration: {
        type: Number,
        trim: true,
    },
    date: { 
        type: Date,
        trim: true, 
        required: [true, "First Name is required"] 
    },
    actionPhotos:[{
        type: String,
        trim: true,
    }],
    attendanceSheetImage: {
        type: String,
        trim: true,
    },
    workingToolsPhotos: [{
        type: String,
        trim: true,
    }],
    comment:{
        type:String,
        trim:true
    },
    outcome:{
        type:String,
        trim:true
    },
},
    { timestamps: true }
)

const Session = mongoose.model('Session', sessionSchema);

export default Session