import { Response, Request } from "express";
import SuscripcionPeriodista from "../models/suscripciones_periodistas";
import Usuario from "../models/usuario";
import coneccion from "../database/coneccion";

//un usuario puede suscribirse a un periodista para recibir notificaciones de sus publicaciones
export const suscribirsePeriodista = async (req: Request, res: Response) => {
  const transaccion = await coneccion.transaction();
  try {
    const { id_usuario, id_periodista } = req.body;

    //verificar que no exista la suscripcion previa
    const suscripcionExistente = await SuscripcionPeriodista.findOne({
      where: {
        id_usuario_comun: id_usuario,
        id_periodista: id_periodista
      }
    });

    if (suscripcionExistente) {
      await transaccion.rollback();
      return res.status(400).json({
        message: "Ya estás suscrito a este periodista"
      });
    }

    const nuevaSuscripcion = await SuscripcionPeriodista.create({
      id_usuario_comun: id_usuario,
      id_periodista: id_periodista
    }, { transaction: transaccion });       

    await transaccion.commit();
    return res.status(201).json({
      message: "Suscripción creada exitosamente",
      data: nuevaSuscripcion
    });
  } catch (error: any) {
    await transaccion.rollback();
    res.status(500).json({
      message: "Error al crear la suscripción",
      error: error.message,
    });
  }
};

//el usuario puede ver a que periodistas esta suscrito
export const obtenerSuscripcionesUsuario = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;

    const suscripciones = await SuscripcionPeriodista.findAll({
      where: { id_usuario_comun: id_usuario },
      include: [
        {
          model: Usuario,
          as: 'periodista',
          attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario']
        }
      ]
    });

    res.status(200).json({
      message: "Suscripciones obtenidas exitosamente",
      data: suscripciones,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener las suscripciones",
      error: error.message,
    });
  }
};

//el usuario puede cancelar su suscripcion a un periodista
export const cancelarSuscripcion = async (req: Request, res: Response) => {
  const transaccion = await coneccion.transaction();
  try {
    const { id_usuario, id_periodista } = req.body;

    const suscripcion = await SuscripcionPeriodista.findOne({
      where: {
        id_usuario_comun: id_usuario,
        id_periodista: id_periodista
      }
    });

    if (!suscripcion) {
      await transaccion.rollback();
      return res.status(404).json({
        message: "No existe una suscripción a este periodista"
      });
    }

    await suscripcion.destroy({ transaction: transaccion });

    await transaccion.commit();
    return res.status(200).json({
      message: "Suscripción cancelada exitosamente"
    });
  } catch (error: any) {
    await transaccion.rollback();
    res.status(500).json({
      message: "Error al cancelar la suscripción",
      error: error.message,
    });
  }
};