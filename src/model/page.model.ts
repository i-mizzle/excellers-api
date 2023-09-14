import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { UserDocument } from "./user.model";

export interface PageDocument extends mongoose.Document {
  user: UserDocument["_id"];
  title: string;
  slug: string;
  body: string;
  media: {
    type: string
    url: string
  }[]
//   excerpt: string
  coverImageUrl: string
  published: Boolean,
  deleted: Boolean
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    slug: {
      type: String,
      required: true
    },
    // excerpt: {
    //   type: String, 
    //   required: true 
    // },
    title: { 
      type: String, 
      required: true 
    },
    body: { 
      type: String, 
      required: true 
    },
    coverImageUrl: {
      type: String,
    },
    published: {
      type: Boolean,
      default: false
    },
    deleted: {
      type: Boolean,
      default: false
    },
    media: [
      {
        type: {
          type: String,
          enum: ['VIDEO', 'IMAGE', 'DOCUMENT'],
          default: 'IMAGE'
        },
        url: {
          type: String
        }
      }
    ],
  },
  { timestamps: true }
);

const Page = mongoose.model<PageDocument>("Page", PageSchema);

export default Page;