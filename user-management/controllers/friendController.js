const BlacklistedToken = require('../models/BlacklistedToken');
const { sendKafkaMessage } = require('../utils/kafkaProducer');
const User = require('../models/User');
const Joi = require('joi');
const { logger } = require('../logger/logger');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const FriendRequest = require('../models/FriendRequest');
require('dotenv').config();
const HttpError = require('../utils/httpError');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const FRIEND_REQUEST_TOPIC = process.env.FRIEND_REQUEST_TOPIC

exports.sendFriendRequestController = async (req, res, next) => {
    try {
        // Get partyA from token
        const partyA = req.user._id;

        // Validate input
        const schema = Joi.object({
            partyB: Joi.string().length(24).hex().required(), // MongoDB ObjectId
            partyA: Joi.string().length(24).hex().optional() // For logging; actual used from token
        });
        const { error } = schema.validate(req.body);
        if (error) {
            // return res.status(400).json({ error: error.details[0].message });
            throw new HttpError(error.details[0].message, 400);
        }
        const partyB = req.body.partyB;

        // Prevent sending to self
        if (partyA.toString() === partyB) {
            // return res.status(400).json({ error: "Cannot send friend request to yourself." });
            throw new HttpError('Cannot send friend request to yourself.', 400);
        }

        // Check if partyB user exists
        const userB = await User.findById(partyB);
        if (!userB) {
            // return res.status(404).json({ error: "User to be friended does not exist." });
            throw new HttpError('User to be friended does not exist.', 404);
        }

        // Prevent duplicate requests (pending/accepted)
        const existing = await FriendRequest.findOne({
            partyA,
            partyB,
            status: { $in: ['pending', 'accepted'] }
        });
        if (existing) {
            // return res.status(409).json({ error: "Friend request already exists or accepted." });
            throw new HttpError('Friend request already exists or accepted.', 409);
        }

        // Create friend request
        const friendRequest = new FriendRequest({
            partyA,
            partyB,
            status: 'pending'
        });
        await friendRequest.save();
        console.log('TOPIC:', FRIEND_REQUEST_TOPIC);
        await sendKafkaMessage(FRIEND_REQUEST_TOPIC,friendRequest);
        res.status(201).json({
            message: "Friend request sent.",
            friendRequest
        });
    } catch (err) {
        next(err);
        logger.error('Error sending friend request:', err);
    }
};

exports.getReceivedFriendRequestsController = async (req, res, next) => {
  try {
    const myId = req.user._id;
    console.log('Received user ID:', myId);
    logger.debug('Fetching received friend requests for user:', myId);
    const requests = await FriendRequest.find({
      partyB: myId,
      status: 'pending',
    }).populate('partyA', 'name email profilePhoto');
    res.status(200).json({ requests });
  } catch (err) {
    logger.error('Error fetching received friend requests:', err);
    next(err);
  }
};


exports.respondToFriendRequestController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const myId = req.user._id;

    if (!['accept', 'reject'].includes(action)) {
      res.status(400);
      throw new Error('Action must be "accept" or "reject".');
    }

    const friendRequest = await FriendRequest.findOne({ _id: id, partyB: myId });

    if (!friendRequest || friendRequest.status !== 'pending') {
      res.status(404);
      throw new Error('Pending friend request not found.');
    }

    friendRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    await friendRequest.save();

    // If accepted, update both users' friends arrays
    if (action === 'accept') {
      const partyA = friendRequest.partyA;
      const partyB = friendRequest.partyB;

      // $addToSet prevents duplicate entries
      await User.findByIdAndUpdate(partyA, { $addToSet: { friends: partyB } });
      await User.findByIdAndUpdate(partyB, { $addToSet: { friends: partyA } });
    }

    res.status(200).json({
      message: `Friend request ${action}ed.`,
      friendRequest
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyFriendsController = async (req, res, next) => {
  try {
    const myId = req.user._id;
    const user = await User.findById(myId).populate('friends', 'name email gender profilePhoto');
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }
    res.status(200).json({
      friends: user.friends  // This will be an array of user objects, not just IDs!
    });
  } catch (err) {
    next(err);
  }
};


