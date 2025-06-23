import mongoose from 'mongoose';

const ROLES = {
    USER: 'user',
    BCOACH: 'businessCoach',
    COCOACH: 'co-Coach',
    ADMIN: 'admin',
    PARTNER: 'partner',
    ENTERPRISE: 'enterprise',
};
const authSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 8
    },
    phone: {
        type: String,
        required: [true, "Phone Number is required"],
        trim:true,
    },
    verified:{
        type: Boolean,
        default: false,
    },
    active:{
        type: Boolean,
        default: true,
    },
    verificationCode:{
        type: String,
        select: false,
    },
    verificationCodeValidation:{
        type: Number,
        select: false,
    },
    forgotPasswordCode:{
        type: String,
        select: false,
    },
    forgotPasswordCodeValidation:{
        type: Number,
        select: false,
    },
    role: {
        type: String,
        enum: [ROLES.USER, ROLES.ADMIN],
        default: ROLES.USER,
    },
    permissions:[{
        type: String,
    }]
    
},
    { timestamps: true }
)

const Auth = mongoose.model('Auth', authSchema);

export default Auth