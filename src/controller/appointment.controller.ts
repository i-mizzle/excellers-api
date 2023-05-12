import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { createAppointment, findAndUpdateAppointment, findAppointment, findAppointments } from "../service/appointment.service";
import { TimeSlotDocument } from "../model/time-slot.model";
import { findTimeSlot } from "../service/time-slot.service";
import { checkIsConsecutive, generateCode, getJsDate } from "../utils/utils";
import { StringDate } from "../utils/types";
import { findAndUpdateEnquiry, findEnquiry } from "../service/enquiry.service";

const parseAppointmentFilters = (query: any) => {
    const { cancelled, title, enquiry, attendeeName, attendeeEmail, attendeePhone, minAppointmentDate, maxAppointmentDate, minDateCreated, maxDateCreated } = query; 

    const filters: any = {}; 

    if (cancelled) {
        filters.cancelled = cancelled
    } 
    
    if (title) {
        filters.title = title
    }

    if (enquiry) {
        filters.enquiry = enquiry
    }
    
    if (attendeeName) {
        // filters.attendee = attendeeName; 
        filters["attendee.name"] = { $elemMatch: { name: attendeeName } };; 
    }
    
    if (attendeeEmail) {
        // filters.email = email; 
        filters["attendee.email"] = { $elemMatch: { name: attendeeEmail } };; 
    }
    
    if (attendeePhone) {
        // filters.phone = phone; 
        filters["attendee.email"] = { $elemMatch: { name: attendeePhone } };; 
    }
        
    if (minAppointmentDate && !maxAppointmentDate) {
        console.log(getJsDate(minAppointmentDate))
        filters.appointmentDate = { $gte: (getJsDate(minAppointmentDate)) }; 
    }

    if (maxAppointmentDate && !minAppointmentDate) {
        console.log(getJsDate(maxAppointmentDate))

        filters.appointmentDate = { $lte: getJsDate(maxAppointmentDate) }; 
    }

    if (minAppointmentDate && maxAppointmentDate) {
        filters.date = { $gte: getJsDate(maxAppointmentDate), $lte: getJsDate(maxAppointmentDate) };
    }
        
    if (minDateCreated && !maxDateCreated) {
        filters.createdAt = { $gte: (getJsDate(minDateCreated)) }; 
    }

    if (maxDateCreated && !minDateCreated) {
        filters.createdAt = { $lte: getJsDate(maxDateCreated) }; 
    }

    if (minDateCreated && maxDateCreated) {
        filters.date = { $gte: getJsDate(minDateCreated), $lte: getJsDate(maxDateCreated) };
    }
  
    return filters

}

const bookedForAttendees = async (attendees: any, timeSlots: any, appointmentDate: StringDate) => {
    
    // check attendee emails if time-slot has already been booked for that attendee
    const attendeeEmails = attendees.map((attendee: any) => {
        return attendee.email
    })

    const allAppointments = await findAppointments({deleted:false, cancelled:false}, 0, 0, '')
    const attendeeBooked = (attendees: any) => {
        return attendees.filter((attendee: any) => {
            return attendeeEmails.includes(attendee.email)
        })
    }

    const bookedForAttendee = allAppointments?.appointments.filter((appointment) => {
        return (
            appointment.appointmentDate.toDateString() === (getJsDate(appointmentDate)).toDateString() && // if appointment is same day 
            appointment.timeSlots.filter((value: string) => timeSlots.includes(value.toString())).length > 0 && // Checking for an intersection in time-slots
            attendeeBooked(appointment.attendees)?.length > 0 // check if attendee is booked
        )
    })

    return bookedForAttendee
}

