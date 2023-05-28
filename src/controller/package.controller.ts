import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { applyPackageDeals, createPackage, findAndUpdatePackage, findPackage, findPackages } from "../service/package.service";
import { getJsDate } from "../utils/utils";

const parsePackageFilters = (query: any) => {
    const { active, month, packageType, minPrice, maxPrice, minLockDownPrice, maxLockDownPrice, createdBy, deal, minDate, maxDate } = query;

    const filters: any = {}; 
  
    if (active) {
      filters.active = active; 
    }
  
    if (month) {
      filters.active = active; 
    }
    
    if (packageType) {
      filters.packageType = packageType; 
    }
    
    if (minPrice) {
        filters['pricing.pricePerUnit'] = { $gte: +minPrice }; 
    }

    if (maxPrice) {
        filters['pricing.pricePerUnit'] = { $lt: +maxPrice }; 
    }

    if (minPrice && maxPrice) {
        filters['pricing.pricePerUnit'] = { $gte: +minPrice, $lte: maxPrice  }; 
    }
    
    if (minLockDownPrice) {
        filters.lockDownPricePerUnit = { $gte: +minLockDownPrice }; 
    }

    if (maxLockDownPrice) {
        filters.lockDownPricePerUnit = { $lt: +maxLockDownPrice }; 
    }

    if (createdBy) {
      filters.createdBy = createdBy; 
    }

    if (deal) {
      filters.deal = deal; 
    }
  
    if (minDate && !maxDate) {
      filters.createdAt = { $gte: getJsDate(minDate) }; 
    }
  
    if (maxDate && !minDate) {
      filters.createdAt = { $lte: getJsDate(maxDate) }; 
    }
  
    if (maxDate) {
      filters.createdAt = { $lte: getJsDate(maxDate), $gte: getJsDate(minDate) }; 
    }
    return filters
}

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

export const getPackagesHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parsePackageFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        const expand = queryObject.expand || null
        const user: any = get(req, 'user');
        
        let packagesQuery: any = {deleted: false, active: true}

        if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
            packagesQuery = {deleted: false}
        }

        const packages = await findPackages({...packagesQuery, ...filters}, resPerPage, page, expand)
        // return res.send(post)

        const mutatedPackages = queryObject.showDeals && queryObject.showDeals === 'true' ? await applyPackageDeals(packages.packages) : packages.packages
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

        const mutatedPackage = queryObject.showDeals && queryObject.showDeals === 'true' ? await applyPackageDeals([foundPackage]) : [foundPackage]

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

        const trip = await findPackage({_id: packageId}, '')
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

        const foundPackage = await findPackage({_id: packageId}, '')
        if(!foundPackage) {
            return response.notFound(res, {message: 'package not found'})
        }

        await findAndUpdatePackage({_id: packageId}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'package deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updatePackagePricingStructureHandler = async (req: Request, res: Response) => {
    try {
        const packages = await findPackages({}, 0, 0, '')
        console.log(packages)
        let updatedCount = 0
        if(packages.packages) {
            await Promise.all(packages.packages.map(async(pack) => {
                if(pack.price && pack.price !== undefined && pack.price !== null) {
                    await findAndUpdatePackage(
                        {_id: pack._id}, {
                            pricing: {
                                pricePerUnit: pack!.price || 0,
                                numberPerUnit: 1,
                            },
                            lockDownPricePerUnit: pack!.lockDownPrice || 0,
                            lockDownPrice: null,
                            price: null
                        }, 
                        {new: true}
                    )
                    updatedCount ++
                }
            }))
        }
        return response.ok(res, {message: `${updatedCount} out of ${packages.packages.length} packages updated`})

    } catch (error: any) {
        return response.error(res, error)
    }
}
