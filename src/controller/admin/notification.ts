// controllers/admin/notificationController.ts

import { NotificationModels } from '../../models/schema/Notification';
import { UserNotificationModel } from '../../models/schema/UserNotification';
import { User } from '../../models/schema/auth/User';
import { messaging } from '../../utils/firebase';

import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { SuccessResponse } from "../../utils/response";



// =============================
// 🔥 إرسال إشعار لكل المستخدمين
// =============================
export const sendNotificationToAll = async (req: Request, res: Response) => {
  const { title, body, relatedId } = req.body;

  if (!title || !body) {
    throw new BadRequest("Title and body are required");
  }

  const allUsers = await User.find({}, { _id: 1, fcmtoken: 1 }).lean();

  if (!allUsers.length) throw new NotFound("No users found");

  const validUsers = allUsers.filter(
    user =>
      user.fcmtoken &&
      typeof user.fcmtoken === "string" &&
      user.fcmtoken.trim() &&
      user.fcmtoken !== "null" &&
      user.fcmtoken !== "undefined"
  );

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
  const newNotification = await NotificationModels.create({
    title,
    body,
    relatedId: relatedId || null,
  });

  // ربط الإشعار بكل المستخدمين
  const userNotifications = validUsers.map(user => ({
    user: user._id,
    notification: newNotification._id,
  }));

  await UserNotificationModel.insertMany(userNotifications);

  // إرسال FCM
  const tokens = validUsers
  .map(user => user.fcmtoken)
  .filter(token => typeof token === 'string');
  const fcmResponse = await messaging.sendEachForMulticast({
    notification: { title, body },
    tokens,
  });

  return SuccessResponse(res, {
    message: "Notification sent to all users",
    notificationId: newNotification._id,
    results: {
      successCount: fcmResponse.successCount,
      failureCount: fcmResponse.failureCount,
      totalTokens: tokens.length,
    },
  }, 200);
};



// =============================
// 🔥 إرسال إشعار ليوزر واحد
// =============================
export const sendNotificationToSingle = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { title, body, relatedId } = req.body;

  if (!title || !body) throw new BadRequest("Title and body are required");

  const user = await User.findById(userId).lean();

  if (!user) throw new NotFound("User not found");
  if (!user.fcmtoken) throw new BadRequest("User does not have a valid FCM token");

  const notification = await NotificationModels.create({
    title,
    body,
    relatedId: relatedId || null,
  });

  await UserNotificationModel.create({
    user: user._id,
    notification: notification._id,
  });

  await messaging.send({
    token: user.fcmtoken,
    notification: { title, body },
  });

  return SuccessResponse(res, {
    message: "Notification sent to user",
    notification,
  }, 200);
};



// =============================
// 🔥 جلب كل الإشعارات
// =============================
export const getAllNotifications = async (req: Request, res: Response) => {
  const notifications = await NotificationModels.find({});

  if (!notifications.length)
    throw new NotFound("No notifications found");

  return SuccessResponse(res, {
    message: "Notifications fetched successfully",
    notifications,
  }, 200);
};



// =============================
// 🔥 جلب إشعار بالـ ID
// =============================
export const getNotificationById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) throw new BadRequest("id is required");

  const notification = await NotificationModels.findById(id);
  if (!notification) throw new NotFound("Notification not found");

  return SuccessResponse(res, {
    message: "Notification fetched successfully",
    notification,
  }, 200);
};




// =============================
// 🔥 حذف الإشعار
// =============================
export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) throw new BadRequest("id is required");

  const notification = await NotificationModels.findByIdAndDelete(id);
  if (!notification) throw new NotFound("Notification not found");

  return SuccessResponse(res, {
    message: "Notification deleted successfully",
    notification,
  }, 200);
};
