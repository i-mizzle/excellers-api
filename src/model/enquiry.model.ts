import mongoose from "mongoose";
import { UserDocument } from "./user.model";
import { AppointmentDocument } from "./appointment.model";

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
    deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Enquiry = mongoose.model<EnquiryDocument>("Enquiry", EnquirySchema);

export default Enquiry;