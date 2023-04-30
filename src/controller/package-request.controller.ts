import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { getJsDate } from "../utils/utils";
import { createPackageRequest, findAndUpdatePackageRequest, findPackageRequest, findPackageRequests } from "../service/package-request.service";

export const createPackageRequestHandler = async (req: Request, res: Response) => {
    try {
        const body = req.body

        const packageRequest = await createPackageRequest({...body, ...{
            travelDate: getJsDate(body.travelDate),
            returnDate: getJsDate(body.returnDate),
        }})
        return response.created(res, packageRequest)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getPackageRequestsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        const expand = queryObject.expand || null
        const user: any = get(req, 'user');
        
        let packagesQuery: any = {deleted: false}

        if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
            packagesQuery = {deleted: false}
        }

        const packageRequests = await findPackageRequests(packagesQuery, resPerPage, page, expand)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: packageRequests.total,
            packageRequests: packageRequests.packageRequests
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getPackageRequestHandler = async (req: Request, res: Response) => {
    try {
        const packageId = get(req, 'params.packageRequestId');

        const queryObject: any = req.query;
        const expand = queryObject.expand || null

        const foundPackageRequest = await findPackageRequest({_id: packageId, deleted: false}, expand)
        // return res.send(post)

        if(!foundPackageRequest) {
            return response.notFound(res, {message: 'package request not found'})
        }


        return response.ok(res, foundPackageRequest)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updatePackageRequestHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const packageRequestId = get(req, 'params.packageRequestId');

        let update = req.body

        if(update.travelDate) {
            update = {...update, ...{travelDate: getJsDate(update.travelDate)}}
        }

        if(update.returnDate) {
            update = {...update, ...{returnDate: getJsDate(update.returnDate)}}
        }

        const trip = await findPackageRequest({_id: packageRequestId}, '')
        if(!trip) {
            return response.notFound(res, {message: 'package request not found'})
        }

        await findAndUpdatePackageRequest({_id: packageRequestId}, update, {new: true})

        return response.ok(res, {message: 'package request updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deletePackageRequestHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const packageRequestId = get(req, 'params.packageRequestId');

        const foundPackageRequest = await findPackageRequest({_id: packageRequestId}, '')
        if(!foundPackageRequest) {
            return response.notFound(res, {message: 'package request not found'})
        }

        await findAndUpdatePackageRequest({_id: packageRequestId}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'package request deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}