import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';
// import config from 'config';
import { UserDocument } from "./user.model";

export interface StoreDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    name: string;
    address: string;
    city: string;
    state: string;
    createdAt: Date;
    updatedAt: Date;
}

const StoreSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const Store = mongoose.model<StoreDocument>('Store', StoreSchema);

export default Store;

// taxes: {
//     enabled: false,
//     description: 'Taxes that will be applied to all purchases',
//     rate: 0,
//     includeTaxesInMenu: true
// },
// receivingAccounts: {
//     enabled: false,
//     description: 'Registered accounts into which to allow transfers for payments',
//     accounts: [
//         {
//             bank: "",
//             accountNumber: "",
//             accountName: "",
//             description: ""
//         }
//     ]
// },
// posDevices: {
//     enabled: false,
//     description: 'Registered POS devices to be used in receiving payments via customer credit/debit cards',
//     devices: [
//         {
//             deviceName: "",
//             provider: "",
//             serialNumber: ""
//         }
//     ]
// },
// deliveryCharges: {
//     enabled: false,
//     description: 'Delivery charges to various locations for your e-commerce platform',
//     charges: [
//         {
//             location: "",
//             charge: ""
//         }
//     ]
// }