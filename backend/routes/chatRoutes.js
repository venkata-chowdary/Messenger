const express=require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {accessChat,fetchChats, deleteChat }=require('../controllers/chatControllers')

const router=express.Router()
router.post('/',authMiddleware,accessChat)
router.get('/',authMiddleware,fetchChats)
router.delete('/:chatId',authMiddleware,deleteChat)


// router.post('/group',authMiddleware,createGroupChat)
// router.put('/rename',authMiddleware,renameGroup)
// router.put('/groupremove',authMiddleware,removeFromGroup)
// router.put('/groupadd',authMiddleware,addToGroup)


module.exports=router