import mongoose from 'mongoose';
import { OrderItem } from './order.model';
import { ItemDocument } from './item.model';
import { CategoryDocument } from './category.model';

interface CartItem extends OrderItem {
    parentItem: ItemDocument['_id']
    parentItemCategory: CategoryDocument['_id']
}

export interface CartDocument extends mongoose.Document {
    clientId: string
    store: string
    items: CartItem[];
    checkoutStatus?: string,
    deleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const CartSchema = new mongoose.Schema(
    {
        clientId: {
            type: String,
            required: true
        },
        store: {
            type: mongoose.Schema.Types.ObjectId, ref: 'ItemVariant',
            required: true
        },
        items: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId, ref: 'ItemVariant',
                    required: true
                },
                parentItem: {
                    type: mongoose.Schema.Types.ObjectId, ref: 'Item',
                    required: true
                },
                parentItemCategory: {
                    type: mongoose.Schema.Types.ObjectId, ref: 'Category',
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
        deleted: {
            type: Boolean,
            default: false
        },
        checkoutStatus: {
            type: String,
            enum: ['pending', 'checked_out'],
            default: 'pending',
            required: true
        }
    },
    { timestamps: true }
);

const Cart = mongoose.model<CartDocument>('Cart', CartSchema);

export default Cart;