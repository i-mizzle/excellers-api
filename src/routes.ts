import { 
    Express,
    Request,
    Response 
} from 'express';
import { checkExistingUserHandler, confirmEmailHandler, createUserHandler, deleteUserHandler, getAllUsersHandler, getUserProfileHandler, updateUserHandler } from './controller/user.controller';
import { 
    createUserSessionHandler,
    invalidateUserSessionHandler,
    getUserSessionsHandler
} from './controller/session.controller';
import { 
    createUserSchema,
    createUserSessionSchema
} from './schema/user.schema'
import {
    checkUserType,
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
import { bookFlightHandler, cancelBookingHandler, getBookingHandler, getBookingsHandler } from './controller/booking.controller';

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
    app.get('/bookings/:bookingCode', 
        validateRequest(getBookingSchema),
        getBookingHandler
    )

    app.get('/bookings', 
        requiresUser,
        requiresAdministrator,
        getBookingsHandler
    )

    app.delete('/bookings/cancel/:bookingCode', 
        requiresUser,
        requiresAdministrator,
        validateRequest(getBookingSchema),
        cancelBookingHandler
    )


    // UPLOAD FILE
    app.post("/files/new", 
        requiresUser,
        upload.single("file"),
        newFileHandler
    )
    

}


