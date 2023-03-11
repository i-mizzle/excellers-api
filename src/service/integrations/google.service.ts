import axios from "axios"
import config from 'config';

interface PlacesRequest {
    longitude: String
    latitude: String
    radius: number
}

export const fetchPlaces = async (input: PlacesRequest) => {
    try {
        const headers = {
            "Content-Type": "application/json"
        }
        
        const response = await axios.post(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${input.latitude},${input.longitude}&radius=${input.radius}&key=${config.get('googleApiKey')}`, { headers }) 
        
        return response.data.result
        
    } catch (error: any) {
        console.error(error)
    }
}  

export const fetchPlaceDetails = async (placeId: String) => {
    try {
        const headers = {
            "Content-Type": "application/json"
        }
        
        const response = await axios.post(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${config.get('googleApiKey')}`, { headers }) 
        console.log('places response....', response.data.result)

        return response.data.result
        
    } catch (error: any) {
        console.error(error)
    }
}  

interface GeolocationRequest {
    address: string
}

export const geoLocate = async (input: GeolocationRequest) => {
    try {
        const headers = {
            "Content-Type": "application/json"
        }
        
        const response = await axios.post(`https://maps.googleapis.com/maps/api/geocode/json?address=${input.address}&key=${config.get('googleApiKey')}`, { headers }) 
        
        return response.data
        
    } catch (error: any) {
        console.error(error)
    }
}  