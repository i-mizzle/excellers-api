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
import { StoreDocument } from './store.model';
import { MenuDocument } from './menu.model';

export interface OrderItem {
    item: ItemVariantDocument['_id']
    quantity: number
    price: number
}

export interface OrderDocument extends mongoose.Document {
    createdBy?: UserDocument['_id'];
    store: StoreDocument['_id']
    alias: string,
    source: string;
    items: OrderItem[];
    status: string;
    total: number;
    vat: number;
    sourceMenu: MenuDocument['_id']
    paymentStatus: string;
    deliveryAddress?: {
        address: string
        city: string
        state: string
    }
    createdAt?: Date;
    updatedAt?: Date;
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
            enum: ['ONLINE', 'ONSITE'],
            default: 'ONSITE'
        },
        sourceMenu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu',
            required: true
        },
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
        },
        items: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId, ref: 'ItemVariant',
                    required: true
                },
                displayName: {
                    type: String,
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
            required: true,
            default: 0
        },
        vat: {
            type: Number,
            default: 0
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
        },
        deliveryAddress: {
            address: {
                type: String,
            },
            city: {
                type: String
            },
            state: {
                type: String
            }
        }

    },
    { timestamps: true }
);

const Order = mongoose.model<OrderDocument>('Order', OrderSchema);

export default Order;