import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { calculateMetrics, getTransactionSummary, getTransactionsByChannel } from "../service/stats.service";
import { findMultipleStoreData } from "../service/store-data.service";

export const statsHandler = async (req: Request, res: Response) => {
    try {
        const orders = await findMultipleStoreData({documentType: 'order'})
        const transactions = await findMultipleStoreData({documentType: 'transaction'})
        const transactionsSummary = getTransactionSummary(transactions)
        const transactionsByChannel = getTransactionsByChannel(transactions)
        const metrics = calculateMetrics(orders)

        return response.ok(res, {metrics, transactionsSummary, transactionsByChannel, }) 
    } catch (error: any) {
        return response.error(res, error)
    }
}