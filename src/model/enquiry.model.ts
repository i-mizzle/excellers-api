import mongoose from 'mongoose';
import { StoreDocument } from './store.model';

export interface EnquiryDocument extends mongoose.Document {
    store: StoreDocument['_id']
    name: string;
    enquiry: string
    email: string
    phone?: string
    deleted: boolean
    createdAt: Date;
    updatedAt: Date;
}

const EnquirySchema = new mongoose.Schema(
    {
        store: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Store',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
        },
        enquiry: {
            type: String,
            required: true
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Enquiry = mongoose.model<EnquiryDocument>('Enquiry', EnquirySchema);

export default Enquiry;