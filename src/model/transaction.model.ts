import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import { OrderDocument } from "./order.model";
import { StoreDocument } from "./store.model";

export interface TransactionDocument extends mongoose.Document {
  createdBy?: UserDocument["_id"];
  order: OrderDocument["_id"];
  store: StoreDocument["_id"];
  transactionReference: string;
  receivingChannel?: any;
  amount: number;
  channel: string;
  status?: string;
  processor: string;
  flutterwaveTransactionId?: string
  processorData?: object
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Store',
      required: true
    },
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
      default: 'pending',
      required: true
    },
    receivingChannel: {},
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