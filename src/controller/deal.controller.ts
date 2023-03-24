import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { createDeal, findAndUpdateDeal, findDeal, findDeals } from "../service/deal.service";
import { getJsDate } from "../utils/utils";

export const createDealHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        // find available and active deals on the dealItem
        const existingDeals = await findDeals({
            dealItemId: body.dealItem, 
            active: true, 
            deleted: false
        }, 0, 0) 

        if(existingDeals && existingDeals.deals.length > 0) {
            return response.conflict(res, {message: `deal item provided already has a running deal, please deactivate it first`})
        }

        const deal = await createDeal({...body, ...{createdBy: userId}})
        return response.created(res, deal)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getDealsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        const user: any = get(req, 'user');

        const deals = await findDeals( {deleted: false}, resPerPage, page)
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

export const getDealHandler = async (req: Request, res: Response) => {
    try {
        const dealId = get(req, 'params.dealId');

        const deal = await findDeal({_id: dealId, deleted: false})
        // return res.send(post)

        if(!deal) {
            return response.notFound(res, {message: 'deal not found'})
        }

        return response.ok(res, deal)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateDealHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const dealId = get(req, 'params.dealId');

        let update = req.body

        if(update.startDate) {
            update = {...update, ...{startDate: getJsDate(update.startDate)}}
        }

        if(update.endDate) {
            update = {...update, ...{startDate: getJsDate(update.endDate)}}
        }

        const deal = await findDeal({_id: dealId})
        if(!deal) {
            return response.notFound(res, {message: 'deal not found'})
        }

        await findAndUpdateDeal({_id: deal._id}, update, {new: true})

        return response.ok(res, {message: 'deal updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteDealHandler = async (req: Request, res: Response) => {
    try {
        const voucherCode = get(req, 'params.voucherCode');

        const deal = await findDeal({voucherCode})
        if(!deal) {
            return response.notFound(res, {message: 'deal not found'})
        }

        await findAndUpdateDeal({_id: deal._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'deal deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}