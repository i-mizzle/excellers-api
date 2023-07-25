import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { UserDocument } from "./user.model";

export interface PostDocument extends mongoose.Document {
  user: UserDocument["_id"];
  title: string;
  slug: string;
  body: string;
  readTimeOverride?: number;
  authors: {
    name: string
    designation: string
  }[]
  media: {
    type: string
    url: string
  }[]
  excerpt: string
  meta: {
    wordCount: number
    readTime: number
    readTimeUnit: string
    readTimeBasis: string
  }
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
    slug: {
      type: String,
      required: true
    },
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
    readTimeOverride: {
      type: Number
    },
    meta: {
      wordCount: {
        type: Number,
        required: true
      },
      readTime: {
        type: Number,
        required: true
      },
      readTimeUnit: {
        type: String,
        required: true
      },
      readTimeBasis: {
        type: String,
        required: true
      }
    }
  },
  { timestamps: true }
);

const Post = mongoose.model<PostDocument>("Post", PostSchema);

export default Post;