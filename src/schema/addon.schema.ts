import { object, string, ref, number, boolean } from "yup";

const createAddonPayload = {
    body: object({
        name: string().required('add-on name is required'),
        price: number().required('add-on price is required in kobo')
    })
}

const params = {
    params: object({
        addonId: string().required('add-on id is required as path param')
    })
}


export const createAddonSchema = object({
    ...createAddonPayload
});

export const singleAddonSchema = object({
    ...params
});
