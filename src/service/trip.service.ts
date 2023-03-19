import { v4 as uuidv4 } from 'uuid';
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import Trip, { OriginDestination, TripDocument } from '../model/trip.model';
import { getJsDate } from '../utils/utils';
import { StringDate } from '../utils/types';
import { UserDocument } from '../model/user.model';

interface CreateTripInput {
    createdBy: UserDocument["_id"];
    title: string
    description?: string
    origin : OriginDestination
    destination : OriginDestination
    price: number,
    lockDownPrice: number,
    startDate: StringDate,
    endDate: StringDate
}

export const createTrip = async (
    input: CreateTripInput) => {
    try {
        const trip = await Trip.create({
            createdBy: input.createdBy,
            title: input.title,
            description: input.description,
            origin : input.origin,
            destination : input.destination,
            price: input.price,
            lockDownPrice: input.lockDownPrice,
            startDate: getJsDate(input.startDate),
            endDate: getJsDate(input.endDate)
        })

        return trip
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findTrips(
    query: FilterQuery<TripDocument>,
    perPage: number,
    page: number,
    options: QueryOptions = { lean: true }
) {
    const total = await Trip.find(query, {}, options).countDocuments()
    let trips = null
    if(perPage===0&&page===0){
        trips = await Trip.find(query, {}, options)
    } else {
        trips = await Trip.find(query, {}, options)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        trips
    }
}

export async function findTrip(
    query: FilterQuery<TripDocument>,
    options: QueryOptions = { lean: true }
) {
    try {
        const trip = await Trip.findOne(query, {}, options)
        
        return trip
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateTrip(
    query: FilterQuery<TripDocument>,
    update: UpdateQuery<TripDocument>,
    options: QueryOptions
) {

    try {
        return Trip.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}