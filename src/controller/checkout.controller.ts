import { Request, Response } from "express";
import * as response from '../responses'
import { AnyKindOfDictionary, get } from "lodash";
import { findAndUpdateCart, findCart } from "../service/cart.service";
import { createOrder, orderTotal } from "../service/order.service";

export const checkoutHandler = async (req: Request, res: Response) => {
    try {
        // const userId = get(req, 'user._id');
        const cartId = get(req, 'params.cartId');
        const body = req.body;

        // get cart 
        const cart = await findCart({_id: cartId})
        if(!cart) {
            return response.notFound(res, {message: `cart not found`})
        }
        const cartUpdate = {
            checkoutStatus: 'checked_out'
        }

        // update cart checkout status
        await findAndUpdateCart({_id: cartId}, cartUpdate, {new: true})

        // create order pulling cart items and total price and set payment status to pending
        const orderPayload: any = {
            alias: `web-order-${cartId}`,
            source: 'ONLINE',
            items: cart.items,
            total: orderTotal(cart.items).total,
            status: 'PENDING',
            paymentStatus: 'UNPAID',
            sourceMenu: body.sourceMenu,
            store: body.store,
            orderBy: body.orderBy,
            deliveryType: body.deliveryType,
            vat: orderTotal(cart.items).vat
        }

        if(body.deliveryType === 'DOORSTEP') {
            orderPayload.deliveryAddress = body.deliveryAddress
        }

        if(body.deliveryType === 'PICKUP') {
            orderPayload.pickupOutlet = body.pickupOutlet
        }

        const order = await createOrder(orderPayload)
        // do these in another step... user will pass the order to the generate payment url
        // initialize payment
        // return payment link

        return response.created(res, {message: 'checked out successfully, order created', order: order});
    } catch (error) {
        return response.error(res, error);
    }
}; 