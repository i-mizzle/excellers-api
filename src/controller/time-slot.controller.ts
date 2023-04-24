import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { createTimeSlot, findAndUpdateTimeSlot, findTimeSlot, findTimeSlots } from "../service/time-slot.service";

export async function createTimeSlotsHandler (req: Request, res: Response) {
    const body = req.body
    const createdTimeSlots: any = []

    await Promise.all( body.timeSlots.map(async (timeSlot: any) => {
        const created = await createTimeSlot(timeSlot)
        createdTimeSlots.push(created)
        return created
    }))

    // return res.send(post)
    return response.created(res, createdTimeSlots)
}

export async function updateTimeSlotHandler (req: Request, res: Response) {
    const timeSlotId = get(req, 'params.timeSlotId');
    const update = req.body;

    const post = await findTimeSlot({ _id: timeSlotId });
    if (!post) {
        return response.notFound(res, { message: `time-slot not found` })
    }

    const updatedTimeSlot = await findAndUpdateTimeSlot({ _id: timeSlotId }, update, { new: true })
    return response.ok(res, updatedTimeSlot)
}

export async function getTimeSlotsHandler(req: Request, res: Response) {
    const user = get(req, 'user');

    let timeSlotsQuery: any = {active: true}

    if(user && ( user['userType'] === 'ADMIN' || user['userType'] === 'SUPER_ADMINISTRATOR') ) {
        timeSlotsQuery = {}
    }

    const timeSlots = await findTimeSlots(timeSlotsQuery)
    // return res.send(timeSlots.sort((a, b) => (a.order > b.order) ? 1: -1)

    return response.ok(res, timeSlots.sort((a: any, b: any) => (a.order > b.order) ? 1: -1))
}