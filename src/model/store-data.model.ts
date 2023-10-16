import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';
// import config from 'config';
// import { UserDocument } from "./user.model";

export interface StoreDataDocument extends mongoose.Document {
    localId: string;
    document: object;
    createdAt?: Date;
    updatedAt?: Date;
}

const StoreDataSchema = new mongoose.Schema(
    {
        localId: {
            type: String,
            required: true,
            unique: true
        },
        document: {
            type: Object
        },
    },
    { timestamps: true }
);

const StoreData = mongoose.model<StoreDataDocument>('StoreData', StoreDataSchema);

export default StoreData;