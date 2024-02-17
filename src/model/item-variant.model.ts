// const itemVariant = {
//     sku: '',
//     name: '',
//     description: '',
//     saleUnit: '',
//     lowStockAlertCount: '',m
//     input: [itemInput],
//     currentStock: 0,
// }

import mongoose from 'mongoose';
import { UserDocument } from "./user.model";
import { ItemDocument } from './item.model';

export interface Recipe {
    item: ItemDocument['_id'],
    measure: number
}

export interface ItemVariantDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    item: ItemDocument['_id'];
    name: string;
    sku: string;
    description: string;
    saleUnit: string;
    recipe: Recipe[]
    deleted: boolean
    createdAt: Date;
    updatedAt: Date;
}

const ItemVariantSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User',
            required: true
        },
        item: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Item'
        },
        name: {
            type: String,
            required: true
        },
        sku: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        saleUnit: {
            type: String,
            required: true
        },
        lowStockAlertCount: {
            type: Number,
            required: true
        },
        currentStock: {
            type: Number,
            default: 0
        },
        deleted: {
            type: Boolean,
            default: false
        },
        recipe: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId, ref: 'Item',
                    required: true
                },
                measure: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    { timestamps: true }
);

const ItemVariant = mongoose.model<ItemVariantDocument>('ItemVariant', ItemVariantSchema);

export default ItemVariant;