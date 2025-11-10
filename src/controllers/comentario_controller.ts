import { Response, Request } from "express";
import Comentario from "../models/comentarios";
import Publicacion from "../models/publicaciones";
import Usuario from "../models/usuario";
import Persona from "../models/persona";
import coneccion from "../database/coneccion";

//los usuarios pueden agregar comentarios a las publicaciones
export const agregarComentario = async (req: Request, res: Response) => {
  const transaccion = await coneccion.transaction();
  try {
    const { id_publicacion, id_usuario, contenido } = req.body;

    const nuevaComentario = await Comentario.create({
      id_publicacion,
      id_usuario,
      contenido
    }, { transaction: transaccion });

    await transaccion.commit();

    res.status(201).json({
      message: "Comentario agregado exitosamente",
      data: nuevaComentario,
    });
  } catch (error: any) {
    await transaccion.rollback();
    res.status(500).json({
      message: "Error al agregar el comentario",
      error: error.message,
    });
  }
};

export const obtenerComentariosPorPublicacion = async (req: Request, res: Response) => {
  try {
    const { id_publicacion } = req.params;

    const comentarios = await Comentario.findAll({
      where: { id_publicacion },
      include: [
        {
          model: Usuario,
          include: [Persona]
        }
      ],
      order: [['fecha_comentario', 'DESC']]
    });

    res.status(200).json({
      message: "Comentarios obtenidos exitosamente",
      data: comentarios,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener los comentarios",
      error: error.message,
    });
  }
};

export const obtenerComentariosPorUsuario = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;

    const comentarios = await Comentario.findAll({
      where: { id_usuario },
      include: [
        {
          model: Publicacion
        }
      ],
      order: [['fecha_comentario', 'DESC']]
    });

    res.status(200).json({
      message: "Comentarios obtenidos exitosamente",
      data: comentarios,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener los comentarios",
      error: error.message,
    });
  }
};

export const editarMiComentario = async (req: Request, res: Response) => {
  const transaccion = await coneccion.transaction();
  try {
    const { id_comentario } = req.params;
    const { id_usuario, contenido } = req.body;

    const comentario = await Comentario.findByPk(id_comentario);

    if (!comentario) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    if (comentario.id_usuario !== id_usuario) {
      return res.status(403).json({ message: "No tienes permiso para editar este comentario" });
    }

    comentario.contenido = contenido || comentario.contenido;

    await comentario.save({ transaction: transaccion });

    await transaccion.commit();

    res.status(200).json({
      message: "Comentario editado exitosamente",
      data: comentario,
    });
  } catch (error: any) {
    await transaccion.rollback();
    res.status(500).json({
      message: "Error al editar el comentario",
      error: error.message,
    });
  }
};

export const eliminarMiComentario = async (req: Request, res: Response) => {
  const transaccion = await coneccion.transaction();
  try {
    const { id_comentario } = req.params;
    const { id_usuario } = req.body;

    const comentario = await Comentario.findByPk(id_comentario);

    if (!comentario) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    if (comentario.id_usuario !== id_usuario) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este comentario" });
    }

    await comentario.destroy({ transaction: transaccion });

    await transaccion.commit();

    res.status(200).json({
      message: "Comentario eliminado exitosamente",
    });
  } catch (error: any) {
    await transaccion.rollback();
    res.status(500).json({
      message: "Error al eliminar el comentario",
      error: error.message,
    });
  }
};