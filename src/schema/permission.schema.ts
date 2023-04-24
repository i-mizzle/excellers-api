import { object, string, ref, number, array } from "yup";

const payload = {
    body: object({
        permissions: array(object({
            name: string().required('permission name is required'),
            description: string().required('time-slot order is required'),
        })).required('permissions is required as an array')
    })
}

const params = {
    params: object({
        slug: string().required('permission slug is required as a path param')
    })
}

export const createPermissionsSchema = object({
   ...payload
});

export const getPermissionSchema = object({
    ...params,
})