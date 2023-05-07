import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { generateCode, getJsDate } from "../utils/utils";
import { createPackageDeal, findAndUpdatePackageDeal, findPackageDeal, findPackageDeals } from "../service/package-deal.service";
import { findPackage } from "../service/package.service";

const parsePackageDealFilters = (query: any) => {
    const { title, discountType, minDiscountValue, maxDiscountValue, minStartDate, maxStartDate, minEndDate, maxEndDate, active, createdBy, packageId } = query; // assuming the query params are named 'name', 'price', 'startDate', and 'endDate'

    const filters: any = {}; // create an empty object to hold the filters
  
    if (title) {
      filters.title = { $regex: title, $options: "i" }; 
    }

    if (discountType) {
      filters.discountType = discountType; 
    }
    
    if (packageId) {
      filters.package = packageId; 
    }
    
    if (active) {
      filters.active = active; 
    }
    
    if (createdBy) {
      filters.createdBy = createdBy; 
    }
  
    if (minDiscountValue) {
      filters.discountValue = { $gte: +minDiscountValue }; 
    }
  
    if (maxDiscountValue) {
      filters.discountValue = { $lte: +maxDiscountValue }; 
    }
  
    if (minStartDate) {
      filters.startDate = { $gte: (getJsDate(minStartDate)) }; 
    }
  
    if (maxStartDate) {
      filters.startDate = { $lte: (getJsDate(maxStartDate)) }; 
    }
  
    if (minEndDate) {
      filters.endDate = { $gte: getJsDate(minEndDate) }; 
    }
  
    if (maxEndDate) {
      filters.endDate = { $lte: getJsDate(maxEndDate) }; 
    }

    return filters
}

export const createPackageDealHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const dealPackage = findPackage({_id: body.package}) 

        if(!dealPackage) {
            return response.notFound(res, {message: 'the package you are trying to deal for was not found'})
        }

        // find available and active deals on the dealItem
        const existingDeals = await findPackageDeals({
            package: body.package, 
            active: true, 
            deleted: false,
            startDate: {
                $gte: new Date(getJsDate(body.startDate)),
                // $lt: new Date(getJsDate(body.endDate))
            },
            endDate: {
                // $gte: new Date(getJsDate(body.startDate)),
                $lte: new Date(getJsDate(body.endDate))
            }
        }, 0, 0, '') 

        if(existingDeals && existingDeals.deals.length > 0) {
            return response.conflict(res, {message: `deal item provided already has a running deal, please deactivate it first`})
        }

        const dealCode = generateCode(16,false).toUpperCase()

        const deal = await createPackageDeal({...body, ...{
            dealCode: dealCode, 
            createdBy: userId }
        })
        return response.created(res, deal)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getPackageDealsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parsePackageDealFilters(queryObject)

        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        const user: any = get(req, 'user');
        let expand = queryObject.expand || null

        const deals = await findPackageDeals( {...filters, ...{deleted: false}}, resPerPage, page, expand)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: deals.total,
            deals: deals.deals
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getPackageDealHandler = async (req: Request, res: Response) => {
    try {
        const dealCode = get(req, 'params.dealCode');
        const queryObject: any = req.query;
        const ObjectId = require('mongoose').Types.ObjectId;
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        let deal = null
        if(ObjectId.isValid(dealCode)) {
            deal = await findPackageDeal({_id: dealCode, deleted: false}, expand)
        } else {
            deal = await findPackageDeal({dealCode: dealCode, deleted: false}, expand)
        }
        // return res.send(post)

        if(!deal) {
            return response.notFound(res, {message: 'deal not found'})
        }

        return response.ok(res, deal)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updatePackageDealHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const dealCode = get(req, 'params.dealCode');

        let update = req.body

        if(update.startDate) {
            update = {...update, ...{startDate: getJsDate(update.startDate)}}
        }

        if(update.endDate) {
            update = {...update, ...{endDate: getJsDate(update.endDate)}}
        }

        const deal = await findPackageDeal({dealCode: dealCode}, '')
        if(!deal) {
            return response.notFound(res, {message: 'deal not found'})
        }

        await findAndUpdatePackageDeal({_id: deal._id}, update, {new: true})

        return response.ok(res, {message: 'deal updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deletePackageDealHandler = async (req: Request, res: Response) => {
    try {
        const dealCode = get(req, 'params.dealCode');

        const deal = await findPackageDeal({dealCode: dealCode}, '')
        if(!deal) {
            return response.notFound(res, {message: 'deal not found'})
        }

        await findAndUpdatePackageDeal({_id: deal._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'deal deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}