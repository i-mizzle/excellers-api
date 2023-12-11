import mongoose from 'mongoose';
import { StoreDocument } from './store.model';

export interface StoreSettingDocument extends mongoose.Document {
    store: StoreDocument['_id'];
    taxes: {
        enabled: boolean
        includeTaxesInMenu: boolean
        rate: number
    }
    receivingAccounts: {
        enabled: boolean
        accounts: {
            bank: string
            accountName: string
            accountNumber: string
            description: string
        }[]
    }
    posDevices: {
        enabled: boolean
        devices: {
            deviceName: string
            provider: string
            serialNumber: string
        }[]
    }
    deliveryCharges: {
        enabled: boolean
        charges: {
            location: string,
            charge: number
        }[]
    }
    createdAt?: Date;
    updatedAt?: Date;
}

const StoreSettingSchema = new mongoose.Schema(
    {
        store: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Store'
        },
        taxes: {
            enabled: {
                type: Boolean,
                default: false
            },
            includeTaxesInMenu: {
                type: Boolean,
                default: false
            },
            rate: {
                type: Number
            },
        },
        receivingAccounts: {
            enabled: {
                type: Boolean,
                default: false
            },
            accounts: [
                {
                    bank: {
                        type: String
                    },
                    accountName: {
                        type: String
                    },
                    accountNumber: {
                        type: String
                    },
                    description: {
                        type: String
                    },
                }
            ]
        },
        posDevices: {
            enabled: {
                type: Boolean,
                default: false
            },
            devices: [
                {
                    deviceName: {
                        type: String
                    },
                    provider: {
                        type: String
                    },
                    serialNumber: {
                        type: String
                    }
                }
            ]
        },
        deliveryCharges: {
            enabled: {
                type: Boolean,
                default: false
            },
            charges: [
                {
                    location: {
                        type: String
                    },
                    charge: {
                        type: Number
                    },
                }
            ]
        },
    },
    { timestamps: true }
);


const StoreSetting = mongoose.model<StoreSettingDocument>('StoreSetting', StoreSettingSchema);

export default StoreSetting;