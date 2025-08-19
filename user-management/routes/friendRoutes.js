const express = require('express');
const friendRouter = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { sendFriendRequestController, getReceivedFriendRequestsController, respondToFriendRequestController, getMyFriendsController, unfriendController } = require('../controllers/friendController');

//Friendship routes
friendRouter.post('/sendRequest', authMiddleware,sendFriendRequestController);
friendRouter.get('/showRequests', authMiddleware, getReceivedFriendRequestsController)
friendRouter.patch('/respondToRequest/:id',authMiddleware, respondToFriendRequestController);
friendRouter.get('/showFriends', authMiddleware, getMyFriendsController); // Assuming you have a controller for this
friendRouter.delete('/removeFriend/:id', authMiddleware, unfriendController); // Assuming you have a controller for this

module.exports = friendRouter;