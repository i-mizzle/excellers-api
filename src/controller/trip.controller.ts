import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { createTrip, findAndUpdateTrip, findTrip, findTrips } from "../service/trip.service";

export const createTripHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const trip = await createTrip({...body, ...{createdBy: userId}})
        return response.created(res, trip)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getTripsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        const user: any = get(req, 'user');
        
        let tripsQuery: any = {deleted: false, active: true}

        if(user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMINISTRATOR' ) {
            tripsQuery = {deleted: false}
        }
        const bookings = await findTrips(tripsQuery, resPerPage, page)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: bookings.total,
            trips: bookings.trips
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getTripHandler = async (req: Request, res: Response) => {
    try {
        const tripId = get(req, 'params.tripId');

        const trip = await findTrip({_id: tripId, deleted: false})
        // return res.send(post)

        if(!trip) {
            return response.notFound(res, {message: 'trip not found'})
        }

        return response.ok(res, trip)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateTripHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const tripId = get(req, 'params.tripId');

        const update = req.body

        const trip = await findTrip({_id: tripId})
        if(!trip) {
            return response.notFound(res, {message: 'trip not found'})
        }

        await findAndUpdateTrip({_id: tripId}, update, {new: true})

        return response.ok(res, {message: 'trip updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteTripHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const tripId = get(req, 'params.tripId');

        const trip = await findTrip({_id: tripId})
        if(!trip) {
            return response.notFound(res, {message: 'trip not found'})
        }

        await findAndUpdateTrip({_id: tripId}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'trip deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}