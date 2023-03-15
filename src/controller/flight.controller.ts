import { Request, Response } from "express";
import { confirmFlightPrice, FlightSearch, searchForFlights } from "../service/integrations/tiqwa.service";
import * as response from '../responses'
import { get } from "lodash";

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
        return response.ok(res, flightSearchResults!.data)
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