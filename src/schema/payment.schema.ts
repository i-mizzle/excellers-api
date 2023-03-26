import { object, string, ref, number, array } from "yup";

const payload = {
    body: object({
        invoiceCode: string().required('package name (name) is required'),
        paymentChannel: string().required('package description (description) is required'),
        redirectUrl: string().required('redirectUrl is required'),
        customer: object({
            email: string().email('Please use a valid email for customer.email').required('customer.email is required'),
            name: string(),
            phone: string()
        }).required('customer object is required'),

    })
}

const params = {
    params: object({
        flwTransactionId: string().required('transaction id is required as a path param')
    })
}

export const initializePaymentSchema = object({
   ...payload
});

export const verifyPaymentSchema = object({
    ...params,
})
