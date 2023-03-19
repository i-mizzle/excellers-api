import { Request, Response } from "express";
import  * as response from "../responses"
import { get } from 'lodash'
import { createNewsletterSubscription, findAndUpdateNewsletterSubscriptions, findNewsletterSubscription, findNewsletterSubscriptions } from "../service/newsletter-subscription.service";
import { sendSubscriptionConfirmation } from "../service/mailer.service";

export const createNewsletterSubscriptionHandler = async (req: Request, res: Response) => {
    try {
        const userId = get(req, 'user._id');
        const body = req.body

        const subscription = await createNewsletterSubscription({...body, ...{createdBy: userId}})
        await sendSubscriptionConfirmation({
            mailTo: body.email,
            firstName: body.name.split(' ')[0] || body.name
        })
        return response.created(res, subscription)
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getNewsletterSubscriptionsHandler = async (req: Request, res: Response) => {
    try {
        const queryObject: any = req.query;
        const resPerPage = +queryObject.perPage || 25; // results per page
        const page = +queryObject.page || 1; // Page 
        
        const newsletterSubscriptions = await findNewsletterSubscriptions({deleted: false}, resPerPage, page)

        const responseObject = {
            page,
            perPage: resPerPage,
            total: newsletterSubscriptions.total,
            subscriptions: newsletterSubscriptions.subscriptions
        }

        return response.ok(res, responseObject)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const getNewsletterSubscriptionHandler = async (req: Request, res: Response) => {
    try {
        const subscriptionId = get(req, 'params.subscriptionId');

        const subscription = await findNewsletterSubscription({_id: subscriptionId, deleted: false})

        if(!subscription) {
            return response.notFound(res, {message: 'subscription not found'})
        }

        return response.ok(res, subscription)
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const updateNewsletterSubscriptionHandler = async (req: Request, res: Response) => {
    try {
        const subscriptionId = get(req, 'params.subscriptionId');

        const update = req.body

        const subscription = await findNewsletterSubscription({_id: subscriptionId, deleted: false})
        if(!subscription) {
            return response.notFound(res, {message: 'subscription not found'})
        }

        await findAndUpdateNewsletterSubscriptions({_id: subscriptionId}, update, {new: true})

        return response.ok(res, {message: 'newsletter subscription updated successfully'})
        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const deleteNewsletterSubscriptionHandler = async (req: Request, res: Response) => {
    try {
        const subscriptionId = get(req, 'params.subscriptionId');

        const subscription = await findNewsletterSubscription({_id: subscriptionId, deleted: false})
        if(!subscription) {
            return response.notFound(res, {message: 'subscription not found'})
        }

        await findAndUpdateNewsletterSubscriptions({_id: subscriptionId}, {deleted: true}, {new: true})

        return response.ok(res, {message: 'subscription deleted successfully'})
        
        
    } catch (error:any) {
        return response.error(res, error)
    }
}