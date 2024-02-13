import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { getJsDate } from "../utils/utils";
import { createShippingLocation, findAndUpdateShippingLocation, findShippingLocation, findShippingLocations } from "../service/shipping-location.service";

const parseLocationFilters = (query: any) => {
    const { minDateCreated, maxDateCreated, type, name } = query; 

    const filters: any = {}; 

    if (name) {
        filters.name = { $regex: name, $options: "i" }; 
    }
    
    if (type) {
        filters.type = type
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

export const createShippingLocationHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        let body = req.body

        const category = await createShippingLocation({...body, ...{createdBy: userId}})
        
        return response.created(res, category)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getShippingLocationsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseLocationFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand ||  null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const locations = await findShippingLocations( {...filters, ...{ deleted: false }}, 0, 0, expand)
        // return res.send(post)

        const responseObject = {
            total: locations.total,
            locations: locations.locations
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

// export const getMenuHandler = async (req: Request, res: Response) => {
//     try {
//         const menuId = get(req, 'params.menuId');
//         const queryObject: any = req.query;
//         let expand = queryObject.expand || null

//         if(expand && expand.includes(',')) {
//             expand = expand.split(',')
//         }

//         const menu = await findMenu({ _id: menuId, deleted: false }, expand)

//         if(!menu) {
//             return response.notFound(res, {message: 'menu not found'})
//         }

//         return response.ok(res, menu)
        
//     } catch (error:any) {
//         return response.error(res, error)
//     }
// }

export const updateShippingLocationHandler = async (req: Request, res: Response) => {
    try {
        const locationId = get(req, 'params.locationId');
        const userId = get(req, 'user._id');
        let update = req.body

        const item = await findShippingLocation({_id: locationId})
        if(!item) {
            return response.notFound(res, {message: 'shipping location not found'})
        }

        await findAndUpdateShippingLocation({_id: item._id}, update, {new: true})

        return response.ok(res, {message: 'shipping location updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteShippingLocationHandler = async (req: Request, res: Response) => {
    try {
        const locationId = get(req, 'params.locationId');
        const userId = get(req, 'user._id')
        const menu = await findShippingLocation({_id: locationId})
        if(!menu) {
            return response.notFound(res, {message: 'shipping location not found'})
        }

        await findAndUpdateShippingLocation({_id: menu._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'category deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
