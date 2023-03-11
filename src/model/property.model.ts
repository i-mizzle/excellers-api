import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface PropertyDocument extends mongoose.Document {
  createdBy: UserDocument["_id"];
  name: string;
  propertyCode?: string;
  description: string;
  geolocation: {
    latitude: string,
    longitude: string
  },
  buildingType: string
  layout: string
  floors: string
  media?: {
    itemType: string,
    itemUrl: string,
  }[];
  features: {
    name: string,
    description: string,
    quantity: number,
  }[];
  // reviews?: {
  //   user: UserDocument["_id"],
  //   rating: number,
  //   review: string,
  // }[];
  value: number
  valuationBy: String
  creatorRoleOnProperty: string
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new mongoose.Schema(
  {
    name: { 
      type: String,
      required: true
    },
    propertyCode: {
      type: String,
      required: true
    },
    description: { 
      type: String,
      required: true
    },
    geolocation: {
      latitude: { 
        type: String,
      },
      longitude: { 
        type: String,
      },
    },
    googleGeocodingResponse: {},
    type: { 
      type: String,
      enum: ['RESIDENTIAL','COMMERCIAL', 'INDUSTRIAL'],
      default: 'RESIDENTIAL'
    },
    buildingType: { 
      type: String,
      enum: ['APARTMENT','BUNGALOW', 'DUPLEX', 'PENTHOUSE', 'TERRACE'],
      default: 'BUNGALOW'
    },
    layout: { 
      type: String,
      enum: ['DETACHED','SEMI_DETACHED'],
      default: 'DETACHED'
    },
    floors: {
      type: Number,
      default: 1
    },
    media: [ 
      {
        itemType: {
          type: String,
          enum: ['IMAGE', 'VIDEO', 'DOCUMENT'],
          default: 'IMAGE'
        },
        itemUrl: {
          type: String
        }
      }
    ],
    features: [ 
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String
        },
        quantity: {
          type: Number,
          required: true
        } 
      }
    ],
    rating: {
      type: Number,
      required: true,
      default: 5
    },
    // reviews: [
    //   {
    //     user: {
    //       type: mongoose.Schema.Types.ObjectId, ref: 'User'
    //     },
    //     rating: {
    //       type: Number,
    //       required: true
    //     },
    //     review: {
    //       type: String,
    //       required: true
    //     },
    //   },
    // ],
    value: {
      type: Number
    },
    valuationBy: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Agent'
    },
    creatorRoleOnProperty: { 
      type: String,
      enum: ['PROPERTY_OWNER','PROPERTY_AGENT'],
      default: 'AGENT'
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Property = mongoose.model<PropertyDocument>("Property", PropertySchema);

export default Property;