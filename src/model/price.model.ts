import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { UserDocument } from "./user.model";

export interface PriceDocument extends mongoose.Document {
  user: UserDocument["_id"];
  item: string;
  slug: string;
  unit: string;
  price: string;
  createdAt: Date;
  updatedAt: Date;
}

const PriceSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    item: { 
      type: String, 
      required: true 
    },
    slug: { 
      type: String, 
      required: true,
      immutable: true
    },
    unit: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
  },
  { timestamps: true }
);

const Price = mongoose.model<PriceDocument>("Price", PriceSchema);

export default Price;