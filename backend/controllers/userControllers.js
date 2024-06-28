const express = require('express')
const User = require('../models/userModel')
const mongoose = require('mongoose')
const generateToken = require('../config/generateToken')
const bcrypt = require('bcryptjs')


const registerUser = async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        res.status(400).json({ message: 'Enter All Fields' })
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
        res.send(400).json({ message: 'User already exsists' })
    }

    const user = await User.create({ name, email, password })
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
module.exports = { registerUser, authUser, allUsers,searchUser };
