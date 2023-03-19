import mongoose from "mongoose";
import { NewsletterSubscriptionsEnum } from "../utils/enums";

export interface NewsletterSubscriptionDocument extends mongoose.Document {
    name: string
    email: string
    deleted: Boolean
    subscriptions: NewsletterSubscriptionsEnum[]
    createdAt?: Date;
    updatedAt?: Date;
}

const NewsletterSubscriptionSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true
    },
    email:{
        type: String, 
        required: true,
        unique: true
    },
    subscriptions: [{
        type:String,
        enum: NewsletterSubscriptionsEnum
    }],
    deleted: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);

const NewsletterSubscription = mongoose.model<NewsletterSubscriptionDocument>("NewsletterSubscription", NewsletterSubscriptionSchema);

export default NewsletterSubscription;