import { Response, Request } from "express";
import Publicacion from "../models/publicaciones";
import coneccion from "../database/coneccion";
import { col, literal, Op, where } from "sequelize";
import Usuario from "../models/usuario";
import Persona from "../models/persona";
import { connectRedis, client } from "../database/redis";
import { PublicacionLike } from "../models/publicacion_like";
import PublicacionFoto from "../models/publicacion_fotos";
import Denuncia from "../models/denuncias";
import env from 'dotenv';
env.config();

const type = process.env.TYPE;

//el usuario de tipo periodista puede crear publicaciones de tipo NOTICIA, ARTICULO o FORO, no puede agregar orientación política
export const crearPublicacion = async (req: Request, res: Response) => {
  const transaccion = await coneccion.transaction();
  try {
    const { id_usuario, tipo_publicacion, titulo, contenido, visibilidad, id_evento } = req.body;

    const nuevaPublicacion = await Publicacion.create({
      id_usuario,
      tipo_publicacion,
      titulo,
      contenido,
      visibilidad,
      id_evento_asociado: id_evento
    });
    //si el tipo de publicacion es ARTICULO o FORO, se aprueba automaticamente
    if (nuevaPublicacion.tipo_publicacion == 'ARTICULO' || nuevaPublicacion.tipo_publicacion === 'FORO') {
      nuevaPublicacion.estado = 'APROBADO';
    }
    //asegurar transaccion
    await nuevaPublicacion.save({ transaction: transaccion });
    await transaccion.commit();
    res.status(201).json({
      message: "Publicación creada exitosamente",
      data: nuevaPublicacion,
    });
  } catch (error: any) {
    await transaccion.rollback();
    res.status(500).json({
      message: "Error al crear la publicación",
      error: error.message,
    });
  }
};

//al administrador le aparecerán las publicaciones con denuncias para que pueda cambiar su estado a ELIMINADO o APROBADO
//si un publicacion tiene denuncias, el admin puede cambiar su estado a ELIMINADO.
export const cambiarEstadoPublicacion = async (req: Request, res: Response) => {
  const transaccion = await coneccion.transaction();
  try {
    const { id_publicacion } = req.params;
    const { nuevo_estado } = req.body;

    const publicacion = await Publicacion.findByPk(id_publicacion);
    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    //acá se verifica si hay una denuncia asociada a la publicacion y se actualiza su estado a RESUELTO
    //se actualizará de manera automática la dnuncia al cambiar el estado de la publicacion a ELIMINADO
    let denuncia = await Denuncia.findOne({
      where: { id_publicacion: id_publicacion }
    });

    if (nuevo_estado !== 'RECHAZADO') {
      denuncia?.update({ estado: 'RESUELTO' }, { transaction: transaccion });
    }


    publicacion.estado = nuevo_estado;
    await publicacion.save({ transaction: transaccion });

    await transaccion.commit();
    res.status(200).json({
      message: "Estado de la publicación actualizado exitosamente",
      data: publicacion,
    });
  } catch (error: any) {
    await transaccion.rollback();
    res.status(500).json({
      message: "Error al actualizar el estado de la publicación",
      error: error.message,
    });
  }
};

//solo administradores agregar o cambian la orientación política
//solo los periodistas pueden actualizar publicaciones de tipo NOTICIA o ARTICULO, pero no su orientación política
export const actualizarPublicacion = async (req: Request, res: Response) => {
  const transaccion = await coneccion.transaction();
  try {
    const { id_publicacion } = req.params;
    const { titulo, contenido, visibilidad, orientacion_politica } = req.body;

    const publicacion = await Publicacion.findByPk(id_publicacion);
    if (!publicacion) {
      await transaccion.rollback();
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    publicacion.titulo = titulo || publicacion.titulo;
    publicacion.contenido = contenido || publicacion.contenido;
    publicacion.visibilidad = visibilidad || publicacion.visibilidad;
    publicacion.orientacion_politica = orientacion_politica || publicacion.orientacion_politica;

    await publicacion.save({ transaction: transaccion });

    await transaccion.commit();
    res.status(200).json({
      message: "Publicación actualizada exitosamente",
      data: publicacion,
    });
  } catch (error: any) {
    await transaccion.rollback();
    res.status(500).json({
      message: "Error al actualizar la publicación",
      error: error.message,
    });
  }
};

//servirá para mostrar los foros, noticias y articulos publicos al inicio, en la página principal
export const publicacionesPublicas = async (req: Request, res: Response) => {
  try {
    const publicaciones = await Publicacion.findAll({
      where: { visibilidad: 'PUBLICO', estado: 'APROBADO' },
      include: [
        {
          model: Usuario,
          attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario', 'posicion_politica'],
          include: [{
            model: Persona,
            attributes: ['nombre', 'apellido', 'biografia'],
          }]
        },
        {
          model: PublicacionFoto,
          attributes: ['url_foto', 'descripcion', 'fecha_subida']
        }
      ],
    });
    if (!client.isOpen) {
      await connectRedis();
    }

    const likePromises = publicaciones.map(publicacion => {
      const contadorKey = `likes_count:${publicacion.id_publicacion}`;
      return client.get(contadorKey);
    });

    const likeCounts = await Promise.all(likePromises);
    const list: PublicacionLike[] = publicaciones.map((publicacion, index) => {
      const likeCountString = likeCounts[index];
      const likes = likeCountString ? parseInt(likeCountString, 10) : 0;

      return {
        publicacion: publicacion,
        likes: likes
      };
    });

    res.status(200).json(list);
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener las publicaciones públicas",
      error: error.message,
    });
  }
};

