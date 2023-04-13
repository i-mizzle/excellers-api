import { object, string, ref, number, array } from "yup";

const payload = {
    body: object({
        invoiceCode: string().required('invoice code required'),
        paymentChannel: string().required('payment channel is required as one of CASH, POS, TRANSFER, ONLINE'),
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
