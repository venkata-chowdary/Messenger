const { sendMessage,allMessages } = require("../controllers/sendMessageController")
const { authMiddleware } = require("../middleware/authMiddleware")

const express=require('express')
const router=express.Router()


router.post('/',authMiddleware,sendMessage)
router.get('/:chatId',authMiddleware,allMessages)

module.exports=router