import { Router } from "express";
import { agregarComentario, obtenerComentariosPorPublicacion, obtenerComentariosPorUsuario, editarMiComentario, eliminarMiComentario } from "../controllers/comentario_controller";

const router_comentarios = Router();

router_comentarios.post('/comentarios', agregarComentario);
router_comentarios.get('/comentarios/publicacion/:id_publicacion', obtenerComentariosPorPublicacion);
router_comentarios.get('/comentarios/usuario/:id_usuario', obtenerComentariosPorUsuario);
router_comentarios.put('/comentarios/:id_usuario/:id_comentario', editarMiComentario);
router_comentarios.delete('/comentarios/:id_usuario/:id_comentario', eliminarMiComentario);

export default router_comentarios;