import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface AddonDocument extends mongoose.Document {
  createdBy: UserDocument["_id"];
  price: number
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AddonSchema = new mongoose.Schema(
  {
    createdBy: { 
        type:  mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }, 
    name: { 
        type: String, 
        required: true
    }, 
    description: { 
        type: String, 
    }, 
    price: { 
        type: Number,
        required: true 
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Addon = mongoose.model<AddonDocument>("Addon", AddonSchema);

export default Addon;