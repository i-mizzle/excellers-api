import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';
// import config from 'config';
import { UserDocument } from "./user.model";

export interface StoreDocument extends mongoose.Document {
    email: string;
    createdBy?: UserDocument['_id'];
    name: string;
    address: string;
    city: string;
    state: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const StoreSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const Store = mongoose.model<StoreDocument>('Store', StoreSchema);

export default Store;