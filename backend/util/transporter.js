const nodemailer=require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    auth: {
        user: 'chowdaryimmanni@gmail.com',
        pass: 'zyibpblntaylgjsa'
    }
});

module.exports=transporter
