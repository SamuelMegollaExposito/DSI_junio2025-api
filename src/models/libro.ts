import { Document, Schema, model, Types } from "mongoose";

interface LibroDocument extends Document {
  titulo: string,
  autor: string,
  año: number,
  editorial: string,
  paginas: number,
  generos: string[];
  reseñas: { lector: Types.ObjectId; calificacion: number; comentario: string }[];
}

const LibroSchema = new Schema<LibroDocument>({
  titulo: {
    type: String,
    requiered: true, 
    trim: true
  },
  autor: {
    type: String,
    requierd: true,
    trim: true
  },
  año: {
    type: Number,
    requiered: true,
  },
  editorial: {
    type: String,
    requiered: true,
    trim: true
  }, 
  generos: {
    type: [String],
    requiered: true,
    enum: ["ficción" , "no ficción" , "historia" , "aventura" , "ciencia" , "fantasía" , "biografía"]
  },
  reseñas: [{
    lector: { type: Schema.Types.ObjectId, ref: 'Lector', required: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, required: true }
  }]

});

export const Libro = model<LibroDocument>("Libro" , LibroSchema);