import mongoose from "mongoose";

export interface LimitProfileDocument extends mongoose.Document {
    limitProfileCode: string;
    limitProfileName: string,
    singleTransactionValue: Number;
    dailyTransactionValue: Number;
    dailyTransactionVolume: Number;
    createdAt?: Date;
    updatedAt?: Date;
}

const NairaWalletSchema = new mongoose.Schema(
  {
    limitProfileCode: {
        type: String,
        required: true
    },
    limitProfileName: {
        type: String,
        required: true
    },
    singleTransactionValue: {
        type: Number,
        required: true
    },
    dailyTransactionVolume: {
        type: Number,
        required: true
    },
    dailyTransactionValue: {
        type: Number,
        required: true
    },
  },
  { timestamps: true }
);

const LimitProfile = mongoose.model<LimitProfileDocument>("LimitProfile", NairaWalletSchema);

export default LimitProfile;