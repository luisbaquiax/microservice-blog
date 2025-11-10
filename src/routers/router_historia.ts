import { Router } from "express";

import { agregarHistorialLectura, reportePublicacionesMasLeidas } from "../controllers/historial_lectura";
const router_historia = Router();

//agregar una publicacion al historial de lectura de un usuario
router_historia.post('/agregar', agregarHistorialLectura);

//reporte de publicaciones mas leidas
router_historia.get('/reporte-mas-leidas', reportePublicacionesMasLeidas);

export default router_historia;