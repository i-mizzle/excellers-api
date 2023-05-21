import { object, string, ref, number, boolean, array } from "yup";


const payload = {
    body: object({
        deal: string().required('deal is required'),
        dealOwners: array(object({
            name: string().required('dealOwner.name is required'),
            email: string().required('dealOwner.email is required'),
            phone: string().required('deal.description is required'),
        })).required('dealOwners is required as an array')
    })
}

const params = {
    params: object({
        bookingCode: string().required('bookingCode is required as a path param')
    })
}

export const createGeneralDealBookingSchema = object({
   ...payload
});

export const getGeneralDealBookingSchema = object({
    ...params
})
