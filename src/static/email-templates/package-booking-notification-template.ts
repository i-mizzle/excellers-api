import { EmailSettingDocument } from "../../model/email-setting.model"
import { PackageBookingNotificationMailParams } from "../../service/mailer.service"
import { replaceEmailVariables } from "../../utils/utils"


export const PackageBookingNotificationTemplate = (input: PackageBookingNotificationMailParams, settings: EmailSettingDocument) => {
    // return `
    //     <div>
    //         <style>
    //             h1 { color: green; }
    //             button {
    //                 background-color: green;
    //                 color: white;
    //                 padding: 15px;
    //                 border-radius: 5px;
    //             }
    //         </style>

    //         <h1>Hello, ${input.firstName}</h1>

    //         <p>Your flight booking on Geotravel has been created successfully with the following details.</p>

    //         <p>Booking code: <strong>${input.bookingCode}</strong></p>
    //         <p>Origin: <strong>${input.origin}</strong></p>
    //         <p>Destination: <strong>${input.destination}</strong></p>
    //         <p>Date: <strong>${input.date}</strong></p>
    //         <p>Time: <strong>${input.time}</strong></p>
    //         <br>
    //         <p>Invoice code: <strong>${input.invoiceCode}</strong></p>



    //         <button href="${input.invoiceUrl}">Click here to pay for your invoice </button>
    //     </div>
    // `

    let emailTemplate =  `<!DOCTYPE html>
    <html style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
    <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Actionable emails e.g. reset password</title>
    
    
    <style type="text/css">
    img {
    max-width: 100%;
    }
    body {
    -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;
    }
    body {
    background-color: #f6f6f6;
    }
    @media only screen and (max-width: 640px) {
      body {
        padding: 0 !important;
      }
      h1 {
        font-weight: 800 !important; margin: 20px 0 5px !important;
      }
      h2 {
        font-weight: 800 !important; margin: 20px 0 5px !important;
      }
      h3 {
        font-weight: 800 !important; margin: 20px 0 5px !important;
      }
      h4 {
        font-weight: 800 !important; margin: 20px 0 5px !important;
      }
      h1 {
        font-size: 22px !important;
      }
      h2 {
        font-size: 18px !important;
      }
      h3 {
        font-size: 16px !important;
      }
      .container {
        padding: 0 !important; width: 100% !important;
      }
      .content {
        padding: 0 !important;
      }
      .content-wrap {
        padding: 10px !important;
      }
      .invoice {
        width: 100% !important;
      }
    }
    </style>
    </head>
    
    <body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6">
    
    <table class="body-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
        <td class="container" width="600" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top">
          <div class="content" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">`

        if(settings.logoUrl && settings.logoUrl !== ''){
            emailTemplate += `<a href="https://www.gowithgeo.com/">
            <img src="${settings.logoUrl}" alt="" style="width:150px">
        </a>`
        }

emailTemplate += `
      <table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff">

            <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">

              <td class="content-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top">

                <meta itemprop="name" content="Confirm Email" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" /><table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">`

                if(settings.topBannerUrl && settings.topBannerUrl !== ''){
                    emailTemplate += `<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                    <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    <img src="${settings.topBannerUrl}" alt="">
                    </td>
                </tr>`
                }

                emailTemplate += `<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">`

                  if(settings.mailBody && settings.mailBody !== ''){
                    emailTemplate += replaceEmailVariables(settings.mailBody, {
                        firstName: input.firstName,
                        invoiceCode: input.invoiceCode,
                        bookingCode: input.bookingCode,
                        packageName: input.packageName,
                    })
                    
                  } else {
                    emailTemplate += `Hello ${input.firstName},

                    <p>Your flight booking on Geotravel has been created successfully with the following details.</p>
        
                    <p>Booking code: <strong>${input.bookingCode}</strong></p>
                    <p>Package: <strong>${input.packageName}</strong></p>
                    <br>
                    <p>Invoice code: <strong>${input.invoiceCode}</strong></p>
                    `
                  }
                  emailTemplate += `</td>
                </tr>
                `
                if(settings.emailAction.showActionButton === true){
                emailTemplate += `<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" itemprop="handler" itemscope itemtype="http://schema.org/HttpActionHandler" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    <a href="${settings.emailAction.buttonUrl + input?.invoiceCode}" class="btn-primary" itemprop="url" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 5px; text-transform: capitalize; background-color: #348eda; margin: 0; border-color: #348eda; border-style: solid; border-width: 10px 20px;">${settings.emailAction.buttonLabel}</a>
                    </td>
                </tr>
                `}
              emailTemplate += `<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
              &mdash; The GeoTravel Team
            </td>
          </tr></table></td>
    </tr>
    </table>
    
    <div class="footer" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;">`

            if(settings.socialMedia.showSocialLinks === true){
              emailTemplate += `<table width="100%" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                  <td class="aligncenter content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">`
                  if(settings.socialMedia.links.filter((link)=>{return link.title === 'twitter'}).length > 0){
                    emailTemplate += `<a href="${settings.socialMedia.links.filter((link)=>{return link.title === 'twitter'})[0].url}" style="margin-right: 10px; display: inline-block">
                      <img src=https://cdn.freebiesupply.com/logos/large/2x/twitter-logo-png-transparent.png" alt="twitter" style="width: 50px">
                    </a>`
                  }
                  if(settings.socialMedia.links.filter((link)=>{return link.title === 'facebook'}).length > 0){
                    emailTemplate += `<a href="${settings.socialMedia.links.filter((link)=>{return link.title === 'facebook'})[0].url}" style="margin-right: 10px; display: inline-block">
                      <img src="https://cdn.freebiesupply.com/logos/thumbs/2x/facebook-logo-2019-thumb.png" alt="facebook" style="height: 35px">
                    </a>`
                  }
                  if(settings.socialMedia.links.filter((link)=>{return link.title === 'instagram'}).length > 0){
                    emailTemplate += `<a href="${settings.socialMedia.links.filter((link)=>{return link.title === 'instagram'})[0].url}" style="margin-right: 10px; display: inline-block">
                      <img src="https://logos-world.net/wp-content/uploads/2020/04/Instagram-icon-Logo-2016-present.png" alt="instagram" style="height: 35px">
                    </a>`
                  }
                  if(settings.socialMedia.links.filter((link)=>{return link.title === 'youtube'}).length > 0){
                    emailTemplate += `<a href="${settings.socialMedia.links.filter((link)=>{return link.title === 'youtube'})[0].url}" style="margin-right: 10px; display: inline-block">
                      <img src="https://cdn.freebiesupply.com/logos/large/2x/youtube-icon-logo-png-transparent.png" alt="youtube" style="height: 35px">
                    </a>`
                  }
                  if(settings.socialMedia.links.filter((link)=>{return link.title === 'linkedin'}).length > 0){
                    emailTemplate += `<a href="${settings.socialMedia.links.filter((link)=>{return link.title === 'linkedin'})[0].url}" style="margin-right: 10px; display: inline-block">
                      <img src="https://cdn.freebiesupply.com/logos/large/2x/linkedin-icon-logo-png-transparent.png" alt="linkedin" style="height: 35px">
                    </a>`
                  }
                    emailTemplate += `</td>
                </tr>
              </table>`
            }
            emailTemplate += `
          </div></div>
        </td>
        <td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
      </tr></table></body>
    </html>`

    return emailTemplate
}