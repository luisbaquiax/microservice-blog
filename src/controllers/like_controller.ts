import { Response, Request } from "express";
import Like from "../models/likes";
import coneccion from "../database/coneccion";
import { connectRedis, client } from "../database/redis";

export const darLike = async (req: Request, res: Response) => {
  var transaccion = await coneccion.transaction();
  let terminado = false;
  try {
    const { id_usuario, id_publicacion } = req.body;

    // Verificar si el usuario ya le dio like a la publicación
    const likeExistente = await Like.findOne({
      where: { id_usuario, id_publicacion }
    });

    if (likeExistente) {
      await transaccion.rollback();
      terminado = true;
      return res.status(400).json({ message: "El usuario ya ha dado like a esta publicación" });
    }

    const nuevoLike = await Like.create({
      id_usuario,
      id_publicacion
    }, { transaction: transaccion });

    await transaccion.commit();
    terminado = true;

    //registra en redis
    const contadorKey = `likes_count:${id_publicacion}`;

    const nuevoTotalLikes = await client.incr(contadorKey);

    const usuariosKey = `usuarios_like:${id_publicacion}`;

    await client.sAdd(usuariosKey, id_usuario.toString());

    res.status(201).json({
      message: "Like agregado exitosamente",
      data: nuevoLike,
    });
  } catch (error: any) {
    if (!terminado) {
      await transaccion.rollback();
    }
    res.status(500).json({
      message: "Error al agregar el like",
      error: error.message,
    });
  }
};

export const quitarLike = async (req: Request, res: Response) => {
  var transaccion = await coneccion.transaction();
  let terminado = false;
  try {
    const { id_usuario, id_publicacion } = req.body;

    const like = await Like.findOne({
      where: { id_usuario, id_publicacion }
    });

    if (!like) {
      await transaccion.rollback();
      terminado = true;
      return res.status(404).json({ message: "Like no encontrado para este usuario y publicación" });
    }

    await like.destroy({ transaction: transaccion });

    await transaccion.commit();
    terminado = true;

    // Eliminar like de redis y decrementar el contador de likes
    const contadorKey = `likes_count:${id_publicacion}`;
    const usuariosKey = `usuarios_like:${id_publicacion}`;

    const nuevoTotalLikes = await client.decr(contadorKey);
    
    await client.sRem(usuariosKey, id_usuario.toString());


    res.status(200).json({
      message: "Like eliminado exitosamente",
    });
  } catch (error: any) {
    if (!terminado) {
      await transaccion.rollback();
    }
    res.status(500).json({
      message: "Error al eliminar el like",
      error: error.message,
    });
  }
};

export const verificarSiYaDioLike = async  (req: Request, res: Response) => {
  try {
    var id_usuario = req.params.id_usuario;
    var id_publicacion = req.params.id_publicacion;
    // Verificar si el usuario ya le dio like a la publicación
    const likeExistente = await Like.findOne({
      where: { id_usuario, id_publicacion }
    });
    if (likeExistente) {
      return res.status(200).json({ yaDioLike: true });
    } else {
      return res.status(200).json({ yaDioLike: false });
    }
  } catch (error: any) {
    res.status(500).json({
      message: "Error al verificar el like",
      error: error.message,
    });
  }
}