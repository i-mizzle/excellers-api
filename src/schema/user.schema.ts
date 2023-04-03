import { object, string, ref } from "yup";

export const createUserSchema = object({
    body: object({
        name: string().required('Name is required'),
        password: string()
            .required('password is required')
            .min(6, 'password is too short - should be 6 chars min'),
            // .matches(/^[a-zA-Z0-9_.-]*$/, 'password can only contain latin characters'),
        phone: string().required('phone number (phone) is required'),
        userType: string().required('user type is required'),
        email: string()
            .email('must be a valid email')
            .required('email is required'),
            
    })
});

export const createUserSessionSchema = object({
    body: object({
        password: string()
            .required('password is required')
            .min(6, 'password is too short - should be 6 chars min'),
            // .matches(/^[a-zA-Z0-9_.-]*$/, 'password can only contain latin characters'),
        email: string()
        .email('must be a valid email')
        .required('email is required')        
    })
});

// .when('eventType', {
//     is: 'VERSUS', 
//     then: object({
//         name: string().required('away side name is required'),
//     })
// }),
