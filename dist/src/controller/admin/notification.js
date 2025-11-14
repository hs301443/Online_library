"use strict";
// controllers/admin/notificationController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.getNotificationById = exports.getAllNotifications = exports.sendNotificationToSingle = exports.sendNotificationToAll = void 0;
const Notification_1 = require("../../models/schema/Notification");
const UserNotification_1 = require("../../models/schema/UserNotification");
const User_1 = require("../../models/schema/auth/User");
const firebase_1 = require("../../utils/firebase");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
// =============================
// 🔥 إرسال إشعار لكل المستخدمين
// =============================
const sendNotificationToAll = async (req, res) => {
    const { title, body, relatedId } = req.body;
    if (!title || !body) {
        throw new BadRequest_1.BadRequest("Title and body are required");
    }
    const allUsers = await User_1.User.find({}, { _id: 1, fcmtoken: 1 }).lean();
    if (!allUsers.length)
        throw new Errors_1.NotFound("No users found");
    const validUsers = allUsers.filter(user => user.fcmtoken &&
        typeof user.fcmtoken === "string" &&
        user.fcmtoken.trim() &&
        user.fcmtoken !== "null" &&
        user.fcmtoken !== "undefined");
    if (!validUsers.length) {
        return res.json({
            success: false,
            message: "No valid FCM tokens found",
            stats: {
                totalUsers: allUsers.length,
                validTokens: 0,
            },
        });
    }
    // إنشاء الإشعار
    const newNotification = await Notification_1.NotificationModels.create({
        title,
        body,
        relatedId: relatedId || null,
    });
    // ربط الإشعار بكل المستخدمين
    const userNotifications = validUsers.map(user => ({
        user: user._id,
        notification: newNotification._id,
    }));
    await UserNotification_1.UserNotificationModel.insertMany(userNotifications);
    // إرسال FCM
    const tokens = validUsers
        .map(user => user.fcmtoken)
        .filter(token => typeof token === 'string');
    const fcmResponse = await firebase_1.messaging.sendEachForMulticast({
        notification: { title, body },
        tokens,
    });
    return (0, response_1.SuccessResponse)(res, {
        message: "Notification sent to all users",
        notificationId: newNotification._id,
        results: {
            successCount: fcmResponse.successCount,
            failureCount: fcmResponse.failureCount,
            totalTokens: tokens.length,
        },
    }, 200);
};
exports.sendNotificationToAll = sendNotificationToAll;
// =============================
// 🔥 إرسال إشعار ليوزر واحد
// =============================
const sendNotificationToSingle = async (req, res) => {
    const { userId } = req.params;
    const { title, body, relatedId } = req.body;
    if (!title || !body)
        throw new BadRequest_1.BadRequest("Title and body are required");
    const user = await User_1.User.findById(userId).lean();
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (!user.fcmtoken)
        throw new BadRequest_1.BadRequest("User does not have a valid FCM token");
    const notification = await Notification_1.NotificationModels.create({
        title,
        body,
        relatedId: relatedId || null,
    });
    await UserNotification_1.UserNotificationModel.create({
        user: user._id,
        notification: notification._id,
    });
    await firebase_1.messaging.send({
        token: user.fcmtoken,
        notification: { title, body },
    });
    return (0, response_1.SuccessResponse)(res, {
        message: "Notification sent to user",
        notification,
    }, 200);
};
exports.sendNotificationToSingle = sendNotificationToSingle;
// =============================
// 🔥 جلب كل الإشعارات
// =============================
const getAllNotifications = async (req, res) => {
    const notifications = await Notification_1.NotificationModels.find({});
    if (!notifications.length)
        throw new Errors_1.NotFound("No notifications found");
    return (0, response_1.SuccessResponse)(res, {
        message: "Notifications fetched successfully",
        notifications,
    }, 200);
};
exports.getAllNotifications = getAllNotifications;
// =============================
// 🔥 جلب إشعار بالـ ID
// =============================
const getNotificationById = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const notification = await Notification_1.NotificationModels.findById(id);
    if (!notification)
        throw new Errors_1.NotFound("Notification not found");
    return (0, response_1.SuccessResponse)(res, {
        message: "Notification fetched successfully",
        notification,
    }, 200);
};
exports.getNotificationById = getNotificationById;
// =============================
// 🔥 حذف الإشعار
// =============================
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const notification = await Notification_1.NotificationModels.findByIdAndDelete(id);
    if (!notification)
        throw new Errors_1.NotFound("Notification not found");
    return (0, response_1.SuccessResponse)(res, {
        message: "Notification deleted successfully",
        notification,
    }, 200);
};
exports.deleteNotification = deleteNotification;
