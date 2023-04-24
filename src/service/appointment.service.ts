import { DocumentDefinition, FilterQuery, QueryOptions, UpdateQuery } from "mongoose"
import Appointment, { AppointmentDocument } from "../model/appointment.model"
import TimeSlot from "../model/time-slot.model"

export async function createAppointment (input: DocumentDefinition<AppointmentDocument>) {
    return Appointment.create(input)
}

export async function findAppointments(
    query: FilterQuery<AppointmentDocument>,
    perPage: number,
    page: number,
    expand: string,
    options: QueryOptions = { lean: true }
) {
    const total = await Appointment.find(query, {}, options).countDocuments()
    let appointments = null
    if(perPage===0&&page===0){
        appointments = await Appointment.find(query, {}, options).populate(expand)
    } else {
        appointments = await Appointment.find(query, {}, options).populate(expand)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        appointments
    }
}

export async function findAppointment(
    query: FilterQuery<AppointmentDocument>,
    options: QueryOptions = { lean: true }
) {
    return Appointment.findOne(query, {}, options)
}

export async function findAndUpdateAppointment(
    query: FilterQuery<AppointmentDocument>,
    update: UpdateQuery<AppointmentDocument>,
    options: QueryOptions
) {
    return Appointment.findOneAndUpdate(query, update, options)
}