import mongoose from 'mongoose';
import { OrderItem } from './order.model';

export interface CartDocument extends mongoose.Document {
    clientId: string
    items: OrderItem;
    createdAt: Date;
    updatedAt: Date;
}

const CartSchema = new mongoose.Schema(
    {
        clientId: {
            type: String,
            required: true
        },
        items: [
            {
                item: {
                    type: String,
                    required: true
                },

            }
        ],
        checkoutStatus: {
            type: String,
            enum: ['pending', 'checked_out']
        }
    },
    { timestamps: true }
);

const Cart = mongoose.model<CartDocument>('Cart', CartSchema);

export default Cart;