import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface EnquiryDocument extends mongoose.Document {
  user: UserDocument["_id"];
  guest: {};
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EnquirySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
    }, 
    email: { 
      type: String, 
    }, 
    phone: { 
      type: String, 
    }, 
    enquiryType: {
      type: String,
      enum: ['PACKAGE', 'DEAL', 'GENERAL', 'VISA'],
      default: 'GENERAL'
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
      default: 'PENDING'
    },
    message: { type: String, required: true },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Enquiry = mongoose.model<EnquiryDocument>("Enquiry", EnquirySchema);

export default Enquiry;