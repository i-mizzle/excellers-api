import { object, string, ref, number, array } from "yup";

const payload = {
    body: object({
        timeSlots: array(object({
            label: string().required('time-slot label is required'),
            order: number().required('time-slot order is required'),
        })).required('time-slots (timeSlots) is required as an array')
    })
}

const params = {
    params: object({
        timeSlotId: string().required('timeSlotId is required as a path param')
    })
}

export const createTimeSlotSchema = object({
   ...payload
});

export const getTimeSlotSchema = object({
    ...params,
})