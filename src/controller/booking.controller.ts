import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { createBooking, findAndUpdateBooking, findBooking, findBookings } from "../service/booking.service";
import { cancelBooking, confirmFlightPrice, issueTicket } from "../service/integrations/tiqwa.service";
import { createInvoice, findInvoice } from "../service/invoice.service";
import { addMinutesToDate, generateCode } from "../utils/utils";
import { AddonDocument } from "../model/addon.model";
import { findAddon } from "../service/addon.service";
import { findExistingFlightDeal } from "../service/flight-deal.service";

export const bookFlightHandler = async (req: Request, res: Response) => {
    try {
        const flightId = get(req, 'params.flightId')
        const userId = get(req, 'user._id');
        
        const invoiceItemType = 'FLIGHT'       
        const invoiceCode = generateCode(18, false).toUpperCase()

        const flightPriceConfirmation = await confirmFlightPrice(flightId)
        const body = req.body

        const booking = await createBooking(body, flightId)

        if(booking.error === true) {
            return response.handleErrorResponse(res, {data: booking.data})
        }

        const bookingWithAddons: any = await findBooking({_id:booking.data._id}, {}, "addons")

        const totalAddonsPrice = bookingWithAddons!.addons.reduce((accumulator: number, currentValue: AddonDocument) => {
            return accumulator + currentValue.price;
        }, 0);

        const existingDeal = await findExistingFlightDeal(
            flightPriceConfirmation!.data.outbound[0].airportFrom, 
            flightPriceConfirmation!.data.outbound[0].airportTo, 
            flightPriceConfirmation!.data.outbound[0].departureTime.toString().split('T')[0]
        )

        let invoiceAmount = (flightPriceConfirmation.data.pricing.payable * 100) + totalAddonsPrice

        if(existingDeal) {

            let discountedPrice: any = null
            if(existingDeal && existingDeal.discountType === 'FIXED') {
                discountedPrice = flightPriceConfirmation.data.pricing.payable - existingDeal.discountValue/100
                flightPriceConfirmation.data.pricing = {...flightPriceConfirmation.data.pricing, ...{discountedPrice: discountedPrice}}
            }

            if(existingDeal && existingDeal.discountType === 'PERCENTAGE') {
                discountedPrice = flightPriceConfirmation.data.pricing.payable - ((existingDeal.discountValue/100) * flightPriceConfirmation.data.pricing.payable)
                flightPriceConfirmation.data.pricing = {...flightPriceConfirmation.data.pricing, ...{discountedPrice: discountedPrice}}
            }
            
            invoiceAmount = (discountedPrice * 100) + totalAddonsPrice   
        }

        const invoiceInput = {
            user: userId,
            invoiceCode: invoiceCode,
            amount: invoiceAmount,
            expiry: addMinutesToDate(new Date(), 1440), // 1 day
            invoiceFor: invoiceItemType,
            invoiceItem: booking.data._id
        }

        const invoice = await createInvoice(invoiceInput)

        const updatedPricing = {
            markup: bookingWithAddons.pricing.markup,
            // payable: bookingWithAddons.pricing.payable + (totalAddonsPrice/100),
            payable: invoiceAmount/100,
        }

        const bookingWithInvoice = await findAndUpdateBooking({_id: booking.data._id}, {
            invoice: invoice._id,
            addonsTotal: totalAddonsPrice/100,
            deal: existingDeal?._id,
            pricing: updatedPricing
        }, {new: true})

        return response.created(res, bookingWithInvoice)
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const getBookingsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }
        const bookings = await findBookings({}, resPerPage, page, expand)
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
        const queryObject: any = req.query;
        const bookingCode = get(req, 'params.bookingCode');
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const booking = await findBooking({bookingCode}, {lean: true}, expand)
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

        const invoice = await findInvoice({_id: booking.invoice})
        if(!invoice || invoice.status === 'PENDING') {
            return response.forbidden(res, {message: 'this booking has not been payed for and cannot be ticketed'})
        }

        const ticketing = await issueTicket(booking.reference)

        if(ticketing.error === true) {
            return response.handleErrorResponse(res, {data: ticketing.data}) 
        } else {
            await findAndUpdateBooking({_id: booking._id}, {ticketed: true}, {new: true})

            return response.ok(res, {message: 'ticket successfully issued for booking'})
        }

    } catch (error: any) {
        return response.error(res, error)
    }
}
