import { object, string } from "yup";

const params = {
    params: object({
        confirmationCode: string().required('confirmation code is required')
    })
}

export const confirmationSchema = object({
    ...params
})