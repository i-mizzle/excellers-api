import Booking, { BookingDocument, Passenger } from "../model/booking.model";
import { bookFlight } from "./integrations/tiqwa.service";
import { v4 as uuidv4 } from 'uuid';
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { generateCode } from "../utils/utils";

export const createBooking = async (
    input: {
        passengers: Array<Passenger>
    }, 
    flightId: string,
    documentRequirement: Boolean
    ) => {
    try {
        const booking = await bookFlight(input, flightId)
        const bookingCode = generateCode(16, false).toUpperCase()

        if(booking.error) {
            return booking
        }

        const bookingPayload = {
            ...input, 
            ...{
                bookingCode: bookingCode,
                flightId: flightId
            }, 
            ...{documentRequired: documentRequirement},
            ...booking.data
        }

        bookingPayload.documentRequired = documentRequirement
        const newBooking = await Booking.create(bookingPayload)
        return {
            error: false,
            errorType: '',
            data: newBooking
        }
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findBookings(
    query: FilterQuery<BookingDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Booking.find(query, {}, options).countDocuments()
    let bookings = null
    if(perPage===0&&page===0){
        bookings = await Booking.find(query, {}, options).populate(expand)
    } else {
        bookings = await Booking.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);

    }

    return {
        total,
        bookings
    }
}

export async function findBooking(
    query: FilterQuery<BookingDocument>,
    options: QueryOptions = { lean: true },
    expand?: string,
) {
    try {
        const booking = await Booking.findOne(query, {}, options).populate(expand)
        
        return booking
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateBooking(
    query: FilterQuery<BookingDocument>,
    update: UpdateQuery<BookingDocument>,
    options: QueryOptions
) {

    try {
        return Booking.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        throw new Error(error)
    }
}