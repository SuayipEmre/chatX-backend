import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

const conntectDB = async() => {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log('Database connected successfully');
  } catch (error) {
    console.log('Database connection error:', error);
    process.exit(1);
  }
}

export default conntectDB