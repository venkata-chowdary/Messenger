const Chat = require("../models/chatModel")
const express = require('express')


// POST - /api/chat/group
const createGroupChat = (req, res) => {
    const { groupName, users, adminIds } = req.body

    if (!groupName || !users || !adminIds) {
        return res.status(400).json({ error: "Please fill all the fields." })
    }

    const allGroupUsers = users.concat(adminIds)
    Chat.create({
        chatName: groupName,
        isGroupChat: true,
        users: allGroupUsers,
        groupAdmins: adminIds,
        latestMessage: null
    })
        .then((newChat) => {
            Chat.findById(newChat._id)
                .populate("users", "-passwords")
                .populate('groupAdmins', "-passwords")
                .then((groupChat) => {
                    console.log(groupChat)
                    res.status(200).json({ groupChat })

                })
                .catch((err) => {
                    console.log(err)
                })
        })
        .catch((err) => {
            console.log(err)
        })
}

// PUT - /api/chat/group/add-user 
const addUserstoGroup = (req, res) => {
    const { chatId, newUserIds } = req.body


    if (!chatId || !newUserIds) {
        return res.status(400).json({ error: "Please fill all the fields." })
    }

    const userIdsArray = Array.isArray(newUserIds) ? newUserIds : [newUserIds];

    Chat.findById(chatId)
        .then((chat) => {
            if (!chat) {
                return res.status(404).json({ error: "Chat not found." })
            }
            const newUsers = userIdsArray.filter(userId => !chat.users.includes(userId))

            if (newUsers.length === 0) {
                return res.status(200).json({ error: "All users already in chat." })
            }
            return newUsers
        })
        .then((newUsers) => {
            console.log(newUsers)
            Chat.findByIdAndUpdate(chatId, { $addToSet: { users: { $each: newUsers } }, }, { new: true })
            .populate("users","-passwords")
                .then((updatedGroup) => {
                    console.log(updatedGroup)
                    return res.status(200).json({ message: "User(s) added to group successfully" ,updatedGroup})
                })
                .catch((err) => {
                    res.status(500).send({ message: 'Server Error', err })
                })
        })
        .catch((err) => {
            res.status(500).send({ message: 'Server Error', err })
        })

}

//PUT -/api/chat/group/remove-user
const removeUserFromGroup = (req, res) => {
    const { chatId, userId } = req.body
    if (!chatId || !userId) {
        return res.status(400).json({ error: "Please fill all the fields." })
    }

    Chat.findById(chatId)
        .then((chatData) => {
            if (!chatData) {
                return res.status(404).json({ error: "Chat not found." })
            }
            if (!chatData.users.includes(userId)) {
                return res.status(404).json({ error: "User not found in chat." })
            }

            Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
            .populate("users","-passwords")
                .then((updatedGroup) => {
                    console.log(updatedGroup)

                    return res.status(200).json({ message: "User(s) removed from group successfully", updatedGroup })
                })
                .catch((err) => {
                    res.status(500).send({ message: 'Server Error', err })
                })
        })
}

//PUT -api/chat/group/rename
const renameGroup = (req, res) => {
    const { chatId, newGroupName } = req.body
    console.log('rename')
    if (!chatId || !newGroupName) {
        return res.status(400).json({ error: "Please fill all the fields." })
    }

    Chat.findByIdAndUpdate(chatId, { chatName: newGroupName }, { new: true })
        .then((updatedGroup) => {
            return res.status(200).json({ message: "Group renamed successfully", updatedGroup })
        })
        .catch((err) => {
            res.status(500).send({ message: 'Server Error', err })
        })
}

//POST -api/chat/group/admin/add
const addAdmin = (req, res) => {

    const { chatId, userId, requestedUserId } = req.body
    if (!chatId || !userId) {
        return res.status(400).json({ error: "Please fill all the fields." })
    }

    //Check wether 
    Chat.findById(chatId)
        .then((chatData) => {
            if (!chatData) {
                return res.status(404).json({ error: "Chat not found." })
            }

            //Check wether requested user is already admin or not
            if (!chatData.groupAdmins.includes(requestedUserId)) {
                return res.status(404).json({ message: "Requested User can't make other user as admin." })
            }

            //Check wether user is already admin or not
            if (chatData.groupAdmins.includes(userId)) {
                return res.status(400).json({ error: "User is already admin." })
            }

            Chat.findByIdAndUpdate(chatId, { $push: { groupAdmins: userId } }, { new: true })
                .then((updatedChat) => {
                    console.log(updatedChat)
                    return res.status(200).json({ message: "User added as admin successfully" })
                })
                .catch((err) => {
                    res.status(500).send({ message: 'Server Error', err })
                })

        })

}

//POST -api/chat/group/admin/remove
const removeAdmin = (req, res) => {
    const { chatId, userId, requestedUserId } = req.body

    if (!chatId || !userId || !requestedUserId) {
        return res.status(400).json({ error: "Please fill all the fields." })
    }
    //Check wether
    Chat.findById(chatId)
        .then((chatData) => {
            if (!chatData) {
                return res.status(404).json({ error: "Chat not found." })
            }

            //Check wether requested user is already admin or not
            if (!chatData.groupAdmins.includes(requestedUserId)) {
                return res.status(404).json({ message: "Requested User can't make other user as admin." })
            }

            //Check wether user is already admin or not
            if (!chatData.groupAdmins.includes(userId)) {
                return res.status(400).json({ error: "User is not an admin." });
            }

            Chat.findByIdAndUpdate(chatId, { $pull: { groupAdmins: userId } }, { new: true })
                .then((updatedChat) => {
                    console.log(updatedChat)
                    return res.status(200).json({ message: "User removed as admin successfully" })
                })
                .catch((err) => {
                    res.status(500).send({ message: "Server Error", err })
                })
        })
}


module.exports = { createGroupChat, addUserstoGroup, renameGroup, removeUserFromGroup, addAdmin, removeAdmin }