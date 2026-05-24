// src/index.ts
import { app } from './app.js';
import { connectDB } from './db/mongoose.js';

const port = process.env.PORT || 3000;

// Arrancamos la conexión
connectDB().then(() => {
  // Solo cuando la promesa de conexión se resuelve, escuchamos en el puerto
  app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });
}).catch(err => {
  console.error("Failed to start server due to DB connection error", err);
});