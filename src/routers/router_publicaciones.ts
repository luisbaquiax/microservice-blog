import { Router } from "express";
import {
    crearPublicacion,
    publicacionesPublicas,
    obtenerPublicacionesVisibles,
    cambiarEstadoPublicacion,
    actualizarPublicacion,
    publicacionesPorOrientacionPolitica,
    publicacionPorId,
    noticiasPendienteAprobacion,
    misPublicaciones,
    obtenerPublicacionesAmigos
} from "../controllers/publicacion_controller";
import { eliminarFotoDePublicacion, agregarFotoAPublicacion } from "../controllers/publicacion_fotos_controllers";
import { middlewareDeSubida, middlewareDeSubidaLocal } from "../middlewares/multer_config";
import env from 'dotenv';
env.config();
const type = process.env.TYPE;
const router_publicaciones = Router();

router_publicaciones.post('/crear', crearPublicacion);
router_publicaciones.get('/publicas', publicacionesPublicas);
router_publicaciones.get('/publicaciones-visibles/:id_usuario', obtenerPublicacionesVisibles);
router_publicaciones.put('/cambiar-estado/:id_publicacion', cambiarEstadoPublicacion);
router_publicaciones.put('/actualizar/:id_publicacion', actualizarPublicacion);
router_publicaciones.get('/por-orientacion/:id_usuario', publicacionesPorOrientacionPolitica);
router_publicaciones.get('/:id_publicacion', publicacionPorId);
router_publicaciones.get('/pendientes/lista', noticiasPendienteAprobacion);
router_publicaciones.get('/mis-publicaciones/:id_usuario', misPublicaciones);
router_publicaciones.get('/amigos/:id_usuario', obtenerPublicacionesAmigos);

//fotos
router_publicaciones.delete('/eliminar-foto/:id_foto', eliminarFotoDePublicacion);


if (type === 'prod') {
    router_publicaciones.post('/agregar-foto', middlewareDeSubida, agregarFotoAPublicacion);
} else {
    router_publicaciones.post('/agregar-foto', middlewareDeSubidaLocal, agregarFotoAPublicacion);
}

export default router_publicaciones;