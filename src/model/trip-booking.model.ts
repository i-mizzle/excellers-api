import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";

export interface TripBookingDocument extends mongoose.Document {
    bookedBy: UserDocument['_id'];
    bookingType: string
    // invoice: Invoi
    createdAt?: Date;
    updatedAt?: Date;
}

const TripBookingSchema = new mongoose.Schema(
  {
    bookedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    bookingType: {
        type: String,
        enum: ['PRIVATE', 'PUBLIC'],
        default: 'PUBLIC'
    },
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    }, 
    travelers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true
            }
        }
    ]
  },
  { timestamps: true }
);

const TripBooking = mongoose.model<TripBookingDocument>("Trip", TripBookingSchema);

export default TripBooking;