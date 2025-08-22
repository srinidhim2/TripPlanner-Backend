const express = require("express");
const {
  getAllNotifications,
  getReadNotifications,
  toggleNotificationReadState,
  setAllNotificationsReadState,
} = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

const notificationRouter = express.Router();

// All routes use authMiddleware → userId comes from token
notificationRouter.get("/", authMiddleware, getAllNotifications);
notificationRouter.get("/read", authMiddleware, getReadNotifications);
notificationRouter.patch("/:id/toggle", authMiddleware, toggleNotificationReadState);
notificationRouter.patch("/all", authMiddleware, setAllNotificationsReadState);

module.exports = notificationRouter;