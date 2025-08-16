const express = require('express');
const userRouter = express.Router();
const { createUserController, uploadProfilePhotoController, getUserController } = require('../controllers/userController');
const uploadProfilePhoto = require('../middlewares/uploadProfilePhoto');

// POST /user - Create a new user
userRouter.post('/', createUserController);

// POST /user/:id/photo - Upload profile photo for a user
userRouter.post('/:id/photo', uploadProfilePhoto.single('profilePhoto'), uploadProfilePhotoController);

// GET /user/:id - Get user by ID
userRouter.get('/:id', getUserController);

module.exports = userRouter;
