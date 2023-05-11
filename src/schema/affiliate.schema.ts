import { object, string, ref, number, boolean } from "yup";

const validateBvnPayload= {
    body: object({
        bvn: string().matches(/^[0-9]{11}$/, 'please provide a valid BVN - an 11 digit string pf numbers').required('bvn is required'),
        dateOfBirth: string().required('date of birth (dateOfBirth) is required in the format DD-MM-YYYY')
    })
}

const approveAffiliatePayload= {
    body: object({
        markupType: string().required('markup type is required as PERCENTAGE or FLAT'),
        markup: number().required('markup is required')
    })
}

const params = {
    params: object({
        userId: string().required('user id of the affiliate is required as path param')
    })
}

export const validateBvnSchema = object({
   ...validateBvnPayload
});

export const approveAffiliateSchema = object({
    ...approveAffiliatePayload,
   ...params
});
