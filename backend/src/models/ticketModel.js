import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    name :{
        type: String,
        trim: true,
        required : [true,'name is Required']
    },
    ticket:{
        type:Number,
        required: [true, 'ticket is required']
    },
    
    priority:{
        type: String,
        enum:['High', 'Medium', 'Low'],
        default: 'Medium',
    },
    description:{
        type: String,
        trim:true,
    },
    status: {
        type: String,
        enum: ['Open', 'Close'],
        default: 'Open'
    },
    assigned:{
        type: mongoose.Schema.Types.ObjectId,
            ref: 'Auth',
            required: true
    },
    user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auth',
            required: true
        },
},{
    timestamps: true
}
)

const Ticket = mongoose.model('Ticket', ticketSchema)

export default Ticket