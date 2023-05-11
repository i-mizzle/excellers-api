import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import { AppointmentDocument } from "./appointment.model";
import { InvoiceDocument } from "./invoice.model";

export interface EnquiryDocument extends mongoose.Document {
  name: string
  email: string
  phone: string
  enquiryType: string
  status: string
  nationality?: string
  companyName?: string
  officeAddress?: string
  designation?: string
  visaEnquiryCountry?: string
  passportAvailable: boolean
  appointment: AppointmentDocument["_id"]
  maritalStatus: string
  deleted: boolean
  message: string;
  invoice: InvoiceDocument["_id"]
  paymentStatus: string
  notes: {
    noteBy: UserDocument["_id"],
    note: string
    createdDate: Date
  }[],
  createdAt?: Date;
  updatedAt?: Date;
}

const EnquirySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
    }, 
    email: { 
      type: String, 
    }, 
    phone: { 
      type: String, 
    }, 
    enquiryType: {
      type: String,
      enum: ['PACKAGE', 'DEAL', 'GENERAL', 'VISA', 'CORPORATE'],
      default: 'GENERAL'
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
      default: 'PENDING'
    },
    companyName: {
      type: String
    },
    officeAddress: {
      type: String
    },
    designation: {
      type: String
    },
    nationality: {
      type: String
    },
    visaEnquiryCountry: {
      type: String
    },
    passportAvailable: {
      type: Boolean,
      default: false
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    maritalStatus: {
      type: String,
      enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER'],
      default: 'SINGLE'
    },
    dateOfBirth: {
      type: Date
    },
    travelHistory: {
      type: Boolean
    },
    message: { 
      type: String, 
      required: true 
    },
    invoice:  {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    },
    paymentStatus: {
      type: String
    },
    notes: [
      {
          note: { 
              type: String 
          },
          noteBy: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          createdDate: {
              type: Date
          }
      }
  ],
    deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Enquiry = mongoose.model<EnquiryDocument>("Enquiry", EnquirySchema);

export default Enquiry;