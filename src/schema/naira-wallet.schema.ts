import { object, string } from "yup";

const params = {
    params: object({
        walletId: string().required('wallet id (_id or account number) is required as a path param')
    })
}

export const getWalletDetailsSchema = object({
    ...params
 });