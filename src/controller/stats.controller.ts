import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { calculateMetrics, getTransactionSummary, getTransactionsByChannel, listLowStockVariants } from "../service/stats.service";
import { findMultipleStoreData } from "../service/store-data.service";
import { findOrders } from "../service/order.service";
import { findTransactions } from "../service/transaction.service";
import { findItems } from "../service/item.service";

export const statsHandler = async (req: Request, res: Response) => {
    try {
        const storeId = req.params.storeId
        const orders = await findOrders({store: storeId}, 0, 0, '')
        const transactions = await findTransactions({store: storeId}, 0, 0, '')
        const inventory = await findItems({store: storeId}, 0, 0, '')
        const transactionsSummary = getTransactionSummary(transactions.data)
        const transactionsByChannel = getTransactionsByChannel(transactions.data)
        const metrics = calculateMetrics(orders.orders)
        const lowStockVariants = listLowStockVariants(inventory.items)

        return response.ok(res, {metrics: {...metrics, ...{lowStock: lowStockVariants}}, transactionsSummary, transactionsByChannel, }) 
    } catch (error: any) {
        return response.error(res, error)
    }
}