import { Application } from "express"
import { Telegraf, Stage } from "telegraf"
import config from "../config";
import { BotContext } from "../../type";
import LocalSession from "telegraf-session-local";
import registerScene from "./scenes/registerScene";
import CustomeError from "../errorHandler";
import rechargeScene from "./scenes/rechargeScene";
import { log } from "../config/logger";

const botSetup = (bot: Telegraf<BotContext>) => {
    const session = new LocalSession<BotContext>()
    const stage = new Stage([
        registerScene,
        rechargeScene
    ])
    
    bot.use(session.middleware())
    bot.use(stage.middleware())

    bot.command('register', ctx => ctx.scene.enter(registerScene.id))
    bot.command('recharge', ctx => ctx.scene.enter(rechargeScene.id))

    bot.telegram.setMyCommands([
        {command:'register', description: 'Create a new account'},
        {command:'recharge', description: 'Buy Airtime and Data'},
        {command:'quit', description: 'Exit or terminate a process'},
    ])

    bot.catch((error: any, ctx:BotContext) => {
        if(error instanceof CustomeError){
            ctx.scene.leave()
            return ctx.reply(error.message)
        }
        log(error);
    })


    if(process.env.NODE_ENV == 'production'){
        bot.telegram.setWebhook(`${config.app.bot.webhookURL}/${config.app.bot.webhookPath}`)
    }else{
        bot.launch()
    }

}

export default botSetup