import { OrderStatusNotificationMailParams } from "../../service/mailer.service";
import { unSlugify } from "../../utils/utils";
// import { replaceDocumentVariables } from "../../utils/utils";


export const OrderStatusNotificationTemplate = (input: OrderStatusNotificationMailParams) => {
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
        
          <div class="content" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">`

emailTemplate += `
      <table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff">

            <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">

                <td class="content-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top">

                    <meta itemprop="name" content="Confirm Email" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" /><table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">`

                    // if(settings.topBannerUrl && settings.topBannerUrl !== ''){
                    //   emailTemplate += `<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                    //   <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    //   <img src="${settings.topBannerUrl}" alt="">
                    //   </td>
                    // </tr>`
                    // }

                    emailTemplate += `
                    <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                        <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                            Hello ${input.orderBy.name}, The status of your order on nadabakehouse has been updated. <br />
                            Your new order status is <strong>${unSlugify(input.newStatus)}</strong>
                        </td>
                    </tr>
                </td>
            </tr>
            `

            emailTemplate += `
            <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    Total Order Amount: ${input.total}
                </td>
            </tr>
            <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    Delivery type: ${unSlugify(input.deliveryType)}
                </td>
            </tr>
            <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    Delivery address: ${input?.deliveryAddress || 'N/A' }
                </td>
            </tr>
            <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                <td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    Payment method: ${unSlugify(input.paymentMethod) }
                </td>
            </tr>
            `

                

            emailTemplate += `</table><div class="footer" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;">`

            emailTemplate += `
          </div></div>

        <td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
      </tr></table>

      <p style="text-decoration: underline;">Items Ordered</p>
      <table>`

        input.items.forEach((item: any, itemIndex: number) => {
            emailTemplate += `
            <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                <td class="content-block" style="width: 5%; font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                ${itemIndex + 1}
                </td>
                <td class="content-block" style="width: 65%; font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    ${item.displayName}
                </td>
                <td class="content-block" style="width: 10%; font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    ${item.quantity}
                </td>
                <td class="content-block" style="width: 20%; font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                    N${item.price.toLocaleString()}
                </td>
            </tr>
            `
        })

      emailTemplate +=`</table>
      </body>
    </html>`

    return emailTemplate
}

