import { object, string, ref, number } from "yup";

const payload = {
    body: object({
        item: string().required('item is required'),
        unit: string().required('unit is required'),
        price: number().required('price is required')
    })
}

const params = {
    params: object({
        priceId: string().required('price id is required as a path param')
    })
}

export const createPriceSchema = object({
   ...payload
});

export const updatePriceSchema = object({
    ...params
})
    
export const deletePriceSchema = object({
    ...params
})