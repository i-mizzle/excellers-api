import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { generateCode } from "../utils/utils";
import { InvoiceDocument } from "./invoice.model";
import { UserDocument } from "./user.model";

export interface TransactionDocument extends mongoose.Document {
  user?: UserDocument["_id"];
  invoice: InvoiceDocument["_id"];
  userType?: string
  transactionReference: string;
  amount: number;
  channel: string;
  processor: string;
  flutterwaveTransactionId?: string
  processorData?: object
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new mongoose.Schema(
  {
    transactionReference: { 
        type: String,
        unique: true,
        required: true,
        immutable: true
    },
    flutterwaveTransactionId: {
      type: String
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Invoice',
      required: true
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
    },
    userType: { 
        type: String, 
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
      default: 'PENDING',
      required: true
    },
    channel: { 
        type: String,
        enum: ['CASH', 'POS', 'TRANSFER', 'ONLINE'],
        required: true
    },
    processor: {
        type: String,
        enum: ['FLUTTERWAVE', 'CASHIER'],
        default: 'FLUTTERWAVE'
    },
    processorData: {},
  },
  { timestamps: true }
);

const Transaction = mongoose.model<TransactionDocument>("Transaction", TransactionSchema);

export default Transaction;