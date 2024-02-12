import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { findAndUpdateVariant, findVariant } from "../service/item-variant.service";
import { findAndUpdateItem, findItem } from "../service/item.service";
import { Recipe } from "../model/item-variant.model";
import { createStockHistory, findStockHistory } from "../service/stock-history.service";
import { getJsDate } from "../utils/utils";

const parseInventoryFilters = (query: any) => {
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

export const updateItemInventoryHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body;
        let item: any = null;

        if ('variant' in body) {
            item = await findVariant({_id: body.variant});

            // Check if all of its recipe items are available in the quantity needed
            await Promise.all(item.recipe.map(async (recipeItem: Recipe) => {
                const itemInRecipe = await findItem({_id: recipeItem.item});
                const changeAmount = body.quantity * recipeItem.measure;
                if (!itemInRecipe || itemInRecipe.currentStock < changeAmount) {
                    return response.conflict(res, {message:`low stock on input item: ${itemInRecipe?.currentStock} available, ${changeAmount} required`});
                }
            }));
        } else {
            item = await findItem({_id: body.item});
        }

        const stockBeforeChange = item.currentStock;

        // Update the item with the quantity (add or subtract based on the type)
        const updateObject: any = {};
        updateObject.currentStock = body.type === 'increase' ?
            item.currentStock + body.quantity :
            item.currentStock - body.quantity;

        // Update item or variant based on type
        if (item.type && item.type === 'store') {
            await findAndUpdateItem({_id: item._id}, updateObject, {new: true});
        } else {
            await findAndUpdateVariant({_id: item._id}, updateObject, {new: true});

            // Update the recipe items accordingly
            await Promise.all(item.recipe.map(async (recipeItem: Recipe) => {
                const itemInRecipe = await findItem({_id: recipeItem.item});
                const changeAmount = body.quantity * recipeItem.measure;

                if (itemInRecipe) {
                    const recipeItemUpdate = {
                        currentStock: itemInRecipe.currentStock - changeAmount
                    };
                    await findAndUpdateItem({_id: itemInRecipe._id}, recipeItemUpdate, {new: true});
                }
            }));
        }

        // Create stock history
        await createStockHistory({
            recordedBy: userId,
            item: body.item || body.variant,
            stockBeforeChange: stockBeforeChange,
            note: body.note,
            type: body.type,
            quantity: body.quantity
        });

        return response.ok(res, {message: 'item updated successfully'});
    } catch (error) {
        return response.error(res, error);
    }
};

export const getItemStockHistoryHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const itemId = get(req, 'params.itemId');
        const filters = parseInventoryFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const items = await findStockHistory( {...filters, ...{ item: itemId }}, resPerPage, page, expand)
        // return res.send(post)

        const responseObject = {
            total: items.total,
            stockHistory: items.stockHistory
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

// export const updateCategoryHandler = async (req: Request, res: Response) => {
//     try {
//         const categoryId = get(req, 'params.categoryId');
//         const userId = get(req, 'user._id');
//         let update = req.body

//         const item = await findCategory({_id: categoryId})
//         if(!item) {
//             return response.notFound(res, {message: 'category not found'})
//         }

//         await findAndUpdateCategory({_id: item._id}, update, {new: true})

//         return response.ok(res, {message: 'category updated successfully'})
        
//     } catch (error:any) {
//         return response.error(res, error)
//     }
// }

// export const deleteCategoryHandler = async (req: Request, res: Response) => {
//     try {
//         const menuId = get(req, 'params.categoryId');
//         const userId = get(req, 'user._id')
//         const menu = await findCategory({_id: menuId})
//         if(!menu) {
//             return response.notFound(res, {message: 'category not found'})
//         }

//         await findAndUpdateCategory({_id: menu._id}, {deleted: true}, {new: true})

//         return response.ok(res, {message: 'category deleted successfully'})
        
//     } catch (error:any) {
//         return response.error(res, error)
//     }
// }
