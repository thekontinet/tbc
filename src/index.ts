import express, { Request, Response } from 'express'
import crypto from 'crypto'
import { BotContext } from '../type';
import dotenv from 'dotenv'
dotenv.config({ path: __dirname+'/.env' });

import Telegraf from 'telegraf'
import botSetup from './telegram/bot'
import config from './config';
import orderModel from './model/order';
import { getReport, processRecharge } from './services/vtuService';
import { log } from './config/logger';

const app = express()
const bot = new Telegraf  <BotContext>(config.app.bot.key);
const secret = config.app.paystack.secret as string;

// config
botSetup(bot)

// middleware
app.use(bot.webhookCallback(config.app.bot.webhookPath as string))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.get('/', async function(req: Request<{ref:string}>, res, next){
    res.send('Rolom tech app.')
})

// Using Express
app.post("/pay/webhook", async function(req, res) {
    //validate event
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
        // Retrieve the request's body
        const event = req.body;
        // Do something with event
        if(event.event === 'charge.success' && event.data.status === 'success'){
            const reference = event.data.reference
            const order = await orderModel.findBy('reference', reference)
            const isValid = await orderModel.isValid(order)

            if(!isValid){
                return res.sendStatus(200)
            }

            // process the recharge
            const recharge = JSON.parse(order.items).at(0)
            const response = await processRecharge(recharge, order.reference)
            const isSuccess = response.status === 'success'

            await orderModel.update(order.id, {status: isSuccess ? 1 : 0, vtu_response:JSON.stringify(response)})

            if(isSuccess && recharge.chat_id){
                bot.telegram.sendMessage(recharge.chat_id, `Your order has been submited`)
            }else if(!isSuccess && recharge.chat_id){
                bot.telegram.sendMessage(recharge.chat_id, `Your order has been submited, but still pending for approval`)
            }


            return res.sendStatus(200)
        }
        
    }
    res.sendStatus(200);
});


app.use((err:any, res: Response) => {
    log(err.message);
    res.send('Something went wrong')
})



app.listen(3000, function(){
    log('server is running');
})