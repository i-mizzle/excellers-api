import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";

export interface OriginDestination {
    country: string
    city: string
    airport: string
}

export interface TripDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    title: string
    description?: string
    origin : OriginDestination
    destination : OriginDestination
    price: number,
    lockDownPrice: number,
    startDate: Date,
    endDate: Date,
    deleted: Boolean
    active: Boolean
    createdAt?: Date;
    updatedAt?: Date;
}

const TripSchema = new mongoose.Schema(
  {
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required:true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    origin : {
        country: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        airport: {
            type: String,
            required: true
        }
    },
    destination : {
        country: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        airport: {
            type: String,
            required: true
        }
    },
    price: {
      type: Number,
      required: true
    },
    lockDownPrice: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    endDate: {
      type: Date,
      required: true
    },
  },
  { timestamps: true }
);

const Trip = mongoose.model<TripDocument>("Trip", TripSchema);

export default Trip;