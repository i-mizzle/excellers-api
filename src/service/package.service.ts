import { v4 as uuidv4 } from 'uuid';
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { getJsDate } from '../utils/utils';
import { StringDate } from '../utils/types';
import { UserDocument } from '../model/user.model';
import Package, { PackageDocument } from '../model/package.model';
import { TripDocument } from '../model/trip.model';
import { findDeals } from './deal.service';

interface CreatePackageInput {
    createdBy: UserDocument['_id'];
    name: string
    description: string
    packageType: string
    features: string[]
    packagePlan?: {
      title: string
      description: string
    }[]
    price: number
    media?: {
      type: string
      url: string
    }[]
    lockDownPrice: number
}

export const createPackage = async (
    input: CreatePackageInput) => {
    try {
        const newPackage = await Package.create(input)

        return newPackage
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findPackages(
    query: FilterQuery<PackageDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Package.find(query, {}, options).countDocuments()
    let packages = null
    if(perPage===0&&page===0){
        packages = await Package.find(query, {}, options)
    } else {
        packages = await Package.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        packages
    }
}

export async function findPackage(
    query: FilterQuery<PackageDocument>,
    expand?: string,
    options: QueryOptions = { lean: true }
) {
    try {
        const foundPackage = await Package.findOne(query, {}, options).populate(expand)
        
        return foundPackage
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdatePackage(
    query: FilterQuery<PackageDocument>,
    update: UpdateQuery<PackageDocument>,
    options: QueryOptions
) {

    try {
        return Package.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}

export const applyPackageDeals = async (packages: PackageDocument[]) => {
    const deals = await findDeals({active: true, deleted: false}, 0, 0)

    const mutatedPackages = await Promise.all(packages.map(async (pack: PackageDocument) => {
        let existingDeal = {}
        let currentPrice = pack.price
        
        const packageDeal = deals.deals.find((deal) => {
            return deal.dealItem.toString() === pack._id.toString()
        })

        if(packageDeal) {
            existingDeal = packageDeal
        }

        if(packageDeal && packageDeal.discountType === 'PERCENTAGE') {
            const discount = pack.price * (packageDeal.discountValue / 100)
            currentPrice = pack.price - discount
        }

        if(packageDeal && packageDeal.discountType === 'FIXED') {
            currentPrice = pack.price - packageDeal.discountValue
        }

        return {
            ...pack,
            ...{
                deal: existingDeal,
                discountedPrice: currentPrice
            }
        }
    }))

    return mutatedPackages
}