// publicaciones que puede ver un usuario segun su visibilidad
// Esta función devuelve las publicaciones que son visibles para el usuario 'id_usuario_viendo'
export const obtenerPublicacionesVisibles = async (req: Request, res: Response) => {
  try {
    const id_usuario_viendo = parseInt(req.params.id_usuario, 10);
    if (isNaN(id_usuario_viendo)) {
      return res.status(400).json({ msg: 'El id_usuario proporcionado no es válido.' });
    }

    // Subconsulta de IDs de amigos aceptados (bidireccional)
    const amigosSubquery = literal(`
      SELECT 
        CASE
          WHEN a.id_usuario1 = ${id_usuario_viendo} THEN a.id_usuario2
          ELSE a.id_usuario1
        END
      FROM amigos AS a
      WHERE 
        (a.id_usuario1 = ${id_usuario_viendo} OR a.id_usuario2 = ${id_usuario_viendo})
        AND a.estado = 'ACEPTADO'
    `);

    // Consulta principal
    const publicaciones = await Publicacion.findAll({
      where: {
        estado: 'APROBADO',
        [Op.or]: [
          // Publicaciones públicas
          { visibilidad: 'PUBLICO' },
          // Publicaciones de amigos o propias
          {
            [Op.and]: [
              { visibilidad: 'AMIGOS' },
              {
                [Op.or]: [
                  { id_usuario: id_usuario_viendo },
                  where(col('Publicacion.id_usuario'), { [Op.in]: amigosSubquery })
                ]
              }
            ]
          }
        ]
      },
      include: [
        {
          model: Usuario,
          attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario', 'posicion_politica'],
          include: [{
            model: Persona,
            attributes: ['nombre', 'apellido', 'biografia'],
          }]
        },
        {
          model: PublicacionFoto,
          attributes: ['url_foto', 'descripcion', 'fecha_subida']
        }
      ],
      order: [['fecha_publicacion', 'DESC']]
    });

    // Conectar Redis si no está abierto
    if (!client.isOpen) {
      await connectRedis();
    }

    // Obtener conteo de likes desde Redis
    const likePromises = publicaciones.map(p => client.get(`likes_count:${p.id_publicacion}`));
    const likeCounts = await Promise.all(likePromises);

    const list: PublicacionLike[] = publicaciones.map((p, index) => ({
      publicacion: p,
      likes: likeCounts[index] ? parseInt(likeCounts[index]!, 10) : 0
    }));

    return res.status(200).json(list);

  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    return res.status(500).json({
      msg: 'Error al obtener publicaciones.',
      error: (error as Error).message
    });
  }
};

