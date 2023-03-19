// yup.mixed<EnumName>().oneOf(Object.values(EnumName))
//     .required(),

import { object, string, ref, array } from "yup";

const payload = {
    body: object({
        name: string().required('name is required'),
        email: string().required('email is required').email('email must be a valid email'),
        subscriptions: array().required('an array of subscriptions is required').min(1, 'provide at least one subscription type enum [eg: PROMOTIONS, ANNOUNCEMENTS]')
    })
}

const params = {
    params: object({
        subscriptionId: string().required('subscription id is required as a path param')
    })
}

export const createNewsletterSubscriptionSchema = object({
   ...payload
});

export const getNewsletterSubscriptionSchema = object({
    ...params
})

export const updateNewsletterSubscriptionSchema = object({
    ...params,
    ...payload
})
    
export const deleteNewsletterSubscriptionSchema = object({
    ...params
})