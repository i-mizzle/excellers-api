import { object, string, ref, number, boolean, array } from "yup";
import { getJsDate } from "../utils/utils";

const payload = {
    body: object({
        title: string().required('title is required'),
        package: string().required('package is required as the _id of the package this deal is for'),
        discountValue: number().required('discountValue is required'),
        discountType: string().required('type is required as enum [eg: PERCENTAGE, FIXED]'),
        description: string().required('description is required'),
        startDate: string().required('start date required in the format DD-MM-YYYY').test("validate-start-date", "start date must be today or after", function(value: any) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            if(getJsDate(value) > yesterday) {
                return true
            } else {
                return false
            }
        }),
        endDate: string().required('end date required in the format DD-MM-YYYY').test("validate-end-date", "end date must be after today and after the start date", function(value: any) {
            if(getJsDate(value) >= new Date()) {
                return true
            } else {
                return false
            }
        }),
        active: boolean(),
        media: array(object({
            type: string().required('media.type is required as enum [eg: VIDEO, IMAGE, DOCUMENT]'),
            url: string().matches(
                /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                'Please use a valid url for media.url').required('media.url is required')
        })),
    })
}

const editPayload = {
    body: object({
        title: string(),
        package: string(),
        discountValue: number(),
        discountType: string(),
        description: string(),
        startDate: string().test("validate-start-date", "start date must be today or after", function(value: any) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            if(getJsDate(value) > yesterday) {
                return true
            } else {
                return false
            }
        }),
        endDate: string().test("validate-end-date", "end date must be after today and after the start date", function(value: any) {
            if(getJsDate(value) >= new Date()) {
                return true
            } else {
                return false
            }
        }),
        active: boolean(),
        media: array(object({
            type: string().required('media.type is required as enum [eg: VIDEO, IMAGE, DOCUMENT]'),
            url: string().matches(
                /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                'Please use a valid url for media.url').required('media.url is required')
        })),
    })
}

const params = {
    params: object({
        dealCode: string().required('dealCode is required as a path param')
    })
}

export const createPackageDealSchema = object({
   ...payload
});

export const getPackageDealSchema = object({
    ...params
})

export const updatePackageDealSchema = object({
    ...params,
    ...editPayload
})