require("dotenv").config()
const nodemailer = require("nodemailer");


const sendEmail = async (email, subject, text) => {
    console.log(process.env.MAIL_USER)
   // try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: process.env.MAIL_PORT_1 || process.env.MAIL_PORT_2,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail({
            from: `"Subarna at Bug Wars" <${process.env.MAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
        })
        .then(()=>console.log("email sent sucessfully"))

        
    //} 
    .catch ((error) =>{
        console.log(error, "email not sent");
    })
};

module.exports = sendEmail;