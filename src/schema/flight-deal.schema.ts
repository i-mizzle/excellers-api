import { object, string, ref, number, boolean, array } from "yup";
import { getJsDate } from "../utils/utils";
import { StringDate } from "../utils/types";
var airports = require('airport-codes');

const payload = {
    body: object({
        title: string().required('title is required'),
        description: string().required('description is required'),
        discountValue: number().required('discountValue is required'),
        discountType: string().required('type is required as enum [eg: PERCENTAGE, FIXED]'),
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
        flight: object({
            origin: string().required('Flight origin airport (flight.origin) is required').test("validate-airport-code", "flight.origin must be a valid IATA airport code", function(value) {
                const exists = airports.findWhere({ iata: value }) 
                if(exists) {
                    return true
                } else {
                    return false
                }
            }),
            destination: string().required('Flight destination airport (flight.destination) is required').test("validate-airport-code", "flight.destination must be a valid IATA airport code", function(value) {
                const exists = airports.findWhere({ iata: value }) 
                if(exists) {
                    return true
                } else {
                    return false
                }
            })
        }),
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

export const createFlightDealSchema = object({
   ...payload
});

export const getFlightDealSchema = object({
    ...params
})