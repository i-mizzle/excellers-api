import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { TripDocument } from "./trip.model";
import { UserDocument } from "./user.model";

export interface PackageDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    name: string
    description: string
    packageType: string
    features: string[]
    packagePlan: {
      title: string
      description: string
    }[]
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
    packageType: {
      type: String,
      required: true,
      enum: ['PACKAGE', 'GROUP'],
      default: 'GROUP'
    },
    features: [
      {type: String}
    ],
    packagePlan: [
      {
        title: {
          type: String
        }, 
        description: {
          type: String
        }
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