import { object, string, ref, number } from "yup";
import { CountryStates } from "../static/country-states";
var airports = require('airport-codes');

const payload = {
    body: object({
        title: string().required('title is required'),
        description: string().max(120, 'description is too long - should be 120 chars max.'),
        price: number().required('Trip price is required'),
        lockDownPrice: number().required('Lock down price is required'),
        startDate: string().required('start date required in the format DD-MM-YYYY'),
        endDate: string().required('end date required in the format DD-MM-YYYY'),
        origin: object({
            country: string().required('Origin country (origin.country) is required').test("validate-country-code", "origin.country must be a valid country code", function(value: any) {
                const exists = CountryStates[value as keyof typeof CountryStates] 
                if(exists) {
                    return true
                } else {
                    return false
                }
            }), 
            city: string().required('Origin city (origin.city) is required'),
            airport: string().required('Origin airport (origin.airport) is required').test("validate-airport-code", "origin.airport must be a valid IATA airport code", function(value) {
                const exists = airports.findWhere({ iata: value }) 
                if(exists) {
                    return true
                } else {
                    return false
                }
            })
        }),
        destination: object({
            country: string().required('Destination country (destination.country) is required').test("validate-country-code", "destination.country must be a valid country code", function(value: any) {
                const exists = CountryStates[value as keyof typeof CountryStates] 
                if(exists) {
                    return true
                } else {
                    return false
                }
            }), 
            city: string().required('Destination city (destination.city) is required'),
            airport: string().required('Destination airport (destination.airport) is required').test("validate-airport-code", "destination.airport must be a valid IATA airport code", function(value) {
                const exists = airports.findWhere({ iata: value }) 
                if(exists) {
                    return true
                } else {
                    return false
                }
            })
        }),
    })
}

const params = {
    params: object({
        tripId: string().required('post id is required')
    })
}

export const createTripSchema = object({
   ...payload
});

export const getTripSchema = object({
    ...params
})

export const updateTripSchema = object({
    ...params
})