import { object, string, ref, number } from "yup";

export const searchFlightSchema = object({
    body: object({
        adults: number().required('number of adults is required'),
        children: number().required('number of children is required'),
        infants: number().required('number of infants is required'),
        cabin: string().required('cabin is required'),
        departureDate: string().required('departureDate is required'),      
        destination: string().required('destination airport code is required'),      
        origin: string().required('origin airport code is required'),      
    })
});

export const params = {
    params: object({
        flightId: string().required('id is required as a path param')
    })
}

export const priceConfirmationSchema = object({
    ...params
})
    