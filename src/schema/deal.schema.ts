import { object, string, ref, number, boolean } from "yup";

const payload = {
    body: object({
        title: string().required('title is required'),
        value: number().required('value is required'),
        type: string().required('type is required as enum [eg: PERCENTAGE, FIXED]'),
        description: string().required('description is required'),
        startDate: string().required('start date required in the format DD-MM-YYYY'),
        endDate: string().required('end date required in the format DD-MM-YYYY'),
        active: boolean()
    })
}

const params = {
    params: object({
        voucherCode: string().required('voucher code is required as a path param')
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