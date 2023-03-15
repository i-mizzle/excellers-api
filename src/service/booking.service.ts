import Booking, { BookingDocument, Passenger } from "../model/booking.model";
import { bookFlight } from "./integrations/tiqwa.service";
import { v4 as uuidv4 } from 'uuid';
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

export const createBooking = async (
    input: {
        passengers: Array<Passenger>
    }, flightId: string) => {
    try {
        const booking = await bookFlight(input, flightId)

        if(booking.error) {
            return booking
        }
        const newBooking = await Booking.create({
            ...input, 
            ...{
                bookingCode: uuidv4(),
                flightId: flightId
            }, 
            ...booking.data
        })
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
    options: QueryOptions = { lean: true }
) {
    const total = await Booking.find(query, {}, options).countDocuments()
    let bookings = null
    if(perPage===0&&page===0){
        bookings = await Booking.find(query, {}, options)
    } else {
        bookings = await Booking.find(query, {}, options)
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
    options: QueryOptions = { lean: true }
) {
    try {
        const booking = await Booking.findOne(query, {}, options)
        
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
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}