import mongoose from 'mongoose';
import { UserDocument } from "./user.model";
import { StoreDocument } from './store.model';

export interface CategoryDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    store: StoreDocument['_id']
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
        store: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Store',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        deleted: {
            type: Boolean,
            default: false
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