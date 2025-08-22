const Notification = require("../models/Notification");
const { logger } = require("../logger/logger");

/**
 * Get all notifications for logged-in user
 */
const getAllNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`📥 Fetching all notifications for user: ${userId}`);
    logger.info(`Fetching all notifications for user`, { userId });

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    console.log(`✅ Found ${notifications.length} notifications for user: ${userId}`);
    logger.info(`Found notifications`, { userId, count: notifications.length });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    logger.error("Error fetching notifications", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

/**
 * Get only read notifications for logged-in user
 */
const getReadNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`📥 Fetching read notifications for user: ${userId}`);
    logger.info(`Fetching read notifications`, { userId });

    const notifications = await Notification.find({ userId, read: true }).sort({
      createdAt: -1,
    });

    console.log(`✅ Found ${notifications.length} read notifications for user: ${userId}`);
    logger.info(`Found read notifications`, { userId, count: notifications.length });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("❌ Error fetching read notifications:", error);
    logger.error("Error fetching read notifications", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch read notifications" });
  }
};

/**
 * Toggle notification read/unread state by ID
 */
const toggleNotificationReadState = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log(`📥 Toggling read state for notification: ${id}, user: ${userId}`);
    logger.info(`Toggling notification state`, { id, userId });

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      console.warn(`⚠️ Notification not found: ${id} for user ${userId}`);
      logger.warn(`Notification not found`, { id, userId });
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    notification.read = !notification.read;
    await notification.save();

    console.log(`✅ Notification ${id} updated -> ${notification.read ? "read" : "unread"}`);
    logger.info(`Notification updated`, { id, userId, read: notification.read });

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error("❌ Error toggling notification:", error);
    logger.error("Error toggling notification", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Failed to update notification" });
  }
};

/**
 * Mark all notifications as read/unread for a user
 */
const setAllNotificationsReadState = async (req, res) => {
  try {
    const userId = req.userId;
    const { read } = req.body;

    if (typeof read !== "boolean") {
      console.warn("⚠️ Invalid 'read' value provided");
      logger.warn("Invalid 'read' value", { read });
      return res
        .status(400)
        .json({ success: false, message: "'read' must be true or false" });
    }

    console.log(`📥 Updating all notifications for user: ${userId} -> ${read ? "read" : "unread"}`);
    logger.info(`Updating all notifications`, { userId, read });

    const result = await Notification.updateMany({ userId }, { $set: { read } });

    console.log(`✅ Updated ${result.modifiedCount} notifications for user: ${userId}`);
    logger.info(`Updated notifications`, { userId, updated: result.modifiedCount });

    res.status(200).json({
      success: true,
      message: `All notifications marked as ${read ? "read" : "unread"}`,
    });
  } catch (error) {
    console.error("❌ Error updating all notifications:", error);
    logger.error("Error updating all notifications", { error: error.message });
    res
      .status(500)
      .json({ success: false, message: "Failed to update notifications" });
  }
};

module.exports = {
  getAllNotifications,
  getReadNotifications,
  toggleNotificationReadState,
  setAllNotificationsReadState,
};
