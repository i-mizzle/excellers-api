import { object, string, ref } from "yup";

export const createStoreSchema = object({
    body: object({
        createdBy: string().required('createdBy is required'),
        name: string().required('name is required'),
        address: string().required('address is required'),
        phone: string().required('address is required'),
        email: string().required('contact email is required'),
        city: string().required('city is required'),
        state: string().required('phone number (phone) is required'),           
    })
});

const params = {
    params: object({
        storeId: string().required('store id is required as a path param')
    })
}

export const getStoreSchema = object({
    ...params
})