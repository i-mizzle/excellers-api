import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { createPackage, findAndUpdatePackage, findPackage, findPackages } from "../service/package.service";
import { getJsDate } from "../utils/utils";
import { PackageDocument } from "../model/package.model";
import { DealDocument } from "../model/deal.model";
import { findDeals } from "../service/deal.service";

export const createPackageHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const trip = await createPackage({...body, ...{createdBy: userId}})
        return response.created(res, trip)
    } catch (error:any) {
        return response.error(res, error)
    }
}

const applyPackageDeals = async (packages: PackageDocument[]) => {
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

export const getPackagesHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        const expand = queryObject.expand || null
        const user: any = get(req, 'user');
        
        let packagesQuery: any = {deleted: false, active: true}

        if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
            packagesQuery = {deleted: false}
        }

        const packages = await findPackages(packagesQuery, resPerPage, page, expand)
        // return res.send(post)

        const mutatedPackages = await applyPackageDeals(packages.packages)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: packages.total,
            packages: mutatedPackages
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getPackageHandler = async (req: Request, res: Response) => {
    try {
        const packageId = get(req, 'params.packageId');

        const queryObject: any = req.query;
        const expand = queryObject.expand || null

        const foundPackage = await findPackage({_id: packageId, deleted: false}, expand)
        // return res.send(post)

        if(!foundPackage) {
            return response.notFound(res, {message: 'package not found'})
        }

        const mutatedPackage = await applyPackageDeals([foundPackage])

        return response.ok(res, mutatedPackage[0])
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updatePackageHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const packageId = get(req, 'params.packageId');

        let update = req.body

        if(update.startDate) {
            update = {...update, ...{startDate: getJsDate(update.startDate)}}
        }

        if(update.endDate) {
            update = {...update, ...{startDate: getJsDate(update.endDate)}}
        }

        const trip = await findPackage({_id: packageId})
        if(!trip) {
            return response.notFound(res, {message: 'package not found'})
        }

        await findAndUpdatePackage({_id: packageId}, update, {new: true})

        return response.ok(res, {message: 'package updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deletePackageHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const packageId = get(req, 'params.packageId');

        const foundPackage = await findPackage({_id: packageId})
        if(!foundPackage) {
            return response.notFound(res, {message: 'package not found'})
        }

        await findAndUpdatePackage({_id: packageId}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'package deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}