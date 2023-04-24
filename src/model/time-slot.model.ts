import mongoose from 'mongoose';

export interface TimeSlotDocument extends mongoose.Document {
    label: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TimeSlotSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            unique: true,
            required: true
        },
        order: {
            type: Number,
            required: true
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const TimeSlot = mongoose.model<TimeSlotDocument>('TimeSlot', TimeSlotSchema);

export default TimeSlot;