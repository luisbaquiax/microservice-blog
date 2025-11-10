import { Request, Response } from 'express';
import coneccion from '../database/coneccion';
import Usuario from '../models/usuario';
import Persona from '../models/persona';
import Denuncia from '../models/denuncias';
import { Op } from 'sequelize';
import Publicacion from '../models/publicaciones';

//usuario comun denuncia una publicacion
export const denunciarPublicacion = async (req: Request, res: Response) => {
    var transaccion = await coneccion.transaction();
    try {
        const { id_usuario, id_publicacion, motivo, descripcion } = req.body;

        //revisar que no exista la denuncia previa
        const denunciaExistente = await Denuncia.findOne({
            where: {
                id_usuario_denunciante: id_usuario,
                id_publicacion: id_publicacion,
                estado: {
                    [Op.in]: ['PENDIENTE', 'REVISADO']
                }
            }
        });

        if (denunciaExistente) {
            await transaccion.rollback();
            return res.status(400).json({
                ok: false,
                mensaje: 'Ya has denunciado esta publicación previamente'
            });
        }

        //crear la denuncia
        const nuevaDenuncia = await Denuncia.create({
            id_usuario_denunciante: id_usuario,
            id_publicacion: id_publicacion,
            motivo: motivo,
            descripcion: descripcion
        }, { transaction: transaccion });       

        await transaccion.commit();
        return res.status(201).json({
            ok: true,
            mensaje: 'Denuncia creada exitosamente',
            denuncia: nuevaDenuncia
        });
    } catch (error) {
        await transaccion.rollback();
        console.error('Error al crear la denuncia:', error);
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al crear la denuncia'
        });
    }
};

//PARA EL ADMINISTRADOR
export const obtenerDenunciasPendientes = async (req: Request, res: Response) => {
    try {
        const denunciasPendientes = await Denuncia.findAll({
            where: {
                estado: ['PENDIENTE', 'REVISADO']
            },
            include: [
                {
                    model: Usuario,
                    include: [
                        {
                            model: Persona,
                        }
                    ],
                    attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario'] 
                }
            ]
        });

        return res.status(200).json({
            ok: true,
            denuncias: denunciasPendientes
        });
    } catch (error: any) {
        console.error('Error al obtener las denuncias pendientes:', error);
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener las denuncias pendientes',
            error: error.message // Incluir el mensaje de error puede ayudar en el debugging
        });
    }
};

//PARA EL ADMINISTRADOR CUANDO SOLO REVISA O LO MARCA COMO RESUELTO
export const actualizarEstadoDenuncia = async (req: Request, res: Response) => {
    var transaccion = await coneccion.transaction();
    try {
        const { id_denuncia, nuevo_estado } = req.body;
        //buscar la denuncia
        const denuncia = await Denuncia.findByPk(id_denuncia);
        if (!denuncia) {
            await transaccion.rollback();
            return res.status(404).json({
                ok: false,
                message: 'Denuncia no encontrada'
            });
        }

        if(nuevo_estado === 'ELIMINAR'){
            const publicacion = denuncia.id_publicacion ? await Publicacion.findByPk(denuncia.id_publicacion) : null;
            if (publicacion) {
                publicacion.estado = 'ELIMINADO';
                await publicacion.save({ transaction: transaccion });
            }
        }

        //actualizar el estado
        denuncia.estado = (nuevo_estado== 'ELIMINAR') ? 'RESUELTO' : 'REVISADO';
        await denuncia.save({ transaction: transaccion });

        await transaccion.commit();
        return res.status(200).json({
            ok: true,
            message: 'Estado de la denuncia actualizado exitosamente',
            denuncia: denuncia
        });
    } catch (error) {
        await transaccion.rollback();
        console.error('Error al actualizar el estado de la denuncia:', error);
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar el estado de la denuncia'
        });
    }
};
