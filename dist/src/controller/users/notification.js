"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleNotification = exports.getUnreadCount = exports.getUserNotifications = void 0;
const Notification_1 = require("../../models/schema/Notification");
const UserNotification_1 = require("../../models/schema/UserNotification");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const mongoose_1 = __importDefault(require("mongoose"));
const getUserNotifications = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not authorized");
    const userId = req.user.id;
    if (!mongoose_1.default.isValidObjectId(userId)) {
        throw new BadRequest_1.BadRequest("Invalid user ID format");
    }
    const notifications = await UserNotification_1.UserNotificationModel.find({ user: userId })
        .populate({
        path: "notification",
        model: Notification_1.NotificationModels,
        select: "title body relatedId createdAt",
    })
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, {
        message: "Notifications fetched successfully",
        notifications,
    });
};
exports.getUserNotifications = getUserNotifications;
const getUnreadCount = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not authorized");
    const userId = req.user.id;
    const count = await UserNotification_1.UserNotificationModel.countDocuments({
        user: userId,
        read: false,
    });
    return (0, response_1.SuccessResponse)(res, {
        unreadCount: count,
    });
};
exports.getUnreadCount = getUnreadCount;
const getSingleNotification = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not authorized");
    const userId = req.user.id;
    const { id } = req.params; // ← ID of UserNotification
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new BadRequest_1.BadRequest("Invalid notification ID format");
    }
    const userNotification = await UserNotification_1.UserNotificationModel.findOne({
        _id: id,
        user: userId,
    }).populate({
        path: "notification",
        model: Notification_1.NotificationModels,
        select: "title body relatedId createdAt",
    });
    if (!userNotification) {
        throw new Errors_1.NotFound("Notification not found for this user");
    }
    // لو مش مقروءة → نخليها مقروءة
    if (!userNotification.read) {
        userNotification.read = true;
        userNotification.readAt = new Date();
        await userNotification.save();
    }
    return (0, response_1.SuccessResponse)(res, {
        message: "Notification fetched successfully",
        notification: userNotification,
    });
};
exports.getSingleNotification = getSingleNotification;
