import mongoose from "mongoose";
import { generateCode } from "../utils/utils";
import { UserDocument } from "./user.model";

export interface ConfirmationCodeDocument extends mongoose.Document {
    code: string;
    type: string;
    expiry: Date
    valid?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ConfirmationCodeSchema = new mongoose.Schema(
  {
    // user: { 
    //     type: mongoose.Schema.Types.ObjectId, 
    //     ref: "User" 
    // },
    code: { 
      type: String, 
      required: true 
    },
    valid: {
        type: Boolean,
        default: true
    },
    expiry: {
      type: Date,
      required: true
    },
    type: { 
      type: String, 
      enum: ['PASSWORD_RESET', 'EMAIL_CONFIRMATION', 'ADMIN_INVITATION'],
      default: 'EMAIL_CONFIRMATION',
      required: true 
    },
  },
  { timestamps: true }
);

const ConfirmationCode = mongoose.model<ConfirmationCodeDocument>("ConfirmationCode", ConfirmationCodeSchema);

export default ConfirmationCode;