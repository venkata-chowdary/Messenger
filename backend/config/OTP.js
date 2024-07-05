const otpGenerator = require('otp-generator');

const generateOTP = async (req, res) => {
    req.app.locals.OTP = otpGenerator.generate(4, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });
    console.log('Generated OTP:', req.app.locals.OTP);
    res.status(201).send({ code: req.app.locals.OTP });
};

const verifyOTP = (req, res) => {
    const {otp}=req.body;
    console.log(otp)
    console.log('Code received:', otp);
    console.log('Stored OTP:', req.app.locals.OTP);

    if (parseInt(req.app.locals.OTP) === parseInt(otp)) {
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        res.status(200).send({ message: "OTP verified successfully", resetSession: req.app.locals.resetSession });
    } else {
        res.status(400).send({ error: "Invalid OTP" });
    }
};

const createPasswordUpdateSession=()=>{
    if(req.app.locals.resetSession){
        req.app.locals.resetSession=false;
        res.status(200).send({ message: "Password reset session created successfully"})
    }
    return res.status(400).send({error:'Session expired'})
}


module.exports = { generateOTP, verifyOTP,createPasswordUpdateSession };
