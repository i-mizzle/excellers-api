import { PasswordResetMailParams } from "../../service/mailer.service";

export const PasswordResetEmailTemplate = (input: PasswordResetMailParams) => {
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

            <p>Reset your password by clicking the button below</p>

            <button href="${input.resetUrl}">Confirm account</button>
        </div>
    `
}