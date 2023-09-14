import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface BannerDocument extends mongoose.Document {
    user: UserDocument["_id"];
    title: string;
    slug: string;
    mediaType: string
    mediaUrl: string
    published: Boolean,
    deleted: Boolean
    createdAt: Date;
    updatedAt: Date;
}

const BannerSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    slug: {
      type: String,
      required: true
    },
    title: { 
      type: String, 
      required: true 
    },
    published: {
      type: Boolean,
      default: false
    },
    deleted: {
      type: Boolean,
      default: false
    },
    mediaType: {
        type: String,
        enum: ['VIDEO', 'IMAGE', 'DOCUMENT'],
        default: 'IMAGE'
    },
    mediaUrl: {
        type: String
    }
  },
  { timestamps: true }
);

const Banner = mongoose.model<BannerDocument>("Banner", BannerSchema);

export default Banner;