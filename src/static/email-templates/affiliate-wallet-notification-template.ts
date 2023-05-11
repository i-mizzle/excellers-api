import { WalletCreationMailParams } from "../../service/mailer.service";

export const AffiliateWalletNotificationTemplate = (input: WalletCreationMailParams) => {
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

            <p>Your affiliate wallet on Geotravel has been create successfully with the following details.</p>

            <p>Account Name: <strong>${input.accountName}</strong></p>
            <p>Account Number: <strong>${input.accountNumber}</strong></p>
            <p>Bank: <strong>${input.bank}</strong></p>

            <button href="">Log in to your account</button>
        </div>
    `
}