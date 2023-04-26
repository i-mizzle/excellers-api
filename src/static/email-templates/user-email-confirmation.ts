import { ConfirmationMailParams } from "../../service/mailer.service";

export const UserEmailConfirmationTemplate = (input: ConfirmationMailParams) => {
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

            <p>Confirm your account by clicking the button below</p>

            <button href="${input.confirmationUrl}">Confirm account</button>
        </div>
    `
}