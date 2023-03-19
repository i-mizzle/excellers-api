import { v4 as uuidv4 } from 'uuid';
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import NewsletterSubscription, { NewsletterSubscriptionDocument } from '../model/newsletter-subscription.model';

export const createNewsletterSubscription = async (
    input: NewsletterSubscriptionDocument) => {
    try {
        const subscription = await NewsletterSubscription.create(input)

        return subscription
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function findNewsletterSubscription(
    query: FilterQuery<NewsletterSubscriptionDocument>,
    options: QueryOptions = { lean: true }
) {
    try {
        const subscription = await NewsletterSubscription.findOne(query, {}, options)
        
        return subscription
    } catch (error: any) {
        throw new Error(error)

    }
}

export async function findNewsletterSubscriptions(
    query: FilterQuery<NewsletterSubscriptionDocument>,
    perPage: number,
    page: number,
    options: QueryOptions = { lean: true }
) {
    const total = await NewsletterSubscription.find(query, {}, options).countDocuments()
    let subscriptions = null
    if(perPage===0&&page===0){
        subscriptions = await NewsletterSubscription.find(query, {}, options)
    } else {
        subscriptions = await NewsletterSubscription.find(query, {}, options)
            .sort({ 'createdAt' : -1 })
            .skip((perPage * page) - perPage)
            .limit(perPage);
    }

    return {
        total,
        subscriptions
    }
}


export async function findAndUpdateNewsletterSubscriptions(
    query: FilterQuery<NewsletterSubscriptionDocument>,
    update: UpdateQuery<NewsletterSubscriptionDocument>,
    options: QueryOptions
) {

    try {
        return NewsletterSubscription.findOneAndUpdate(query, update, options)
    } catch (error: any) {
        return {
            error: true,
            errorType: 'error',
            data: JSON.parse(error.error).message
        } 
    }
}