import mongoose from 'mongoose';

const enterpriseSchema = new mongoose.Schema({
    user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auth',
            required: true
        },
    active:{
        type: Boolean,
        default: true,
    },
    name: {
        type: String,
        required: [true, "name is required"],
        unique: true,
        trim: true,
    },
    address: {
        type: String,
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    noStaff: {
        type: Number,
        trim: true
    },
    yearsExistence: {
        type: Number,
        trim: true
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
        trim:true,
    },
    city: {
        type: String,
        trim:true,
    },
}, { timestamps: true });

const Enterprise = mongoose.model('Enterprise', enterpriseSchema);

export default Enterprise;