import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { addMinutesToDate, generateCode, getJsDate } from "../utils/utils";
import { createItem, findAndUpdateItem, findItem, findItems } from "../service/item.service";
import { createVariant, findAndUpdateVariant, findVariants } from "../service/item-variant.service";
import { ItemVariantDocument } from "../model/item-variant.model";
import { findAndUpdateMenu, findMenus } from "../service/menu.service";
import { MenuDocument, MenuItem } from "../model/menu.model";

const parseItemFilters = (query: any) => {
    const { minDateCreated, maxDateCreated, type, name } = query; 

    const filters: any = {}; 

    if (type) {
        filters.type = type
    }

    if (name) {
        filters.name = { $regex: name, $options: "i" }; 
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

export const createItemHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const item = await createItem({
            // ...body, ...{createdBy: userId}
            createdBy: body.createdBy,
            store: body.store,
            sku: body.sku,
            name: body.name,
            category: body.category,
            description: body.description,
            lowStockAlertCount: body?.lowStockAlertCount,
            type: body.type,
            stockUnit: body?.stockUnit,
            currentStock: 0,
            coverImage: body.coverImage || null,
        })
        const variants: ItemVariantDocument[] = []
        const update: ItemVariantDocument['_id'][] = []
        let updatedItem = null
        if(body.variants && body.variants !== ''){
            await Promise.all(body.variants.map(
                async (variant: ItemVariantDocument, variantIndex: number) => {
                    const newVariant = await createVariant({...variant, ...{
                        createdBy: body.createdBy
                    }})
                    variants.push(newVariant)
                    update.push(newVariant._id)
                }
            ))
            updatedItem = await findAndUpdateItem({_id: item._id}, {variants: update}, {new: true})
        }

        
        return response.created(res, updatedItem)
        // return response.created(res, {...item, ...{variants: variants}})
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getItemsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseItemFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const items = await findItems( {...filters, ...{ deleted: false }}, resPerPage, page, expand)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: items.total,
            items: items.items
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getItemHandler = async (req: Request, res: Response) => {
    try {
        const itemId = get(req, 'params.itemId');
        const storeId = get(req, 'params.storeId');
        const queryObject: any = req.query;
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const item = await findItem({ _id: itemId, store: storeId, deleted: false }, expand)

        if(!item) {
            return response.notFound(res, {message: 'item not found'})
        }

        return response.ok(res, item)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateItemHandler = async (req: Request, res: Response) => {
    try {
        const enquiryId = get(req, 'params.enquiryId');
        const userId = get(req, 'user._id');
        let update = req.body

        const item = await findItem({_id: enquiryId})
        if(!item) {
            return response.notFound(res, {message: 'item not found'})
        }


        await findAndUpdateItem({_id: item._id}, update, {new: true})

        return response.ok(res, {message: 'item updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

const removeItemVariantFromMenus = async (variantId: string): Promise<void> => {
    try {
        // Find all menus containing the specified item variant
        const menus = await findMenus({ 'items.item': variantId }, 0, 0, '');
        if(!menus || menus.menus.length > 0 ) {
            console.log(`Item variant with ID ${variantId} not found in any menus`);
            return
        }

        // Remove the item variant from each menu
        await Promise.all(
            menus.menus.map(async (menu: MenuDocument) => {
                const itemsWithVariantRemoved = menu.items.filter((item: MenuItem) => item.item.toString() !== variantId);
                await findAndUpdateMenu({_id: menu._id}, {items: itemsWithVariantRemoved}, {new: true})
            })
        );
  
        console.log(`Item variant with ID ${variantId} removed from all menus.`);
    } catch (error) {
        console.error('Error removing item variant from menus:', error);
        throw error;
    }
}

export const deleteItemHandler = async (req: Request, res: Response) => {
    try {
        const itemId = get(req, 'params.itemId');
        const userId = get(req, 'user._id')
        const item = await findItem({_id: itemId})
        if(!item) {
            return response.notFound(res, {message: 'item not found'})
        }

        await findAndUpdateItem({_id: item._id}, {deleted: true}, {new: true})

        const itemVariants = await findVariants({item: itemId}, 0, 0, '')

        itemVariants.variants.forEach(async (variant: ItemVariantDocument) => {
            await removeItemVariantFromMenus(variant._id)
            await findAndUpdateVariant({_id: variant._id}, {deleted: true, item: ''}, {new: true})
        })

        return response.ok(res, {message: 'item deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
