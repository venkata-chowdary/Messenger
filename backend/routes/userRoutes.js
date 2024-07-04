const express = require('express');
const { registerUser, authUser,allUsers, searchUser, updateUserName,updateProfilePicture, updateAbout, updatePassword } = require('../controllers/userControllers');
const router = express.Router();
const {authMiddleware}=require('../middleware/authMiddleware')


router.post('/', registerUser);
router.post('/login', authUser);
router.get('/',authMiddleware,allUsers)
router.get('/search',authMiddleware,searchUser)
router.put('/update-username',authMiddleware,updateUserName)
router.put('/update-about',authMiddleware,updateAbout)
router.put('/update-profile-picture',authMiddleware,updateProfilePicture)
router.put('/update-password',authMiddleware,updatePassword)
module.exports = router;
