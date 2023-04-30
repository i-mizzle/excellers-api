import mongoose from 'mongoose';
import { EnquiryDocument } from './enquiry.model';
import { TimeSlotDocument } from './time-slot.model';
import { UserDocument } from './user.model';

export interface AppointmentDocument extends mongoose.Document {
    appointmentCode: string;
    title: string;
    description: string;
    enquiry?: EnquiryDocument["_id"];
    timeSlots: TimeSlotDocument["_id"][]
    appointmentDate: Date;
    attendees: {
        name: string
        email: string
        phone: string
    }[]
    scheduledBy: UserDocument["_id"]
    location: {
        locationType: string,
        location: string
    }
    cancelled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema = new mongoose.Schema(
    {
        appointmentCode: {
            type: String,
            required: true,
            immutable: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        enquiry: {
            type:  mongoose.Schema.Types.ObjectId, 
            ref: 'Enquiry',
        },
        appointmentDate:{
            type: Date,
            required: true
        },
        timeSlots: [
            {
                type:  mongoose.Schema.Types.ObjectId, 
                ref: 'TimeSlot',
            }
        ],
        attendees: [
            {
                name: {
                    type: String,
                    required: true
                },
                email: {
                    type: String,
                    required: true
                },
                phone: {
                    type: String,
                    required: true
                },
            }
        ],
        scheduledBy: {
            type:  mongoose.Schema.Types.ObjectId, 
            ref: 'User',
        },
        location: {
            locationType: {
                type: String,
                enum: ['ONLINE', 'PHYSICAL'],
                default: 'ONLINE'
            },
            location: {
                type: String,
                required: true
            }
       },
       cancelled: {
            type: Boolean,
            default: false
       },
       deleted: {
            type: Boolean,
            default: false
       }
    },
    { timestamps: true }
);

const Appointment = mongoose.model<AppointmentDocument>('Appointment', AppointmentSchema);

export default Appointment;