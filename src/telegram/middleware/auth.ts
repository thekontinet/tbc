import { BotContext } from "../../../type";
import userModel from "../../model/user";

export const mustHaveAnAccount = async (ctx:BotContext, next:any) => {
    const telegram_id = ctx.from?.id.toString() as string;
    const userExists = await userModel.existsWith("telegram_id", telegram_id);
  
    if (!userExists) {
      ctx.reply("Sorry, you have to create an account first, to start using this service. Send /register to create an account");
      ctx.session.referer = ctx.scene.current?.id as string
      ctx.scene.reset();
      return ctx.scene.leave();
    }
  
    return next();
  }