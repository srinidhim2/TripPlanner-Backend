const express = require('express');
const friendRouter = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { sendFriendRequestController, getReceivedFriendRequestsController, respondToFriendRequestController } = require('../controllers/friendController');

//Friendship routes
friendRouter.post('/send', authMiddleware,sendFriendRequestController);
friendRouter.get('/show', authMiddleware, getReceivedFriendRequestsController)
friendRouter.patch('/respond/:id',authMiddleware, respondToFriendRequestController);

module.exports = friendRouter;