import { Request, Response } from "express";
import PublicacionFoto from "../models/publicacion_fotos";
import coneccion from "../database/coneccion";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import env from 'dotenv';
env.config();

const local_storage = process.env.LOCAL_STORAGE || 'http://localhost:8080/uploads/';
const type = process.env.TYPE;
const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || '',
        secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
    },
});

export const agregarFotoAPublicacion = async (req:Request, res:Response) => {
    var transaccion = await coneccion.transaction();
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "No se ha subido ningún archivo." });
        }
        
        var id_publicacion = req.body.id_publicacion;
        if (!id_publicacion) {
            return res.status(400).json({ msg: "No se ha proporcionado el ID de la publicación." });
        }

        const file = req.file;
        let url_imagen = `${Date.now()}_${file.originalname}`;
        if(type === 'prod'){
            const bucketName = process.env.BUCKET_FILES; // Tu bucket

            const params = {
                Bucket: bucketName,
                Key: `${Date.now()}_${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype,

            };
    
            // Enviar el comando a S3
            const command = new PutObjectCommand(params);
            await s3Client.send(command);
    
            // Construir la URL de la foto para guardarla en la DB
            //url_imagen = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
        }
        if(type == 'dev'){
            //guardar en local
            url_imagen = file.filename;
            

        }

        const nuevaFoto = await PublicacionFoto.create({
            id_publicacion: req.body.id_publicacion,
            url_foto: url_imagen,
        }, { transaction: transaccion });
        

        await transaccion.commit();
        
        res.status(200).json({ 
            msg: "Foto subida y URL guardada con éxito", 
            url: type === 'dev' ? local_storage + url_imagen : `https://${process.env.BUCKET_FILES}.s3.${process.env.REGION}.amazonaws.com/${url_imagen}`,
        });

    } catch (error: any) {
        await transaccion.rollback();
        console.error("Error al subir a S3:", error);
        res.status(500).json({ msg: "Error al subir la foto.", error:  error.message });
    }
};

export const eliminarFotoDePublicacion = async (req: Request, res: Response) => {
    const transaccion = await coneccion.transaction();
    try {
        const { id_foto } = req.params;

        const foto = await PublicacionFoto.findByPk(id_foto);
        if (!foto) {
            return res.status(404).json({ message: "Foto no encontrada" });
        }

        await foto.destroy({ transaction: transaccion });

        await transaccion.commit();

        res.status(200).json({
            message: "Foto eliminada de la publicación exitosamente",
        });
    } catch (error: any) {
        await transaccion.rollback();
        res.status(500).json({
            message: "Error al eliminar la foto de la publicación",
            error: error.message,
        });
    }
};