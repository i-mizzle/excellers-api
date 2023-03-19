import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { TripDocument } from "./trip.model";
import { UserDocument } from "./user.model";

export interface PackageDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    name: string
    description: string
    trips: TripDocument["_id"][]
    price: number
    media: {
      type: string
      url: string
    }[]
    lockDownPrice: number
    deleted: Boolean
    active: Boolean
    createdAt?: Date;
    updatedAt?: Date;
}

const PackageSchema = new mongoose.Schema(
  {
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    trips: [
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Trip" 
      }
    ],
    media: [
      {
        type: {
          type: String,
          enum: ['VIDEO', 'IMAGE', 'DOCUMENT'],
          default: 'IMAGE'
        },
        url: {
          type: String
        }
      }
    ],
    price: {
      type: Number,
      required: true
    },
    lockDownPrice: {
      type: Number,
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
  },
  { timestamps: true }
);

const Package = mongoose.model<PackageDocument>("Package", PackageSchema);

export default Package;