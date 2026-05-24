import express from "express";
import "../db/mongoose.js";
import { Lector } from "../models/lector.js";
import { Libro } from "../models/libro.js";

export const lectorRouter = express.Router();

// Crear un lector
lectorRouter.post("/lectores" , async (req, res) => {
  try {
    const lector = new Lector(req.body);
    await lector.save();
    return res.status(201).send(lector);
  } catch (error){
    return res.status(400).send({
      msg: "Error al crear el lector",
    error: (error as any).message 
    });
  }
});


// Obtener lector (Todos o por username via query)
lectorRouter.get('/lectores', async (req, res) => {
  try {
    // 1. Extraemos el username de la query string (?username=...)
    const usernameQuery = req.query.username;

    // 2. Construimos el filtro de búsqueda
    // Si existe el username en la query, filtramos. Si no, pasamos un objeto vacío {}
    const filter = usernameQuery ? { username: usernameQuery.toString() } : {};

    // 3. Ejecutamos la búsqueda con el filtro
    const lectores = await Lector.find(filter);

    // 4. Si no hay resultados, error 404
    if (lectores.length === 0) {
      return res.status(404).send({ 
        msg: usernameQuery ? `No existe el lector ${usernameQuery}` : "No hay lectores en la base de datos" 
      });
    }

    // 5. Devolvemos el array de resultados
    return res.send(lectores);
  } catch (error) {
    return res.status(500).send({
      msg: "Error al buscar lectores",
      error: (error as any).message
    });
  }
});

// Actualizar la informacion de un lector por su nombre de usuario haciendo uso de una query string
lectorRouter.patch("/lectores", async (req, res) => {

  // primero verificamos que se haya proporcionado el username en la query
  if (!req.query.username) {
    return res.status(400).send({ msg: "Se debe proporcionar un nombre de usuario (username)"});
  }

  // Definimos los campos que se pueden actualizar
  const updates = Object.keys(req.body);
  const allowedUpdates = ["nombre", "email" , "generosFavoritos"];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if( !isValidOperation) {
      return res.status(400).send({
        msg: "Actualizacion no permitida. Solo puedees cambiar: " + allowedUpdates.join(",")
      });
  }

  // Ahora buscamos y actualizamos
  try{
    const lector = await Lector.findOneAndUpdate(
      {username: req.query.username.toString()},
      req.body,
      {
        new: true, // para que devuelva el objeto ya actualizado
        runValidator: true // para que valide el email y los enums al actualizar
      }
    );

    if(!lector) {
      return res.status(400).send({msg: "Lector no encontrado"});
    }
    return res.send(lector);

  } catch (error) {
    return res.status(400).send(error);
  }
});

// Borrar lector (query) + Cascada
lectorRouter.delete("/lectores", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).send({ error: "A username must be provided" });
  }

  try {
    // 1. Intentamos borrar directamente. findOneAndDelete devuelve el objeto borrado o null.
    const lectorBorrado = await Lector.findOneAndDelete({ 
      username: username.toString() 
    });

    // 2. Si es null, es que no existía. Devolvemos 404 y cortamos la ejecución.
    if (!lectorBorrado) {
      return res.status(404).send({ error: "User not found" });
    }

    // 3. Si llegamos aquí, TypeScript SABE que lectorBorrado NO es null.
    // Procedemos con la cascada usando el ID del lector que acabamos de borrar.
    await Libro.updateMany(
      {}, 
      { $pull: { reseñas: { lector: lectorBorrado._id } } }
    );

    // 4. Respondemos con el objeto que fue eliminado
    return res.send(lectorBorrado);

  } catch (error) {
    return res.status(500).send(error);
  }
});