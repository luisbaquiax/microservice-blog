import { Router } from "express";

import { agregarAmigo, aceptarAmigo, rechazarAmigo, listarAmigos, solicitudesPendientes, eliminarAmigo } from "../controllers/amigos_controller";

const router_friends = Router();

router_friends.post('/agregar', agregarAmigo);
router_friends.post('/aceptar', aceptarAmigo);
router_friends.post('/rechazar', rechazarAmigo);
router_friends.get('/listar-amigos/:id_usuario', listarAmigos);
router_friends.delete('/eliminar', eliminarAmigo);
router_friends.get('/solicitudes-pendientes/:id_usuario', solicitudesPendientes);

export default router_friends;