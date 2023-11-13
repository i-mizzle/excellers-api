import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { calculateMetrics, getTransactionSummary, getTransactionsByChannel, listLowStockVariants } from "../service/stats.service";
import { findMultipleStoreData } from "../service/store-data.service";

export const statsHandler = async (req: Request, res: Response) => {
    try {
        const orders = await findMultipleStoreData({documentType: 'order'})
        const transactions = await findMultipleStoreData({documentType: 'transaction'})
        const inventory = await findMultipleStoreData({documentType: 'item'})
        const transactionsSummary = getTransactionSummary(transactions)
        const transactionsByChannel = getTransactionsByChannel(transactions)
        const metrics = calculateMetrics(orders)
        const lowStockVariants = listLowStockVariants(inventory)

        return response.ok(res, {metrics: {...metrics, ...{lowStock: lowStockVariants}}, transactionsSummary, transactionsByChannel, }) 
    } catch (error: any) {
        return response.error(res, error)
    }
}