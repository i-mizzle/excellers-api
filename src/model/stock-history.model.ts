import mongoose from 'mongoose';
import { UserDocument } from "./user.model";
import { ItemVariantDocument } from './item-variant.model';
import { ItemDocument } from './item.model';
import { StoreDocument } from './store.model';
import { OrderDocument } from './order.model';

export interface StockHistoryDocument extends mongoose.Document {
    recordedBy: UserDocument['_id'];
    store: StoreDocument['_id']
    item?: ItemDocument['_id'] 
    variant?: ItemVariantDocument['_id']
    order?: OrderDocument['_id'];
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
        store: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Store',
            required: true
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId, ref: 'ItemVariant',
        },
        item: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Item',
        },
        order: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Order',
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