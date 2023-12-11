import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { calculateMetrics, getTransactionSummary, getTransactionsByChannel, listLowStockVariants } from "../service/stats.service";
import { findMultipleStoreData } from "../service/store-data.service";

export const statsHandler = async (req: Request, res: Response) => {
    try {
        const storeId = req.params.storeId
        const orders = await findMultipleStoreData({documentType: 'order', store: storeId})
        const transactions = await findMultipleStoreData({documentType: 'payment', store: storeId})
        const inventory = await findMultipleStoreData({documentType: 'item', store: storeId})
        const transactionsSummary = getTransactionSummary(transactions.data)
        const transactionsByChannel = getTransactionsByChannel(transactions.data)
        const metrics = calculateMetrics(orders.data)
        const lowStockVariants = listLowStockVariants(inventory.data)

        return response.ok(res, {metrics: {...metrics, ...{lowStock: lowStockVariants}}, transactionsSummary, transactionsByChannel, }) 
    } catch (error: any) {
        return response.error(res, error)
    }
}