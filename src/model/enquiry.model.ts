import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface EnquiryDocument extends mongoose.Document {
  enquiryByGuest: boolean;
  user: UserDocument["_id"];
  guest: {};
  message: string;
  property: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EnquirySchema = new mongoose.Schema(
  {
    guest: {
      name: { 
        type: String, 
      }, 
      email: { 
        type: String, 
      }, 
      phone: { 
        type: String, 
      }, 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    property: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Property" 
    },
    enquiryByGuest: { type: Boolean, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Enquiry = mongoose.model<EnquiryDocument>("Enquiry", EnquirySchema);

export default Enquiry;