import { 
    Express,
    Request,
    Response 
} from 'express';
import { deleteDataItemHandler, exportDataToCsvHandler, pullDataHandler, pullSingleDataItemHandler, pushDataHandler, updateDataItemHandler } from './controller/store-data.controller';
import { requiresUser, validateRequest } from './middleware';
import requiresAdministrator from './middleware/requiresAdministrator';
import { changePasswordSchema, createUserSchema, createUserSessionSchema, getUserDetailsSchema } from './schema/user.schema';
import { adminUpdateUserHandler, bulkImportUsers, bulkResetPasswords, changePasswordHandler, createUserHandler, deleteUserHandler, getAllUsersHandler, getUserDetailsHandler, getUserProfileHandler, resetUserPassword, updateUserHandler } from './controller/user.controller';
import { createStoreSchema, getStoreSchema } from './schema/store.schema';
import { createStoreHandler, getStoreDetailsHandler } from './controller/store.controller';
import { createUserSessionHandler, invalidateUserSessionHandler } from './controller/session.controller';
import requiresPermissions from './middleware/requiresPermissions';
import { rejectForbiddenUserFields } from './middleware/rejectForbiddenUserFields';
import { statsHandler } from './controller/stats.controller';
import { createUpdateStoreSettingHandler, findStoreSettingHandler } from './controller/store-setting.controller';
import { upload } from './service/integrations/cloudinary.service';
import { newFileHandler, newFilesHandler } from './controller/file.controller';
import { createItemHandler, deleteItemHandler, getItemHandler, getItemsHandler } from './controller/item.controller';
import { updateItemHandler } from './controller/item-variant.controller';
import { createCategoryHandler, getCategoriesHandler } from './controller/category.controller';
import { createItemSchema } from './schema/item.schema';
import { createMenuHandler, deleteMenuHandler, getMenuHandler, getMenusHandler, updateMenuHandler } from './controller/menu.controller';
import { createMenuSchema } from './schema/menu.schema';
import { getItemStockHistoryHandler, updateItemInventoryHandler } from './controller/inventory.controller';


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
        getCategoriesHandler
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
    
    // fetch menus
    app.get('/menus/:storeId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_menus']),
        getMenusHandler
    )

    // fetch menu details
    app.get('/menus/:menuId/:storeId',
        requiresUser,
        requiresAdministrator,
        requiresPermissions(['can_manage_menus']),
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
}


