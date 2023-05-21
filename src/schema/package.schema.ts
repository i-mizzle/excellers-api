import { object, string, ref, number, array } from "yup";

const payload = {
    body: object({
        name: string().required('package name (name) is required'),
        description: string().required('package description (description) is required'),
        packageType: string().required('package type (packageType) is required as enum [eg: PRIVATE, GROUP]'),
        fulfilledBy: string().required('fulfilledBy is required'),
        price: number().required('package price (price) is required'),
        month: string().required('month is required'),
        lockDownPrice: number().required('package lock down price (lockDownPrice) (price) is required'),
        inclusions: array().required('an array of inclusions is required for this package').min(1, 'provide at least one inclusion'),
        media: array(object({
            type: string().required('media.type is required as enum [eg: VIDEO, IMAGE, DOCUMENT]'),
            url: string().matches(
                /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                'Please use a valid url for media.url').required('media.url is required')
        })),
        itinerary: array(object({
            title: string().required('itinerary.title is required'),
            description: string().required('itinerary.description is required'),
        })),
        destination: object({
            country: string().required('destination.country is required'),
            city: string().required('destination.city is required'),
        }).required('destination is required')
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