import express, { NextFunction, Request, Response } from 'express'
import crypto from 'crypto'
import { BotContext } from '../type';
import dotenv from 'dotenv'
dotenv.config({ path: __dirname + '/../.env' });

import Telegraf from 'telegraf'
import botSetup from './telegram/bot'
import config from './config';
import orderModel from './model/order';
import { processRecharge } from './services/vtuService';
import { log } from './config/logger';

const app = express()
const bot = new Telegraf  <BotContext>(config.app.bot.key);
const secret = config.app.paystack.secret as string;


// middleware
app.use(bot.webhookCallback('/' + config.app.bot.webhookPath))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// config
botSetup(bot)

app.get('/', async function(req: Request<{ref:string}>, res: Response, next:any){
    res.send('Rolom tech app version 1.')
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


app.use((err:any, req: Request, res:Response, next: NextFunction) => {
    log(err);
    res.send('Something went wrong')
})


const PORT = process.env.PORT || 3000
app.listen(PORT, function(){
    log('server is running');
})