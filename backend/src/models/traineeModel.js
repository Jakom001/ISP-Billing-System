import mongoose from 'mongoose';

const traineesSchema = new mongoose.Schema({
    
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
    firstName: { 
        type: String,
        trim: true, 
        required: [true, "First Name is required"] 
    },
    lastName: {
        type: String,
        trim: true,
        required: [true, "Last Name is required"] 
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "Email is required"],
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    phone: {
        type: String,
        required: [true, "Phone Number is required"],
        trim:true,
    },
    gender:{
        type:String,
        required: [true, "Gender is required"],
        enum: ['Male', 'Female'],
        trim:true
    },
    position:{
        type:String,
        required: [true, "Position is required"],
        enum: ["ceo", "director", "senior Management", "middle Management", "technical level", "others"],
        trim:true
    },
    ageBracket:{
        type:String,
        required: [true, "AgeBracket is required"],
        enum: ["18-35", "36-45", "45-60", "Above 60"],
        trim:true
    },
    
    active:{
        type: Boolean,
        default: true,
    },
},
    { timestamps: true }
)

const Trainee = mongoose.model('Trainee', traineesSchema);

export default Trainee