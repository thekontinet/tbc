import path from "path"
import { env } from "../helpers"
export const app = {
    supabase:{
        url: 'https://wxxcbdynnpayydnhlciv.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eGNiZHlubnBheXlkbmhsY2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzY0MDU5NjAsImV4cCI6MTk5MTk4MTk2MH0.7DpxXn17qmVJZJfCa1XCPYkjvtb5ofzBifSkMU2luQU'
    },
    openai:{
        key: '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',
        trainingDataFile: path.normalize("storage/trainings/rolom.txt"),
    },
    bot:{
        webhookURL: env('TELEGRAM_WEBHOOK_URL'),
        webhookPath: env('TELEGRAM_WEBHOOK_PATH'),
        key: env('TELEGRAM_KEY'),
        username: 'rolombot',
        firstname: 'rexa',
    },
    redis:{
        url: env('REDIS_URL'),
        host: env('REDIS_HOST'),
        port: env('REDIS_PORT'),
        password: env('REDIS_PASSWORD')
    },
    paystack:{
        key: env('PAYSTACK_KEY'),
        secret: env('PAYSTACK_SECRET')
    },
    vtu:{
        key: env('VTU_KEY'),
        endpoint: env('VTU_ENDPOINT')
    }
}