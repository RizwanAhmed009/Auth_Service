const redis = require("redis");
const redisClient = redis.createClient();
redisClient.connect().catch((err) => {
    console.error("Failed to connect with redis client :", err.message);
  });
redisClient.on("connect",()=>{
console.log("Connected to redis ...")
});
redisClient.on("error",(err)=>{
console.error("Error to connect redis:",err.message);
})

module.exports = redisClient;