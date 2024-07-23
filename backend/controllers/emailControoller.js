const transporter = require('../util/transporter')


const sendOTP = (to, subject, text) => {
    const mailOptions = {
        from: 'chowdaryimmanni@gmail.com',
        to,
        subject,
        text,
        debug: true,
        
        logger: true
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log("mail sent")
        }
    })
}




module.exports = { sendOTP }