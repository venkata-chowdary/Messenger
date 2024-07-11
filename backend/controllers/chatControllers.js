const { compareSync } = require("bcryptjs");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
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

    console.log("yes")
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
            console.log(results)
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

// GET - /api/chat/:chatId

const loadChat = (req, res) => {
    const chatId = req.params.chatId


    if (!chatId) {
        return res.status(400).send({ message: "chatId is required." })
    }

    Chat.findById(chatId)
        .populate("users", "-password")
        .populate("latestMessage")
        .populate('latestMessage.sender')
        .then(async (response) => {
            if (!response) {
                return res.status(400).send({ message: "Chat not found." })
            }
            response = await User.populate(response, {
                path: "latestMessage.sender",
                select: "name pic email",
            });
    
            res.status(200).json(response);

        })
        .catch((err) => {
            console.log(err)
        })
}

// DELETE - /api/chat/deletechat
const deleteChat = (req, res) => {
    const chatToDelete = req.params.chatId;
    Message.deleteMany({ chat: chatToDelete })
        .then((response) => {
            if (response.deletedCount === 0) {
                return res.status(400).json({ message: "No messages found to delete." })
            }
            return Chat.findByIdAndDelete(chatToDelete)
        })
        .then((response) => {
            if (!response) {
                return res.status(404).json({ message: "Chat not found" });
            }
            res.status(200).json({ message: "Chat and related messages deleted" });
        })
        .catch((err) => {
            console.log(err)
        })
}

const markMessageAsRead = async (req, res) => {
    const { chatId } = req.params
    Message.updateMany(
        { chat: chatId, readBy: { $ne: req.user._id } },
        { $push: { readBy: req.user._id } })

        .then((response) => {
            res.status(200).json({ message: "Messages marked as read" });
        })
        .catch((err) => {
            console.log(err)
        })
}


const getUnreadMessageCount = (req, res) => {
    const { chatId } = req.params
    Message.find({ chat: chatId, readBy: { $ne: req.user._id } })
        .then((response) => {
            const unreadCount = response.length
            res.status(200).json({ unreadCount })
        })
        .catch((err) => {
            res.status(500).json({ message: error.message });
        })
}
module.exports = { accessChat, fetchChats, deleteChat, markMessageAsRead, getUnreadMessageCount, loadChat }