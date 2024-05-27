import { 
    Express,
    Request,
    Response 
} from 'express';
import { deleteDataItemHandler, exportDataToCsvHandler, pullDataHandler, pullSingleDataItemHandler, pushDataHandler, transformCategoriesHandler, transformSaleItemsHandler, transformStoreItemsHandler, updateDataItemHandler } from './controller/store-data.controller';
import { requiresUser, validateRequest } from './middleware';
import requiresAdministrator from './middleware/requiresAdministrator';
import { changePasswordSchema, createUserSchema, createUserSessionSchema, getUserDetailsSchema } from './schema/user.schema';
import { adminUpdateUserHandler, bulkImportUsers, bulkResetPasswords, changePasswordHandler, createUserHandler, deleteUserHandler, getAllUsersHandler, getUserDetailsHandler, getUserProfileHandler, resetUserPassword, updateUserHandler } from './controller/user.controller';
import { createStoreSchema, getStoreSchema } from './schema/store.schema';
import { createStoreHandler, getStoreDetailsHandler, getStoresHandler } from './controller/store.controller';
import { createUserSessionHandler, invalidateUserSessionHandler } from './controller/session.controller';
import requiresPermissions from './middleware/requiresPermissions';
import { rejectForbiddenUserFields } from './middleware/rejectForbiddenUserFields';
import { statsHandler } from './controller/stats.controller';
import { createUpdateStoreSettingHandler, findStoreSettingHandler } from './controller/store-setting.controller';
import { upload } from './service/integrations/cloudinary.service';
import { newFileHandler, newFilesHandler } from './controller/file.controller';
import { createItemHandler, deleteItemHandler, getItemHandler, getItemsHandler } from './controller/item.controller';
import { updateItemHandler } from './controller/item-variant.controller';
import { createCategoryHandler, deleteCategoryHandler, getCategoriesHandler } from './controller/category.controller';
import { createItemSchema } from './schema/item.schema';
import { createMenuHandler, deleteMenuHandler, getEcommerceMenuHandler, getMenuHandler, getMenusHandler, updateMenuHandler } from './controller/menu.controller';
import { createMenuSchema } from './schema/menu.schema';
import { getItemStockHistoryHandler, updateItemInventoryHandler } from './controller/inventory.controller';
import { createOrderSchema } from './schema/order.schema';
import { addToOrderHandler, createOrderHandler, deleteOrderHandler, getOrderHandler, getOrdersByStoreHandler, getOrdersHandler, removeFromOrderHandler, updateOrderHandler } from './controller/order.controller';
import { createTransactionHandler, exportTransactionsToCsvHandler, getAllTransactionsHandler } from './controller/transaction.controller';
import { receivePaymentHandler } from './controller/payments.controller';


