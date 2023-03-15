import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { createBooking, findAndUpdateBooking, findBooking, findBookings } from "../service/booking.service";
import { cancelBooking } from "../service/integrations/tiqwa.service";

export const bookFlightHandler = async (req: Request, res: Response) => {
    try {
        const flightId = get(req, 'params.flightId')
        const body = req.body

        const booking = await createBooking(body, flightId)
        // return res.send(post)

        if(booking.error === true) {
            return response.handleErrorResponse(res, {data: booking.data})
        }
        return response.created(res, booking.data)
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const getBookingsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 

        const bookings = await findBookings({}, resPerPage, page)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: bookings.total,
            bookings: bookings.bookings
        }

        return response.ok(res, responseObject)
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const getBookingHandler = async (req: Request, res: Response) => {
    try {
        const bookingCode = get(req, 'params.bookingCode');

        const booking = await findBooking({bookingCode})
        // return res.send(post)

        if(!booking) {
            return response.notFound(res, {message: 'booking not found'})
        }

        return response.ok(res, booking)
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const cancelBookingHandler = async (req: Request, res: Response) => {
    try {
        const bookingCode = get(req, 'params.bookingCode');

        const booking = await findBooking({bookingCode})
        // return res.send(post)
        console.log('---> ', booking)

        if(!booking) {
            return response.notFound(res, {message: 'booking not found'})
        }

        if(booking.cancelled === true) {
            return response.conflict(res, {message: 'booking was previously cancelled'})
        }

        if(booking.ticketed === true) {
            return response.conflict(res, {message: 'this booking has already been ticketed'})
        }

        const cancellation = await cancelBooking(booking.reference)

        if(cancellation.error === true) {
            return response.handleErrorResponse(res, {data: cancellation.data}) 
        } else {
            await findAndUpdateBooking({_id: booking._id}, {cancelled: true}, {new: true})

            return response.ok(res, {message: 'booking cancelled successfully'})
        }

        return response.ok(res, booking)
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const issueTicketForBookingHandler = async (req: Request, res: Response) => {
    try {
        const bookingCode = get(req, 'params.bookingCode');

        const booking = await findBooking({bookingCode})
        // return res.send(post)

        if(!booking) {
            return response.notFound(res, {message: 'booking not found'})
        }

        if(booking.cancelled === true) {
            return response.conflict(res, {message: 'ticket was previously cancelled, you can no longer create a ticket for it'})
        }

        if(booking.ticketed === true) {
            return response.conflict(res, {message: 'this booking has already been ticketed'})
        }

        

        return response.ok(res, booking)
    } catch (error: any) {
        return response.error(res, error)
    }
}
