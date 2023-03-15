import mongoose from "mongoose";

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
    outboundStps: number
    priceChange: Boolean,
    pricing: any,
    reference: string
    totalDuration: number
    totalInboundDuration: number | null
    totalOutboundDuration: number | null
    travelersPrice: Array<object>
    createdAt?: Date;
    updatedAt?: Date;
}

const BookingSchema = new mongoose.Schema(
  {
    bookingCode: {type: String},
    flightId: {type: String},
    passengers: [],
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
    outboundStps: {type: Number},
    pricing: {},
    priceChange: {type: Boolean},
    reference: {type: String},
    totalDuration: {type: Number},
    totalInboundDuration: {},
    totalOutboundDuration: {type: Number},
    travelersPrice: []
  },
  { timestamps: true }
);

const Booking = mongoose.model<BookingDocument>("Booking", BookingSchema);

export default Booking;