export const createAppointmentHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const timeSlots = await Promise.all(body.timeSlots.map(async (timeSlot: TimeSlotDocument["_id"]) => {
            const slot = await findTimeSlot({_id: timeSlot})
            return slot
        }))

        const isConsecutive = checkIsConsecutive(timeSlots, 'order')
        if(!isConsecutive) {
            return response.badRequest(res, {message: 'please use consecutive time-slots for your request'})
        }

        const bookingConflict = await bookedForAttendees(body.attendees, body.timeSlots, body.appointmentDate)

        if(bookingConflict && bookingConflict.length > 0) {
            return response.badRequest(res, {message: 'One or more of your attendees has a clash on this date'})
        }

        if(body.enquiry) {
            const enquiry = await findEnquiry({_id: body.enquiry, deleted: false})
            if(!enquiry) {
                return response.notFound(res, {message: 'the enquiry you are trying to create an appointment for was not found'})
            }

            body.attendees.push({
                name: enquiry.name,
                email: enquiry.email,
                phone: enquiry.phone
            })
        }

        // return response.ok(res, timeSlots)
        const appointmentCode = generateCode(16, false).toUpperCase()
        const appointment = await createAppointment({...body, ...{
            appointmentCode,
            createdBy: userId, 
            appointmentDate: getJsDate(body.appointmentDate)}})

        if(body.enquiry) {
            await findAndUpdateEnquiry({_id: body.enquiry}, {appointment: appointment._id}, {new: true})
        }

        return response.created(res, appointment)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getAppointmentsHandler = async (req: Request, res: Response) => {
    try { 
        const queryObject: any = req.query;
        const filters = parseAppointmentFilters(queryObject)
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const appointments = await findAppointments({...filters, ...{deleted: false}}, resPerPage, page, expand)
        // return res.send(post)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: appointments.total,
            appointments: appointments.appointments
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getAppointmentHandler = async (req: Request, res: Response) => {
    try {
        const appointmentCode = get(req, 'params.appointmentCode');
        const queryObject: any = req.query;
        let expand = queryObject.expand || null

        if(expand && expand.includes(',')) {
            expand = expand.split(',')
        }

        const appointment = await findAppointment({appointmentCode: appointmentCode, deleted: false}, expand)
        // return res.send(post)

        if(!appointment) {
            return response.notFound(res, {message: 'appointment not found'})
        }

        return response.ok(res, appointment)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateAppointmentHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const appointmentCode = get(req, 'params.appointmentCode');

        let update = req.body

        const appointment = await findAppointment({appointmentCode}, '')
        if(!appointment) {
            return response.notFound(res, {message: 'appointment not found'})
        }

        if(update.timeSlots && update.timeSlots.length > 0) {
            const timeSlots = await Promise.all(update.timeSlots.map(async (timeSlot: TimeSlotDocument["_id"]) => {
                const slot = await findTimeSlot({_id: timeSlot})
                return slot
            }))
    
            const isConsecutive = checkIsConsecutive(timeSlots, 'order')
            if(!isConsecutive) {
                return response.badRequest(res, {message: 'please use consecutive time-slots for your request'})
            }
        }

        if( update.appointmentDate) {
            update = {...update, ...{appointmentDate: getJsDate(update.date)}}
        }

        if(update.attendees?.length > 0 && update.timeSlots?.length > 0 && update.appointmentDate) {
            const bookingConflict = await bookedForAttendees(update.attendees, update.timeSlots, update.appointmentDate)
            if(bookingConflict && bookingConflict.length > 0) {
                return response.badRequest(res, {message: 'one or more of your attendees has a clash on this date'})
            }
        }

        await findAndUpdateAppointment({_id: appointment._id}, update, {new: true})

        return response.ok(res, {message: 'appointment updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const cancelAppointmentHandler = async (req: Request, res: Response) => {
    try {
        const appointmentCode = get(req, 'params.appointmentCode');

        const appointment = await findAppointment({appointmentCode}, '')
        if(!appointment) {
            return response.notFound(res, {message: 'appointment not found'})
        }

        await findAndUpdateAppointment({_id: appointment._id}, {cancelled: true}, {new: true})

        return response.ok(res, {message: 'appointment cancelled successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}