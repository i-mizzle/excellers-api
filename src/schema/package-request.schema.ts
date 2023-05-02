import { object, string, ref, number, array } from "yup";
import { getJsDate } from "../utils/utils";

const payload = {
    body: object({
        name: string().required('package name (name) is required'),
        activities: array().required('an array of activities is required').min(1, 'provide at least one activity'),
        description: string().required('package description (description) is required'),
        packageType: string().required('package type (packageType) is required as enum [eg: PRIVATE, GROUP]'),
        budget: number().required('package price (price) is required'),
        // inclusions: array().required('an array of inclusions is required for this package').min(1, 'provide at least one inclusion'),
        travelDate: string().required('travel date (travelDate) is required in the format DD-MM-YYYY').test("validate-date", "travel date must not be in the past", function(value: any): boolean {
            const jsDate = getJsDate(value)
            if(jsDate < new Date()) {
                return false
            } else {
                return true
            }
        }),
        adults: number().required('number of adults (adults) is required'),
        children: number(),
        infants: number(),
        origin: string().required('origin is required'),
        destination: string().required('destination is required'),
        returnDate: string().required('return date (returnDate) is required in the format DD-MM-YYYY').test("validate-date", "return date must not be in the past", function(value: any): boolean {
            const jsDate = getJsDate(value)
            if(jsDate < new Date()) {
                return false
            } else {
                return true
            }
        }),
        requestedBy: object({
            name: string().required('requestedBy.name is required'),
            email: string().required('requestedBy.email is required'),
            phone: string().required('requestedBy.phone is required'),
        }).required('requestedBy is required as an object with name, email, phone'),
        // media: array(object({
        //     type: string().required('media.type is required as enum [eg: VIDEO, IMAGE, DOCUMENT]'),
        //     url: string().matches(
        //         /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
        //         'Please use a valid url for media.url').required('media.url is required')
        // })),
        // itinerary: array(object({
        //     title: string().required('itinerary.title is required'),
        //     description: string().required('itinerary.description is required'),
        // }))
    })
}

const params = {
    params: object({
        packageRequestId: string().required('package request id is required as a path param')
    })
}

export const createPackageRequestSchema = object({
   ...payload
});

export const getPackageRequestSchema = object({
    ...params,
})
    
export const deletePackageRequestSchema = object({
    ...params
})