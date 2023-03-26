import { DocumentDefinition, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import Transaction, { TransactionDocument } from '../model/transaction.model';

import { findUser } from './user.service';
import mongoose from "mongoose";

import { generateCode } from '../utils/utils';

// import { CustomerValidationObject, validateCustomer } from './biller-providers/irecharge.service';

export const transactionsWithUsers = async (transactions: any ) => {
    const mutatedTransactions: any = await Promise.all(transactions.map(async (transaction: any) => {
        if(transaction.user) {
            const user = await findUser({_id: transaction.user})
            // TO DO, REMOVE SENSITIVE USER DATTA

            transaction.user = {
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
                userCode: user?.userCode
            }
        }
        return transaction
    }))

    return mutatedTransactions
}


export async function createTransaction (input: DocumentDefinition<TransactionDocument>) {
    try {
        const ref = generateCode(16, true)
        return Transaction.create({...input, ...{transactionReference: ref}})
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function findTransaction(
    query: FilterQuery<TransactionDocument>,
    options: QueryOptions = { lean: true }
) {
    const transaction = Transaction.findOne(query, {}, options)
    const transactionWithUser = await transactionsWithUsers([transaction])
    return transactionWithUser[0]
}

export async function findAllTransactions(
    perPage: number,
    page: number,
    options: QueryOptions = { lean: true }
) {
    const total = await Transaction.find().countDocuments()
    const transactions = await Transaction.find({}, {}, options)
        .sort({ 'createdAt' : -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage)

    return {
        total,
        data: await transactionsWithUsers(transactions)
    }
}

export async function findTransactions(
    query: FilterQuery<TransactionDocument>,
    perPage: number,
    page: number,
    options: QueryOptions = { lean: true }
) {
    const total = await Transaction.find(query, {}, options).countDocuments()
    const transactions = await Transaction.find(query, {}, options)
        .sort({ 'createdAt' : -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage);

    // const mutatedTransactions = await Promise.all(transactions.map(async (transaction) => {
    //     if(transaction.paymentFor && transaction.paymentFor === 'SUBSCRIPTION') {
    //         const plan = await findSubscriptionPlan({_id: mongoose.Types.ObjectId(transaction.paymentItem)})
    //         const planDetails = {
    //             _id: plan!._id,
    //             name: plan!.name,
    //             duration: plan!.duration,
    //         }
    //         transaction.paymentItem = planDetails
    //     }
    //     if(transaction.paymentFor && transaction.paymentFor === 'TICKET') {
    //         const eventItem = await findEvent({_id: mongoose.Types.ObjectId(transaction.paymentItem)})
    //         const eventDetails = {
    //             _id: eventItem!._id,
    //             name: eventItem!.name,
    //             date: eventItem!.eventDate,
    //         }
    //         transaction.paymentItem = eventDetails
    //     }
    //     // biller.category = category!.categoryName || ""
    //     return transaction
    // }))

    return {
        total,
        data: transactions
    }
}

export async function findAndUpdateTransaction(
    query: FilterQuery<TransactionDocument>,
    update: UpdateQuery<TransactionDocument>,
    options: QueryOptions
) {
    return Transaction.findOneAndUpdate(query, update, options)
}

export async function deleteTransaction(
    query: FilterQuery<TransactionDocument>
) {
    return Transaction.deleteOne(query)
}
