const express = require('express');
const { registerUser, authUser, allUsers, searchUser, updateUserName, updateProfilePicture, updateAbout, updatePassword, getAllUsers } = require('../controllers/userControllers');
const router = express.Router();
const { authMiddleware, localVariables } = require('../middleware/authMiddleware');
const { generateOTP, verifyOTP } = require('../config/OTP');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/', authMiddleware, allUsers);
router.get('/get-users',authMiddleware,getAllUsers)
router.get('/search', authMiddleware, searchUser);
router.put('/update-username', authMiddleware, updateUserName);
router.put('/update-about', authMiddleware, updateAbout);
router.put('/update-profile-picture', authMiddleware, updateProfilePicture);
router.put('/update-password', authMiddleware, localVariables, updatePassword);

router.get('/generate-otp', authMiddleware, localVariables, generateOTP);
router.post('/verify-otp', authMiddleware, localVariables, verifyOTP);

module.exports = router;
