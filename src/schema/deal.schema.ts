import { object, string, ref, number, boolean } from "yup";

const payload = {
    body: object({
        title: string().required('title is required'),
        dealItemType: string().required('dealItemType is required as enum [eg: PACKAGE, FLIGHT]'),
        dealItem: string().required('dealItem is required'),
        discountValue: number().required('discountValue is required'),
        discountType: string().required('type is required as enum [eg: PERCENTAGE, FIXED]'),
        description: string().required('description is required'),
        startDate: string().required('start date required in the format DD-MM-YYYY'),
        endDate: string().required('end date required in the format DD-MM-YYYY'),
        active: boolean()
    })
}

const params = {
    params: object({
        dealId: string().required('dealId is required as a path param')
    })
}

export const createDealSchema = object({
   ...payload
});

// export const updatePostSchema = object({
//     ...params,
//     ...payload
// })
    
export const getDealSchema = object({
    ...params
})