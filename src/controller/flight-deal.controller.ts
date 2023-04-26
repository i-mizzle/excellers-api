import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { generateCode, getJsDate } from "../utils/utils";
import { createPackageDeal, findAndUpdatePackageDeal, findPackageDeal, findPackageDeals } from "../service/package-deal.service";
import { createFlightDeal, findAndUpdateFlightDeal, findFlightDeal, findFlightDeals } from "../service/flight-deal.service";

export const createFlightDealHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        // if(getJsDate(body.startDate) < new Date()) {
        //     return response.
        // }

        // find available and active deals on the dealItem
        const existingDeals = await findFlightDeals({
            flight: body.flight, 
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
            return response.conflict(res, {message: `this route already has a running deal, please deactivate it first`})
        }

        const dealCode = generateCode(16,false).toUpperCase()

        const deal = await createFlightDeal({...body, ...{
            dealCode: dealCode, 
            createdBy: userId }
        })
        return response.created(res, deal)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getFlightDealsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        const user: any = get(req, 'user');
        let expand = queryObject.expand || null

        const deals = await findPackageDeals( {deleted: false}, resPerPage, page, expand)
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

export const getFlightDealHandler = async (req: Request, res: Response) => {
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

export const updateFlightDealHandler = async (req: Request, res: Response) => {
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

        const deal = await findFlightDeal({dealCode: dealCode}, '')
        if(!deal) {
            return response.notFound(res, {message: 'deal not found'})
        }

        await findAndUpdateFlightDeal({_id: deal._id}, update, {new: true})

        return response.ok(res, {message: 'deal updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteFlightDealHandler = async (req: Request, res: Response) => {
    try {
        const dealCode = get(req, 'params.dealCode');

        const deal = await findFlightDeal({dealCode: dealCode}, '')
        if(!deal) {
            return response.notFound(res, {message: 'deal not found'})
        }

        await findAndUpdateFlightDeal({_id: deal._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'deal deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}