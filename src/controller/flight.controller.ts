import { Request, Response } from "express";
import { confirmFlightPrice, FlightSearch, searchForFlights } from "../service/integrations/tiqwa.service";
import * as response from '../responses'
import { get } from "lodash";
import { findExistingFlightDeal, findFlightDeal } from "../service/flight-deal.service";
import { getMarginValue } from "../service/margin.service";
import log from "../logger";
import { findUser } from "../service/user.service";
import { findAffiliateMarkup } from "../service/affiliate-markup.service";

const airports = require('airport-codes');

export const flightSearchHandler = async (req: Request, res: Response) => {
    try {
        const body = req.body
        
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

        const results = await Promise.all(resultsToParse.map(async (result: any) => {
            console.log(result)
            let discountedPrice = null

            // search for existing deal on the route
            const existingDeal = await findExistingFlightDeal(
                body.origin, 
                body.destination, 
                body.departureDate,
                result.outbound[0].marketingAirline
            ) 

            if(existingDeal && existingDeal.discountType === 'FIXED' && body.showDeals && body.showDeals === true) {
                discountedPrice = result.pricing.payable - existingDeal.discountValue/100
                result.pricing = {...result.pricing, ...{discountedPrice: discountedPrice}}
            }

            if(existingDeal && existingDeal.discountType === 'PERCENTAGE' && body.showDeals && body.showDeals === true) {
                discountedPrice = result.pricing.payable - ((existingDeal.discountValue/100) * result.pricing.payable)
                result.pricing = {...result.pricing, ...{discountedPrice: discountedPrice}}
            }

            if(body.showDeals && body.showDeals === true) {
                result.deal = existingDeal
            }

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
        }))

        return response.ok(res, {total: results.length, results})
        // return response.ok(res, flightSearchResults!.data)
    } catch (error: any) {
        return response.error(res, error)
    }
}

export const confirmFlightPriceHandler = async (req: Request, res: Response) => {
    try {
        const flightId = req.params.flightId
        const queryObject: any = req.query;
        const confirmation = await confirmFlightPrice(flightId)
        const userId = get(req, 'user._id');


        if(confirmation.error === true) {
            return response.handleErrorResponse(res, {data: confirmation.data})
        }

        let confirmationData = confirmation!.data

        const existingDeal = await findExistingFlightDeal(
            confirmation!.data.outbound[0].airportFrom, 
            confirmation!.data.outbound[0].airportTo, 
            confirmation!.data.outbound[0].departureTime.toString().split('T')[0],
            confirmationData.outbound[0].marketingAirline
        ) 

        log.info('confirmationData ------------->')
        log.info(confirmationData)

        const margin = await getMarginValue(
            confirmationData.documentRequired ? 'INTERNATIONAL' : 'LOCAL', confirmationData.pricing.payable
        )

        let affiliateMarkup = 0
        if(userId && userId !== '') {
            const user = await findUser({_id: userId})

            if(user && user.userType === 'AFFILIATE') {
                const markup = await findAffiliateMarkup({user: userId})
                
                if(markup && markup.markupType === 'PERCENTAGE') {
                    affiliateMarkup = (markup.markup/100) * confirmationData.pricing.payable
                }
                
                if(markup && markup.markupType === 'FIXED') {
                    affiliateMarkup = markup.markup
                }
            }
        }

        console.log('AFFILIATE MONEY::::::> ', affiliateMarkup)

        if(margin === null) {
            return response.notFound(res, {message: 'margin not found'})
        }

        let discountedPrice = null
        if(queryObject?.showDeal === 'true' && !existingDeal ) {
            confirmationData.pricing = {
                ...confirmationData.pricing, 
                ...{
                    payable: confirmationData.pricing.payable + margin + affiliateMarkup
                }
            }
        }

        if(queryObject?.showDeal === 'true' && existingDeal && existingDeal.discountType === 'FIXED') {
            discountedPrice = (confirmationData.pricing.payable - (existingDeal.discountValue/100)) + margin + affiliateMarkup
            confirmationData.pricing = {...confirmationData.pricing, ...{
                discountedPrice: discountedPrice, 
                payable: confirmationData.pricing.payable + margin + affiliateMarkup
            }}
        }

        if(queryObject?.showDeal === 'true' && existingDeal && existingDeal.discountType === 'PERCENTAGE') {
            discountedPrice = (confirmationData.pricing.payable - ((existingDeal.discountValue/100) * confirmationData.pricing.payable)) + margin + affiliateMarkup

            confirmationData.pricing = {
                ...confirmationData.pricing, 
                ...{
                    discountedPrice: discountedPrice, 
                    payable: confirmationData.pricing.payable + margin + affiliateMarkup
                }
            }
        }
        
        if(queryObject?.showDeal === 'true' && existingDeal) {
            confirmationData.deal = existingDeal
        }

        if(!queryObject?.showDeal || queryObject?.showDeal === 'false') {
            confirmationData.pricing = {...confirmationData.pricing, ...{
                discountedPrice: discountedPrice, 
                payable: confirmationData.pricing.payable + margin + affiliateMarkup
            }}
        }
        
        return response.ok(res, confirmationData)
    } catch (error: any) {
        return response.error(res, error)
    }
}