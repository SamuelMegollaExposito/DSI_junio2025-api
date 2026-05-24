import express from "express";
import "../db/mongoose.js";
import { Libro } from "../models/libro.js";
import { Lector } from "../models/lector.js";

export const libroRouter = express.Router();

// Crear un nuevo libro Se debe comprobar antes que los lectores de reseñas existen previamente en la base de datos
libroRouter.post("/libros", async (req, res) =>{
  try{
    //miramos las reseñas
    if (req.query.reseñas) {
      for( const r of req.body.reseñas) {
        const existe = await Lector.findById(r.lector);
        if (!existe) return res.status(404).send({ msg: `El lector ${r.lector} no existe`});
      }
    }

    const libro = new Libro(req.body);
    await libro.save();
    return res.status(201).send(libro);
  }catch(error){
    return res.status(400).send(error);
  }
});

/* Obtener todos los libros o un libro concreto. En el segundo caso, deberá hacer uso de rutas dinámicas y utilizar un parámetro
id que permita acceder a la información de un libro dado su identificador único. En ambos casos, deberá hacer uso de
populate para mostrar información adicional de los lectores que han realizado reseñas, y no solo mostrar los 
ObjectID correspondientes. */

libroRouter.get("/libros/:id" , async (req, res) => {
  try {
    const libro = await Libro.findById(req.params.id).populate('reseñas.lector');
    if (!libro) return res.status(404).send({ msg: "Libro no encontrado" });
    return res.send(libro);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// 1. Ruta para obtener TODOS
libroRouter.get("/libros", async (req, res) => {
  try {
    const libros = await Libro.find().populate('reseñas.lector');
    return res.send(libros);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * Actualizar un libro por su ID (Ruta dinámica).
 * Valida que los lectores de las reseñas existan antes de modificar.
 */
libroRouter.patch('/libros/:id', async (req, res) => {
  const allowedUpdates = ['titulo', 'autor', 'año', 'editorial', 'paginas', 'generos', 'reseñas'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  // 1. Programación defensiva: Validar campos permitidos
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Actualización no permitida' });
  }

  try {
    // 2. Si se están modificando las reseñas, validar que los lectores existen
    if (req.body.reseñas) {
      for (const resena of req.body.reseñas) {
        // Buscamos cada lector por su ID
        const lectorExiste = await Lector.findById(resena.lector);
        if (!lectorExiste) {
          return res.status(404).send({ 
            error: `El lector con ID ${resena.lector} no existe en la base de datos.` 
          });
        }
      }
    }

    // 3. Intentar la actualización
    const libro = await Libro.findByIdAndUpdate(req.params.id, req.body, {
      new: true,          // Devuelve el libro modificado
      runValidators: true // Ejecuta validaciones del esquema (enums, min/max)
    });

    if (!libro) {
      return res.status(404).send({ error: 'Libro no encontrado' });
    }

    return res.send(libro);
  } catch (error) {
    return res.status(400).send(error);
  }
});

/**
 * Borrar un libro por su ID (Ruta dinámica).
 */
libroRouter.delete('/libros/:id', async (req, res) => {
  try {
    const libro = await Libro.findByIdAndDelete(req.params.id);

    if (!libro) {
      return res.status(404).send({ error: 'Libro no encontrado' });
    }

    return res.send(libro);
  } catch (error) {
    return res.status(500).send(error);
  }
});