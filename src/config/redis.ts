import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { REDIS_URL } from "./env.js";

export async function createRedisAdapter(io: any) {
  const pubClient = createClient({ url:REDIS_URL });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

  console.log("✅ Redis adapter connected");
}
