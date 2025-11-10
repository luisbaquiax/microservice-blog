import { Response, Request } from "express";
import Amigo from "../models/amigos";
import coneccion from "../database/coneccion";
import Usuario from "../models/usuario";
import Persona from "../models/persona";
import { Op } from "sequelize";

export const agregarAmigo = async (req: Request, res: Response) => {
    var transaccion = coneccion.transaction();
    try {
        const { id_usuario1, id_usuario2 } = req.body;

        const amigoExistente = await Amigo.findOne({
            where: {
                [Op.or]: [
                    { id_usuario1, id_usuario2 },
                    { id_usuario1: id_usuario2, id_usuario2: id_usuario1 }
                ]
            }
        });

        if (amigoExistente) {
            return res.status(400).json({ msg: 'Ya existe una solicitud o amistad entre estos usuarios' });
        }

        const nuevaSolicitud = await Amigo.create({
            id_usuario1,
            id_usuario2,
            estado: 'PENDIENTE'
        }, { transaction: await transaccion });

        await (await transaccion).commit();

        res.status(201).json(nuevaSolicitud);
    } catch (error) {
        console.error('Error al agregar amigo:', error);
        res.status(500).json({ msg: 'Error al agregar amigo' });
    }
}

export const aceptarAmigo = async (req: Request, res: Response) => {
    var transaccion = coneccion.transaction();
    try {
        const { id_usuario1, id_usuario2 } = req.body;

        const solicitud = await Amigo.findOne({
            where: { id_usuario1, id_usuario2 }
        });

        if (!solicitud) {
            return res.status(404).json({ msg: 'Solicitud de amistad no encontrada' });
        }
        
        solicitud.estado = 'ACEPTADO';
        solicitud.fecha_actualizacion = new Date();
        await solicitud.save({ transaction: await transaccion });   
        await (await transaccion).commit();

        res.status(200).json(solicitud);
    } catch (error) {
        console.error('Error al aceptar amigo:', error);
        res.status(500).json({ msg: 'Error al aceptar amigo' });
    }
}

export const rechazarAmigo = async (req: Request, res: Response) => {
    var transaccion = coneccion.transaction();
    try {
        const { id_usuario1, id_usuario2 } = req.body;

        const solicitud = await Amigo.findOne({
            where: { id_usuario1, id_usuario2 }
        });

        if (!solicitud) {
            return res.status(404).json({ msg: 'Solicitud de amistad no encontrada' });
        }
        
        solicitud.estado = 'RECHAZADO';
        solicitud.fecha_actualizacion = new Date();
        await solicitud.save({ transaction: await transaccion });   
        await (await transaccion).commit();

        res.status(200).json(solicitud);
    } catch (error) {
        console.error('Error al rechazar amigo:', error);
        res.status(500).json({ msg: 'Error al rechazar amigo' });
    }
}

export const listarAmigos = async (req: Request, res: Response) => {
    try {
        const id_usuario = parseInt(req.params.id_usuario, 10);

        if (isNaN(id_usuario)) {
            return res.status(400).json({ msg: 'ID de usuario no válido.' });
        }

        const amigos = await Amigo.findAll({
            where: {
                estado: 'ACEPTADO',
                [Op.or]: [
                    { id_usuario1: id_usuario },
                    { id_usuario2: id_usuario }
                ]
            },
            
            include: [
                {
                    model: Usuario,
                    as: 'Solicitante',
                    include: [{
                        model: Persona,
                        attributes: ['nombre', 'apellido', 'fecha_nacimiento', 'correo', 'telefono', 'direccion', 'ciudad', 'pais', 'codigo_postal', 'sexo', 'tipo_sangre', 'biografia']
                    }],
                    attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario', 'estado', 'fecha_registro', 'posicion_politica', 'medios_comunicacion']
                },
                {
                    model: Usuario,
                    as: 'Receptor',
                    include: [{
                        model: Persona,
                        attributes: ['nombre', 'apellido', 'fecha_nacimiento', 'correo', 'telefono', 'direccion', 'ciudad', 'pais', 'codigo_postal', 'sexo', 'tipo_sangre', 'biografia']
                    }],
                    attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario', 'estado', 'fecha_registro', 'posicion_politica', 'medios_comunicacion']
                }
            ],
            order: [['fecha_actualizacion', 'DESC']]
        });

        res.status(200).json(amigos);
    } catch (error) {
        console.error('Error al listar amigos:', error);
        res.status(500).json({ msg: 'Error al listar amigos' });
    }
};

export const solicitudesPendientes = async (req: Request, res: Response) => {
    try {
        const { id_usuario } = req.params;

        const solicitudes = await Amigo.findAll({
            where: {
                id_usuario1: id_usuario,
                estado: 'PENDIENTE'
            },
            include: [
                {
                    model: Usuario,
                    as: 'Solicitante',
                    include: [{
                        model: Persona,
                        attributes: ['nombre', 'apellido', 'fecha_nacimiento', 'correo', 'telefono', 'direccion', 'ciudad', 'pais', 'codigo_postal', 'sexo', 'tipo_sangre', 'biografia']
                    }],
                    attributes: ['id_usuario', 'nombre_usuario', 'tipo_usuario', 'estado', 'fecha_registro', 'posicion_politica', 'medios_comunicacion']
                }
            ],
            order: [['fecha_solicitud', 'DESC']]
        });

        res.status(200).json(solicitudes);
    } catch (error) {
        console.error('Error al listar solicitudes pendientes:', error);
        res.status(500).json({ msg: 'Error al listar solicitudes pendientes', error: error } );
    }
}

export const eliminarAmigo = async (req: Request, res: Response) => {
    var transaccion = coneccion.transaction();
    try {
        const { id_usuario1, id_usuario2 } = req.body;

        const solicitud = await Amigo.findOne({
            where: { id_usuario1, id_usuario2 }
        });

        if (!solicitud) {
            return res.status(404).json({ msg: 'Amigo no encontrado' });
        }
        await solicitud.destroy({ transaction: await transaccion });
        await (await transaccion).commit();

        res.status(200).json({ msg: 'Amigo eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar amigo:', error);
        res.status(500).json({ msg: 'Error al eliminar amigo' });
    }
}       