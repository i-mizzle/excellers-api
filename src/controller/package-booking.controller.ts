import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { createInvoice, findAndUpdateInvoice } from "../service/invoice.service";
import { createPackageBooking, findAndUpdatePackageBooking, findPackageBooking, findPackageBookings } from "../service/package-booking.service";
import { applyPackageDeals, findPackage } from "../service/package.service";
import { addMinutesToDate, generateCode, getJsDate } from "../utils/utils";
import { findUser } from "../service/user.service";
import { findAffiliateMarkup } from "../service/affiliate-markup.service";

const parsePackageBookingFilters = (query: any) => {
    const { lockDown, packageId, invoice, ownerName, ownerEmail, ownerPhone, minDate, maxDate, paymentStatus } = query;

    const filters: any = {}; 
      
    if (lockDown) {
        filters.lockDown = lockDown;
    } 
      
    if (paymentStatus) {
        filters.paymentStatus = paymentStatus;
    } 

    if (packageId) {
      filters.package = packageId; 
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

export const createPackageBookingHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body
        body.bookedBy = userId
        const bookingPackage = await findPackage({_id: body.package})
        if(!bookingPackage) {
            return response.notFound(res, {message: 'package not found'})
        }

        const invoiceItemType = 'PACKAGE'       
        const invoiceCode = generateCode(18, false).toUpperCase()
        const packagePrice = await applyPackageDeals([bookingPackage])

        let invoicePrice = 0

        if(body.lockDown && body.lockDown === true) {
            invoicePrice = bookingPackage.lockDownPrice
        } else if ((!body.lockDown || body.lockDown === false) && body.bookAtDealPrice && body.bookAtDealPrice === true) {
            invoicePrice = packagePrice[0].discountedPrice
        } else if ((!body.lockDown || body.lockDown === false) && (!body.bookAtDealPrice || body.bookAtDealPrice === false)) {
            invoicePrice = bookingPackage.price
        }

        let affiliateBooking = false

        if(userId && userId !== '') {
            const user = await findUser({_id: userId})

            if(user && user.userType === 'AFFILIATE') {
                affiliateBooking = true
                const markup = await findAffiliateMarkup({user: userId})
                
                if(markup && markup.markupType === 'PERCENTAGE') {
                    invoicePrice += (markup.markup/100) * invoicePrice
                }
                
                if(markup && markup.markupType === 'FIXED') {
                    invoicePrice += markup.markup
                }
            }

        }

        const invoiceInput = {
            user: userId,
            invoiceCode: invoiceCode,
            amount:invoicePrice,
            expiry: addMinutesToDate(new Date(), 1440), // 1 day
            invoiceFor: invoiceItemType,
            partPayment: body.lockDown && body.lockDown === true ? true : false,
            invoiceItem: bookingPackage._id,
            affiliateBooking
        }

        const invoice = await createInvoice(invoiceInput)

        const bookingInput = {
            bookedBy: userId,
            invoice: invoice._id,
            package:bookingPackage._id,
            lockDown: body.lockDown,
            packageOwners: body.packageOwners
        }

        const packageBooking = await createPackageBooking(bookingInput)

        await findAndUpdateInvoice({_id: invoice._id}, { invoiceItem: packageBooking._id }, { new: true })
        
        return response.created(res, packageBooking)
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const getPackageBookingsHandler = async (req: Request, res: Response) => {
    try {
        const user: any = get(req, 'user');
        const queryObject: any = req.query;
        const filters = parsePackageBookingFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        console.log(expand)
        
        let packagesBookingsQuery: any = {user: user._id}

        if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
            packagesBookingsQuery = {}
        }

        const bookings = await findPackageBookings({...filters, ...packagesBookingsQuery}, resPerPage, page, expand)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: bookings.total,
            bookings: bookings.packageBookings
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getPackageBookingHandler = async (req: Request, res: Response) => {
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
            booking = await findPackageBooking({_id: bookingCode}, {lean: true}, expand)
        } else {
            booking = await findPackageBooking({bookingCode: bookingCode}, {lean: true}, expand)
        }

        // return res.send(post)

        if(!booking) {
            return response.notFound(res, {message: 'package booking not found'})
        }


        return response.ok(res, booking)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updatePackageBookingsWithInvoiceStatuses = async (req: Request, res: Response) => {
    try {
        const bookings = await findPackageBookings({}, 0, 0, 'invoice')
        console.log(bookings)
        let updatedCount = 0
        if(bookings.packageBookings) {
            await Promise.all(bookings.packageBookings.map(async(booking) => {
                console.log(booking.invoice)
                if(booking.invoice && booking.invoice.status) {
                    await findAndUpdatePackageBooking({_id: booking._id}, {paymentStatus: booking.invoice.status}, {new: true})
                    updatedCount ++
                }
            }))
        }
        return response.ok(res, {message: `${updatedCount} out of ${bookings.packageBookings.length} package bookings updated`})

    } catch (error: any) {
        return response.error(res, error)
    }
}
