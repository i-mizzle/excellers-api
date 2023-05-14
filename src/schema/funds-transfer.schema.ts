import { object, string, ref, number, boolean } from "yup";

const validateBankAccountPayload = {
    body: object({
        bankCode: string().required('bank code (bankCOde) is required'),
        accountNumber: number().required('account number (accountNumber) required')
    })
}

export const validateBankAccountSchema = object({
    ...validateBankAccountPayload
});

const fundsTransferPayload = {
    body: object({
        wallet: string().required('wallet is required - the _id of the wallet'),
        accountNumber: string().required('destination account number (accountNumber) is required'),
        bankName: string().required('destination bank name (bankName) is required'),
        bankCode: string().required('destination bank code (bankCode) is required'),
        accountName: string().required('destination account name (accountName) is required'),
        sessionId: string().required('session id (sessionId) is required'),
        amount: number().required('transfer amount (amount) is required in kobo')
    })
}

// const params = {
//     params: object({
//         addonId: string().required('add-on id is required as path param')
//     })
// }

export const fundsTransferSchema = object({
    ...fundsTransferPayload
});



// export const singleAddonSchema = object({
//     ...params
// });
