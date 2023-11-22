import { 
    Express,
    Request,
    Response 
} from 'express';
import { pullDataHandler, pullSingleDataItemHandler, pushDataHandler, pushSanitizeDataHandler, updateDataItemHandler, updateStoreIdsHandler } from './controller/store-data.controller';
import { requiresUser, validateRequest } from './middleware';
import requiresAdministrator from './middleware/requiresAdministrator';
import { changePasswordSchema, createUserSchema, createUserSessionSchema, getUserDetailsSchema } from './schema/user.schema';
import { adminUpdateUserHandler, changePasswordHandler, createUserHandler, deleteUserHandler, getAllUsersHandler, getUserDetailsHandler, getUserProfileHandler, updateUserHandler } from './controller/user.controller';
import { createStoreSchema, getStoreSchema } from './schema/store.schema';
import { createStoreHandler, getStoreDetailsHandler } from './controller/store.controller';
import { createUserSessionHandler, invalidateUserSessionHandler } from './controller/session.controller';
import requiresPermissions from './middleware/requiresPermissions';
import { rejectForbiddenUserFields } from './middleware/rejectForbiddenUserFields';
import { statsHandler } from './controller/stats.controller';


export default function(app: Express) {
    app.get('/ping', (req: Request, res: Response) => res.sendStatus(200))
    
    app.post('/store-data/push-sanitize', 
        // requiresUser,
        // requiresAdministrator,
        pushSanitizeDataHandler
    )
    
    app.get('/store-data/update-store-ids', 
        // requiresUser,
        // requiresAdministrator,
        updateStoreIdsHandler
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

//     // Confirm email
//     app.get('/auth/confirm-email/:confirmationCode', 
//         validateRequest(confirmationSchema), 
//         confirmEmailHandler
//     )

//     // Invite user
//     app.post('/auth/invitations', 
//         requiresUser, 
//         requiresAdministrator,
//         validateRequest(createInvitationSchema),
//         inviteUserHandler
//     )

//     app.get('/auth/invitations', 
//         requiresUser, 
//         requiresAdministrator,
//         getAllInvitationsHandler
//     )

//     app.get('/auth/invitations/:inviteCode', 
//         getInvitationByInviteeHandler
//     )

//     app.post('/auth/invitations/:inviteCode', 
//         acceptInvitationHandler
//     )

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

//     // FLIGHTS

//     app.post('/flights/search', 
//         validateRequest(searchFlightSchema),
//         flightSearchHandler
//     )

//     app.get('/flights/confirm-price/:flightId', 
//         validateRequest(priceConfirmationSchema),
//         confirmFlightPriceHandler
//     )

//     app.post('/flights/book-flight/:flightId', 
//         validateRequest(bookingSchema),
//         bookFlightHandler
//     )
    
//     // Bookings
//     app.get('/flights/bookings/:bookingCode', 
//         validateRequest(getBookingSchema),
//         getBookingHandler
//     )

//     app.get('/flights/bookings', 
//         requiresUser,
//         requiresAdministrator,
//         getBookingsHandler
//     )

//     app.delete('/flights/bookings/cancel/:bookingCode', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getBookingSchema),
//         cancelBookingHandler
//     )

//     app.get('/flights/bookings/issue-ticket/:bookingCode', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getBookingSchema),
//         issueTicketForBookingHandler
//     )

//     app.post('/trips', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createTripSchema),
//         createTripHandler
//     )

//     app.put('/trips/:tripId', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(updateTripSchema),
//         updateTripHandler
//     )

//     app.delete('/trips/:tripId', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getTripSchema),
//         deleteTripHandler
//     )

//     app.get('/trips/:tripId', 
//         validateRequest(getTripSchema),
//         getTripHandler
//     )

//     app.get('/trips', 
//         getTripsHandler
//     )

//     /**
//      * Packages
//      */
//     app.post('/packages', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createPackageSchema),
//         createPackageHandler
//     )

//     app.get('/packages', 
//         getPackagesHandler
//     )

//     app.get('/packages/:packageId', 
//         validateRequest(getPackageSchema),
//         getPackageHandler
//     )

//     app.put('/packages/:packageId', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getPackageSchema),
//         updatePackageHandler
//     )

//     app.delete('/packages/:packageId', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getPackageSchema),
//         deletePackageHandler
//     )

//     /**
//      * Package requests
//      */
//     app.post('/package-requests', 
//         validateRequest(createPackageRequestSchema),
//         createPackageRequestHandler
//     )

//     app.get('/package-requests', 
//         requiresUser,
//         requiresAdministrator,
//         getPackageRequestsHandler
//     )

//     app.get('/package-requests/:packageRequestId', 
//         validateRequest(getPackageRequestSchema),
//         getPackageRequestHandler
//     )

//     app.put('/package-requests/:packageRequestId', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getPackageRequestSchema),
//         updatePackageRequestHandler
//     )

//     app.delete('/package-requests/:packageRequestId', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getPackageRequestSchema),
//         deletePackageRequestHandler
//     )

//     // Package bookings

//     app.post('/bookings/packages',
//         validateRequest(createPackageBookingSchema),
//         createPackageBookingHandler
//     )

//     app.get('/bookings/packages',
//         requiresUser,
//         getPackageBookingsHandler
//     )

//     app.get('/bookings/packages/:bookingCode',
//         requiresUser,
//         validateRequest(getPackageBookingSchema),
//         getPackageBookingHandler
//     )

//     /**
//      * Invoices
//      */

//     app.get('/invoices',
//         requiresUser,
//         getInvoicesHandler
//     )

//     app.get('/invoices/:invoiceId',
//         // requiresUser,
//         getInvoiceHandler
//     )

//     app.put('/invoices/update/:invoiceId',
//         requiresUser,
//         requiresAdministrator,
//         updateInvoiceHandler
//     )

//     /**
//      * Payments
//      */

//     app.post('/payments/initialize-payment',
//         validateRequest(initializePaymentSchema),
//         initializePaymentHandler
//     )

//     app.get('/payments/verify-payment/:flwTransactionId',
//         validateRequest(verifyPaymentSchema),
//         verifyTransactionHandler
//     )

//     app.post('/flw-webhook',
//         flutterwaveWebhookHandler
//     )

//     /**
//      * Transactions
//      */

//     app.get('/transactions',
//         requiresUser,
//         getAllTransactionsHandler
//     )

//     app.get('/transactions/:transactionReference',
//         requiresUser,
//         getTransactionHandler
//     )

//     /**
//      * Package Deals
//      */
//     app.post('/deals/packages', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createPackageDealSchema),
//         createPackageDealHandler
//     )

//     app.get('/deals/packages', 
//         getPackageDealsHandler
//     )

//     app.get('/deals/packages/:dealCode', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getPackageDealSchema),
//         getPackageDealHandler
//     )

//     app.put('/deals/packages/:dealCode', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(updatePackageDealSchema),
//         updatePackageDealHandler
//     )
        
//     app.delete('/deals/packages/:dealCode', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getPackageDealSchema),
//         deletePackageDealHandler
//     )

//     /**
//      * Flight Deals
//      */
//     app.post('/deals/flights', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createFlightDealSchema),
//         createFlightDealHandler
//     )

//     app.get('/deals/flights', 
//         getFlightDealsHandler
//     )

//     app.get('/deals/flights/:dealCode', 
//         validateRequest(getPackageDealSchema),
//         getFlightDealHandler
//     )

//     app.put('/deals/flights/:dealCode', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(updateFlightDealSchema),
//         updateFlightDealHandler
//     )
        
//     app.delete('/deals/flights/:dealCode', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getFlightDealSchema),
//         deleteFlightDealHandler
//     )

//     /**
//      * General Deals
//      */
//     app.post('/deals', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createGeneralDealSchema),
//         createGeneralDealHandler
//     )

//     app.get('/deals', 
//         getGeneralDealsHandler
//     )

//     app.get('/deals/:dealCode', 
//         validateRequest(getGeneralDealSchema),
//         getGeneralDealHandler
//     )

//     app.put('/deals/:dealCode', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(updateGeneralDealSchema),
//         updateGeneralDealHandler
//     )
        
//     app.delete('/deals/:dealCode', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(updateGeneralDealSchema),
//         deleteGeneralDealHandler
//     )

//     // Bookings
//     app.post('/deals/general/bookings', 
//         validateRequest(createGeneralDealBookingSchema),
//         createGeneralDealBookingHandler
//     )

//     app.get('/deals/general/bookings/:bookingCode', 
//         validateRequest(getGeneralDealBookingSchema),
//         getGeneralDealBookingHandler
//     )

//     app.get('/deals/general/bookings', 
//         requiresUser,
//         requiresAdministrator,
//         getGeneralDealBookingsHandler
//     )

//     // app.delete('/deals/bookings/cancel/:bookingCode', 
//     //     requiresUser,
//     //     requiresAdministrator,
//     //     validateRequest(getBookingSchema),
//     //     cancelBookingHandler
//     // )

//     app.get('/deals/bookings/issue-ticket/:bookingCode', 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getBookingSchema),
//         issueTicketForBookingHandler
//     )

//     /**
//      * Enquiries
//      */
//     app.post('/enquiries', 
//         validateRequest(createEnquirySchema),
//         createEnquiryHandler
//     )

//     app.get('/enquiries', 
//         requiresUser,
//         requiresAdministrator,
//         getEnquiriesHandler
//     )

//     app.get('/enquiries/:enquiryId', 
//         requiresUser,
//         requiresAdministrator,
//         getEnquiryHandler
//     )

//     app.put('/enquiries/:enquiryId', 
//         requiresUser,
//         requiresAdministrator,
//         updateEnquiryHandler
//     )

//     /**
//      * Newsletter Subscriptions
//     */
    
//     app.post('/newsletter/subscriptions', 
//         validateRequest(createNewsletterSubscriptionSchema),
//         createNewsletterSubscriptionHandler
//     )
    
//     app.get('/newsletter/subscriptions', 
//         requiresUser,
//         requiresAdministrator,
//         getNewsletterSubscriptionsHandler
//     )
    
//     app.get('/newsletter/subscriptions/:subscriptionId', 
//         validateRequest(getNewsletterSubscriptionSchema),
//         getNewsletterSubscriptionHandler
//     )
    
//     app.put('/newsletter/subscriptions/:subscriptionId', 
//         validateRequest(getNewsletterSubscriptionSchema),
//         updateNewsletterSubscriptionHandler
//     )
    
//     app.delete('/newsletter/subscriptions/:subscriptionId', 
//         validateRequest(getNewsletterSubscriptionSchema),
//         deleteNewsletterSubscriptionHandler
//     )

//     /**
//      * AFFILIATES
//      */

//     app.post("/affiliates/approve/:userId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(approveAffiliateSchema),
//         approveAffiliateHandler
//     )

//     // app.post("/affiliates/validate-bvn", 
//     //     requiresUser,
//     //     requiresAffiliate,
//     //     validateRequest(validateBvnSchema),
//     //     verifyAffiliateBvnHandler
//     // )

//     // app.get("/affiliates/wallets", 
//     //     requiresUser,
//     //     requiresAffiliate,
//     //     getWalletsHandler
//     // )

//     // app.get("/affiliates/wallets/:walletId", 
//     //     requiresUser,
//     //     requiresAffiliate,
//     //     validateRequest(getWalletDetailsSchema),
//     //     getWalletHandler
//     // )

//     // app.get("/affiliates/wallets/:walletId/transactions", 
//     //     requiresUser,
//     //     requiresAffiliate,
//     //     validateRequest(getWalletDetailsSchema),
//     //     getWalletTransactionsHandler
//     // )

//     // app.get("/affiliates/wallets/:walletId/balance", 
//     //     requiresUser,
//     //     requiresAffiliateOrAdmin,
//     //     validateRequest(getWalletDetailsSchema),
//     //     getWalletBalanceHandler
//     // )

//     /**
//      * FUNDS TRANSFER
//      */

//     app.get("/funds-transfer/banks", 
//         requiresUser,
//         requiresAffiliateOrAdmin,
//         getBanksHandler
//     )

//     app.post("/funds-transfer/validate-account", 
//         requiresUser,
//         requiresAffiliateOrAdmin,
//         validateRequest(validateBankAccountSchema),
//         validateBankAccountHandler
//     )

//     app.post("/funds-transfer/initiate", 
//         requiresUser,
//         requiresAffiliate,
//         validateRequest(fundsTransferSchema),
//         fundsTransferHandler
//     )

//     /**
//      * ADDONS
//      */

//     app.post("/addons", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createAddonSchema),
//         createAddonHandler
//     )

//     app.get("/addons", 
//         getAddonsHandler
//     )

//     app.get("/addons/:addonId", 
//         getAddonHandler
//     )

//     app.put("/addons/:addonId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(singleAddonSchema),
//         updateAddonHandler
//     )

//     app.delete("/addons/:addonId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(singleAddonSchema),
//         deleteAddonHandler
//     )

//     // SETTINGS
//     // time-slots
//     app.post("/settings/time-slots", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createTimeSlotSchema),
//         createTimeSlotsHandler
//     )

//     app.get("/settings/time-slots", 
//         getTimeSlotsHandler
//     )

//     app.put("/settings/time-slots/:timeSlotId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getTimeSlotSchema),
//         updateTimeSlotHandler
//     )

//     // permissions
//     app.post("/settings/permissions", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createPermissionsSchema),
//         createPermissionsHandler
//     )

//     app.get("/settings/permissions", 
//         requiresUser,
//         requiresAdministrator,
//         getPermissionsHandler
//     )

//     // prices
//     app.post("/settings/prices", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createPriceSchema),
//         createPriceHandler
//     )
        
//     app.get("/settings/prices", 
//         getPricesHandler
//     )
        
//     app.put("/settings/prices/:priceId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(updatePriceSchema),
//         updatePriceHandler
//     )

//     // prices
//     app.post("/settings/margins", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createMarginSchema),
//         createMarginHandler
//     )
        
//     app.get("/settings/margins", 
//         getMarginsHandler
//     )
        
//     app.put("/settings/margins/:marginId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getMarginSchema),
//         updateMarginHandler
//     )

//     // Roles
//     app.post("/settings/roles", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createRoleSchema),
//         createRoleHandler
//     )
        
//     app.get("/settings/roles", 
//         requiresUser,
//         requiresAdministrator,
//         getRolesHandler
//     )
        
//     app.put("/settings/roles/update/:roleId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(deleteRoleSchema),
//         updateRoleHandler
//     )

//     app.delete("/settings/roles/:roleId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(deleteRoleSchema),
//         deleteRoleHandler
//     )

//     app.delete("/settings/roles/:roleId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(deleteRoleSchema),
//         deleteRoleHandler
//     )

//     app.post("/settings/email", 
//         requiresUser,
//         requiresAdministrator,
//         createEmailSettingHandler
//     )  

//     app.get("/settings/email", 
//         requiresUser,
//         requiresAdministrator,
//         getEmailSettingsHandler
//     )  

//     app.get("/settings/email/:settingId", 
//         requiresUser,
//         requiresAdministrator,
//         getEmailSettingHandler
//     )  

//     app.put("/settings/email/:settingId", 
//         requiresUser,
//         requiresAdministrator,
//         updateEmailSettingHandler
//     )  

//     app.post("/settings/email/:settingId/test", 
//         requiresUser,
//         requiresAdministrator,
//         testEmailSettingHandler
//     )  

//     // CALENDAR?APPOINTMENTS
//     app.post("/appointments", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createAppointmentSchema),
//         createAppointmentHandler
//     )

//     app.get("/appointments", 
//         requiresUser,
//         requiresAdministrator,
//         getAppointmentsHandler
//     )

//     app.get("/appointments/:appointmentCode", 
//         requiresUser,
//         validateRequest(getAppointmentSchema),
//         getAppointmentHandler
//     )

//     app.put("/appointments/:appointmentCode", 
//         requiresUser,
//         validateRequest(getAppointmentSchema),
//         updateAppointmentHandler
//     )

//     app.delete("/appointments/:appointmentCode", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(getAppointmentSchema),
//         cancelAppointmentHandler
//     )

//     /**
//      * BANNER ENDPOINTS
//      */

//     app.post("/banners", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createBannerSchema),
//         createBannerHandler
//     )

//     app.get("/banners", 
//         getBannersHandler
//     )

//     app.get("/banners/:bannerId", 
//         validateRequest(getBannerSchema),
//         getBannerHandler
//     )

//     app.put("/banners/update/:bannerId", 
//         validateRequest(updateBannerSchema),
//         updateBannerHandler
//     )

//     app.delete("/banners/delete/:bannerId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(deleteBannerSchema),
//         deleteBannerHandler
//     )

//     /**
//      * PAGE ENDPOINTS
//      */

//     app.post("/pages", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(createPageSchema),
//         createPageHandler
//     )

//     app.get("/pages", 
//         getPagesHandler
//     )

//     app.get("/pages/:pageId", 
//         validateRequest(getPageSchema),
//         getPageHandler
//     )

//     app.get("/pages/type/:type", 
//         validateRequest(getPageByTypeSchema),
//         getPageByTypeHandler
//     )

//     app.put("/pages/update/:pageId", 
//         validateRequest(updatePageSchema),
//         updatePageHandler
//     )

//     app.delete("/pages/delete/:pageId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(deletePageSchema),
//         deletePageHandler
//     )

//     /**
//      * PAGE ENDPOINTS
//      */

//     app.post("/blog/posts", 
//     requiresUser,
//     requiresAdministrator,
//     validateRequest(createPostSchema),
//     createPostHandler
// )

//     app.get("/blog/posts", 
//         getPostsHandler
//     )

//     app.get("/blog/posts/:postId", 
//         validateRequest(getPostSchema),
//         getPostHandler
//     )

//     app.put("/blog/posts/:postId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(updatePostSchema),
//         updatePostHandler
//     )

//     app.delete("/blog/posts/:postId", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(deletePostSchema),
//         deletePostHandler
//     )

//     app.post("/blog/posts/comments/:postId", 
//         validateRequest(createPostCommentSchema),
//         createPostCommentHandler
//     )

//     app.get("/blog/posts/comments/:postId", 
//         validateRequest(getPostCommentsSchema),
//         getPostCommentsHandler
//     )

//     app.put("/blog/posts/comments/:postCommentId/publish", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(updatePostCommentSchema),
//         publishPostCommentHandler
//     )

//     app.delete("/blog/posts/comments/:postCommentId/delete", 
//         requiresUser,
//         requiresAdministrator,
//         validateRequest(deletePostCommentSchema),
//         deletePostCommentHandler
//     )

//     // SCRIPTS

//     app.get("/scripts/blog/posts/generate-meta",
//         requiresUser,
//         requiresAdministrator,
//         createPostsMetaHandler
//     )

//     app.get('/scripts/flights/bookings/invoice-status',
//         requiresUser,
//         requiresAdministrator,
//         updateBookingsWithInvoiceStatuses
//     )

//     app.get('/scripts/packages/bookings/update-invoice-status',
//         requiresUser,
//         requiresAdministrator,
//         updatePackageBookingsWithInvoiceStatuses
//     )

//     app.get('/scripts/enquiries/update-status',
//         requiresUser,
//         requiresAdministrator,
//         updateEnquiriesWithInvoiceStatuses
//     )

//     app.get('/scripts/packages/update-pricing-structure',
//         requiresUser,
//         requiresAdministrator,
//         updatePackagePricingStructureHandler
//     )

//     app.get('/scripts/general-deals/update-pricing-structure',
//         requiresUser,
//         requiresAdministrator,
//         updateGeneralDealPricingStructureHandler
//     )

//     app.get('/wallet-balance',
//         requiresUser,
//         requiresAdministrator,
//         getTiqwaWalletBalanceHandler
//     )

//     // UPLOAD FILE
//     app.post("/files/new", 
//         requiresUser,
//         upload.single("file"),
//         newFileHandler
//     )
    
//     // UPLOAD MULTIPLE FILES
//     app.post("/files/new/multiple", 
//         requiresUser,
//         upload.array("files", 10),
//         newFilesHandler
//     )
}


