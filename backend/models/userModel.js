const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    about:{type:String,default:"Available"},
    profilePhoto: {
        type: String,
        required: true,
        // default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
    },
    isConfirmed: { type: Boolean, default: false }

}, { timestamps: true })


userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});



const User=mongoose.model('User',userSchema)
module.exports=User