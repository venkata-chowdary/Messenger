const Chat = require("../models/chatModel");
const User = require('../models/userModel')
const mongoose = require('mongoose')

// - post /api/chat
const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
        
    }

    try {
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", "-password")
            .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            const chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            };

            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// get- /api/chat
const fetchChats = async (req, res) => {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
            results = await User.populate(results, {
                path: "latestMessage.sender",
                select: "name pic email",
            });
            res.status(200).send(results);
        })
        .catch((err) => {
            console.log(err)
        })

}

// DELETE - /api/chat/deletechat

const deleteChat = (req, res) => {
    const chatToDelete = req.params.chatId;

    Chat.findByIdAndDelete(chatToDelete)
        .then((response) => {
            if (!response) {
                return res.status(404).json({ message: "Chat not found" });
            }
            console.log(response);
            res.status(200).json({ message: "Chat Deleted" });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        });
}

module.exports = { accessChat, fetchChats, deleteChat }