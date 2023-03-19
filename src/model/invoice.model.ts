// link to transaction reference in transactions model
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { generateCode } from "../utils/utils";
import { UserDocument } from "./user.model";

export interface InvoiceDocument extends mongoose.Document {
  user: UserDocument["_id"];
  invoiceCode: string;
  amount: number;
  invoiceFor: string,
  invoiceItem: mongoose.Schema.Types.ObjectId,
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceCode: { 
        type: String,
        unique: true,
        required: true
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
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
      enum: ['PACKAGE', 'TRIP', 'FLIGHT'],
      default: 'PACKAGE',
      required: true
    },
    invoiceItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }
  },
  { timestamps: true }
);

const Invoice = mongoose.model<InvoiceDocument>("Invoice", InvoiceSchema);

export default Invoice;