import { Context } from "telegraf"
import { SceneContextMessageUpdate } from "telegraf/typings/stage"


type Product = {
    id: string,
    code: string
    title: string,
    price:number,
    category?: string
    description: string
    [key:string]: any
}


export type Recharge = {
    provider: string,
    type: string,
    phone: string,
    amount: string,
    code: string,
    chat_id?: string | number
}

export interface Session {
    recharge: Recharge,
    referer: string
    [key:string]: any
}
  
type BaseBotContext = Context & SceneContextMessageUpdate & {scene:string}
  
export interface BotContext extends BaseBotContext {
    session: Session
}