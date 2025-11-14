// models/Notification.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  body: string;
  relatedId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);


export const NotificationModels = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);
