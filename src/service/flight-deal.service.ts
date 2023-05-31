import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { UserDocument } from "../model/user.model";
import { StringDate } from "../utils/types";
import { getJsDate } from "../utils/utils";
import FlightDeal, { FlightDealDocument } from "../model/flight-deal.model";

interface CreateFlightDealInput {
    createdBy: UserDocument['_id'];
    dealCode: string,
    flight: {
        origin: string
        destination: string
    }
    discountValue: number,
    airlines: string[],
    discountType: string,
    title: string
    description: string,
    startDate: StringDate,
    endDate: StringDate
    active?: Boolean
    media?: {
      type: string
      url: string  
    }[]
}


export const createFlightDeal = async (
    input: CreateFlightDealInput) => {
        try {
        const deal = await FlightDeal.create({
            createdBy: input.createdBy,
            title: input.title,
            description: input.description,
            flight: input.flight,
            dealCode: input.dealCode,
            discountValue: input.discountValue,
            discountType: input.discountType,
            airlines: input.airlines,
            startDate: getJsDate(input.startDate),
            endDate: getJsDate(input.endDate),
            active: input.active || true,
            media: input.media
        })
        return deal
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findFlightDeals(
    query: FilterQuery<FlightDealDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await FlightDeal.find(query, {}, options).countDocuments()
    let deals = null
    if(perPage===0&&page===0){
        deals = await FlightDeal.find(query, {}, options).populate(expand)
    } else {
        deals = await FlightDeal.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    console.log(deals)

    return {
        total,
        deals
    }
}

export async function findFlightDeal(
    query: FilterQuery<FlightDealDocument>,
    expand: string,
    options: QueryOptions = { lean: true },
) {
    try {
        const deal = await FlightDeal.findOne(query, {}, options).populate(expand)
        
        return deal
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findAndUpdateFlightDeal(
    query: FilterQuery<FlightDealDocument>,
    update: UpdateQuery<FlightDealDocument>,
    options: QueryOptions
) {

    try {
        return FlightDeal.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}

export const findExistingFlightDeal = async(origin: string, destination: string, departureDate: string, airline: string) => {
    console.log(origin, ' -> ', destination, ' on ', departureDate)
    // search for existing deal on the route
    const dealQuery = {
        flight: {
            origin: origin,
            destination: destination
        }, 
        active: true, 
        deleted: false,
        airlines: { $in: [airline] },
        startDate: {
            $lte: new Date(departureDate)
        },
        endDate: {
            $gte: new Date(departureDate),
        }
    }

    console.log('deal => ', dealQuery)

    const existingDeal = await findFlightDeal(dealQuery, '') 

    console.log('deal => ', existingDeal)

    return existingDeal
}