import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { addMinutesToDate, generateCode, getJsDate } from "../utils/utils";
import { ItemVariantDocument } from "../model/item-variant.model";
import { createMenu, findAndUpdateMenu, findMenu, findMenus } from "../service/menu.service";

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

export const createMenuHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        let body = req.body

        const menu = await createMenu({...body, ...{createdBy: userId}})
        
        return response.created(res, menu)
        // return response.created(res, {...item, ...{variants: variants}})
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getMenusHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseMenuFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const items = await findMenus( {...filters, ...{ deleted: false }}, resPerPage, page, expand)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: items.total,
            enquiries: items.menus
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getMenuHandler = async (req: Request, res: Response) => {
    try {
        const menuId = get(req, 'params.menuId');
        const queryObject: any = req.query;
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const menu = await findMenu({ _id: menuId, deleted: false }, expand)

        if(!menu) {
            return response.notFound(res, {message: 'menu not found'})
        }

        return response.ok(res, menu)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateMenuHandler = async (req: Request, res: Response) => {
    try {
        const menuId = get(req, 'params.menuId');
        const userId = get(req, 'user._id');
        let update = req.body

        const item = await findMenu({_id: menuId})
        if(!item) {
            return response.notFound(res, {message: 'menu not found'})
        }

        await findAndUpdateMenu({_id: item._id}, update, {new: true})

        return response.ok(res, {message: 'menu updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteMenuHandler = async (req: Request, res: Response) => {
    try {
        const menuId = get(req, 'params.menuId');
        const userId = get(req, 'user._id')
        const menu = await findMenu({_id: menuId})
        if(!menu) {
            return response.notFound(res, {message: 'menu not found'})
        }

        await findAndUpdateMenu({_id: menu._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'menu deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
