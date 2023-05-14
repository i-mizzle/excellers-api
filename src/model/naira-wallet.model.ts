import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface NairaWalletDocument extends mongoose.Document {
  user: UserDocument["_id"];
  accountReference: string;
//   reservationReference: string;
  accountName: string;
  accountNumber: string;
  flwSubAccountReference: string;
  bankCode: string;
  bankName: string;
  accountParent: string;
  accountCustomerId: string;
  createdAt: Date;
  updatedAt?: Date;
}

const NairaWalletSchema = new mongoose.Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    flwSubAccountReference: {
        type: String
    },
    accountReference: {
        type: String,
        required: true
    },
    // reservationReference: {
    //     type: String,
    //     required: true
    // },
    accountName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    bankCode: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    accountCustomerId: {
        type: String
    },
    accountParent: {
        type: String
    }
  },
  { timestamps: true }
);


const NairaWallet = mongoose.model<NairaWalletDocument>("NairaWallet", NairaWalletSchema);

export default NairaWallet;