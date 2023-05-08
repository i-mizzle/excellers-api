import mongoose from "mongoose";
import { nanoid } from "nanoid";

import { PostDocument } from "./post.model";

export interface PostCommentDocument extends mongoose.Document {
  post: PostDocument["_id"];
  parentComment: PostCommentDocument["_id"];
  author: {
    name: string
    designation: string
  }
  published: Boolean,
  deleted: Boolean,
  adminComment: Boolean
}

const PostCommentSchema = new mongoose.Schema(
  {
    post: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Post",
      required: true
    },
    parentComment: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "PostComment" 
    },
    author: {
        name: { 
          type: String, 
          required: true 
        },
        designation: { 
          type: String
        },
    },
    comment: {
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
    adminComment: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
);

const PostComment = mongoose.model<PostCommentDocument>("PostComment", PostCommentSchema);

export default PostComment;