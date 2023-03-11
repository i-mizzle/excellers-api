import { object, string, ref, boolean } from "yup";

export const createUserSchema = object({
    body: object({
        property: string().required('Property is required'),
        message: string().required('enquiry message is required'),
        enquiryByGuest: boolean().required('select true/false if this enquiry is by a guest'),
        guest: object().when('enquiryByGuest', {
            is: true, 
            then: object({
                name: string().required('guest name is required'),
                email: string().email('must be a valid email').required('guest email is required'),
                phone: string().required('guest phone is required'),
            })
        })       
    })
});
