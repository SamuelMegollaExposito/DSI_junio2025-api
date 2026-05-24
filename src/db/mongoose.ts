import { connect } from 'mongoose';

export const connectDB = async () => {
  try {
    // Usamos 127.0.0.1 para evitar problemas de resolución de nombres
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/book-api';
    
    console.log(`Attempting to connect to: ${mongoUrl}`); // Log de depuración
    
    await connect(mongoUrl);
    console.log('Connection to MongoDB established');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // No salgas del proceso aquí para que el servidor pueda intentar reconectar
  }
};