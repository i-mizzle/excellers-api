import { Request, Response } from "express";
import { confirmFlightPrice, FlightSearch, searchForFlights } from "../service/integrations/tiqwa.service";
import * as response from '../responses'
import { get } from "lodash";

const airports = require('airport-codes');

export const flightSearchHandler = async (req: Request, res: Response) => {
    try {
        const body = req.body
        const queryObject: any = req.query;
        
        const requestPayload: FlightSearch = {
            adults: body.adults,
            cabin: body.cabin,
            departure_date: body.departureDate, 
            destination: body.destination,
            origin: body.origin,
            children: body.children,
            infants: body.infants,
            return_date: body.returnDate
        }

        const flightSearchResults = await searchForFlights(requestPayload)

        if(flightSearchResults.error === true) {
            return response.handleErrorResponse(res, {data: flightSearchResults.data})
        }

        const filteredResults = flightSearchResults!.data.filter((result: any) => {
            const outboundFlightsFound = result.outbound.filter((flight:any)=> {
                return body.airlines?.includes(flight.operatingAirline)
            })

            if (outboundFlightsFound.length > 0 ) {
                return result
            }
        })

        let resultsToParse = flightSearchResults!.data

        if(body.airlines && body.airlines.length > 0) {
            resultsToParse = filteredResults
        }

        const results = resultsToParse.map((result: any) => {
            const outboundFlights: any = []
            const inboundFlights: any = []

            result.outbound.forEach((flight: any) => {
                const airportFrom = {
                    airportCode: flight.airportFrom,
                    name: airports.findWhere({ iata: flight.airportFrom }).get('name'),
                    city: airports.findWhere({ iata: flight.airportFrom }).get('city'),
                    country: airports.findWhere({ iata: flight.airportFrom }).get('country'),
                }
                const airportTo = {
                    airportCode: flight.airportTo,
                    name: airports.findWhere({ iata: flight.airportTo }).get('name'),
                    city: airports.findWhere({ iata: flight.airportTo }).get('city'),
                    country: airports.findWhere({ iata: flight.airportTo }).get('country'),
                }

                flight.airportFrom = airportFrom
                flight.airportTo = airportTo
                
                flight.departureDate = new Date(flight?.departureTime).toLocaleDateString()
                flight.departureTime = new Date(flight?.departureTime).toLocaleTimeString()
                flight.arrivalDate = new Date(flight?.arrivalTime).toLocaleDateString()
                flight.arrivalTime = new Date(flight?.arrivalTime).toLocaleTimeString()

                
                outboundFlights.push(flight)
            })
            result.outbound = outboundFlights

            result.inbound.forEach((flight: any) => {
                const airportFrom = {
                    airportCode: flight.airportFrom,
                    name: airports.findWhere({ iata: flight.airportFrom }).get('name'),
                    city: airports.findWhere({ iata: flight.airportFrom }).get('city'),
                    country: airports.findWhere({ iata: flight.airportFrom }).get('country'),
                }
                
                const airportTo = {
                    airportCode: flight.airportTo,
                    name: airports.findWhere({ iata: flight.airportTo }).get('name'),
                    city: airports.findWhere({ iata: flight.airportTo }).get('city'),
                    country: airports.findWhere({ iata: flight.airportTo }).get('country'),
                }

                flight.airportFrom = airportFrom
                flight.airportTo = airportTo
                flight.departureDate = new Date(flight?.departureTime).toLocaleDateString()
                flight.departureTime = new Date(flight?.departureTime).toLocaleTimeString()
                flight.arrivalDate = new Date(flight?.arrivalTime).toLocaleDateString()
                flight.arrivalTime = new Date(flight?.arrivalTime).toLocaleTimeString()
                inboundFlights.push(flight)
            })
            result.inbound = inboundFlights

            return result
        })

        return response.ok(res, {total: results.length, results})
        // return response.ok(res, flightSearchResults!.data)
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const confirmFlightPriceHandler = async (req: Request, res: Response) => {
    try {
        const flightId = req.params.flightId

        const confirmation = await confirmFlightPrice(flightId)

        if(confirmation.error === true) {
            return response.handleErrorResponse(res, {data: confirmation.data})
        }
        return response.ok(res, confirmation!.data)
    } catch (error: any) {
        return response.error(res, error)
    }
}