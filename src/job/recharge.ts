// import { Queue, Worker } from "bullmq";
// import config from "../config";

// const connection = {
//   host: config.app.redis.host,
//   port: config.app.redis.port,
//   password: config.app.redis.password,
// };

// const rechargeQueue = new Queue("recharge", {
//   connection,
//   defaultJobOptions: {
//     attempts: 5,
//     backoff: {
//         type: 'exponential',
//         delay: 3000,
//     },
//   }
// });

// const worker = new Worker(
//   "recharge",
//   async (job) => {
//     console.log('Processing... ' + job.id);
//     throw new Error('wicked')
//   },
//   {
//     connection,
//   }
// );

// worker.addListener('completed', function(){
//     console.log('holla');
// })

// export default rechargeQueue;
