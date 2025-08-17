const express = require('express');
const userRouter = express.Router();
const { createUserController, uploadProfilePhotoController, getUserController, getProfilePhotoController, loginController, updateUserController } = require('../controllers/userController');
const uploadProfilePhoto = require('../middlewares/uploadProfilePhoto');
const authMiddleware = require('../middlewares/authMiddleware');
const { sendFriendRequestController } = require('../controllers/friendController');
// Login route (no auth)
userRouter.post('/login', loginController);

// POST /user - Create a new user (protected)
userRouter.post('/', createUserController);

// POST /user/:id/photo - Upload profile photo for a user (protected)
userRouter.post('/:id/photo', authMiddleware, uploadProfilePhoto.single('profilePhoto'), uploadProfilePhotoController);

// GET /user/:id - Get user by ID (protected)
userRouter.get('/:id', authMiddleware, getUserController);

// GET /user/:id/photo - Get profile photo for a user (protected)
userRouter.get('/:id/photo', authMiddleware, getProfilePhotoController);
const { logoutController } = require('../controllers/userController');
// Logout route (protected)
userRouter.post('/logout', authMiddleware, logoutController);

userRouter.patch('/',authMiddleware, updateUserController)

//Friendship routes
userRouter.post('/friend-requests', authMiddleware,sendFriendRequestController);

module.exports = userRouter;
