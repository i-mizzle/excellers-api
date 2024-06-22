import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { getJsDate } from "../utils/utils";
import { createOrder, deleteOrder, findAndUpdateOrder, findOrder, findOrders, orderItems, orderTotal } from "../service/order.service";
import { findUser } from "../service/user.service";
import { checkItemInventory, deductItemInventory, findAndUpdateVariant, findVariant } from "../service/item-variant.service";
import { createStockHistory, findAndUpdateStockHistory, findStockHistoryEntry } from "../service/stock-history.service";
import * as Papa from 'papaparse';
import { sendOrderStatusUpdateNotification } from "../service/mailer.service";

const parseOrderFilters = (query: any) => {
    const { minDateCreated, maxDateCreated, alias, status, store, source, minTotal, maxTotal, paymentStatus } = query; 

    const filters: any = {}; 

    if (source) {
        filters.source = source
    } 

    if (paymentStatus) {
        filters.paymentStatus = paymentStatus;
    } 
    
    if (status) {
        filters.status = status
    }

    if (alias) {
        filters.alias = { $regex: alias, $options: "i" }; 
    }
    
    if (store) {
        filters.name = store; 
    }

    if (minTotal && !maxTotal) {
        filters.total = { $gte: minTotal }; 
    }

    if (maxTotal && !minTotal) {
        filters.total = { $lte: maxTotal }; 
    }

    if (minTotal && maxTotal) {
        filters.total = { $gte: minTotal, $lte: maxTotal };
    }

    if (minDateCreated && !maxDateCreated) {
        filters.createdAt = { $gte: (getJsDate(minDateCreated)) }; 
    }

    if (maxDateCreated && !minDateCreated) {
        filters.createdAt = { $lte: getJsDate(maxDateCreated) }; 
    }

    if (minDateCreated && maxDateCreated) {
        filters.createdAt = { $gte: getJsDate(minDateCreated), $lte: getJsDate(maxDateCreated) };
    }
  
    return filters
}

// const orderTotal = (items: any) => {
//     const totalPrice = items.reduce((a: any, b: any) => a + (b.price * b.quantity || 0), 0)
//     const vat = totalPrice * 0.075
//     return {total: totalPrice, vat: vat}
// }

export const createOrderHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const inventoryErrors: string[] = []

        // check first if all inventory items have enough stock
        await Promise.all(body.items.map(async (item: any) =>{
            const checkResult = await checkItemInventory(item.item, item.quantity)
            if(checkResult.error === true) {
                inventoryErrors.push(checkResult.data)
            }
        }))

        if(inventoryErrors.length > 0 ){
            return response.badRequest(res, {data: inventoryErrors.join(', ')})
        }

        // Deduct all inventory items
        await Promise.all(body.items.map(async (item: any) =>{
            await deductItemInventory(item.item, item.quantity)
        }))

        const total = orderTotal(body.items)
        const order = await createOrder({...body, ...{createdBy: userId, total: total.total, vat: total.vat}})
        return response.created(res, order)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const addToOrderHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const user = await findUser({_id: userId})
        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }

        const orderId = get(req, 'params.orderId');
        const body = req.body

        // get the order
        const order = await findOrder({_id: orderId})
        if(!order) {
            return response.notFound(res, {message: 'order not found'})
        }
        
        // get item amd check if quantity in the payload is available
        const item = await findVariant({_id: body.item})
        if(!item) {
            return response.notFound(res, {message: 'item not found'})
        }

        if(body.quantity > item.currentStock){
            return response.notFound(res, {message: 'required quantity exceeds stock'})
        }

        // deduct the quantity from the item stock
        const previousStock = item.currentStock
        const newItemStock = item.currentStock - body.quantity
        await findAndUpdateVariant({_id: item._id}, {currentStock: newItemStock}, {new: true})

        // check if the current order exists in the item's stock history, 
        const existingHistoryItemForOrder = await findStockHistoryEntry({order: orderId, variant: item._id})
        if(existingHistoryItemForOrder){
            // if it is, just add to the quantity of that record
            const newStockHistoryQuantity = existingHistoryItemForOrder.quantity + body.quantity
            await findAndUpdateStockHistory({_id: existingHistoryItemForOrder._id}, {quantity: newStockHistoryQuantity}, {new: true})
        } else {
            // create entry for the order in the item's stock history
            await createStockHistory({
                order: orderId,
                recordedBy: userId,
                store: user.store,
                variant: item._id,
                stockBeforeChange: previousStock,
                note: 'Order fulfillment',
                type: 'decrease',
                quantity: body.quantity
            })
        }
        
        // add item to the items in the order
        // first, check if the item is already in the order
        const orderItemIndex = order.items.findIndex((i: any)=> i.item === item._id)
        // if it is, add quantity to it
        if(orderItemIndex) {
            order.items[orderItemIndex].quantity += body.quantity;
        }else {
            // if not push the item
            const orderItem = {
                item: body.item,
                quantity: body.quantity,
                price: body.price
            }
            order.items.push(orderItem);
        }
        const newOrderTotal = order.total + (body.price * body.quantity)
        order.total = newOrderTotal

        await findAndUpdateOrder({_id: order._id}, order, {new: true})
        
        return response.ok(res, {message: 'item(s) added to order'})
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const removeFromOrderHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const user = await findUser({_id: userId})
        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }

        const orderId = get(req, 'params.orderId');
        const body = req.body

        // get the order
        const order = await findOrder({_id: orderId})
        if(!order) {
            return response.notFound(res, {message: 'order not found'})
        }
        
        // get item
        const item = await findVariant({_id: body.item})
        if(!item) {
            return response.notFound(res, {message: 'item not found'})
        }

        // add the quantity back to the item stock
        const newItemStock = item.currentStock +- body.quantity
        await findAndUpdateVariant({_id: item._id}, {currentStock: newItemStock}, {new: true})

        // check if the current order exists in the item's stock history, 
        const existingHistoryItemForOrder = await findStockHistoryEntry({order: orderId, variant: item._id})
        if(existingHistoryItemForOrder){
            // if it is, subtract from the quantity of that record
            const newStockHistoryQuantity = existingHistoryItemForOrder.quantity - body.quantity
            await findAndUpdateStockHistory({_id: existingHistoryItemForOrder._id}, {quantity: newStockHistoryQuantity}, {new: true})
        }
        
        return response.ok(res, {message: 'item(s) added to order'})
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getOrdersByStoreHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const storeId = req.params.storeId
        const filters = parseOrderFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        const userId = get(req, 'user._id');
        const user = await findUser({_id: userId})
        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const orders = await findOrders({...filters, ...{store: storeId}}, resPerPage, page, expand)
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

