const express=require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const {accessChat,fetchChats, deleteChat, markMessageAsRead, getUnreadMessageCount, loadChat }=require('../controllers/chatControllers')
const {createGroupChat, addUserstoGroup, renameGroup,removeUserFromGroup, addAdmin, removeAdmin}=require('../controllers/GroupControllers')


const router=express.Router()
router.post('/',authMiddleware,accessChat)
router.get('/',authMiddleware,fetchChats)
router.get('/:chatId',authMiddleware,loadChat)

router.delete('/:chatId',authMiddleware,deleteChat)
router.post('/:chatId/mark-as-read',authMiddleware,markMessageAsRead)
router.get('/:chatId/unread',authMiddleware,getUnreadMessageCount)

router.post('/group',authMiddleware,createGroupChat)
router.put('/group/add-user',authMiddleware,addUserstoGroup)
router.put('/group/remove-user',authMiddleware,removeUserFromGroup)
router.put('/group/rename',authMiddleware,renameGroup)
router.put('/group/admin/add',authMiddleware,addAdmin)
router.put('/group/admin/remove',authMiddleware,removeAdmin)


// router.put('/groupremove',authMiddleware,removeFromGroup)


module.exports=router