import { InvitationMailParams } from "../../service/mailer.service";

export const AdminInvitationTemplate = (input: InvitationMailParams) => {
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

            <p>You were invited as an administrator on GeoTravel. Click the link below to accept your invitation and and continue to the dashboard</p>

            <button href="">Log in to your account</button>
        </div>
    `
}