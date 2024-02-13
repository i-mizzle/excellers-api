import mongoose from 'mongoose';
import { UserDocument } from "./user.model";

export interface ShippingLocationDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    location: string;
    price: number;
    deleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ShippingLocationSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        location: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        deleted: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

const ShippingLocation = mongoose.model<ShippingLocationDocument>('ShippingLocation', ShippingLocationSchema);

export default ShippingLocation;