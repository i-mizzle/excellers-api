import { object, string, ref, array, number } from "yup";

const payload = {
    body: object({
        user: object().required('user object is required'),
        channel: string().required('transaction channel is required'),
        amount: number().required('transaction amount is required'),
        paymentFor: string().required('paymentFor is required as one of TICKET or SUBSCRIPTION'),
        // paymentItem: string().required('paymentItem (the id of the item being paid for) is required as a string'),
        processor: string().required('processor is required')
    })
}

const params = {
    params: object({
        transactionReference: string().required('transaction reference is required as a path param')
    })
}

export const createTransactionSchema = object({
   ...payload
});

export const getTransactionSchema = object({
    ...params
})

export const updateTransactionSchema = object({
    ...params
})