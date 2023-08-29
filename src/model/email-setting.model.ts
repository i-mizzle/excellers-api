import mongoose from "mongoose";

export interface EmailSettingDocument extends mongoose.Document {
    name: string;
    slug: string;
    mailSubject: string;
    logoUrl: string;
    topBannerUrl: string;
    emailAction: {
        showActionButton: boolean
        buttonUrl: string,
        buttonLabel: string
    };
    socialMedia: {
        showSocialLinks: boolean
        links: {
            title: string
            url: string
        }[]
    }
    allowedVariables: string[]
    mailBody: string
    deleted: boolean
    createdAt?: Date;
    updatedAt?: Date;
}

const EmailSettingSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true
    },
    slug: { 
        type: String, 
        required: true,
        unique: true
    },
    logoUrl: {
        type: String
    },
    topBannerUrl: {
        type: String
    },
    emailAction: {
        showActionButton: {
            type: Boolean
        },
        buttonUrl: {
            type: String
        },
        buttonLabel: {
            type: String
        }
    },
    socialMedia: {
        showSocialLinks: {
            type: Boolean,
            default: false
        },
        links: [
            {
                title: {
                    type: String,
                    enum: ['facebook', 'twitter', 'instagram', 'tiktok', 'pinterest', 'linkedin', 'youtube']
                },
                url: {
                    type: String
                }
            }
        ]
    },
    allowedVariables: [
        {
            type: String
        }
    ],
    mailSubject: {
        type: String
    },
    mailBody: {
        type: String
    },
    deleted: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);

const EmailSetting = mongoose.model<EmailSettingDocument>("EmailSetting", EmailSettingSchema);

export default EmailSetting;