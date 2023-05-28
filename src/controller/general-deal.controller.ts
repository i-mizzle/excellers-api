import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { generateCode, getJsDate } from "../utils/utils";
import { createGeneralDeal, findAndUpdateGeneralDeal, findGeneralDeal, findGeneralDeals } from "../service/general-deal.service";

const parseGeneralDealFilters = (query: any) => {
    const { title, minDealPrice, vendor, maxDealPrice, minStartDate, maxStartDate, minEndDate, maxEndDate, active, createdBy } = query; // assuming the query params are named 'name', 'price', 'startDate', and 'endDate'

    const filters: any = {}; // create an empty object to hold the filters
  
    if (title) {
      filters.title = { $regex: title, $options: "i" }; 
    }
    
    if (active) {
      filters.active = active; 
    }
    
    if (createdBy) {
      filters.createdBy = createdBy; 
    }
    
    if (vendor) {
      filters.vendor = vendor; 
    }
  
    if (minDealPrice && !maxDealPrice) {
      filters['dealPricing.pricePerUnit'] = { $gte: +minDealPrice }; 
    }
  
    if (maxDealPrice && !minDealPrice) {
      filters['dealPricing.pricePerUnit'] = { $lte: +maxDealPrice }; 
    }

    if (minDealPrice && maxDealPrice) {
      filters['dealPricing.pricePerUnit'] = { $gte: +minDealPrice, $lte: maxDealPrice  }; 
    }
  
    if (minStartDate && !maxStartDate) {
      filters.startDate = { $gte: (getJsDate(minStartDate)) }; 
    }
  
    if (maxStartDate && !minStartDate ) {
      filters.startDate = { $lte: (getJsDate(maxStartDate)) }; 
    }
  
    if (maxStartDate && minStartDate ) {
      filters.startDate = { $gte: getJsDate(minStartDate), $lte: getJsDate(maxStartDate) }; 
    }
  
    if (minEndDate && !maxEndDate) {
      filters.endDate = { $gte: getJsDate(minEndDate) }; 
    }
  
    if (maxEndDate && !minEndDate) {
      filters.endDate = { $lte: getJsDate(maxEndDate) }; 
    }
    
    if (maxEndDate && minEndDate) {
      filters.endDate = { $gte: getJsDate(minEndDate), $lte: getJsDate(maxEndDate) }; 
    }

    return filters
}

export const createGeneralDealHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body


        const dealCode = generateCode(16,false).toUpperCase()

        const deal = await createGeneralDeal({...body, ...{
            dealCode: dealCode, 
            createdBy: userId }
        })
        return response.created(res, deal)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getGeneralDealsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseGeneralDealFilters(queryObject)

        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        const user: any = get(req, 'user');
        let expand = queryObject.expand || null

        let dealsQuery: any = {
            active: true,
            deleted: false
        }

        if(user && (user.userType === 'ADMIN' || user.userType === 'SUPER_ADMINISTRATOR')) {
            dealsQuery = {deleted: false}
        }

        const deals = await findGeneralDeals( {...filters, ...dealsQuery}, resPerPage, page, expand)
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

export const getGeneralDealHandler = async (req: Request, res: Response) => {
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
            deal = await findGeneralDeal({_id: dealCode, deleted: false}, expand)
        } else {
            deal = await findGeneralDeal({dealCode: dealCode, deleted: false}, expand)
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

export const updateGeneralDealHandler = async (req: Request, res: Response) => {
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

        const deal = await findGeneralDeal({dealCode: dealCode}, '')
        if(!deal) {
            return response.notFound(res, {message: 'deal not found'})
        }

        await findAndUpdateGeneralDeal({_id: deal._id}, update, {new: true})

        return response.ok(res, {message: 'deal updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteGeneralDealHandler = async (req: Request, res: Response) => {
    try {
        const dealCode = get(req, 'params.dealCode');

        const deal = await findGeneralDeal({dealCode: dealCode}, '')
        if(!deal) {
            return response.notFound(res, {message: 'deal not found'})
        }

        await findAndUpdateGeneralDeal({_id: deal._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'deal deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}


export const updateGeneralDealPricingStructureHandler = async (req: Request, res: Response) => {
    try {
        const deals = await findGeneralDeals({}, 0, 0, '')

        let updatedCount = 0
        if(deals.deals) {
            await Promise.all(deals.deals.map(async(deal) => {
                const pricing = deal.dealPrice
                const originalPricing = deal.originalPrice
                if(deal.dealPrice && deal.dealPrice !== undefined && deal.dealPrice !== null) {
                    await findAndUpdateGeneralDeal(
                        {_id: deal._id}, {
                            dealPricing: {
                                pricePerUnit:pricing || 0,
                                numberPerUnit: 1,
                            },
                            originalPricePerUnit: originalPricing || 0,
                            dealPrice: null,
                            originalPrice: null
                        }, 
                        {new: true}
                    )
                    updatedCount ++
                }
            }))
        }
        return response.ok(res, {message: `${updatedCount} out of ${deals.deals.length} deals updated`})

    } catch (error: any) {
        return response.error(res, error)
    }
}