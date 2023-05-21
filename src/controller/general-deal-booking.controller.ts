import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { createInvoice, findAndUpdateInvoice } from "../service/invoice.service";
import { addMinutesToDate, generateCode, getJsDate } from "../utils/utils";
import { findUser } from "../service/user.service";
import { findAffiliateMarkup } from "../service/affiliate-markup.service";
import { findGeneralDeal } from "../service/general-deal.service";
import { createGeneralDealBooking, findAndUpdateGeneralDealBooking, findGeneralDealBooking, findGeneralDealBookings } from "../service/general-deal-booking.service";

const parseGeneralDealBookingFilters = (query: any) => {
    const { deal, invoice, ownerName, ownerEmail, ownerPhone, minDate, maxDate, paymentStatus } = query;

    const filters: any = {}; 
      
    if (paymentStatus) {
        filters.paymentStatus = paymentStatus;
    } 

    if (deal) {
      filters.package = deal; 
    }
    
    if (invoice) {
      filters.invoice = invoice; 
    }
    
    if (ownerName) {
        filters["owner.name"] = { $elemMatch: { name: ownerName } };; 
    }

    if (ownerEmail) {
        filters["owner.email"] = { $elemMatch: { email: ownerEmail } };; 
    }
    
    if (ownerPhone) {
        filters["flight.origin"] = { $elemMatch: { phone: ownerPhone } };;  
    }
  
    if (minDate) {
      filters.createdAt = { $lte: getJsDate(minDate) }; 
    }
  
    if (maxDate) {
      filters.createdAt = { $lte: getJsDate(maxDate) }; 
    }
    return filters
}

export const createGeneralDealBookingHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body
        body.bookedBy = userId

        console.log(body)
        const bookingDeal = await findGeneralDeal({_id: body.deal, active:true})
        console.log(bookingDeal)
        if(!bookingDeal) {
            return response.notFound(res, {message: 'deal not found or is inactive'})
        }

        const invoiceItemType = 'DEAL'       
        const invoiceCode = generateCode(18, false).toUpperCase()

        let invoicePrice = bookingDeal.dealPrice

        let affiliateBooking = false

        // if(userId && userId !== '') {
        //     const user = await findUser({_id: userId})

        //     if(user && user.userType === 'AFFILIATE') {
        //         affiliateBooking = true
        //         const markup = await findAffiliateMarkup({user: userId})
                
        //         if(markup && markup.markupType === 'PERCENTAGE') {
        //             invoicePrice += (markup.markup/100) * invoicePrice
        //         }
                
        //         if(markup && markup.markupType === 'FIXED') {
        //             invoicePrice += markup.markup
        //         }
        //     }

        // }

        const invoiceInput = {
            user: userId,
            invoiceCode: invoiceCode,
            amount:invoicePrice,
            expiry: addMinutesToDate(new Date(), 1440), // 1 day
            invoiceFor: invoiceItemType,
            partPayment: body.lockDown && body.lockDown === true ? true : false,
            invoiceItem: bookingDeal._id,
            affiliateBooking
        }

        const invoice = await createInvoice(invoiceInput)

        const bookingInput = {
            bookedBy: userId,
            invoice: invoice._id,
            deal: bookingDeal._id,
            dealOwners: body.dealOwners,
            paymentStatus: 'PENDING',
            affiliateBooking
        }

        const generalDealBooking = await createGeneralDealBooking(bookingInput)

        await findAndUpdateInvoice({_id: invoice._id}, { invoiceItem: generalDealBooking._id }, { new: true })
        
        return response.created(res, generalDealBooking)
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const getGeneralDealBookingsHandler = async (req: Request, res: Response) => {
    try {
        const user: any = get(req, 'user');
        const queryObject: any = req.query;
        const filters = parseGeneralDealBookingFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        console.log(expand)
        
        let packagesBookingsQuery: any = {bookedBy: user._id}

        if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
            packagesBookingsQuery = {}
        }

        const bookings = await findGeneralDealBookings({...filters, ...packagesBookingsQuery}, resPerPage, page, expand)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: bookings.total,
            bookings: bookings.generalDealBookings
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getGeneralDealBookingHandler = async (req: Request, res: Response) => {
    try {
        const bookingCode = get(req, 'params.bookingCode');

        const queryObject: any = req.query;
        let expand = queryObject.expand || null
        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }
        const ObjectId = require('mongoose').Types.ObjectId;

        let booking = null
        if(ObjectId.isValid(bookingCode)) {
            booking = await findGeneralDealBooking({_id: bookingCode}, {lean: true}, expand)
        } else {
            booking = await findGeneralDealBooking({bookingCode: bookingCode}, {lean: true}, expand)
        }

        // return res.send(post)

        if(!booking) {
            return response.notFound(res, {message: 'booking not found'})
        }

        return response.ok(res, booking)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
