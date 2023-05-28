import mongoose from "mongoose";
import { ConfirmationCodeDocument } from "./confirmation-code.model";
import { TripDocument } from "./trip.model";
import { UserDocument } from "./user.model";

export interface PackageDocument extends mongoose.Document {
    createdBy: UserDocument['_id'];
    name: string
    description: string
    packageType: string
    inclusions: string[]
    month: string
    activities: {
      imageUrl: string
      title: string
      description: string
    }[]
    itinerary: {
      title: string
      description: string
    }[]
    destination: {
      country: string
      city: string
    }
    fulfilledBy: string
    price?: number | null
    pricing: {
      pricePerUnit: number,
      numberPerUnit: number,
    }
    media: {
      type: string
      url: string
    }[]
    lockDownPrice?: number | null
    lockDownPricePerUnit: number
    deleted: Boolean
    active: Boolean
    createdAt?: Date;
    updatedAt?: Date;
}

const PackageSchema = new mongoose.Schema(
  {
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    name: {
        type: String,
        required: true
    },
    fulfilledBy: {
      type: String,
      required: true
    },
    month: {
      type: String,
      required: true
    },
    destination: {
      country: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
    },
    description: {
      type: String,
      required: true
    },
    packageType: {
      type: String,
      required: true,
      enum: ['PRIVATE', 'GROUP'],
      default: 'GROUP'
    },
    inclusions: [
      {type: String}
    ],
    itinerary: [
      {
        title: {
          type: String
        }, 
        description: {
          type: String
        }
      }
    ],
    activities: [
      {
        imageUrl: {
          type: String
        }, 
        title: {
          type: String
        }, 
        description: {
          type: String
        }
      }
    ],
    media: [
      {
        type: {
          type: String,
          enum: ['VIDEO', 'IMAGE', 'DOCUMENT'],
          default: 'IMAGE'
        },
        url: {
          type: String
        }
      }
    ],
    // price: {
    //   type: Number,
    //   required: true
    // },
    lockDownPricePerUnit: {
      type: Number,
      required: true
    },
    pricing: {
      pricePerUnit: {
        type: Number,
        required: true
      },
      numberPerUnit: {
        type: Number,
        required: true
      },
    },
    deleted: {
      type: Boolean,
      default: false
    },
    active: {
        type: Boolean,
        default: true
    },
  },
  { timestamps: true }
);

const Package = mongoose.model<PackageDocument>("Package", PackageSchema);

export default Package;