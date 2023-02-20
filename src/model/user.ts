import { log } from "../config/logger"
import CustomeError from "../errorHandler"
import { supabase } from "../services/supabase"
import BaseModel from "./base"

class User extends BaseModel{
    table = 'users'
    
    async createAccountWithEmailAndTelegram(email:string, telegram_id:string, name = ''){
        const {data:user} = await supabase
            .from(this.table)
            .select()
            .or(`telegram_id.eq.${telegram_id}, email.eq.${email}`)
            .single()

        if(user){
            throw new CustomeError('Account already registered')
        }

        const {data, error, status} = await supabase.from('users').insert({
            email, telegram_id, name
        }).select().single()

        if(error){
            log(error)
            return null
        }

        return data
    }
}

const userModel = new User

export default userModel