import { ConfirmationMailParams } from "../../service/mailer.service";

export const UserEmailConfirmationTemplate = (input: ConfirmationMailParams) => {
    // <div>
    //     <style>
    //         h1 { color: green; }
    //         button {
    //             background-color: green;
    //             color: white;
    //             padding: 15px;
    //             border-radius: 5px;
    //         }
    //     </style>

    //     <h1>Hello, ${input.firstName}</h1>

    //     <p>Confirm your account by clicking the button below</p>

    //     <button href="${input.confirmationUrl}">Confirm account</button>
    // </div>
    return `
        <div>
            <style>
                * {
                    font-family: Arial, Helvetica, sans-serif;
                }
                
                .container {
                    width: 95%;
                    max-width: 32rem;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    padding: 1.2rem;
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }
                .container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    z-index: -1;
                    left: 0;
                    border-style: solid;
                    border-width: 10vw 20vw;
                    border-color: rgba(207, 207, 211, 0.353) transparent transparent rgba(207, 207, 211, 0.353);
                }
                .container::after {
                    content: '';
                    position: absolute;
                    top: -1rem;
                    z-index: -1;
                    left: 0;
                    border-style: solid;
                    border-width: 10vw 20vw;
                    border-color: rgba(207, 207, 211, 0.353) transparent transparent rgba(207, 207, 211, 0.353);
                }

                .footer-icons {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                }

                .footer-icons>a>img {
                    width: 1.5rem;
                    height: 1.5rem;
                }

                .footer-links {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 2rem 0;
                }

                .footer-links>a {
                    font-size: 0.8rem;
                    color: rgb(4, 4, 224);
                    text-transform: capitalize;
                    border-right: 1px solid rgb(4, 4, 224);
                    text-align: center;
                    padding: 0 1rem;
                }

                .footer-links>a:last-child {
                    border-right: none;
                }

                a {
                    text-decoration: none;
                }
                .subject {
                    font-size: 2rem;
                    color: rgb(60, 58, 58);
                    font-weight: 550;
                }
                .title {
                    font-size: 1.3rem;
                    font-weight: 550;
                    margin: 3rem 0;
                }
                .par {
                    color: rgb(60, 58, 58);
                }
                .pad1 {
                    padding-bottom: 1rem;
                }
                .button {
                    margin: 2rem 0;
                }
                .button>a {
                    padding: 1.2rem 2rem;
                    background-color: rgb(1, 1, 189);
                    color: white;
                    text-transform: uppercase;
                    font-size: 0.9rem;
                    border-radius: 0.6rem;
                    cursor: pointer
                    box-shadow: 3px 6px 10px rgb(162, 160, 160);
                }
                .brand {
                    margin-bottom: 2rem;
                }
                .brand img {
                    width: 7rem;
                }
            </style>

            <div class="container">
                <div class="">
                    <div class="brand">
                        <a href="https://www.gowithgeo.com/">
                            <img src="https://res.cloudinary.com/travel-wahoo/image/upload/v1688224783/geotravel-assets/g98j5fwmwolopcfclfy9.png" alt="">
                        </a>
                    </div>
                </div>
                <div class="subject">Welcome to GeoTravel – Activate Your Account</div>

                <div class="title">Dear ${input.firstName},</div>

                <div class="par pad1">We are happy to have you here!</div>
            <div class="par pad1"> Please click on the below button to activate your account.</div>

            <div class="button">
                <a href="${input.confirmationUrl}">activate account</a>
            </div>
                <div class="par">Best Regards,</div>
                <div class="par">The GeoTravel Team</div>

                <div class="footer-links">
                    <a href="https://www.gowithgeo.com/privacy-policy">privacy policy</a>
                    <a href="https://www.gowithgeo.com/terms-and-conditions">terms and conditions</a>
                    <a href="https://www.gowithgeo.com/about-us">about us</a>
                </div>
                <div class="footer-icons">
                    <a href="https://www.facebook.com/TravelwithGeo">
                        <img src="https://cdn-icons-png.flaticon.com/128/733/733547.png" alt="" class="">
                    </a>
                    <a href="https://twitter.com/travelwithgeo">
                        <img src="https://cdn-icons-png.flaticon.com/128/733/733579.png" alt="" class="">
                    </a>
                    <a href="https://www.instagram.com/geotravels/">
                        <img src="https://cdn-icons-png.flaticon.com/128/2111/2111463.png" alt="" class="">
                    </a>
                    <a href="https://ng.linkedin.com/company/geo-travel-tours">
                        <img src="https://cdn-icons-png.flaticon.com/128/3536/3536505.png" alt="" class="">
                    </a>
                </div>
            </div>
        </div>
    `
}