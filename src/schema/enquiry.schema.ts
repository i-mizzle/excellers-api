import { object, string, ref, boolean } from "yup";

const payload = {
    body: object({
        enquiryType: string().required('enquiryType is required as enum (eg: PACKAGE, DEAL, GENERAL, VISA, CORPORATE'),
        message: string().required('enquiry message is required'),
        name: string().required('guest name is required'),
        email: string().email('must be a valid email').required('guest email is required'),
        phone: string().required('guest phone is required'),      
        nationality: string().when('enquiryType', {
            is: 'VISA', 
            then: string().required('nationality is required for VISA enquiries')
        }),
        visaEnquiryCountry: string().when('enquiryType', {
            is: 'VISA', 
            then: string().required('country (visaEnquiryCountry) is required for VISA enquiries')
        }),
        passportAvailable: string().when('enquiryType', {
            is: 'VISA', 
            then: string().required('passport availability (passportAvailable) is required for VISA enquiries')
        }),
        maritalStatus: string().when('enquiryType', {
            is: 'VISA', 
            then: string().required('marital status (maritalStatus) is required for VISA enquiries. should be one of: SINGLE, MARRIED, DIVORCED, WIDOWED, OTHER')
        }),
        dateOfBirth: string().when('enquiryType', {
            is: 'VISA', 
            then: string().required('date of birth (dateOfBirth) is required in the format DD-MM-YYYY')
        }),
        travelHistory: string().when('enquiryType', {
            is: 'VISA', 
            then: string().required('travel history (travelHistory) is required as a boolean')
        }),
        price: string().when('enquiryType', {
            is: 'VISA', 
            then: string().required('price is required - this is the id of the pricing item for this service')
        }),
        companyName: string().when('enquiryType', {
            is: 'CORPORATE', 
            then: string().required('company name (companyName) is required for corporate enquiries')
        }),
        officeAddress: string().when('enquiryType', {
            is: 'CORPORATE', 
            then: string().required('officeAddress is required for corporate enquiries')
        }),
        designation: string().when('enquiryType', {
            is: 'CORPORATE', 
            then: string().required('designation is required for corporate enquiries')
        })
    })
}

const params = {
    params: object({
        enquiryId: string().required('enquiry id is required as a path param')
    })
}

export const createEnquirySchema = object({
   ...payload
});

export const getEnquirySchema = object({
    ...params
})
