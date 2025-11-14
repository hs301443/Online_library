import { Router } from 'express';
import {
  sendNotificationToAll,
  sendNotificationToSingle,
  getAllNotifications,
  getNotificationById,
  deleteNotification
} from '../../controller/admin/notification';

import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.post('/', catchAsync(sendNotificationToAll));

router.post('/:userId', catchAsync(sendNotificationToSingle));

router.get('/', catchAsync(getAllNotifications));

router.get('/:id', catchAsync(getNotificationById));

router.delete('/:id', catchAsync(deleteNotification));

export default router;
