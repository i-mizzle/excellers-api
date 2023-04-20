import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose"
import { InvoiceDocument } from "../model/invoice.model"
import PackageBooking, { PackageBookingDocument } from "../model/package-booking.model"
import { PackageDocument } from "../model/package.model"
import { UserDocument } from "../model/user.model"
import { generateCode } from "../utils/utils"

interface PackageBookingInput {
    bookedBy: UserDocument['_id']
    invoice: InvoiceDocument['_id']
    package:PackageDocument['_id']
    packageOwners: {
        name: string
        email: string
        phone: string
    }[]
}

export const createPackageBooking = async (
    input: PackageBookingInput) => {
    try {
        const bookingCode = generateCode(16, false).toUpperCase()
        const newPackage = await PackageBooking.create({...input, ...{bookingCode}})

        return newPackage
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findPackageBookings(
    query: FilterQuery<PackageBookingDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await PackageBooking.find(query, {}, options).countDocuments()
    let packageBookings = null
    if(perPage===0&&page===0){
        packageBookings = await PackageBooking.find(query, {}, options).populate(expand)
    } else {
        packageBookings = await PackageBooking.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        packageBookings
    }
}

export async function findPackageBooking(
    query: FilterQuery<PackageBookingDocument>,
    options: QueryOptions = { lean: true },
    expand?: string,
) {
    try {
        const foundPackage = await PackageBooking.findOne(query, {}, options).populate(expand)
        
        return foundPackage
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdatePackage(
    query: FilterQuery<PackageBookingDocument>,
    update: UpdateQuery<PackageBookingDocument>,
    options: QueryOptions
) {

    try {
        return PackageBooking.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}