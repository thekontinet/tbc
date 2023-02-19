import Paystack from "paystack";
import config from "../config";

const paymentGateway = Paystack(config.app.paystack.key);

export const initiatePayment = async (email: string, amount: number, reference:string) => {
  const amountInKb = amount * 100;
  const {
    data: payment,
    status,
    message,
  } = await paymentGateway.transaction.initialize({
    email,
    amount: amountInKb,
    reference,
    name: "Telebot Payment",
    callback_url: "https://t.me/rolombot",
  });

  if (!status) {
    throw new Error(message);
  }

  return payment;
};

export const verifyTransaction = async (reference:string) => {
    const {
      data: payment,
      status,
      message,
    } = await paymentGateway.transaction.verify(reference);
  
    if (!status || payment.status !== 'success') {
      throw new Error(message);
    }
  
    return payment;
};