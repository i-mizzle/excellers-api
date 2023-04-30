import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { getJsDate } from '../utils/utils';
import { StringDate } from '../utils/types';
import { UserDocument } from '../model/user.model';
import { TripDocument } from '../model/trip.model';
import { findPackageDeals } from './package-deal.service';
import PackageRequest, { PackageRequestDocument } from '../model/package-request.model';

interface CreatePackageRequestInput {
    name: string
    requestedBy: {
        name: {
            type: String, 
            required: true
        }
        email: {
            type: String, 
            required: true
        }
        phone: {
            type: String, 
            required: true
        }
    },
    description: string
    packageType: string
    inclusions: string[]
    itinerary?: {
      title: string
      description: string
    }[]
    travelDate: StringDate
    returnDate: StringDate
    price: number
    media?: {
      type: string
      url: string
    }[]
    lockDownPrice: number
}

export const createPackageRequest = async (
    input: CreatePackageRequestInput) => {
    try {
        const newPackageRequest = await PackageRequest.create(input)

        return newPackageRequest
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findPackageRequests(
    query: FilterQuery<PackageRequestDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await PackageRequest.find(query, {}, options).countDocuments()
    let packageRequests = null
    if(perPage===0&&page===0){
        packageRequests = await PackageRequest.find(query, {}, options).populate(expand)
    } else {
        packageRequests = await PackageRequest.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        packageRequests
    }
}

export async function findPackageRequest(
    query: FilterQuery<PackageRequestDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    try {
        const foundPackage = await PackageRequest.findOne(query, {}, options).populate(expand)
        
        return foundPackage
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdatePackageRequest(
    query: FilterQuery<PackageRequestDocument>,
    update: UpdateQuery<PackageRequestDocument>,
    options: QueryOptions
) {

    try {
        return PackageRequest.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}
