import { object, string, ref, number, array } from "yup";

const payload = {
    body: object({
        name: string().required('package name (name) is required'),
        description: string().required('package description (description) is required'),
        price: number().required('package price (price) is required'),
        lockDownPrice: number().required('package lock down price (lockDownPrice) (price) is required'),
        trips: array().required('an array of trips is required for this package').min(1, 'provide at least one trip id'),
        media: array(object({
            type: string().required('media.type is required as enum [eg: VIDEO, IMAGE, DOCUMENT]'),
            url: string().matches(
                /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                'Please use a valid url for media.url').required('media.url is required')
        }))
    })
}

const params = {
    params: object({
        packageId: string().required('package id is required as a path param')
    })
}

export const createPackageSchema = object({
   ...payload
});

export const getPackageSchema = object({
    ...params,
})
    
export const deletePackageSchema = object({
    ...params
})