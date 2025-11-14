import { NotificationModels } from '../../models/schema/Notification';
import { UserNotificationModel } from "../../models/schema/UserNotification";
import { UnauthorizedError, NotFound } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import mongoose from 'mongoose';



export const getUserNotifications = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not authorized");
  const userId = req.user.id;

  if (!mongoose.isValidObjectId(userId)) {
    throw new BadRequest("Invalid user ID format");
  }

  const notifications = await UserNotificationModel.find({ user: userId })
    .populate({
      path: "notification",
      model: NotificationModels,
      select: "title body relatedId createdAt",
    })
    .sort({ createdAt: -1 });

  return SuccessResponse(res, {
    message: "Notifications fetched successfully",
    notifications,
  });
};

export const getUnreadCount = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not authorized");

  const userId = req.user.id;

  const count = await UserNotificationModel.countDocuments({
    user: userId,
    read: false,
  });

  return SuccessResponse(res, {
    unreadCount: count,
  });
};



export const getSingleNotification = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not authorized");

  const userId = req.user.id;
  const { id } = req.params; // ← ID of UserNotification

  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequest("Invalid notification ID format");
  }

  const userNotification = await UserNotificationModel.findOne({
    _id: id,
    user: userId,
  }).populate({
    path: "notification",
    model: NotificationModels,
    select: "title body relatedId createdAt",
  });

  if (!userNotification) {
    throw new NotFound("Notification not found for this user");
  }

  // لو مش مقروءة → نخليها مقروءة
  if (!userNotification.read) {
    userNotification.read = true;
    userNotification.readAt = new Date();
    await userNotification.save();
  }

  return SuccessResponse(res, {
    message: "Notification fetched successfully",
    notification: userNotification,
  });
};
