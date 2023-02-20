import { log } from "../config/logger"
import { supabase } from "../services/supabase"

class BaseModel {
    table = ''

    async create(insertData:any){
        const {data, status, error} = await supabase.from(this.table)
            .insert(insertData)
            .select()
            .single()
        
        if(error){
            log(error);
            return null
        }

        return data
    }
    
    async find(value:string, column = 'id'){
        const {data, status, error} = await supabase.from(this.table).select().eq(column, value).single()

        if(error){
            log(error);
            return null
        }

        return data
    }

    async findBy(column:string, value:string){
        const {data, status, error} = await supabase.from(this.table)
            .select()
            .eq(column, value)
            .single()
            
        if(error){
            log(error);
            return null
        }

        return data;
    }

    async existsWith(column:string, value:string){
        const {data, status, error} = await supabase.from(this.table)
            .select()
            .eq(column, value)
            
        if(error){
            log(error);
            return null
        }

        return data.length >= 1;
    }

    async update(id:string, dataset: any){
        const {data, status, error} = await supabase.from(this.table)
            .update(dataset)
            .eq('id', id)
            .select()
            .single()      
            
        if(error){
            log(error);
            return null
        }

        return data;
    }
}

export default BaseModel