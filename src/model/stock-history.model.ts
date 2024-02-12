import mongoose from 'mongoose';
import { UserDocument } from "./user.model";
import { ItemVariantDocument } from './item-variant.model';
import { ItemDocument } from './item.model';

export interface StockHistoryDocument extends mongoose.Document {
    recordedBy: UserDocument['_id'];
    item: ItemDocument['_id'] | ItemVariantDocument['_id']
    stockBeforeChange: number;
    note: string;
    type: string;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const StockHistorySchema = new mongoose.Schema(
    {
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId, ref: 'ItemVariant',
        },
        item: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Item',
        },
        stockBeforeChange: {
            type: Number,
            required: true
        },
        note: {
            type: String
        },
        type: {
            type: String,
            enum: ['increase', 'decrease'],
            default: 'increase'
        },
        quantity:{
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

const StockHistory = mongoose.model<StockHistoryDocument>('StockHistory', StockHistorySchema);

export default StockHistory;