import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { UserDocument } from "./user.model";

export interface DealDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    voucherCode: string,
    type: string,
    value: number,
    title: string
    description: string,
    startDate: Date,
    endDate: Date,
    active: Boolean
    deleted: Boolean
    createdAt?: Date;
    updatedAt?: Date;
}

const DealSchema = new mongoose.Schema(
  {
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    voucherCode: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['PERCENTAGE', 'FIXED'],
        required: true
    },
    value: {
        type: Number,
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
    }
  },
  { timestamps: true }
);

const Deal = mongoose.model<DealDocument>("Deal", DealSchema);

export default Deal;