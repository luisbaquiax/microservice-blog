import { Router } from "express";
import { suscribirsePeriodista, obtenerSuscripcionesUsuario } from "../controllers/suscripcion_controller";

const suscripcionRouter = Router();

suscripcionRouter.post("/suscribirse", suscribirsePeriodista);
suscripcionRouter.get("/suscripciones/:id_usuario", obtenerSuscripcionesUsuario);

export default suscripcionRouter;  