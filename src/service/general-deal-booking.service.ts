import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose"
import { InvoiceDocument } from "../model/invoice.model"
import { UserDocument } from "../model/user.model"
import { generateCode } from "../utils/utils"
import { GeneralDealDocument } from "../model/general-deal.model"
import GeneralDealBooking, { GeneralDealBookingDocument } from "../model/general-deal-booking.model"

interface GeneralDealBookingInput {
    bookedBy: UserDocument['_id']
    invoice: InvoiceDocument['_id']
    deal:GeneralDealDocument['_id']
    paymentStatus: string
    affiliateBooking: Boolean
    dealOwners: {
        name: string
        email: string
        phone: string
    }[]
}

export const createGeneralDealBooking = async (
    input: GeneralDealBookingInput) => {
    try {
        const bookingCode = generateCode(16, false).toUpperCase()
        const newPackage = await GeneralDealBooking.create({...input, ...{bookingCode}})

        return newPackage
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findGeneralDealBookings(
    query: FilterQuery<GeneralDealBookingDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await GeneralDealBooking.find(query, {}, options).countDocuments()
    let generalDealBookings = null
    if(perPage===0&&page===0){
        generalDealBookings = await GeneralDealBooking.find(query, {}, options).populate(expand)
    } else {
        generalDealBookings = await GeneralDealBooking.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        generalDealBookings
    }
}

export async function findGeneralDealBooking(
    query: FilterQuery<GeneralDealBookingDocument>,
    options: QueryOptions = { lean: true },
    expand?: string,
) {
    try {
        const foundPackage = await GeneralDealBooking.findOne(query, {}, options).populate(expand)
        
        return foundPackage
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateGeneralDealBooking(
    query: FilterQuery<GeneralDealBookingDocument>,
    update: UpdateQuery<GeneralDealBookingDocument>,
    options: QueryOptions
) {
    try {
        return GeneralDealBooking.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}