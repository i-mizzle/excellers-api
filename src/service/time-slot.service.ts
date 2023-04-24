import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import TimeSlot, { TimeSlotDocument } from '../model/time-slot.model';

export async function createTimeSlot (input: DocumentDefinition<TimeSlotDocument>) {
    return TimeSlot.create(input)
}

export async function findTimeSlots(query: FilterQuery<TimeSlotDocument>) {
    return TimeSlot.find(query).lean();
}

export async function findTimeSlot(
    query: FilterQuery<TimeSlotDocument>,
    options: QueryOptions = { lean: true }
) {
    return TimeSlot.findOne(query, {}, options)
}

export async function findAndUpdateTimeSlot(
    query: FilterQuery<TimeSlotDocument>,
    update: UpdateQuery<TimeSlotDocument>,
    options: QueryOptions
) {
    return TimeSlot.findOneAndUpdate(query, update, options)
}
