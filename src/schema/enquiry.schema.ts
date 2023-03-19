import { object, string, ref, boolean } from "yup";

const payload = {
    body: object({
        enquiryType: string().required('enquiryType is required as enum (eg: PACKAGE, DEAL, GENERAL, VISA'),
        message: string().required('enquiry message is required'),
        name: string().required('guest name is required'),
        email: string().email('must be a valid email').required('guest email is required'),
        phone: string().required('guest phone is required'),      
    })
}

const params = {
    params: object({
        enquiryId: string().required('enquiry id is required as a path param')
    })
}

export const createEnquirySchema = object({
   ...payload
});

export const getEnquirySchema = object({
    ...params
})
