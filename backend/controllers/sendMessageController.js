const Chat = require("../models/chatModel")
const Message = require("../models/messageModel")
const User = require("../models/userModel")

const sendMessage = async (req, res) => {
    const { content, chatId } = req.body
    if (!content || !chatId) {
        console.log("Invalid Message request")
        return res.status(400).json({ message: "Invalid Message request" })
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }

    try {
        var message = await Message.create(newMessage)
        message = await message.populate('sender', 'name profilePhoto')
        message = await message.populate('chat')
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name profilePhoto email'
        })

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message })
        res.json(message)

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

const allMessages = async (req, res) => {
    const {chatId}=req.params
    try {
        const messages = await Message.find({chat:chatId}).populate('sender', 'name profilePhoto email')
        res.status(200).json(messages)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error" })
        
    }
}


module.exports = { sendMessage,allMessages }