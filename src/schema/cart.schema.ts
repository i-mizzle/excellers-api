import { object, string, ref, number, boolean, array } from "yup";

export const createCartSchema = object({
    body: object({
        clientId: string().required('clientId is required'),
        items: array(object({
            item: string().required('items.item is required'),
            displayName: string(),
            price: number().required('item.price is required')
        })),
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
