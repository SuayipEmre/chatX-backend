import { createClient } from "redis";
import { REDIS_URL } from "../config/env.js";

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.connect();

export const setUserOnline = async (userId: string, socketId: string) => {
  await redisClient.set(`user:${userId}`, socketId);
};

export const getUserSocket = async (userId: string) => {
  return await redisClient.get(`user:${userId}`);
};

export const removeUserOnline = async (userId: string) => {
  await redisClient.del(`user:${userId}`);
};
