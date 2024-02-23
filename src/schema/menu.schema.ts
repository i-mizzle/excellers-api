import { object, string, ref, number, boolean, array } from "yup";

export const createMenuSchema = object({
    body: object({
        name: string().required('name is required'),
        description: string(),
        eCommerceMenu: boolean(),
        items: array(object({
            item: string().required('items.item is required'),
            displayName: string().required('items.displayName is required'),
            price: number().required('item.price is required')
        })),
    })
});

const params = {
    params: object({
        menuId: string().required('menu id is required as a path param')
    })
}

export const getMenuSchema = object({
    ...params
})
