import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface PackageDealDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    package: mongoose.Document["_id"] | string,
    discountType: string,
    discountValue: number,
    title: string
    dealCode: string
    description: string,
    startDate: Date,
    endDate: Date,
    active: Boolean
    deleted: Boolean,
    media?: {
      type: string
      url: string
    }[]
    createdAt?: Date;
    updatedAt?: Date;
}

const PackageDealSchema = new mongoose.Schema(
  {
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    package: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Package',
      required: true
    },
    discountType: {
        type: String,
        enum: ['PERCENTAGE', 'FIXED'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    dealCode: {
        type: String,
        required: true,
        immutable: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    },
    deleted: {
      type: Boolean,
      default: false
    },
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
  },
  { timestamps: true }
);

const PackageDeal = mongoose.model<PackageDealDocument>("PackageDeal", PackageDealSchema);

export default PackageDeal;