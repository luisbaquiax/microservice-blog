import { Response, Request } from "express";
import HistorialLectura from "../models/historial_lectura";
import conneccion from "../database/coneccion";
import Publicacion from "../models/publicaciones";

//agregar una publicacion al historial de lectura de un usuario
//esto se hace cada vez que un usuario lee una publicacion haciendo click en "ver publicacion"
//o el link que lo redirecciona a la publicacion
export const agregarHistorialLectura = async (req: Request, res: Response) => {
  var transaccion = await conneccion.transaction();
  try {
    const { id_usuario, id_publicacion } = req.body;

    const nuevoHistorial = await HistorialLectura.create({
      id_usuario,
      id_publicacion,
    });
    await transaccion.commit();
    return res.status(201).json({
      message: "Publicación agregada al historial de lectura"
    });
  } catch (error: any) {
    await transaccion.rollback();
    res.status(500).json({
      message: "Error al agregar al historial de lectura",
      error: error,
    });
  }
};

// reporte de publicaciones mas leidas por los usuarios
// el administrador puede ver un reporte de las publicaciones más leídas por los usuarios
// para identificar tendencias y popularidad de contenido, y mostra en la pagina de inicio todos los usuarios
// las publicaciones mas leidas
// al hacer click ver pubicacion lo redirecciona a la publicacion para poer leerla
export const reportePublicacionesMasLeidas = async (req: Request, res: Response) => {
  try {
    const publicacionesMasLeidas = await HistorialLectura.findAll({
      include: [
        {
          model: Publicacion,
          // Seleccionamos los campos para mostrarlos en el reporte
          attributes: ['titulo', 'contenido', 'tipo_publicacion', 'orientacion_politica']
        }
      ],
      attributes: [
        // 1. Especificar la columna de la tabla principal para evitar ambigüedad.
        'HistorialLectura.id_publicacion', 
        [HistorialLectura.sequelize!.fn('COUNT', HistorialLectura.sequelize!.col('HistorialLectura.id_publicacion')), 'cantidad_lecturas']
      ],
      // 2. Agrupar por la clave foránea (no ambigua) y por la clave primaria 
      //    de la tabla incluida (Publicacion) y sus atributos.
      //    Generalmente, agrupar por la PK de la tabla incluida es suficiente, 
      //    pero incluiremos el resto para la máxima compatibilidad.
      group: [
          'HistorialLectura.id_publicacion', 
          'Publicacion.id_publicacion', // Clave primaria de Publicacion
          'Publicacion.titulo', 
          'Publicacion.contenido', 
          'Publicacion.tipo_publicacion', 
          'Publicacion.orientacion_politica'
      ],
      order: [[HistorialLectura.sequelize!.fn('COUNT', HistorialLectura.sequelize!.col('HistorialLectura.id_publicacion')), 'DESC']],
      //limit: 10
    });

    return res.status(200).json({
      message: "Reporte de publicaciones más leídas generado exitosamente",
      data: publicacionesMasLeidas,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error al generar el reporte de publicaciones más leídas",
      error: error.message,
    });
  }
};