import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const transport = nodemailer.createTransport({
    host: "mail.adrescg.com",
    port: 465,
    secure:true,
    auth: {
        user: process.env.NODE_CODE_SENDING_EMAIL,
        pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
    },
});

export default transport;