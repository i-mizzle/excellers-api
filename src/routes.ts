import { 
    Express,
    Request,
    Response 
} from 'express';
import { checkExistingUserHandler, confirmEmailHandler, createUserHandler, deleteUserHandler, getAllUsersHandler, getUserDetailsHandler, getUserProfileHandler, updateUserHandler } from './controller/user.controller';
import { 
    createUserSessionHandler,
    invalidateUserSessionHandler,
    getUserSessionsHandler
} from './controller/session.controller';
import { 
    createUserSchema,
    createUserSessionSchema,
    getUserDetailsSchema
} from './schema/user.schema'
import {
    checkUserType,
    requiresAffiliate,
    requiresUser,
    validateRequest
} from './middleware'
import { upload } from './service/integrations/cloudinary.service';
import { newFileHandler } from './controller/file.controller';
import { rejectForbiddenUserFields } from './middleware/rejectForbiddenUserFields';
import requiresAdministrator from './middleware/requiresAdministrator';
import { createInvitationSchema, getInvitationSchema } from './schema/invitation.schema';
// import { getInvitationHandler, InviteUserHandler } from './controller/invitation.controller';
import { confirmationSchema } from './schema/confirmation-code.schema';
import { requestPasswordResetHandler, resetPasswordHandler } from './controller/password-reset.controller';
import { inviteUserHandler } from './controller/invitation.controller';
import { confirmFlightPriceHandler, flightSearchHandler } from './controller/flight.controller';
import { priceConfirmationSchema, searchFlightSchema } from './schema/flight.schema';
import { bookingSchema, getBookingSchema } from './schema/booking.schema';
import { bookFlightHandler, cancelBookingHandler, getBookingHandler, getBookingsHandler, issueTicketForBookingHandler } from './controller/booking.controller';
import { createTripHandler, deleteTripHandler, getTripHandler, getTripsHandler, updateTripHandler } from './controller/trip.controller';
import { createTripSchema, getTripSchema, updateTripSchema } from './schema/trip.schema';
import { createNewsletterSubscriptionHandler, deleteNewsletterSubscriptionHandler, getNewsletterSubscriptionHandler, getNewsletterSubscriptionsHandler, updateNewsletterSubscriptionHandler } from './controller/newsletter-subscription.controller';
import { createNewsletterSubscriptionSchema, getNewsletterSubscriptionSchema } from './schema/newsletter-subscription.schema';
import { createPackageSchema, getPackageSchema } from './schema/package.schema';
import { createPackageHandler, deletePackageHandler, getPackageHandler, getPackagesHandler, updatePackageHandler } from './controller/package.controller';
import { createPackageDealSchema, getPackageDealSchema, updatePackageDealSchema } from './schema/package-deal.schema';
import { createEnquirySchema } from './schema/enquiry.schema';
import { createEnquiryHandler, getEnquiriesHandler, getEnquiryHandler, updateEnquiryHandler } from './controller/enquiry.controller';
import { createPackageBookingSchema, getPackageBookingSchema } from './schema/package-booking.schema';
import { createPackageBookingHandler, getPackageBookingHandler, getPackageBookingsHandler } from './controller/package-booking.controller';
import { getInvoiceHandler, getInvoicesHandler } from './controller/invoice.controller';
import { initializePaymentSchema, verifyPaymentSchema } from './schema/payment.schema';
import { flutterwaveWebhookHandler, initializePaymentHandler, verifyTransactionHandler } from './controller/payments.controller';
import { getAllTransactionsHandler, getTransactionHandler } from './controller/transaction.controller';
import { approveAffiliateSchema, validateBvnSchema } from './schema/affiliate.schema';
import { approveAffiliateHandler, verifyAffiliateBvnHandler } from './controller/affiliate.controller';
import { createAddonSchema, singleAddonSchema } from './schema/addon.schema';
import { createAddonHandler, deleteAddonHandler, getAddonHandler, getAddonsHandler, updateAddonHandler } from './controller/addon.controller';
import { createTimeSlotSchema, getTimeSlotSchema } from './schema/timeslot.schema';
import { createTimeSlotsHandler, getTimeSlotsHandler, updateTimeSlotHandler } from './controller/time-slot.controller';
import { createAppointmentSchema, getAppointmentSchema } from './schema/appointment.schema';
import { cancelAppointmentHandler, createAppointmentHandler, getAppointmentHandler, getAppointmentsHandler, updateAppointmentHandler } from './controller/appointment.controller';
import { createPermissionsSchema } from './schema/permission.schema';
import { createPermissionsHandler, getPermissionsHandler } from './controller/permission.controller';
import { createPackageDealHandler, deletePackageDealHandler, getPackageDealHandler, getPackageDealsHandler, updatePackageDealHandler } from './controller/package-deal.controller';
import { createFlightDealSchema, getFlightDealSchema, updateFlightDealSchema } from './schema/flight-deal.schema';
import { createFlightDealHandler, deleteFlightDealHandler, getFlightDealsHandler, updateFlightDealHandler } from './controller/flight-deal.controller';

