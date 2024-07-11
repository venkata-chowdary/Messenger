const express = require('express')
const User = require('../models/userModel')
const mongoose = require('mongoose')
const generateToken = require('../config/generateToken')
const bcrypt = require('bcryptjs')


const registerUser = async (req, res) => {
    const { name, email, password, profilePic } = req.body
    console.log("photo", profilePic)
    if (!name || !email || !password) {
        res.status(400).json({ message: 'Enter All Fields' })
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
        return res.send(400).json({ message: 'User already exsists' })
    }

    const user = await User.create({ name, email, password, profilePhoto: profilePic })
    if (user) {
        return res.status(201).json({
            message: 'User created successfully',
            data: {
                name: user.name,
                _id: user._id,
                email: user.email,
                profilePhoto: user.profilePhoto,
                token: generateToken(user._id)
            }
        });
    }
    else {
        return res.status(400).json({ message: 'Failed to create user' });
    }
};

const authUser = async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
        return res.status(201).json({
            message: 'User logged in successfully',
            data: {
                name: user.name,
                _id: user._id,
                email: user.email,
                about: user.about,
                profilePhoto: user.profilePhoto,
                token: generateToken(user._id)
            }
        });
    }
    else {
        res.status(401).json({ message: 'Invalid email or password' });
    }

};

// get- /api/user
const allUsers = async (req, res) => {
    User.find({
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ]
    }).find({ _id: { $ne: req.user._id } })
        .then((users) => {
            res.send(users)
        })
        .catch(err => {
            console.log(err)
            res.status(400).json({ message: "Failed to fetch users" })
        })
}

const searchUser = async (req, res) => {
    const { searchName } = req.query
    console.log(searchName)
    User.find({
        name: { $regex: searchName, $options: 'i' }
    }).select('name _id profilePhoto')
        .then((users) => {
            const filteredUsers = users.filter(user => user._id.toString() !== req.user._id.toString());
            res.send(filteredUsers)
        })
        .catch(err => {
            console.log(err)
            res.status(400).json({ message: "Failed to fetch users" })
        })
}

const updateUserName = async (req, res) => {
    const newName = req.body.newName
    User.findByIdAndUpdate(req.user._id, { name: newName }, { new: true })
        .then((updatedData) => {
            res.status(200).json(updatedData)
        })
        .catch((err) => {
            console.log(err)
        })
}

const updateAbout = (req, res) => {
    const newAbout = req.body.newAbout
    User.findByIdAndUpdate(req.user._id, { about: newAbout }, { new: true })
        .then((updatedData) => {
            res.status(200).json(updatedData)
        })
        .catch((err) => {
            console.log(err)
        })
}

const updateProfilePicture = (req, res) => {
    const newProfilePhoto = req.body.newProfilePic
    User.findByIdAndUpdate(req.user._id, { profilePhoto: newProfilePhoto }, { new: true })
        .then((updatedData) => {
            console.log(updatedData)
            res.status(200).json(updatedData)
        })
        .catch((err) => {
            console.log(err)
        })
}



const updatePassword = (req, res) => {
    const newPassword = req.body.newPassword
    const oldPassword = req.body.oldPassword

    console.log(newPassword,oldPassword)    
    User.findOne(req.user._id)
        .then((userData) => {
            if (!userData) {
                return res.status(404).json({ message: "User not found" });
            }

            bcrypt.compare(oldPassword, userData.password)
                .then((status) => {
                    if (!status) {
                        return res.status(400).json({ message: "Old password is incorrect" })
                    }
                    console.log(status)
                    bcrypt.genSalt(10)
                        .then(salt => bcrypt.hash(newPassword, salt))
                        .then((hashedPassword) => {
                            User.findByIdAndUpdate(req.user._id, { password: hashedPassword }, { new: true })
                                .then((updatedData) => {
                                    res.status(200).json({message:'password updated successfully.'})
                                })
                                .catch((err) => {
                                    console.log(err)
                                })
                        })
                })
                .catch((err) => {
                    console.log(err)
                    res.status(500).json({ message: "Server error" });
                })
        })
}

const getAllUsers=(req,res)=>{
    
    User.find({})
    .select('-password')
    .then((allusersData)=>{
        const otherUsers=allusersData.filter((user)=>{
            return user._id.toString()!==req.user._id.toString()
        })
        res.status(200).json({otherUsers})
    })
}

module.exports = { registerUser, authUser, allUsers, searchUser, updateUserName, updateProfilePicture, updateAbout, updatePassword,getAllUsers };
