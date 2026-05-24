import { Document, Schema, model } from "mongoose";

interface LectorDocument extends Document{
  nombre: string,
  username: string,
  email: string,
  generosFavoritos: string[],
}

const LectorSchema = new Schema<LectorDocument>({

  nombre: {
    type: String,
    requiered: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    requiered: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    requiered: true,
    trim: true,
    validate: (value: string) => {
      if (!value.includes("@")) throw new Error('Email no válido');
    }
  },
  generosFavoritos: {
    type: [String],
    required: true,
    enum: ["ficción", "no ficción", "historia", "aventura", "ciencia", "fantasía", "biografía"]
  }
});

export const Lector = model<LectorDocument>("Lector", LectorSchema);