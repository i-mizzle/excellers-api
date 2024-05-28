import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { MenuDocument } from "../model/menu.model";
import { findUser } from "../service/user.service";
import { createEnquiry, findAndUpdateEnquiry, findEnquiries, findEnquiry } from "../service/enquiry.service";

export const createEnquiryHandler = async (req: Request, res: Response) => {
    try {
        const body = req.body

        const enquiry = await createEnquiry(body)
        
        return response.created(res, enquiry)
        // return response.created(res, {...item, ...{variants: variants}})
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getEnquiriesHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        // const storeId = get(req, 'params.storeId');
        const userId = get(req, 'user._id');
        const user = await findUser({_id: userId}) 
        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }

        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const enquiries = await findEnquiries( { deleted: false }, resPerPage, page, expand)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: enquiries.total,
            enquiries: enquiries.enquiries
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}


export const updateEnquiryHandler = async (req: Request, res: Response) => {
    try {
        const enquiryId = get(req, 'params.enquiryId');
        const update = req.body
        
        const userId = get(req, 'user._id');
        const user = await findUser({_id: userId}) 
        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }

        const menu = await findEnquiry({_id: enquiryId, deleted: false, store: user.store})
        if(!menu) {
            return response.notFound(res, {message: 'enquiry not found'})
        }

        await findAndUpdateEnquiry({_id: menu._id}, update, {new: true})

        return response.ok(res, {message: 'enquiry updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteEnquiryHandler = async (req: Request, res: Response) => {
    try {
        const enquiryId = get(req, 'params.enquiryId');
        const update = req.body
        
        const userId = get(req, 'user._id');
        const user = await findUser({_id: userId}) 
        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }

        const menu = await findEnquiry({_id: enquiryId, deleted: false, store: user.store})
        if(!menu) {
            return response.notFound(res, {message: 'enquiry not found'})
        }

        await findAndUpdateEnquiry({_id: menu._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'enquiry deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
