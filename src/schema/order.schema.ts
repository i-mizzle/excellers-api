import { object, string, ref, number, boolean, array } from "yup";

export const createOrderSchema = object({
    body: object({
        createdBy: string(),
        orderAlias: string(),
        source: string().required('source is required'),
        cart: string().when('source', {
            is: 'online', 
            then: string().required('cart id is required for online orders')
        }),
        items: array(object({
            item: string().required('items.item is required'),
            displayName: string(),
            price: number().required('item.price is required')
        }).when('source', {
            is: 'onsite', 
            then: string().required('an array of items is required for onsite orders')
        })),
    })
});

const params = {
    params: object({
        categoryId: string().required('category id is required as a path param')
    })
}

export const getCategorySchema = object({
    ...params
})
