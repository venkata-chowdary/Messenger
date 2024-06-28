const express = require('express');
const { registerUser, authUser,allUsers, searchUser } = require('../controllers/userControllers');
const router = express.Router();
const {authMiddleware}=require('../middleware/authMiddleware')


router.post('/', registerUser);
router.post('/login', authUser);
router.get('/',authMiddleware,allUsers)
router.get('/search',authMiddleware,searchUser)
module.exports = router;
