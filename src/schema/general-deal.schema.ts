import { object, string, ref, number, boolean, array } from "yup";
import { getJsDate } from "../utils/utils";

const payload = {
    body: object({
        title: string().required('title is required'),
        originalPrice: number().required('original price (originalPrice) of this item is required'),
        dealPrice: number().required('deal price (dealPrice) of this item is required'),
        description: string().required('description is required'),
        vendor: string().required('vendor is required'),
        dealType: string().required('dealType is required'),
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
        originalPrice: number(),
        dealPrice: number(),
        description: string(),
        dealType: string(),
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

export const createGeneralDealSchema = object({
   ...payload
});

export const getGeneralDealSchema = object({
    ...params
})

export const updateGeneralDealSchema = object({
    ...params,
    ...editPayload
})