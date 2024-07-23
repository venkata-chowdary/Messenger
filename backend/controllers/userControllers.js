const express = require('express')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const generateToken = require('../config/generateToken')
const bcrypt = require('bcryptjs')
const { JsonWebTokenError } = require('jsonwebtoken')
const transporter = require('../util/transporter')



const registerUser = async (req, res) => {
    const { name, email, password, profilePic } = req.body
    console.log("photo", profilePic)
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Enter All Fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    try {
        const user = await User.create({ name, email, password, profilePhoto: profilePic });

        const confirmToken = jwt.sign({ id: user._id }, 'emailconfirm', { expiresIn: '1h' });
        const url = `http://localhost:4000/api/user/confirm/${confirmToken}`;

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Account Confirmation',
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
            @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');

            body {
                margin: 0;
                padding: 0;
                font-family: 'Lato', Arial, sans-serif;
                background-color: #fff;
                color: #fff;
            }

            .email-confirmation {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background-color: #1a1a1a;
            }

            .confirm-container {
                width: 100%;
                max-width: 500px;
                padding: 40px 20px 20px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                background-color: #333;
                border-radius: 8px;
                margin: 0 auto;
                text-align: center;
            }

            .confirm-container h1 {
                font-size: 26px;
                margin: 20px 0;
                color: #fff;
            }

            .confirm-container hr {
                border: 1px solid #444;
                width: 80%;
                margin: 20px auto;
            }

            .confirm-container .main-name {
                font-size: 16px;
                margin: 18px 0;
                line-height: 1.5;
            }

            .confirm-container p{
                margin: 0 0 10px;
                color:#fff
            }

            .confirm-container p span {
                color: #007bff;
                font-weight: 600;
            }

            .confirm-container a.confirm-button {
                display: inline-block;
                padding: 12px 20px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                background-color: #007bff;
                color: #fff;
                text-decoration: none;
                transition: background-color 0.3s ease;
                font-weight: bold;
                margin: 20px auto 5px;
            }

            .confirm-container a.confirm-button:hover {
                background-color: #0056b3;
            }

            .confirm-container .footer {
                margin-top: 40px;
                font-size: 14px;
            }
            
            .footer p{
                color: #888;

            }

            .confirm-container .footer a {
                color: #007bff;
                text-decoration: none;
            }

            .confirm-container .footer a:hover {
                text-decoration: underline;
            }
        </style>
            </head>
            <body>
                <div class="email-confirmation">
                    <div class="confirm-container">
                        <h1>Welcome to Our App!</h1>
                        <hr />
                        <p class="main-name">Hello <span>${user.name}</span>,</p>
                        <p>Thank you for registering with us.</p>
                        <p>To complete your registration and activate your account, please confirm your email address by clicking the button below:</p>
                        <a href="${url}" class="confirm-button">Confirm Account</a>
        
                        <div class="footer">
                            <p>Need assistance? <a href="mailto:support@yourapp.com">Contact Support</a></p>
                            <p>&copy; ${new Date().getFullYear()} Our App. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Error sending confirmation email" });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).json({
                    message: "User created successfully, please check your email to confirm your account",
                    data: {
                        name: user.name,
                        _id: user._id,
                        email: user.email,
                        profilePhoto: user.profilePhoto,
                        token: generateToken(user._id)
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: 'Failed to create user' });
    }
};

const confirmAccount = async (req, res) => {
    try {
        const { token } = req.params;
        console.log(token)
        const decoded = jwt.verify(token, 'emailconfirm');
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.isConfirmed = true; // Add an `isConfirmed` field to your User model
        await user.save();
        res.redirect('http://localhost:3000/account-confirmed'); // Adjust URL according to your client setup
        return res.status(200).json({ message: 'Account confirmed successfully' });
    } catch (error) {
        return res.status(400).json({ message: 'Error confirming account' });
    }
}


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
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;

    console.log(newPassword, oldPassword);
    User.findById(req.user._id)
        .then(userData => {
            if (!userData) {
                return res.status(404).json({ message: "User not found" });
            }

            bcrypt.compare(oldPassword, userData.password)
                .then(status => {
                    if (!status) {
                        return res.status(400).json({ message: "Old password is incorrect" });
                    }
                    console.log(status);
                    bcrypt.genSalt(10)
                        .then(salt => bcrypt.hash(newPassword, salt))
                        .then(hashedPassword => {
                            User.findByIdAndUpdate(req.user._id, { password: hashedPassword }, { new: true })
                                .then(updatedData => {
                                    res.status(200).json({ message: 'Password updated successfully.' });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({ message: "Server error" });
                                });
                        });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ message: "Server error" });
                });
        });
};

const getAllUsers = (req, res) => {
    User.find({})
        .select('-password')
        .then((allusersData) => {
            const otherUsers = allusersData.filter((user) => {
                return user._id.toString() !== req.user._id.toString()
            })
            res.status(200).json({ otherUsers })
        })
}

const getUserById = (req, res) => {
    const { callerId } = req.body
    console.log(req.body)
    User.findById(callerId).select('-password')
        .then((userData) => {
            res.status(200).json({ userData })
        })
        .catch((err) => {
            console.log(err)
            res.status(500).json({ message: "Server error" }
            )
        })
}
module.exports = {
    registerUser,
    authUser,
    allUsers,
    searchUser,
    updateUserName,
    updateProfilePicture,
    updateAbout,
    updatePassword,
    getAllUsers,
    confirmAccount,
    getUserById
};
