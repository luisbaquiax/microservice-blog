import { Request, Response } from "express";
import Persona from "../models/persona";
import Usuario from "../models/usuario";
import coneccion  from "../database/coneccion";
import { encriptPassword, comparePassword } from "../utils/encriptation";
import { client, connectRedis } from "../database/redis";

export const registerUser = async (req: Request, res: Response) => {
  const transaccion = await coneccion.transaction(); 

  try {
    const {
      nombre,
      apellido,
      fecha_nacimiento,
      dpi,
      correo,
      telefono,
      direccion,
      ciudad,
      pais,
      codigo_postal,
      sexo,
      tipo_sangre,
      biografia,
      nombre_usuario,
      password,
      tipo_usuario,
      posicion_politica,
      medios_comunicacion
    } = req.body;

    const persona = await Persona.create(
      {
        nombre,
        apellido,
        fecha_nacimiento,
        dpi,
        correo,
        telefono,
        direccion,
        ciudad,
        pais,
        codigo_postal,
        sexo,
        tipo_sangre,
        biografia
      },
      { transaction: transaccion }
    );

    const password_hash = await encriptPassword(password);

    await Usuario.create(
      {
        id_usuario: persona.id_persona,
        nombre_usuario,
        password_hash,
        tipo_usuario,
        posicion_politica,
        medios_comunicacion
      },
      { transaction: transaccion }
    );

    //guardar credenciales en redis
    await client.hSet(`user:${nombre_usuario}`, {
      nombre_usuario,
      password_hash,
      tipo_usuario,
      posicion_politica,
      medios_comunicacion
    });

    await transaccion.commit();

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      persona
    });

  } catch (error) {
    await transaccion.rollback();
    res.status(500).json({
      message: 'Error al registrar el usuario',
      error: (error as Error).message
    });
  }
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { nombre_usuario, password } = req.body;
    //primero buscar usuario en redis
    const userRedis = await client.hGetAll(`user:${nombre_usuario}`);
    if (userRedis && Object.keys(userRedis).length > 0) {
      const isPasswordValid = await comparePassword(password, userRedis.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }
      const usuario = await Usuario.findOne({ where: { nombre_usuario } });
      console.log('Usuario encontrado en Redis');
      return  res.status(200).json({
        message: 'Inicio de sesión exitoso',
        usuario: {
          id_usuario: usuario?.id_usuario,
          nombre_usuario: userRedis.nombre_usuario,
          tipo_usuario: userRedis.tipo_usuario,
          posicion_politica: userRedis.posicion_politica,
          medios_comunicacion: userRedis.medios_comunicacion,
        }
      });
    }

    const usuario = await Usuario.findOne({ where: { nombre_usuario } });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await comparePassword(password, usuario.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        tipo_usuario: usuario.tipo_usuario,
        posicion_politica: usuario.posicion_politica,
        medios_comunicacion: usuario.medios_comunicacion,
      }
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      message: 'Error al iniciar sesión',
      error: (error as Error).message
    });
  }
}

// Obtener todos los usuarios con su información de persona asociada, para el perfil de usuario
export const getUsersWithPersona = async (req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.findAll({
      where: {
        tipo_usuario: 'COMUN' // Filtrar solo usuarios comunes
      },
      include: [{ model: Persona }]
    });

    res.status(200).json({
      message: 'Usuarios obtenidos correctamente',
      data: usuarios
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los usuarios',
      error: (error as Error).message
    });
  }
};

//obtener el perfil de un usuario por su id
//en caso de que este usuario es periodista, se deberá mostrar un botoón suscribirme en el frontend
//incluso usar cuando el usuario logeago ver las suscripciones a periodistas, 
// y podrá ver su perfil la hacer click en el botón "ver perfil"
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id_usuario } = req.params;

    const usuario = await Usuario.findByPk(id_usuario, {
      include: [{ model: Persona }]
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      message: 'Perfil de usuario obtenido correctamente',
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el perfil de usuario',
      error: (error as Error).message
    });
  }
};
