import mongoose from 'mongoose';
import { UserDocument } from "./user.model";
import { ItemVariantDocument } from './item-variant.model';

export interface MenuItem {
    item: ItemVariantDocument['_id']
    displayName: string
    price: number
}

export interface MenuDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    name: string;
    description: string
    eCommerceMenu: boolean
    items: MenuItem[];
    createdAt: Date;
    updatedAt: Date;
}

const MenuSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        eCommerceMenu: {
            type: Boolean,
            default: false
        },
        items: [
            {
                item: { 
                    type: mongoose.Schema.Types.ObjectId, ref: 'ItemVariant',
                    required: true
                },
                displayName: {
                    type: String,
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    { timestamps: true }
);

const Menu = mongoose.model<MenuDocument>('Menu', MenuSchema);

export default Menu;