//publicaciones de mis amigos
export const obtenerPublicacionesAmigos = async (req: Request, res: Response) => {
  try {
    const id_usuario_viendo = parseInt(req.params.id_usuario, 10);
    if (isNaN(id_usuario_viendo)) {
      return res.status(400).json({ msg: 'El id_usuario proporcionado no es válido.' });
    }

    // 🔹 Subconsulta: obtener los IDs de los amigos aceptados (bidireccional)
    const amigosSubquery = literal(`
      (
        SELECT 
          CASE
            WHEN a.id_usuario1 = ${id_usuario_viendo} THEN a.id_usuario2
            ELSE a.id_usuario1
          END
        FROM amigos AS a
        WHERE 
          (a.id_usuario1 = ${id_usuario_viendo} OR a.id_usuario2 = ${id_usuario_viendo})
          AND a.estado = 'ACEPTADO'
      )
    `);

    // 🔹 Buscar publicaciones SOLO de amigos
    const publicaciones = await Publicacion.findAll({
      where: {
        estado: 'APROBADO',
        id_usuario: { [Op.in]: amigosSubquery } // Solo las de amigos aceptados
      },
      include: [
        {
          model: Usuario,
          attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario', 'posicion_politica'],
          include: [
            {
              model: Persona,
              attributes: ['nombre', 'apellido', 'biografia'],
            }
          ]
        },
        {
          model: PublicacionFoto,
          attributes: ['url_foto', 'descripcion', 'fecha_subida']
        }
      ],
      order: [['fecha_publicacion', 'DESC']]
    });

    // 🔹 Conectar a Redis si no está conectado
    if (!client.isOpen) {
      await connectRedis();
    }

    // 🔹 Obtener el conteo de likes desde Redis
    const likePromises = publicaciones.map(p => client.get(`likes_count:${p.id_publicacion}`));
    const likeCounts = await Promise.all(likePromises);

    // 🔹 Preparar respuesta
    const list: PublicacionLike[] = publicaciones.map((p, index) => ({
      publicacion: p,
      likes: likeCounts[index] ? parseInt(likeCounts[index]!, 10) : 0
    }));

    return res.status(200).json(list);

  } catch (error) {
    console.error('Error al obtener publicaciones de amigos:', error);
    return res.status(500).json({
      msg: 'Error al obtener publicaciones de amigos.',
      error: (error as Error).message
    });
  }
};

export const publicacionPorId = async (req: Request, res: Response) => {
  try {
    const { id_publicacion } = req.params;

    const publicacion = await Publicacion.findByPk(id_publicacion, {
      include: [
        {
          model: Usuario,
          attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario', 'estado', 'fecha_registro', 'posicion_politica', 'medios_comunicacion'],
          include: [{
            model: Persona,
            attributes: ['nombre', 'apellido', 'fecha_nacimiento', 'correo', 'telefono', 'direccion', 'ciudad', 'pais', 'codigo_postal', 'sexo', 'tipo_sangre', 'biografia']
          }]
        }
      ],
    });

    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    // Conectar a Redis si no está conectado
    if (!client.isOpen) {
      await connectRedis();
    }

    const contadorKey = `likes_count:${publicacion.id_publicacion}`;
    const likeCountString = await client.get(contadorKey);
    const likes = likeCountString ? parseInt(likeCountString, 10) : 0;

    const publicacionConLikes: PublicacionLike = {
      publicacion: publicacion,
      likes: likes
    };

    res.status(200).json({
      message: "Publicación obtenida exitosamente",
      data: publicacionConLikes,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener la publicación",
      error: error.message,
    });
  }
};

//publicaciones activas por perfil de usuario (periodista)
//servirá en el fronten para mostrar su tentencia política con una barra horizontal
// mostrando el porcentaje de izquierda, derecha o neutro, se agrupará las 
//publicaciones por orientación política, esto se mostrará en su perfil de usuario (periodista)
export const publicacionesPorOrientacionPolitica = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;

    const publicaciones = await Publicacion.findAll({
      where: {
        id_usuario: id_usuario,
        estado: 'ACTIVO'
      },
      attributes: ['orientacion_politica', [literal('COUNT(*)'), 'cantidad']],
      group: ['orientacion_politica']
    });

    res.status(200).json({
      message: "Publicaciones por orientación política obtenidas exitosamente",
      data: publicaciones,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener las publicaciones por orientación política",
      error: error.message,
    });
  }
};

export const noticiasPendienteAprobacion = async (req: Request, res: Response) => {
  try {
    const publicaciones = await Publicacion.findAll({
      where: { estado: 'PENDIENTE', tipo_publicacion: 'NOTICIA' },
      include: [
        {
          model: Usuario,
          attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario', 'estado', 'fecha_registro', 'posicion_politica', 'medios_comunicacion'],
          include: [{
            model: Persona,
            attributes: ['nombre', 'apellido', 'fecha_nacimiento', 'correo', 'telefono', 'direccion', 'ciudad', 'pais', 'codigo_postal', 'sexo', 'tipo_sangre', 'biografia']
          }]
        }
      ],
    });
    res.status(200).json({
      message: "Publicaciones pendientes obtenidas exitosamente",
      data: publicaciones,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener las publicaciones pendientes",
      error: error.message,
    });
  }
};

export const misPublicaciones = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;

    const publicaciones = await Publicacion.findAll({
      where: { id_usuario: id_usuario },
      include: [
        {
          model: PublicacionFoto,
          attributes: ['url_foto', 'descripcion', 'fecha_subida']
        }
      ],
      order: [['fecha_publicacion', 'DESC']]
    });

    res.status(200).json({
      message: "Mis publicaciones obtenidas exitosamente",
      data: publicaciones,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener mis publicaciones",
      error: error.message,
    });
  }
};