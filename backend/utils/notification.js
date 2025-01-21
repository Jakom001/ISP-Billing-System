require('dotenv').config();
const nodemailer = require('nodemailer');
// const twilio = require("twilio");

const sendEmailNotification = async (email, subject, message) => {
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: message,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email} successfully`);
        return true;
    }catch(error){
        console.error("Error sending email:", error.message);
    }
}



// const sendSMSNotification = async (user, message) => {
//   const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

//   try {
//     await client.messages.create({
//       body: message,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: user.phoneNumber,
//     });
//     console.log(`SMS sent to ${user.phoneNumber}`);
//   } catch (error) {
//     console.error("Failed to send SMS:", error.message);
//   }
// };

// module.exports = { sendSMSNotification };

module.exports = {sendEmailNotification};