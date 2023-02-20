import { BaseScene, Markup } from "telegraf";
import { BotContext, Recharge } from "../../../type";
import CustomeError from "../../errorHandler";
import orderModel from "../../model/order";
import userModel from "../../model/user";
import { initiatePayment } from "../../services/payment";
import { getAirtimePlans, getDataPlans } from "../../services/vtuService";
import { extractDataPlanFromString } from "../../utils";
import { mustHaveAnAccount } from "../middleware/auth";
import { getRechargePaymentTemplate } from "../templates";

const rechargeScene = new BaseScene<BotContext>("scene:recharge");

rechargeScene.use(mustHaveAnAccount);

rechargeScene.command("quit", (ctx) => {
  ctx.scene.leave();
  ctx.scene.reset();
});

rechargeScene.leave((ctx) => ctx.reply("Recharge Terminated"));

rechargeScene.enter(async (ctx) => {
  /**
   * Saving the chat id of the user in the session. so it can be sent with the order.
   * The chat id will be used to send the user feedback after payment verification
   * in the gateway(paystack) webhook
  */
  ctx.session.recharge = {} as Recharge
  ctx.session.recharge.chat_id = ctx.chat?.id;


  ctx.reply(
    "Select your network provider",
    Markup.inlineKeyboard([
      [Markup.callbackButton("MTN", "MTN")],
      [Markup.callbackButton("AIRTEL", "AIRTEL")],
      [Markup.callbackButton("GLO", "GLO")],
      [Markup.callbackButton("9MOBILE", "9MOBILE")],
    ]).extra()
  );
});

rechargeScene.action(/^(MTN|AIRTEL|GLO|9MOBILE)$/, async (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();
  console.log(ctx.match);
  const provider = ctx.match && ctx.match[0] as string;
  ctx.session.recharge.provider = provider?.toLowerCase() as string;
  ctx.reply(
    "Select recharge option",
    Markup.inlineKeyboard([
      [Markup.callbackButton("I want to buy Mobile DATA", "DATA")],
      [Markup.callbackButton("I want to buy AIRTIME", "AIRTIME")],
    ]).extra()
  );
});

rechargeScene.action(/^(DATA|AIRTIME)$/, async (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();
  const type = ctx.match && ctx.match[0] as string;
  ctx.session.recharge.type = type?.toLowerCase() as string;

  if (type === "AIRTIME") {
    const airtimes = await getAirtimePlans();
    const airtimeToKeyboard = airtimes.map((airtime) => [
      Markup.callbackButton(airtime.toString(), `amount:${airtime}`),
    ]);
    ctx.reply(
      "Select your airtime recharge plan",
      Markup.inlineKeyboard(airtimeToKeyboard).extra()
    );
  }

  if (type === "DATA") {
    const plans = await getDataPlans();
    const plansToKeyboard = plans
      .filter(
        (plan) => plan.provider.toLowerCase() === ctx.session.recharge.provider
      )
      .map((plan) => [
        Markup.callbackButton(`${plan.title}`, `plan:${plan.code}`),
      ]);

    ctx.reply(
      "Select your data recharge plan",
      Markup.inlineKeyboard(plansToKeyboard).extra()
    );
  }
});

rechargeScene.action(/(^plan:([0-9a-zA-Z_]*)|amount:(\d+))$/, async (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage();

  if (ctx.session.recharge.type === "data") {
    const code = ctx.match && ctx.match[2] as string;
    const plan = (await getDataPlans()).find(
      (p) => p.code.toLowerCase() == code?.toLowerCase()
    );

    if (!plan) throw new CustomeError("Error. Command was not understood");

    ctx.session.recharge.code = plan.code;
    ctx.session.recharge.amount = plan.amount.toString();
  } else {
    ctx.session.recharge.amount = (ctx.match && ctx.match[3]) as string;
  }

  ctx.reply("Enter phone number to recharge");
});

rechargeScene.on("text", (ctx) => {
  const phoneNumber = ctx.message?.text as string;

  if (!/^\d{11}$/.test(phoneNumber)) {
    return ctx.reply(
      "Invalid phone number. Please enter a valid 11-digit phone number:"
    );
  }

  ctx.session.recharge.phone = phoneNumber;
  const { provider, amount, phone, code } = ctx.session.recharge;
  let message = "";

  if (ctx.session.recharge.type === "data") {
    const data_plan = extractDataPlanFromString(code);
    message = `You are about to recharge ${provider} ${data_plan} to ${phone}. Do you want to proceed ?`;
  } else {
    message = `You are about to recharge ${provider} N${amount} to ${phone}. Do you want to proceed ?`;
  }

  ctx.reply(
    message,
    Markup.inlineKeyboard([
      [Markup.callbackButton("Yes", "Yes")],
      [Markup.callbackButton("No", "No")],
    ]).extra()
  );
});

rechargeScene.action(/^(Yes|No)$/, async (ctx) => {
  ctx.answerCbQuery();
  ctx.deleteMessage()

  if(ctx.match && ctx.match[0] === 'No'){
    return ctx.scene.leave()
  }

  const recharge = ctx.session.recharge;

  const user = await userModel.findBy(
    "telegram_id",
    ctx.from?.id.toString() as string
  );
  
  const order = await orderModel.createVtu(user.id, ctx.session.recharge);

  if(!order) return ctx.reply('Something went wrong. Failed to create order')

  //generate payment for order
  const payment = await initiatePayment(
    user.email,
    order.total,
    order.reference
  );

  //reply with button to pay and verify payment
  ctx.replyWithHTML(
    getRechargePaymentTemplate({ ...recharge, reference: order.reference }),
    Markup.inlineKeyboard([
      [Markup.urlButton("PROCEED TO PAYMENT", payment.authorization_url)],
    ]).extra()
  );

  return ctx.scene.leave()
});

export default rechargeScene;
