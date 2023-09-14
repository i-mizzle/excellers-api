import axios from 'axios';
import config from 'config';
import { Passenger } from '../../model/booking.model';
import { snakeToCamel } from '../../utils/utils';

const tiqwaConfig: any = config.get('tiqwa');

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${tiqwaConfig.accessToken}`
}

export interface FlightSearch {
    adults: string
    cabin: string
    departure_date: string
    destination: string
    origin: string
    children?: number
    infants?: number,
    return_date?: string
}

export const searchForFlights = async (input: FlightSearch ) => {
    try {
        let params = `adults=${input.adults}&cabin=${input.cabin}&departure_date=${input.departure_date}&destination=${input.destination}&origin=${input.origin}`
        if(input.children && input.children > 0) {
            params += `&children=${input.children}`
        }
        if(input.infants && input.infants > 0) {
            params += `&infants=${input.infants}`
        }
        if(input.return_date && input.return_date !== '') {
            params += `&return_date=${input.return_date }`
        }
        const response = await axios.get(`${tiqwaConfig.baseUrl}/flight/search?${params}`, { headers })

        // console.log("TIQWA RESPONSE ===> ", response.data)

        const results = response.data.map((item: any)=>{
            return snakeToCamel(item)
        })
        
        return {
            error: false,
            data: results,
            errorType: '',
        }

    } catch (error: any) {
        console.error('---> ERROR BLOCK --->', error)  
        return {
            error: true,
            errorType: 'error',
            data: error.response
        } 
    }
}

export const confirmFlightPrice = async (flightId: string) => {
    try {
        const response = await axios.get(`${tiqwaConfig.baseUrl}/flight/confirm_price/${flightId}`, { headers })
        
        return {
            error: false,
            data: snakeToCamel(response.data),
            errorType: '',
        }

    } catch (error: any) {
        console.error('---> ERROR BLOCK --->', error.response.data)  
        throw new Error(error.response.data.message)

        // return {
        //     error: true,
        //     errorType: 'error',
        //     data: error.response.data
        // } 
    }
}

interface BookingInput {
    passengers: Array<Passenger>
}

interface PassengerForTiqwa {
    passenger_type: string
    first_name: string
    last_name: string
    dob: string,
    gender: string
    title: string
    email:string
    phone_number:string
    documents?: any
}

export const bookFlight = async (input: BookingInput, flightId: string) => {
    try {

        const requestPassengers = input.passengers.map((passenger) => {
            const passengerObject: PassengerForTiqwa= {
                passenger_type: passenger.passengerType,
                first_name: passenger.firstName,
                last_name: passenger.lastName,
                dob: passenger.dob,
                gender: passenger.gender,
                title: passenger.title,
                email: passenger.email,
                phone_number: passenger.phoneNumber
            }

            if (passenger.documents) {
                passengerObject.documents = {
                    number: passenger.documents.number,
                    issuing_date: passenger.documents.issuingDate,
                    expiry_date: passenger.documents.expiryDate,
                    issuing_country: passenger.documents.issuingCountry,
                    nationality_country: passenger.documents.nationalityCountry,
                    document_type: passenger.documents.documentType,
                    holder: passenger.documents.holder
                }
            }
            return passengerObject
        })

        const requestPayload = {
            passengers: requestPassengers
        }
        const response = await axios.post(`${tiqwaConfig.baseUrl}/flight/book/${flightId}`, requestPayload, { headers })

        console.log(response.data)
        
        return {
            error: false,
            data: snakeToCamel(response.data),
            errorType: '',
        }
    } catch (error: any) {
        console.error('---> ERROR BLOCK --->', error)  
        return {
            error: true,
            errorType: 'error',
            data: error.response.data
        } 
    }
}

export const issueTicket = async (reference: string) => {
    try {
        const response = await axios.post(`${tiqwaConfig.baseUrl}/flight/pay/${reference}`, {}, { headers })

        console.log(response.data)
        
        return {
            error: false,
            data: snakeToCamel(response.data),
            errorType: '',
        }
    } catch (error: any) {
        console.error('---> ERROR BLOCK --->', error)  
        return {
            error: true,
            errorType: 'error',
            data: error.response.data
        } 
    }
}

export const cancelBooking = async (reference: string) => {
    console.log('booking to be cancelled -> -> ', reference)
    try {
        const response = await axios.post(`${tiqwaConfig.baseUrl}/flight/${reference}`, {}, { headers })

        console.log(response.data)
        
        return {
            error: false,
            data: snakeToCamel(response.data),
            errorType: '',
        }
    } catch (error: any) {
        console.error('---> ERROR BLOCK --->', error)  
        return {
            error: true,
            errorType: 'error',
            data: error.response.data
        } 
    }
}

export const getWalletBalance = async () => {
    try {
        const response = await axios.get(`${tiqwaConfig.baseUrl}/wallet`, { headers })

        console.log(response.data)
        
        return {
            error: false,
            data: snakeToCamel(response.data.data),
            errorType: '',
        }
    } catch (error: any) {
        console.error('---> ERROR BLOCK --->', error)  
        return {
            error: true,
            errorType: 'error',
            data: error.response.data
        } 
    }
}