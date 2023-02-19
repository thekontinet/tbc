import { BotContext } from "../../../type";
import userModel from "../../model/user";

export const mustHaveAnAccount = async (ctx:BotContext, next:any) => {
    const telegram_id = ctx.from?.id.toString() as string;
    const user = await userModel.findBy("telegram_id", telegram_id);
  
    if (!user) {
      ctx.reply("Sorry, you cannot use this service. Please send /register to create account.");
      ctx.scene.reset();
      return ctx.scene.leave();
    }
  
    return next();
  }