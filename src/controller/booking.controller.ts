import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { createBooking, findAndUpdateBooking, findBooking, findBookings } from "../service/booking.service";
import { cancelBooking, confirmFlightPrice, issueTicket } from "../service/integrations/tiqwa.service";
import { createInvoice, findInvoice } from "../service/invoice.service";
import { addMinutesToDate, generateCode, getJsDate } from "../utils/utils";
import { AddonDocument } from "../model/addon.model";
import { findExistingFlightDeal } from "../service/flight-deal.service";
import mongoose from 'mongoose';
import { findMargin, getMarginValue } from "../service/margin.service";
const parseBookingFilters = (query: any) => {
    const { hasDeal, deal, documentRequired, ticketed, cancelled, minDate, maxDate, minAmount, maxAmount, addons, airportFrom, airportTo, passengerEmail, passengerPhone, passengerFirstName, passengerLastName, paymentStatus } = query; // assuming the query params are named 'name', 'price', 'startDate', and 'endDate'

    const filters: any = {}; 

    if (hasDeal) {
        filters.deal = { $exists: true, $ne: "" };
    }
    
    if (paymentStatus) {
        filters.paymentStatus = paymentStatus;
    } 

    if (airportFrom) {
        filters.outbound = { $elemMatch: {airportFrom: airportFrom} }; 
    } 
    
    if (airportTo) {
        filters.outbound = { $elemMatch: {airportTo: airportTo} }; 
    }

    if (addons) {
        const addonIds = addons.split(","); // assuming that the category ids are passed as a comma-separated string
        filters.addons = { $in: addonIds }; 
    }
    
    if (deal) {
        filters.deal = deal; 
    }
    
    if (documentRequired) {
        filters.documentRequired = documentRequired; 
    }
        
    if (ticketed) {
        filters.ticketed = ticketed; 
    }
        
    if (cancelled) {
        filters.cancelled = cancelled; 
    }
  
    if (passengerFirstName) {
        filters["passengers.firstName"] = passengerFirstName; 
    }
  
    if (passengerLastName) {
        filters["passengers.lastName"] = passengerLastName; 
    }
  
    if (passengerPhone) {
        filters["passengers.phone"] = passengerPhone; 
    }
  
    if (passengerEmail) {
        filters["passengers.email"] = passengerEmail; 
    }
  
    if (minAmount) {
        filters["pricing.payable"] = { $gte: +minAmount }; 
    }
  
    if (maxAmount) {
        filters["pricing.payable"] = { $lt: +maxAmount }; 
    }
  
    if (minDate && !maxDate) {
        filters.createdAt = { $gte: (getJsDate(minDate)) }; 
    }
  
    if (maxDate && !minDate) {
        filters.createAt = { $lte: getJsDate(maxDate) }; 
    }


    if (minDate && maxDate) {
        filters.date = { $gte: getJsDate(minDate), $lte: getJsDate(maxDate) };
    }

    return filters

}

const findPassengersRequiringDocuments = (passengers: any) => {
    const requireDocs: string[] = []
    passengers.forEach((passenger: any)=>{
        if (!passenger.documents) {
            requireDocs.push(passenger.firstName + ' ' + passenger.lastName)
        }
    })

    return requireDocs
}

const bookingPriceWithAffiliateMarkup = () => {

}

export const bookFlightHandler = async (req: Request, res: Response) => {
    try {
        const flightId = get(req, 'params.flightId')
        const userId = get(req, 'user._id');
        const body = req.body
        
        const invoiceItemType = 'FLIGHT'       
        const invoiceCode = generateCode(18, false).toUpperCase()

        const flightPriceConfirmation = await confirmFlightPrice(flightId)

        const passengersRequiringDocuments = findPassengersRequiringDocuments(body.passengers)

        if(flightPriceConfirmation && flightPriceConfirmation?.data?.documentRequired === true && passengersRequiringDocuments.length > 0) {
            return response.badRequest(res, {message: `The following passengers require a document for this trip: ${passengersRequiringDocuments.join(', ')}`})
        }
        
        const booking = await createBooking(body, flightId, flightPriceConfirmation?.data?.documentRequired)

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
            flightPriceConfirmation!.data.outbound[0].departureTime.toString().split('T')[0],
            flightPriceConfirmation!.data.outbound[0].marketingAirline
        )

        const margin = await getMarginValue(
            flightPriceConfirmation?.data?.documentRequired ? 'INTERNATIONAL' : 'LOCAL', flightPriceConfirmation.data.pricing.payable
        )

        if(!margin) {
            return response.notFound(res, {message: 'margin not found'})
        }

        let invoiceAmount = (flightPriceConfirmation.data.pricing.payable * 100) + totalAddonsPrice + margin

        if(existingDeal && body?.bookAtDealPrice === true) {

            let discountedPrice: any = null
            if(existingDeal && existingDeal.discountType === 'FIXED') {
                discountedPrice = flightPriceConfirmation.data.pricing.payable - existingDeal.discountValue/100
                flightPriceConfirmation.data.pricing = {...flightPriceConfirmation.data.pricing, ...{discountedPrice: discountedPrice}}
            }

            if(existingDeal && existingDeal.discountType === 'PERCENTAGE') {
                discountedPrice = flightPriceConfirmation.data.pricing.payable - ((existingDeal.discountValue/100) * flightPriceConfirmation.data.pricing.payable)
                flightPriceConfirmation.data.pricing = {...flightPriceConfirmation.data.pricing, ...{discountedPrice: discountedPrice}}
            }
            
            invoiceAmount = (discountedPrice * 100) + totalAddonsPrice + margin 
        }

        const invoiceInput = {
            user: userId,
            invoiceCode: invoiceCode,
            amount: invoiceAmount,
            expiry: addMinutesToDate(new Date(), 1440), // 1 day
            invoiceFor: invoiceItemType,
            invoiceItem: booking.data._id
        }

        console.log('INVOICE INPUT---> ---> ', invoiceInput)

        const invoice = await createInvoice(invoiceInput)

        const updatedPricing = {
            markup: bookingWithAddons.pricing.markup,
            // payable: bookingWithAddons.pricing.payable + (totalAddonsPrice/100),
            payable: invoiceAmount/100,
        }

        const bookingUpdatePayload = {
            invoice: invoice._id,
            paymentStatus: invoice.status,
            addonsTotal: totalAddonsPrice/100,
            pricing: updatedPricing,
            deal: null
        }

        if (body?.bookAtDealPrice === true && existingDeal) {
            bookingUpdatePayload.deal = existingDeal._id
        }

        const bookingWithInvoice = await findAndUpdateBooking({_id: booking.data._id}, bookingUpdatePayload, {new: true})

        return response.created(res, bookingWithInvoice)
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const getBookingsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseBookingFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }
        console.log(filters)
        const bookings = await findBookings(filters, resPerPage, page, expand)
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


export const updateBookingsWithInvoiceStatuses = async (req: Request, res: Response) => {
    try {
        const bookings = await findBookings({}, 0, 0, 'invoice')
        console.log(bookings)
        let updatedCount = 0
        if(bookings.bookings) {
            await Promise.all(bookings.bookings.map(async(booking) => {
                console.log(booking.invoice)
                if(booking.invoice && booking.invoice.status) {
                    await findAndUpdateBooking({_id: booking._id}, {paymentStatus: booking.invoice.status}, {new: true})
                    updatedCount ++
                }
            }))
        }
        return response.ok(res, {message: `${updatedCount} out of ${bookings.bookings.length} bookings updated`})

    } catch (error: any) {
        return response.error(res, error)
    }
}
