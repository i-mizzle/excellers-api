import { AffiliateApprovalMailParams } from "../../service/mailer.service";

export const AffiliateApprovalConfirmationTemplate = (input: AffiliateApprovalMailParams) => {
    return `
        <div>
            <style>
                h1 { color: green; }
                button {
                    background-color: green;
                    color: white;
                    padding: 15px;
                    border-radius: 5px;
                }
            </style>

            <h1>Hello, ${input.firstName}</h1>

            <p>Your affiliate account on Geotravels has been approved successfully. Click the link below to access your account and continue your onboarding process</p>

            <button href="${input.confirmationUrl}">Log in to your account</button>
        </div>
    `
}