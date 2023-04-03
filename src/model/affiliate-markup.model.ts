import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface AffiliateMarkupDocument extends mongoose.Document {
  user: UserDocument["_id"];
  approvedBy: UserDocument["_id"];
  markup: number
  markupType: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AffiliateMarkupSchema = new mongoose.Schema(
  {
    user: { 
        type:  mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }, 
    approvedBy: { 
        type:  mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }, 
    markupType: { 
        type: String, 
        enum: ['PERCENTAGE', 'FLAT'],
        required: true
    }, 
    markup: { 
        type: Number,
        required: true 
    }
  },
  { timestamps: true }
);

const AffiliateMarkup = mongoose.model<AffiliateMarkupDocument>("AffiliateMarkup", AffiliateMarkupSchema);

export default AffiliateMarkup;