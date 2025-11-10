import { Router } from "express";
import { suscribirsePeriodista, obtenerSuscripcionesUsuario, cancelarSuscripcion } from "../controllers/suscripcion_controller";

const suscripcionRouter = Router();

suscripcionRouter.post("/suscribirse", suscribirsePeriodista);
suscripcionRouter.get("/suscripciones/:id_usuario", obtenerSuscripcionesUsuario);
suscripcionRouter.delete("/cancelar", cancelarSuscripcion);

export default suscripcionRouter;  