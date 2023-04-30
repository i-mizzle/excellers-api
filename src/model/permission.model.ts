import mongoose from "mongoose";

export interface PermissionDocument extends mongoose.Document {
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new mongoose.Schema(
    {
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
        description: { 
            type: String, 
            required: true 
        },
    },
    { 
        timestamps: true 
    }
);

const Permission = mongoose.model<PermissionDocument>("Post", PermissionSchema);

export default Permission;