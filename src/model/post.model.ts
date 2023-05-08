import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { UserDocument } from "./user.model";

export interface PostDocument extends mongoose.Document {
  user: UserDocument["_id"];
  title: string;
  body: string;
  authors: {
    name: string
    designation: string
  }[]
  media: {
    type: string
    url: string
  }[]
  excerpt: string
  coverImageUrl: string
  published: Boolean,
  deleted: Boolean
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" },
    authors: [
      {
        name: { 
          type: String, 
          required: true 
        },
        designation: { 
          type: String
        },
      }
    ],
    excerpt: {
      type: String, 
      required: true 
    },
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

const Post = mongoose.model<PostDocument>("Post", PostSchema);

export default Post;