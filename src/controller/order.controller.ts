import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { getJsDate } from "../utils/utils";
import { createOrder, findAndUpdateOrder, findOrder, findOrders } from "../service/order.service";

const parseMenuFilters = (query: any) => {
    const { minDateCreated, maxDateCreated, enquiryType, status, maritalStatus, name, email, phone, nationality, invoice, appointment, visaEnquiryCountry, travelHistory, paymentStatus } = query; 

    const filters: any = {}; 

    if (enquiryType) {
        filters.enquiryType = enquiryType
    } 

    if (paymentStatus) {
        filters.paymentStatus = paymentStatus;
    } 
    
    if (status) {
        filters.status = status
    }

    if (maritalStatus) {
        filters.maritalStatus = maritalStatus
    }
    
    if (name) {
        filters.name = name; 
    }
    
    if (email) {
        filters.email = email; 
    }
        
    if (phone) {
        filters.phone = phone; 
    }
        
    if (invoice) {
        filters.invoice = invoice; 
    }
  
    if (nationality) {
        filters.nationality = nationality 
    }
  
    if (appointment) {
        filters.appointment = appointment; 
    }
  
    if (visaEnquiryCountry) {
        filters.visaEnquiryCountry = visaEnquiryCountry; 
    }
  
    if (travelHistory) {
        filters.travelHistory = travelHistory; 
    }

    if (minDateCreated && !maxDateCreated) {
        filters.createdAt = { $gte: (getJsDate(minDateCreated)) }; 
    }

    if (maxDateCreated && !minDateCreated) {
        filters.createdAt = { $lte: getJsDate(maxDateCreated) }; 
    }

    if (minDateCreated && maxDateCreated) {
        filters.date = { $gte: getJsDate(minDateCreated), $lte: getJsDate(maxDateCreated) };
    }
  
    return filters
}

export const createOrderHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        let body = req.body

        const order = await createOrder({...body, ...{createdBy: userId}})
        
        return response.created(res, order)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getOrdersHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseMenuFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const orders = await findOrders({...filters, ...{ deleted: false }}, resPerPage, page, expand)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: orders.total,
            orders: orders.orders
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getOrderHandler = async (req: Request, res: Response) => {
    try {
        const orderId = get(req, 'params.orderId');
        const queryObject: any = req.query;
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const order = await findOrder({ _id: orderId, deleted: false }, expand)

        if(!order) {
            return response.notFound(res, {message: 'order not found'})
        }

        return response.ok(res, order)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateOrderHandler = async (req: Request, res: Response) => {
    try {
        const orderId = get(req, 'params.orderId');
        const userId = get(req, 'user._id');
        let update = req.body

        const item = await findOrder({_id: orderId})
        if(!item) {
            return response.notFound(res, {message: 'order not found'})
        }

        await findAndUpdateOrder({_id: item._id}, update, {new: true})

        return response.ok(res, {message: 'order updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteOrderHandler = async (req: Request, res: Response) => {
    try {
        const orderId = get(req, 'params.orderId');
        const userId = get(req, 'user._id')
        const order = await findOrder({_id: orderId})
        if(!order) {
            return response.notFound(res, {message: 'menu not found'})
        }

        await findAndUpdateOrder({_id: order._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'order deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
