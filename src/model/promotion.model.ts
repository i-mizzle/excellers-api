import mongoose from 'mongoose';
import { UserDocument } from "./user.model";
import { ItemVariantDocument } from './item-variant.model';
import { StoreDocument } from './store.model';
import { ItemDocument } from './item.model';
import { CategoryDocument } from './category.model';

export interface PromoItem {
    item: ItemVariantDocument['_id']
    parentItem: ItemDocument['_id']
    parentItemCategory: CategoryDocument['_id']
    displayName?: string
}

export interface PromotionDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    store: StoreDocument['_id']
    name: string;
    description: string
    active: boolean
    promotionType: string
    discountType?: string
    discount?: number
    packPrice?: number
    allowedItems: PromoItem[];
    runTime: {
        start: Date
        end: Date
    }
    itemsPerSale: {
        minimum: number
        maximum: number
    }
    promoUnitsSold: number
    deleted: boolean
    createdAt: Date;
    updatedAt: Date;
}

const PromotionSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        store: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Store',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        promotionType: {
            type: String,
            enum: ['discount', 'pack_deal'],
            required: true
        },
        // pack deals don't require a discount type as they will have set prices
        discountType: {
            type: String,
            enum: ['percentage', 'fixed']
        },
        // only required if it's a discount
        discount: {
            type: Number
        },
        // only required if the promo is a pack deal
        packPrice: {
            type: Number
        },
        allowedItems: [
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
                }
            }
        ],
        runTime: {
            start: {
                type: Date
            },
            end: {
                type: Date
            }
        },
        itemsPerSale: {
            minimum: {
                type: Number,
                required: true
            },
            maximum: {
                type: Number,
                required: true
            },
        },
        promoUnitsSold: {
            type: Number
        },
        active: {
            type: Boolean,
            default: false
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Promotion = mongoose.model<PromotionDocument>('Promotion', PromotionSchema);

export default Promotion;