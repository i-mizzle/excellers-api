import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { createInvoice } from "../service/invoice.service";
import { createPackageBooking, findPackageBookings } from "../service/package-booking.service";
import { applyPackageDeals, findPackage } from "../service/package.service";
import { addMinutesToDate, generateCode } from "../utils/utils";

export const createPackageBookingHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const bookingPackage = await findPackage({_id: body.package})
        if(!bookingPackage) {
            return response.notFound(res, {message: 'package not found'})
        }

        const invoiceItemType = 'PACKAGE'       
        const invoiceCode = generateCode(18, false).toUpperCase()
        const packagePrice = await applyPackageDeals([bookingPackage])

        const invoiceInput = {
            user: userId,
            invoiceCode: invoiceCode,
            amount: packagePrice[0].discountedPrice,
            expiry: addMinutesToDate(new Date(), 1440), // 1 day
            invoiceFor: invoiceItemType,
            invoiceItem: bookingPackage._id
        }

        const invoice = await createInvoice(invoiceInput)

        const bookingInput = {
            bookedBy: userId,
            invoice: invoice._id,
            package:bookingPackage._id,
            packageOwners: body.packageOwners
        }

        const packageBooking = await createPackageBooking(bookingInput)
        return response.created(res, packageBooking)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getPackageBookingsHandler = async (req: Request, res: Response) => {
    try {
        const user: any = get(req, 'user');
        const queryObject: any = req.query;
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

        const bookings = await findPackageBookings(packagesBookingsQuery, resPerPage, page, expand)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: packagesBookingsQuery.total,
            bookings: bookings.packageBookings
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

// export const getPackageBookingHandler = async (req: Request, res: Response) => {
//     try {
//         const packageId = get(req, 'params.packageId');

//         const queryObject: any = req.query;
//         const expand = queryObject.expand || null

//         const foundPackage = await findPackage({_id: packageId, deleted: false}, expand)
//         // return res.send(post)

//         if(!foundPackage) {
//             return response.notFound(res, {message: 'package not found'})
//         }

//         const mutatedPackage = await applyPackageDeals([foundPackage])

//         return response.ok(res, mutatedPackage[0])
        
//     } catch (error:any) {
//         return response.error(res, error)
//     }
// }
