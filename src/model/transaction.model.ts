import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import { OrderDocument } from "./order.model";

export interface TransactionDocument extends mongoose.Document {
  user?: UserDocument["_id"];
  order: OrderDocument["_id"];
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
    order: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order',
      required: true
    },
    createdBy: { 
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
      enum: ['pending', 'successful', 'failed'],
      default: 'PENDING',
      required: true
    },
    channel: { 
        type: String,
        enum: ['cash', 'pos', 'transfer', 'web'],
        required: true
    },
    processor: {
        type: String,
        enum: ['flutterwave', 'cashier'],
        default: 'cashier'
    },
    processorData: {},
  },
  { timestamps: true }
);

const Transaction = mongoose.model<TransactionDocument>("Transaction", TransactionSchema);

export default Transaction;