import mongoose from "mongoose";

export interface PackageRequestDocument extends mongoose.Document {
    name: string
    email: string
    phone: string
    description: string
    packageType: string
    inclusions: string[]
    itinerary: {
      title: string
      description: string
    }[]
    budget: number
    travelDate?: Date
    returnDate?: Date
    media: {
      type: string
      url: string
    }[]
    createdAt?: Date;
    updatedAt?: Date;
}

const PackageRequestSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true
    },
    requestedBy: {
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
    travelDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
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
    budget: {
      type: Number,
      required: true
    },
    deleted: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

const PackageRequest = mongoose.model<PackageRequestDocument>("PackageRequest", PackageRequestSchema);

export default PackageRequest;