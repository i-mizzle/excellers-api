// const orderItem = {
//     itemName: "",
//     sku: "",
//     quantity: "",
//     price: ""
// }

// const order = {
//     orderAlias: "",
//     orderItems: [],
//     total: "",
//     createdBy: userDetails()._id
// }

import mongoose from 'mongoose';
import { UserDocument } from "./user.model";
import { ItemVariantDocument } from './item-variant.model';

export interface OrderItem {
    item: ItemVariantDocument['_id']
    quantity: number
    price: number
}

export interface OrderDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    alias: string,
    items: OrderItem[];
    description: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        alias: {
            type: String,
            required: true
        },
        source: {
            type: String,
            enum: ['online', 'onsite'],
            default: 'onsite'
        },
        items: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId, ref: 'ItemVariant',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                price: { 
                    type: Number,
                    required: true
                }
            }
        ],
        total: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            default: 'IN_PROGRESS',
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['UNPAID', 'PART_PAID', 'PAID'],
            default: 'UNPAID',
            required: true
        }
    },
    { timestamps: true }
);

const Order = mongoose.model<OrderDocument>('Order', OrderSchema);

export default Order;