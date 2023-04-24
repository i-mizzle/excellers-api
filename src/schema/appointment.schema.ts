import { object, string, array } from "yup";
import { foundDuplicateStrings, getJsDate } from "../utils/utils";

const payload = {
    body: object({
        title: string().required('title is required'),
        description: string().max(120, 'description is too long - should be 120 chars max.'),
        enquiry: string(),
        appointmentDate: string().required('appointment date is required in the format DD-MM-YYYY').test("validate-date", "appointment date must not be in the past", function(value: any): boolean {
            const jsDate = getJsDate(value)
            if(jsDate < new Date()) {
                return false
            } else {
                return true
            }
        }),
        location: object({ 
            locationType: string().required('location type (location.locationType) is required as one of ONLINE or PHYSICAL'),
            location: string().required('location (location.location) is required')
        }),
        attendees: array(object({
            name: string().required('name is required'),
            email: string().required('email is required'),
            phone: string().required('phone is required'),
        })).required('please provide an array of attendees'),
        timeSlots: array(string().required('please provide at least one time-slot for this appointment')).required('time-slots (timeSlots) is required as an array').test("validate-duplicate-slots", "Your timeSlots array contains duplicates", function(value: any): boolean {
            const duplicatesFound = foundDuplicateStrings(value)
            if(duplicatesFound) {
                return true
            } else {
                return false
            }
        })
    })
}

const params = {
    params: object({
        appointmentCode: string().required('appointmentCode  id is required as a path param')
    })
}

export const createAppointmentSchema = object({
   ...payload
});

export const getAppointmentSchema = object({
    ...params
})
