import { object, string, ref } from "yup";

const payload = {
    body: object({
        status: string().required('permission name is required as one of PENDING, PAID, PART_PAID')
    })
}

const params = {
    params: object({
        invoiceId: string().required('invitation code is required as a path param')
    })
}

export const updateInvoiceSchema = object({
    ...params,
    ...payload
 });
