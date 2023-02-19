import { Recharge } from "../../type"
import CustomeError from "../errorHandler"
import { supabase } from "../services/supabase"
import { generatePaymentReference } from "../utils"
import BaseModel from "./base"

class Order extends BaseModel{
    table = 'sales'
    
    async createVtu(user_id: string|number, item:Recharge){
        return await this.create({
            items: JSON.stringify([item]), 
            total: item.amount,
            user_id,
            reference: generatePaymentReference()
        })
    }

    async isValid(order:any){
           if(!order){
                return false
            }

            if(order.status != 0){
                return false
            }

            return true
    }
}

const orderModel = new Order

export default orderModel