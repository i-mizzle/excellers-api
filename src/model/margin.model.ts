import mongoose from "mongoose";

export interface MarginDocument extends mongoose.Document {
  name: string;
  slug: string;
  marginType: string;
  flightType: string;
  value: number
  createdAt: Date;
  updatedAt: Date;
}

const MarginSchema = new mongoose.Schema(
    {
        createdBy: { 
            type:  mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        }, 
        name: { 
            type: String, 
            required: true 
        },
        slug: { 
            type: String, 
            required: true,
            unique: true,
            immutable: true
        },
        marginType: { 
            type: String, 
            enum: ['PERCENTAGE', 'FLAT'],
            required: true
        }, 
        flightType: { 
            type: String, 
            enum: ['INTERNATIONAL', 'LOCAL'],
            required: true
        }, 
        value: { 
            type: Number,
            required: true 
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    { 
        timestamps: true 
    }
);

const Margin = mongoose.model<MarginDocument>("Margin", MarginSchema);

export default Margin;