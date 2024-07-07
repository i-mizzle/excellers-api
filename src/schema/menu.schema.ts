import { object, string, ref, number, boolean, array } from "yup";

export const createMenuSchema = object({
    body: object({
        name: string().required('name is required'),
        description: string(),
        eCommerceMenu: boolean(),
        items: array(object({
            item: string().required('items.item is required'),
            displayName: string().required('items.displayName is required'),
            fixedPricing: boolean().required('items.fixedPricing is required as a boolean'),
            price: number()
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
