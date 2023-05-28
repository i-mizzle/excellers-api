import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface GeneralDealDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    originalPrice?: number | null,
    originalPricePerUnit: number,
    dealPrice?: number | null,
    dealPricing: {
      pricePerUnit: number,
      numberPerUnit: number,
    }
    title: string
    dealCode: string
    dealType: string,
    description: string,
    vendor: string,
    startDate: Date,
    endDate: Date,
    active?: Boolean
    deleted: Boolean,
    media?: {
      type: string
      url: string
    }[]
    createdAt?: Date;
    updatedAt?: Date;
}

const GeneralDealSchema = new mongoose.Schema(
  {
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    originalPricePerUnit: {
        type: Number,
        required: true
    },
    // dealPrice: {
    //     type: Number,
    //     required: true
    // },
    // price?: number | null
    dealPricing: {
      pricePerUnit: {
        type: Number,
        required: true
      },
      numberPerUnit: {
        type: Number,
        required: true
      },
    },
    dealCode: {
        type: String,
        required: true,
        immutable: true
    },
    dealType: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    vendor: {
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

const GeneralDeal = mongoose.model<GeneralDealDocument>("GeneralDeal", GeneralDealSchema);

export default GeneralDeal;