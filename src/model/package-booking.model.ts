import mongoose from "mongoose";
import { InvoiceDocument } from "./invoice.model";
import { PackageDocument } from "./package.model";
import { UserDocument } from "./user.model";

export interface PackageBookingDocument extends mongoose.Document {
    bookedBy?: UserDocument['_id'];
    invoice: InvoiceDocument['_id']
    package: PackageDocument['_id']
    affiliateBooking: Boolean
    lockDown: Boolean,
    bookingCode: String,
    paymentStatus: String
    packageOwners: {
        name: string
        email: string
        phone: string
    }[]
    createdAt?: Date;
    updatedAt?: Date;
}

const PackageBookingSchema = new mongoose.Schema(
  {
    bookedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        // required: true
    }, 
    paymentStatus: {
        type: String,
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        requires: true
    },
    bookingCode: {
        type: String,
        required: true,
        immutable: true
    },
    lockDown: {
        type: Boolean 
    },
    affiliateBooking : {
        type: Boolean,
        default: false
    },
    packageOwners: [
        {
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true
            }
        }
    ]
  },
  { timestamps: true }
);

const PackageBooking = mongoose.model<PackageBookingDocument>("PackageBooking", PackageBookingSchema);

export default PackageBooking;