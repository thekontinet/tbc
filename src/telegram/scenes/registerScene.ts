import {BaseScene} from 'telegraf'
import { BotContext } from '../../../type'
import userModel from '../../model/user'
import validator from 'validator'

const registerScene = new BaseScene<BotContext>('scene:register')

registerScene.hears(/quit/i, ctx => {
    ctx.scene.leave()
    ctx.scene.reset()
})

registerScene.leave(ctx => {
    ctx.scene.reset()
    ctx.reply("Registration Terminated")
})

registerScene.enter(ctx => {
    return ctx.reply('Please enter your email address to create an account:')
})

registerScene.on('text', async ctx => {
    const email = ctx.message?.text as string
    const telegram_id = ctx.from?.id.toString() as string
    const name = ctx.from?.first_name.toString() as string

    if(!validator.isEmail(email)){
        return ctx.reply('Invalid email address. Please provide a valid email address')
    }

    const user = await userModel.createAccountWithEmailAndTelegram(email, telegram_id, name)

    /**
     * @todo Send verification email to the user and create a different scene to verify.
     * User should not be able to perform any transactions without a verified account
     */


    ctx.reply(`Welcome ${user.name}, Your account was created successsfully`)
    return ctx.scene.leave()
})

export default registerScene