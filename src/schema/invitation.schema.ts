import { object, string, ref } from "yup";

export const createInvitationSchema = object({
    body: object({
        firstName: string().required('firstName is required'),
        lastName: string().required('lastName is required'),
        email: string()
            .email('must be a valid email')
            .required('email is required'),
        userType: string().required('userType is required'),
        invitationUrl: string().required('please provide url for confirmation link (confirmationUrl)')
    })
});

export const acceptInvitationSchema = object({
    body: object({
        invitationCode: string().required('invitation code (invitationCode) is required as a string'),
        password: string()
            .required('password is required')
            .min(10, 'password is too short - should be 10 chars min'),
            // .matches(/^[a-zA-Z0-9_.-]*$/, 'password can only contain latin characters'),
    })
})

const params = {
    params: object({
        invitationCode: string().required('invitation code is required as a path param')
    })
}

export const getInvitationSchema = object({
    ...params
 });
