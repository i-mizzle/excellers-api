import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { generateCode } from "../utils/utils";
import { SubscriptionPlanDocument } from "./subscription-plan.model";
import { UserDocument } from "./user.model";

export interface TransactionDocument extends mongoose.Document {
  user: UserDocument["_id"];
  transactionReference: string;
  amount: number;
  channel: string;
  processor: string;
  processorData?: object
  itemOwners?:object[]
  paymentFor: string,
  paymentItem?: SubscriptionPlanDocument["_id"]
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new mongoose.Schema(
  {
    transactionReference: { 
        type: String,
        unique: true,
        // default: nanoid(16),
        // default: generateCode(16, true),
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
      enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
      default: 'PENDING',
      required: true
    },
    paymentFor: {
      type: String,
      enum: ['TICKET', 'SUBSCRIPTION'],
      default: 'TICKET',
      required: true
    },
    paymentItem: {
      type: String,
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
    itemOwners: [],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }
  },
  { timestamps: true }
);

const Transaction = mongoose.model<TransactionDocument>("Transaction", TransactionSchema);

export default Transaction;