export const getOrdersHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseOrderFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        const userId = get(req, 'user._id');
        const user = await findUser({_id: userId})
        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        let ordersQuery = {
            ...filters, ...{store: user.store}
        }

        if(user.userType === 'SUPER_ADMINISTRATOR') {
            ordersQuery = {...filters}
        }

        const orders = await findOrders(ordersQuery, resPerPage, page, expand)
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

export const exportOrdersToCsvHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const filters = parseOrderFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; 
        const page = +queryObject.page || 1; 
        let expand = queryObject.expand || null

        const userId = get(req, 'user._id');
        const user = await findUser({_id: userId})
        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const orders = await findOrders({...filters, ...{store: user.store}}, 0, 0, expand)

        let data: any = []

        data = orders.orders.map((item: any) => {
            console.log('an order ---> ', item)
            const itemBody = {
                "source menu": item.sourceMenu.name,
                "order alias": item?.alias,
                "items purchased": orderItems(item.order),
                "status": item.status,
                "processed by": item.createdBy?.name,
                total: item.total,
                vat: item.vat,
                "payment status": item.paymentStatus,
                "time stamp": `${new Date(item?.createdAt).toDateString()} - ${new Date(item?.createdAt).toLocaleTimeString()}`
            }
            
            return itemBody
        });

        const csvString = Papa.unparse(data, { header: true });

        res.setHeader('Content-Disposition', 'attachment; filename=output.csv');
        res.setHeader('Content-Type', 'text/csv');
        res.status(200).send(csvString);
    } catch (error) {
        console.error(error);
        return response.error(res, error)
    }
}

export const getOrderHandler = async (req: Request, res: Response) => {
    try {
        const orderId = get(req, 'params.orderId');
        const queryObject: any = req.query;

        const userId = get(req, 'user._id');
        const user = await findUser({_id: userId})
        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }

        let expand = queryObject.expand || null
        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const order = await findOrder({ _id: orderId, store: user.store }, expand)

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
        const user = await findUser({_id: userId})
        if(!user) {
            return response.notFound(res, {message: 'user not found'})
        }
        let update = req.body

        const order = await findOrder({_id: orderId, store: user.store})
        if(!order) {
            return response.notFound(res, {message: 'order not found'})
        }

        await findAndUpdateOrder({_id: order._id}, update, {new: true})

        let deliveryAddress

        if(order.deliveryAddress) {
            deliveryAddress = order.deliveryAddress?.address + ', (' + order.deliveryAddress?.description ? order.deliveryAddress?.description : '' + '), ' + order.deliveryAddress?.city
        }

        if(order.source === 'ONLINE') {
            await sendOrderStatusUpdateNotification({
                mailTo: order.orderBy!.email,
                items: order.items,
                deliveryType: order.deliveryType || '',
                paymentMethod: order.paymentMethod || '',
                deliveryAddress: deliveryAddress,
                orderBy: order.orderBy!,
                total: order.total.toLocaleString(),
                newStatus: update.status
            })
        }

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

        // check if order is not completed and not paid for
        if(order.status !== 'COMPLETED' && order.paymentStatus === 'UNPAID'){
            // if it is, loop through the items and add them back to the variant
            await Promise.all(order.items.map(async (item) =>{
                const variant = await findVariant({_id: item.item})
                if(!variant) {
                    return response.notFound(res, {message: 'item not found'})
                }
                const newItemStock = variant.currentStock + item.quantity
                await findAndUpdateVariant({_id: item.item}, {currentStock: newItemStock}, {new: true})
            }))
        }

        // await findAndDeleteOrder({_id: order._id}, {deleted: true}, {new: true})
        await deleteOrder({_id: order._id})

        return response.ok(res, {message: 'order deleted successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}
