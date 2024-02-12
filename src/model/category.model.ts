import mongoose from 'mongoose';
import { UserDocument } from "./user.model";

export interface CategoryDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    name: string;
    description: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        type: {
            type: String,
            enum: ['store', 'sale'],
            default: 'store'
        }
    },
    { timestamps: true }
);

const Category = mongoose.model<CategoryDocument>('Category', CategorySchema);

export default Category;