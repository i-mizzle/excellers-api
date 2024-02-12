import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { getJsDate } from "../utils/utils";
import { createCart, findAndUpdateCart, findCart, findCarts } from "../service/cart.service";

const parseCartFilters = (query: any) => {
    const { minDateCreated, maxDateCreated, clientId, name } = query; 

    const filters: any = {}; 

    // if (name) {
    //     filters.name = { $regex: name, $options: "i" }; 
    // }
    
    if (clientId) {
        filters.clientId = clientId
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

export const createCartHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const cart = await createCart(body)
        
        return response.created(res, cart)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getCartsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseCartFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand ||  null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const items = await findCarts( {...filters, ...{ deleted: false }}, 0, 0, expand)
        // return res.send(post)

        const responseObject = {
            total: items.total,
            categories: items.categories
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

export const updateCategoryHandler = async (req: Request, res: Response) => {
    try {
        const cartId = get(req, 'params.cartId');
        let update = req.body

        const item = await findCart({_id: cartId})
        if(!item) {
            return response.notFound(res, {message: 'shopping cart not found'})
        }

        await findAndUpdateCart({_id: item._id}, update, {new: true})

        return response.ok(res, {message: 'shopping cart updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteCategoryHandler = async (req: Request, res: Response) => {
    try {
        const menuId = get(req, 'params.categoryId');
        const cart = await findCart({_id: menuId})
        if(!cart) {
            return response.notFound(res, {message: 'shopping cart not found'})
        }

        await findAndUpdateCart({_id: cart._id}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'shopping cart deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
