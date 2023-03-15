import { array } from "yup";
import { object, string, ref, number } from "yup";

const payload = {
    body: object({   
        passengers: array( object({
            passengerType: string().required('passengerType is required'),
            firstName: string().required('firstName is required'),
            lastName: string().required('lastName is required'),
            dob: string().required('dob is required'),
            gender: string().required('gender is required'),
            title: string().required('title is required'),
            email: string().required('email is required'),
            phoneNumber: string().required('phoneNumber is required'),
        })).required('an array of passengers is required'),
    })
};

const params = {
    params: object({
        bookingCode: string().required('id is required')
    })
}

const newBookingParam = {
    params: object({
        flightId: string().required('id is required')
    })
}

export const bookingSchema = object({
    ...newBookingParam,
    ...payload
})

export const getBookingSchema = object({
    ...params
})

    