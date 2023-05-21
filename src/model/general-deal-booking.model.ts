import mongoose from "mongoose";
import { InvoiceDocument } from "./invoice.model";
import { UserDocument } from "./user.model";
import { GeneralDealDocument } from "./general-deal.model";

export interface GeneralDealBookingDocument extends mongoose.Document {
    bookedBy?: UserDocument['_id'];
    invoice: InvoiceDocument['_id']
    deal: GeneralDealDocument['_id']
    affiliateBooking: Boolean
    bookingCode: String
    paymentStatus: String
    dealOwners: {
        name: string
        email: string
        phone: string
    }[]
    createdAt?: Date;
    updatedAt?: Date;
}

const GeneralDealBookingSchema = new mongoose.Schema(
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
    deal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GeneralDeal',
        requires: true
    },
    bookingCode: {
        type: String,
        required: true,
        immutable: true
    },
    affiliateBooking : {
        type: Boolean,
        default: false
    },
    dealOwners: [
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

const GeneralDealBooking = mongoose.model<GeneralDealBookingDocument>("GeneralDealBooking", GeneralDealBookingSchema);

export default GeneralDealBooking;