export default function(app: Express) {
    app.get('/ping', (req: Request, res: Response) => res.sendStatus(200))
    
    // app.post('/store-data/push-sanitize', 
    //     // requiresUser,
    //     // requiresAdministrator,
    //     pushSanitizeDataHandler
    // )

    // app.post('/users/bulk-create', bulkImportUsers)
    // app.post('/users/reset-all-passwords', bulkResetPasswords)
    
    // app.get('/store-data/update-store-ids', 
    //     // requiresUser,
    //     // requiresAdministrator,
    //     updateStoreIdsHandler
    // )

    app.post('/reset-password/:user', 
        requiresUser,
        requiresAdministrator,
        resetUserPassword
    )

    app.post('/store-data/push', 
        requiresUser,
        requiresAdministrator,
        pushDataHandler
    )

    app.get('/store-data/pull/:storeId/:documentType', 
        requiresUser,
        requiresAdministrator,
        pullDataHandler
    )

    app.get('/store-data/pull/:storeId/:documentType/:itemId', 
        requiresUser,
        requiresAdministrator,
        pullSingleDataItemHandler
    )

    app.delete('/store-data/delete/:storeId/:itemId', 
        requiresUser,
        requiresAdministrator,
        deleteDataItemHandler
    )

    app.put('/store-data/update/:storeId/:itemId', 
        requiresUser,
        requiresAdministrator,
        updateDataItemHandler
    )

    app.put('/store-data/update/multiple/:storeId/:itemId', 
        requiresUser,
        requiresAdministrator,
        updateDataItemHandler
    )

    app.get('/store-data/export/csv/:storeId/:documentType', 
        requiresUser,
        requiresAdministrator,
        exportDataToCsvHandler
    )

    app.post('/auth/create-user', 
        // checkUserType,
        validateRequest(createUserSchema), 
        createUserHandler
    )

    app.post('/store', 
        // requiresUser,
        // requiresAdministrator,
        validateRequest(createStoreSchema), 
        createStoreHandler
    )

    app.get('/stores', 
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_store']),
        getStoresHandler
    )

    app.get('/store/:storeId', 
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_store']),
        validateRequest(getStoreSchema), 
        getStoreDetailsHandler
    )

    app.post('/settings', 
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_store']),
        createUpdateStoreSettingHandler
    )

    app.get('/settings/:storeId', 
        requiresUser,
        requiresAdministrator,
        // requiresPermissions(['can_manage_store']),
        validateRequest(getStoreSchema), 
        findStoreSettingHandler
    )

    // Login
    app.post('/auth/sessions', 
        validateRequest(createUserSessionSchema), 
        createUserSessionHandler
    )

//     // Get user sessions
//     app.get('/auth/sessions', 
//         requiresUser, 
//         getUserSessionsHandler
//     )

    // logout
    app.delete('/auth/sessions', 
        requiresUser, 
        invalidateUserSessionHandler
    )

//     // Get user sessions
//     app.get('/user/sessions', 
//         requiresUser, 
//         getUserSessionsHandler
//     )

//     // Get user profile
    app.get('/user/profile', 
        requiresUser, 
        getUserProfileHandler
    )

    // Update user profile
    app.put('/user/profile', 
        requiresUser, 
        rejectForbiddenUserFields, 
        updateUserHandler
    )

    // Update user profile
    app.put('/user/profile/:userId', 
        requiresUser, 
        requiresAdministrator, 
        requiresPermissions(['can_manage_users']),
        validateRequest(getUserDetailsSchema),
        adminUpdateUserHandler
    )

//  Get all users 
    app.get('/users/all', 
        requiresUser, 
        requiresAdministrator,
        requiresPermissions(['can_manage_users']),
        getAllUsersHandler
    )

//  Get user account details by admin
    app.get('/users/profile/:userId', 
        requiresUser, 
        requiresAdministrator,
        requiresPermissions(['can_manage_users']),
        validateRequest(getUserDetailsSchema),
        getUserDetailsHandler
    )

//     Delete user account
    app.delete('/users/delete/:userId', 
        requiresUser, 
        requiresAdministrator,
        requiresPermissions(['can_manage_users']),
        validateRequest(getUserDetailsSchema),
        deleteUserHandler
    )

//     app.post('/auth/password-reset/request', 
//         validateRequest(resetRequestSchema),
//         requestPasswordResetHandler
//     )

//     app.post('/auth/password-reset', 
//         validateRequest(resetPasswordSchema),
//         resetPasswordHandler
//     )

    app.post('/user/change-password', 
        requiresUser,
        validateRequest(changePasswordSchema),
        changePasswordHandler
    )

    app.get('/dashboard/stats/:storeId', 
        requiresUser,
        requiresPermissions(['can_manage_reports']),
        statsHandler
    )

    // Categories
    // create category
    app.post('/categories',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_items']),
        createCategoryHandler
    )
    // get all categories
    app.get('/categories/:storeId',
        // requiresUser,
        // requiresAdministrator,
        // requiresPermissions(['can_manage_items']),
        getCategoriesHandler
    )
    // get all categories
    app.delete('/categories/:categoryId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_items']),
        deleteCategoryHandler
    )
    // Items
    // create item
    app.post('/items',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_items']),
        // validateRequest(createItemSchema),
        createItemHandler
    )
    
    // fetch items
    app.get('/items/:storeId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_items']),
        getItemsHandler
    )

    // fetch item details
    app.get('/items/:itemId/:storeId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_items']),
        getItemHandler
    )

    // update items
    app.patch('/items/:itemId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_items']),
        updateItemHandler
    )

    // delete items
    app.delete('/items/:itemId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_items']),
        deleteItemHandler
    )

    // Menus
    // create menu
    app.post('/menus',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_menus']),
        validateRequest(createMenuSchema),
        createMenuHandler
    )
    
    // fetch store ecommerce menu
    app.get('/menus/e-commerce/:storeId',
        getEcommerceMenuHandler
    )
    
    // fetch menus
    app.get('/menus',
        requiresUser,
        requiresAdministrator,
        getMenusHandler
    )

    // fetch menu details
    app.get('/menus/:menuId',
        requiresUser,
        requiresAdministrator,
        getMenuHandler
    )

    // update menu
    app.patch('/menus/:menuId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_menus']),
        updateMenuHandler
    )

    // delete menu
    app.delete('/menus/:menuId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_menus']),
        deleteMenuHandler
    )
    
    /**
     * ORDERS
     */

    // create order
    app.post('/orders',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_orders']),
        validateRequest(createOrderSchema),
        createOrderHandler
    )
    
    // fetch orders
    app.get('/orders/:storeId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_reports']),
        getOrdersByStoreHandler
    )
    
    // fetch orders
    app.get('/orders',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_orders']),
        getOrdersHandler
    )

    // fetch order details
    app.get('/orders/details/:orderId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_orders']),
        getOrderHandler
    )

    // add to order
    app.patch('/orders/:orderId/add-item',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_orders']),
        addToOrderHandler
    )

    // remove from order
    app.patch('/orders/:orderId/remove-item',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_orders']),
        removeFromOrderHandler
    )

    // update order
    app.patch('/orders/:orderId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_orders']),
        updateOrderHandler
    )

    // delete order
    app.delete('/orders/:orderId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_orders']),
        deleteOrderHandler
    )

    /**
     * INVENTORY
     */

    // fetch item stock history
    app.get('/inventory/:itemId/stock-history',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_inventory']),
        getItemStockHistoryHandler
    )

    // update item stock
    app.post('/inventory/:itemId/stock',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_inventory']),
        updateItemInventoryHandler
    )

    /**
     * TRANSACTIONS
     */
    app.post('/transactions',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_transactions']),
        receivePaymentHandler
    )

    app.get('/transactions/:storeId/export/csv',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_transactions']),
        exportTransactionsToCsvHandler
    )

    app.get('/transactions/:storeId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_transactions']),
        getAllTransactionsHandler
    )

    // UPLOAD FILE
    app.post("/files/new", 
        requiresUser,
        upload.single("file"),
        newFileHandler
    )
    
    // UPLOAD MULTIPLE FILES
    app.post("/files/new/multiple", 
        requiresUser,
        upload.array("files", 10),
        newFilesHandler
    )

    /**
     * Data transformations
     */

    // transform categories
    app.get('/data/transform/categories/:storeId',
        requiresUser,
        transformCategoriesHandler
    )

    // transform store items
    app.get('/data/transform/store-items/:storeId',
        requiresUser,
        transformStoreItemsHandler
    )

    // transform store items
    app.get('/data/transform/sale-items/:storeId',
        requiresUser,
        transformSaleItemsHandler
    )

    // transform store items
    // app.post('/data/transform/menus',
    //     requiresUser,
    //     transformSaleItemsHandler
    // )

    // // transform store items
    // app.post('/data/transform/transactions',
    //     requiresUser,
    //     transformSaleItemsHandler
    // )

}


