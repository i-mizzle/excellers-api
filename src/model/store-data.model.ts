import mongoose from 'mongoose';
import { StoreDocument } from './store.model';
import { UserDocument } from './user.model';
export interface StoreDataDocument extends mongoose.Document {
    localId?: string;
    documentType: string;
    createdBy: UserDocument['_id'];
    store: StoreDocument['_id']
    document: object;
    createdAt?: Date;
    updatedAt?: Date;
}

const StoreDataSchema = new mongoose.Schema(
    {
        localId: {
            type: String,
            // required: true,
            // unique: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        documentType: {
            type: String,
            required: true
        },
        store: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Store',
            // required: true
        },
        transformed: {
            type: Boolean,
            default: false
        },
        document: {
            type: Object
        },
    },
    { timestamps: true }
);

const StoreData = mongoose.model<StoreDataDocument>('StoreData', StoreDataSchema);

export default StoreData;