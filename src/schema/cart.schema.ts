import { object, string, ref, number, boolean, array } from "yup";

export const sendToCartSchema = object({
    body: object({
        clientId: string().required('clientId is required'),
        item: object({
            item: string().required('items.item is required'),
            parentItem: string().required('items.parentItem is required'),
            parentItemCategory: string().required('items.parentItemCategory is required'),
            displayName: string(),
            price: number().required('item.price is required'),
            quantity: number().required('item.quantity is required')
        }),
    }),
    params: object({
        storeId: string().required('store id is required as a path param')
    })
});

export const deductFromCartSchema = object({
    body: object({
        clientId: string().required('clientId is required'),
        item: string().required('items.item is required'),
        quantity: number().required('item.quantity is required')
    }),
    params: object({
        storeId: string().required('store id is required as a path param')
    })
});

export const checkoutCartSchema = object({
    body: object({
        deliveryType: string().required('delivery type is required'),
        paymentType: string().required('payment type is required'),
        sourceMenu: string().required('source menu is required'),
        store: string().required('store is required'),
        orderBy: object({
            name: string().required('name (orderBy.name) is required'),
            email: string().required('email (orderBy.email) is required'),
            phone: string().required('phone (orderBy.phone) is required'),
        }),
        deliveryAddress: object({
            address: string().required('delivery address is required'),
            state: string().required('delivery state is required'),
            city: string().required('delivery city is required'),
            description: string(),
        }).when('deliveryType', {
            is: 'DOORSTEP', 
            then: object().required('delivery address is required for')
        }),
        pickupOutlet: string().when('deliveryType', {
            is: 'PICKUP', 
            then: string().required('pickup outlet is required for pickup orders')
        }),
    }),
    params: object({
        cartId: string().required('cart id is required as a path param')
    })
});

const params = {
    params: object({
        cartId: string().required('cart id is required as a path param')
    })
}

export const getCartSchema = object({
    ...params
})
