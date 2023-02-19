import { Recharge } from "../../type"
import { extractDataPlanFromString } from "../utils"

export const getRechargePaymentTemplate = (recharge:Recharge & {reference:string}) => {
    const packageName = `${recharge.provider.toUpperCase()} ${
        recharge.type === "data" ? extractDataPlanFromString(recharge.code) : "N" + recharge.amount
    }`
    return (`
Your transaction was initiated successfully. Below is the summary of your order:

<b>Package:</b> ${packageName}
<b>Reference:</b> ${recharge.reference}
<b>Amount:</b> N${recharge.amount}
<b>Phone:</b> ${recharge.phone}
    
To complete your transaction please click on the <b>"PROCEED TO PAYMENT"</b> button below to make payment.
      `)
}