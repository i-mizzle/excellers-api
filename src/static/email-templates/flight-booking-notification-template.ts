import { FlightBookingNotificationMailParams } from "../../service/mailer.service"


export const FlightBookingNotificationTemplate = (input: FlightBookingNotificationMailParams) => {
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

            <p>Your flight booking on Geotravel has been created successfully with the following details.</p>

            <p>Booking code: <strong>${input.bookingCode}</strong></p>
            <p>Origin: <strong>${input.origin}</strong></p>
            <p>Destination: <strong>${input.destination}</strong></p>
            <p>Date: <strong>${input.date}</strong></p>
            <p>Time: <strong>${input.time}</strong></p>
            <br>
            <p>Invoice code: <strong>${input.invoiceCode}</strong></p>



            <button href="${input.invoiceUrl}">Click here to pay for your invoice </button>
        </div>
    `
}