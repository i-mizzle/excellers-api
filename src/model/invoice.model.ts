// link to transaction reference in transactions model
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { generateCode } from "../utils/utils";
import { UserDocument } from "./user.model";

export interface InvoiceDocument extends mongoose.Document {
  user?: UserDocument["_id"];
  invoiceCode: string;
  amount: number;
  invoiceFor: string,
  status?: string
  expiry: Date
  invoiceItem: mongoose.Schema.Types.ObjectId,
  createdAt?: Date;
  updatedAt?: Date;
}

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceCode: { 
        type: String,
        unique: true,
        required: true
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'PART_PAID'],
      default: 'PENDING',
      required: true
    },
    invoiceFor: {
      type: String,
      enum: ['PACKAGE', 'FLIGHT', 'ENQUIRY'],
      default: 'PACKAGE',
      required: true
    },
    invoiceItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    expiry: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

const Invoice = mongoose.model<InvoiceDocument>("Invoice", InvoiceSchema);

export default Invoice;