export default function(app: Express) {
    app.get('/ping', (req: Request, res: Response) => res.sendStatus(200))

    // Register
    app.post('/auth/signup', 
        checkUserType,
        validateRequest(createUserSchema), 
        createUserHandler
    )

    // Confirm email
    app.get('/auth/confirm-email/:confirmationCode', 
        validateRequest(confirmationSchema), 
        confirmEmailHandler
    )

    // Get user sessions
    app.post('/auth/invitations', 
        requiresUser, 
        requiresAdministrator,
        validateRequest(createInvitationSchema),
        inviteUserHandler
    )

    // Login
    app.post('/auth/sessions', 
        validateRequest(createUserSessionSchema), 
        createUserSessionHandler
    )

    // Get user sessions
    app.get('/auth/sessions', 
        requiresUser, 
        getUserSessionsHandler
    )

    // logout
    app.delete('/auth/sessions', 
        requiresUser, 
        invalidateUserSessionHandler
    )

    // Get user sessions
    app.get('/user/sessions', 
        requiresUser, 
        getUserSessionsHandler
    )

    // Get user profile
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

    // Get all users 
    app.get('/users/all', 
        requiresUser, 
        requiresAdministrator,
        getAllUsersHandler
    )

    // Delete user account
    app.get('/users/profile/:userId', 
        requiresUser, 
        requiresAdministrator,
        validateRequest(getUserDetailsSchema),
        getUserDetailsHandler
    )

    // Delete user account
    app.delete('/users/delete/:userCode', 
        requiresUser, 
        requiresAdministrator,
        deleteUserHandler
    )

    app.post('/auth/password-reset/request', 
        requestPasswordResetHandler
    )

    app.post('/auth/password-reset', 
        resetPasswordHandler
    )

    // FLIGHTS
    app.post('/flights/search', 
        validateRequest(searchFlightSchema),
        flightSearchHandler
    )

    app.get('/flights/confirm-price/:flightId', 
        validateRequest(priceConfirmationSchema),
        confirmFlightPriceHandler
    )

    app.post('/flights/book-flight/:flightId', 
        validateRequest(bookingSchema),
        bookFlightHandler
    )
    
    // Bookings
    app.get('/flights/bookings/:bookingCode', 
        validateRequest(getBookingSchema),
        getBookingHandler
    )

    app.get('/flights/bookings', 
        requiresUser,
        requiresAdministrator,
        getBookingsHandler
    )

    app.delete('/flights/bookings/cancel/:bookingCode', 
        requiresUser,
        requiresAdministrator,
        validateRequest(getBookingSchema),
        cancelBookingHandler
    )

    app.get('/flights/bookings/issue-ticket/:bookingCode', 
        requiresUser,
        requiresAdministrator,
        validateRequest(getBookingSchema),
        issueTicketForBookingHandler
    )

    app.post('/trips', 
        requiresUser,
        requiresAdministrator,
        validateRequest(createTripSchema),
        createTripHandler
    )

    app.put('/trips/:tripId', 
        requiresUser,
        requiresAdministrator,
        validateRequest(updateTripSchema),
        updateTripHandler
    )

    app.delete('/trips/:tripId', 
        requiresUser,
        requiresAdministrator,
        validateRequest(getTripSchema),
        deleteTripHandler
    )

    app.get('/trips/:tripId', 
        validateRequest(getTripSchema),
        getTripHandler
    )

    app.get('/trips', 
        getTripsHandler
    )

    /**
     * Packages
     */
    app.post('/packages', 
        requiresUser,
        requiresAdministrator,
        validateRequest(createPackageSchema),
        createPackageHandler
    )

    app.get('/packages', 
        getPackagesHandler
    )

    app.get('/packages/:packageId', 
        validateRequest(getPackageSchema),
        getPackageHandler
    )

    app.put('/packages/:packageId', 
        requiresUser,
        requiresAdministrator,
        validateRequest(getPackageSchema),
        updatePackageHandler
    )

    app.delete('/packages/:packageId', 
        requiresUser,
        requiresAdministrator,
        validateRequest(getPackageSchema),
        deletePackageHandler
    )

    // Package bookings
    app.post('/bookings/packages',
        validateRequest(createPackageBookingSchema),
        createPackageBookingHandler
    )

    app.get('/bookings/packages',
        requiresUser,
        getPackageBookingsHandler
    )

    app.get('/bookings/packages/:bookingCode',
        requiresUser,
        validateRequest(getPackageBookingSchema),
        getPackageBookingHandler
    )

    /**
     * Invoices
     */

    app.get('/invoices',
        requiresUser,
        getInvoicesHandler
    )

    app.get('/invoices/:invoiceId',
        // requiresUser,
        getInvoiceHandler
    )

    /**
     * Payments
     */

    app.post('/payments/initialize-payment',
        validateRequest(initializePaymentSchema),
        initializePaymentHandler
    )

    app.get('/payments/verify-payment/:flwTransactionId',
        validateRequest(verifyPaymentSchema),
        verifyTransactionHandler
    )

    app.post('/flw-webhook',
        flutterwaveWebhookHandler
    )

    /**
     * Transactions
     */

    app.get('/transactions',
        requiresUser,
        getAllTransactionsHandler
    )

    app.get('/transactions/:transactionReference',
        requiresUser,
        getTransactionHandler
    )

    /**
     * Package Deals
     */
    app.post('/deals/packages', 
        requiresUser,
        requiresAdministrator,
        validateRequest(createPackageDealSchema),
        createPackageDealHandler
    )

    app.get('/deals/packages', 
        requiresUser,
        requiresAdministrator,
        getPackageDealsHandler
    )

    app.get('/deals/packages/:dealCode', 
        requiresUser,
        requiresAdministrator,
        validateRequest(getPackageDealSchema),
        getPackageDealHandler
    )

    app.put('/deals/packages/:dealCode', 
        requiresUser,
        requiresAdministrator,
        validateRequest(updatePackageDealSchema),
        updatePackageDealHandler
    )
        
    app.delete('/deals/packages/:dealCode', 
        requiresUser,
        requiresAdministrator,
        validateRequest(getPackageDealSchema),
        deletePackageDealHandler
    )

    /**
     * Flight Deals
     */
    app.post('/deals/flights', 
        requiresUser,
        requiresAdministrator,
        validateRequest(createFlightDealSchema),
        createFlightDealHandler
    )

    app.get('/deals/flights', 
        requiresUser,
        requiresAdministrator,
        getFlightDealsHandler
    )

    // app.get('/deals/packages/:dealCode', 
    //     requiresUser,
    //     requiresAdministrator,
    //     validateRequest(getPackageDealSchema),
    //     getPackageDealHandler
    // )

    app.put('/deals/flights/:dealCode', 
        requiresUser,
        requiresAdministrator,
        validateRequest(updateFlightDealSchema),
        updateFlightDealHandler
    )
        
    app.delete('/deals/flights/:dealCode', 
        requiresUser,
        requiresAdministrator,
        validateRequest(getFlightDealSchema),
        deleteFlightDealHandler
    )

    /**
     * Enquiries
     */
    app.post('/enquiries', 
        validateRequest(createEnquirySchema),
        createEnquiryHandler
    )

    app.get('/enquiries', 
        requiresUser,
        requiresAdministrator,
        getEnquiriesHandler
    )

    app.get('/enquiries/:enquiryId', 
        requiresUser,
        requiresAdministrator,
        getEnquiryHandler
    )

    app.put('/enquiries/:enquiryId', 
        requiresUser,
        requiresAdministrator,
        updateEnquiryHandler
    )

    /**
     * Newsletter Subscriptions
    */
    
    app.post('/newsletter/subscriptions', 
        validateRequest(createNewsletterSubscriptionSchema),
        createNewsletterSubscriptionHandler
    )
    
    app.get('/newsletter/subscriptions', 
        requiresUser,
        requiresAdministrator,
        getNewsletterSubscriptionsHandler
    )
    
    app.get('/newsletter/subscriptions/:subscriptionId', 
        validateRequest(getNewsletterSubscriptionSchema),
        getNewsletterSubscriptionHandler
    )
    
    app.put('/newsletter/subscriptions/:subscriptionId', 
        validateRequest(getNewsletterSubscriptionSchema),
        updateNewsletterSubscriptionHandler
    )
    
    app.delete('/newsletter/subscriptions/:subscriptionId', 
        validateRequest(getNewsletterSubscriptionSchema),
        deleteNewsletterSubscriptionHandler
    )

    /**
     * AFFILIATES
     */

    app.post("/affiliates/approve/:userId", 
        requiresUser,
        requiresAdministrator,
        validateRequest(approveAffiliateSchema),
        approveAffiliateHandler
    )

    app.post("/affiliates/validate-bvn/:userId", 
        requiresUser,
        requiresAffiliate,
        validateRequest(validateBvnSchema),
        verifyAffiliateBvnHandler
    )

    /**
     * ADDONS
     */

    app.post("/addons", 
        requiresUser,
        requiresAdministrator,
        validateRequest(createAddonSchema),
        createAddonHandler
    )

    app.get("/addons", 
        getAddonsHandler
    )

    app.get("/addons/:addonId", 
        getAddonHandler
    )

    app.put("/addons/:addonId", 
        requiresUser,
        requiresAdministrator,
        validateRequest(singleAddonSchema),
        updateAddonHandler
    )

    app.delete("/addons/:addonId", 
        requiresUser,
        requiresAdministrator,
        validateRequest(singleAddonSchema),
        deleteAddonHandler
    )

    // SETTINGS
    // time-slots
    app.post("/settings/time-slots", 
        requiresUser,
        requiresAdministrator,
        validateRequest(createTimeSlotSchema),
        createTimeSlotsHandler
    )

    app.get("/settings/time-slots", 
        getTimeSlotsHandler
    )

    app.put("/settings/time-slots/:timeSlotId", 
        requiresUser,
        requiresAdministrator,
        validateRequest(getTimeSlotSchema),
        updateTimeSlotHandler
    )

    // permissions
    app.post("/settings/permissions", 
        requiresUser,
        requiresAdministrator,
        validateRequest(createPermissionsSchema),
        createPermissionsHandler
    )

    app.get("/settings/permissions", 
        requiresUser,
        requiresAdministrator,
        getPermissionsHandler
    )

    // CALENDAR?APPOINTMENTS
    app.post("/appointments", 
        requiresUser,
        requiresAdministrator,
        validateRequest(createAppointmentSchema),
        createAppointmentHandler
    )

    app.get("/appointments", 
        requiresUser,
        requiresAdministrator,
        getAppointmentsHandler
    )

    app.get("/appointments/:appointmentCode", 
        requiresUser,
        validateRequest(getAppointmentSchema),
        getAppointmentHandler
    )

    app.put("/appointments/:appointmentCode", 
        requiresUser,
        validateRequest(getAppointmentSchema),
        updateAppointmentHandler
    )

    app.delete("/appointments/:appointmentCode", 
        requiresUser,
        requiresAdministrator,
        validateRequest(getAppointmentSchema),
        cancelAppointmentHandler
    )

    // UPLOAD FILE
    app.post("/files/new", 
        requiresUser,
        upload.single("file"),
        newFileHandler
    )
    

}


