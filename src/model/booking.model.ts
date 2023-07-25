import mongoose from "mongoose";
import { InvoiceDocument } from "./invoice.model";
import { AddonDocument } from "./addon.model";
import { FlightDealDocument } from "./flight-deal.model";
import { UserDocument } from "./user.model";
import { MarginDocument } from "./margin.model";

export interface Passenger {
    passengerType: string
    firstName: string
    lastName: string
    dob: string
    gender: string,
    title: string,
    email: string,
    phoneNumber: string,
    documents: PassengerDocument
}

interface PassengerDocument {
    number: string
    issuingDate: string
    expiryDate: string
    issuingCountry: string
    nationalityCountry: string
    documentType: string
    holder: Boolean
}

interface Flight {
    airportFrom: string
    airportTo: string
    arrivalTime: Date
    baggage: string
    bookingClass: string,
    cabinType: string
    departureTime: Date
    duration: number
    equipmentType: string
    flightNumber: string
    layover: string | null
    marketingAirline: string,
    marriageGroup: string | null,
    operatingAirline: string,
    overnight: Boolean
  }

export interface BookingDocument extends mongoose.Document {
    bookingCode: string
    flightId: string
    passengers: Array<Passenger>
    margin: MarginDocument['_id']
    addons: Array<AddonDocument['_id']>
    deal?: FlightDealDocument['_id']
    addonsTotal: number,
    ticketed: Boolean
    cancelled: Boolean
    amount: number
    bookableSeats: number
    currency: string
    documentRequired: Boolean
    expiresAt: string
    inbound: Array<Flight>
    inboundStops: number
    outbound: Array<Flight>
    outboundStops: number
    priceChange: Boolean,
    pricing: any,
    reference: string
    totalDuration: number
    invoice: InvoiceDocument['_id'],
    affiliateBooking: Boolean
    paymentStatus: string
    totalInboundDuration: number | null
    totalOutboundDuration: number | null
    travelersPrice: Array<object>
    bookedBy?: UserDocument["_id"]
    createdAt?: Date;
    updatedAt?: Date;
}

const BookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      unique: true,
      immutable: true
    },
    flightId: {type: String},
    invoice: { 
      type:  mongoose.Schema.Types.ObjectId, 
      ref: 'Invoice'
    },
    paymentStatus: {
      type: String
    },
    addons: [
      {
        type:  mongoose.Schema.Types.ObjectId, 
        ref: 'Addon'
      }
    ],
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FlightDeal' 
    },
    affiliateBooking:{
      type: Boolean,
      default: false
    },
    addonsTotal: {type: Number},
    passengers: [],
    margin: { 
      type:  mongoose.Schema.Types.ObjectId, 
      ref: 'Margin'
    },
    amount: {type: Number},
    ticketed: {type: Boolean, default: false},
    cancelled: {type: Boolean, default: false},
    bookableSeats: {type: Number},
    currency: {type: String},
    documentRequired: {type: Boolean},
    expiresAt: {type: String},
    inbound: [],
    inboundStops: {type: String},
    outbound: [],
    outboundStops: {type: Number},
    pricing: {},
    priceChange: {type: Boolean},
    reference: {type: String},
    totalDuration: {type: Number},
    totalInboundDuration: {},
    totalOutboundDuration: {type: Number},
    travelersPrice: [],
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const Booking = mongoose.model<BookingDocument>("Booking", BookingSchema);

export default Booking;