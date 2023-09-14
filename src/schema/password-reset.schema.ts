import { object, string, ref, array } from "yup";

const requestResetPayload = {
    body: object({
        email: string().required('email is required')
    })
}

const resetPasswordPayload = {
    body: object({
        resetCode: string().required('resetCode is required'),
        password: string().required('password is required'),
    })
}

export const resetRequestSchema = object({
   ...requestResetPayload
});

export const resetPasswordSchema = object({
   ...resetPasswordPayload
});
