import axios from "axios"
import { Recharge } from "../../type"
import config from "../config"
import redisCache from "./cache"

const axiosInstace = axios.create({
    baseURL: 'https://www.airtimenigeria.com/api/v1/',
    headers: {
        "Authorization": `Bearer ${config.app.vtu.key}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    validateStatus(status) {
        return status < 500
    },
})

type DataPlanItem = {
    provider: string,
    title: string,
    code: string,
    amount: number
}

export const getAirtimePlans = async () => [500, 1000, 1500, 5000, 10000]

export const getDataPlans = async ():Promise<DataPlanItem[]> => {
    const cacheKey = 'vtu_data_plans_x'

    if(await redisCache.has(cacheKey)){
        return await redisCache.get(cacheKey)
    }

    const {data} = await axiosInstace.get(`data/plans`)    

    const transformedData = data.data.map((plan: any) => {
        const title = plan.plan_summary.replace(':', '').split('|').slice(0,1).join(' ')
        const amount = plan.regular_price + 15
        return {
            provider: plan.network_operator,
            title: `${title} - N${amount} - ${plan.validity}`,
            code: plan.package_code,
            amount
        }
    })

    await redisCache.set(cacheKey, transformedData, 10)

    return transformedData
}

export const sendData = async (phones: string[], package_code:string, reference:string) => {
const body = {
        "network_operator": package_code.split('_')[0]?.toUpperCase(),
        "phone": phones.join(','),
        "package_code": package_code,
        "customer_reference": reference,
    };

    const {data} = await axiosInstace.post('data/purchase', body)

    return data
}

export const sendAirtime = async (phones: string[], provider:string, amount:number, reference:string) => {
  
    const body = {
        "network_operator": provider,
        "phone": phones.join(', '),
        "amount": amount,
        "customer_reference": reference,
        "max_amount": 5000,
    };

    const {data} = await axiosInstace.post("airtime/purchase", body)
    return data
}

export const getReport = async (reference:string) => {
    const {data} = await axiosInstace.get(`delivery?reference=${reference}`)
    return data
}


export const processRecharge = async (recharge:Recharge, reference:string) => {
    let data

    if(recharge.type.toLowerCase() === 'airtime'){
        data = await sendAirtime(recharge.phone.split(','), recharge.provider, parseInt(recharge.amount), reference)
    }else{
        data = await sendData(recharge.phone.split(','), recharge.code, reference)
    }
    
    return data
}