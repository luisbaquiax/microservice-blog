import { Router } from "express";

import { denunciarPublicacion, actualizarEstadoDenuncia, obtenerDenunciasPendientes } from "../controllers/denuncia_controller";

const denunciaRouter = Router();

denunciaRouter.post("/denunciar", denunciarPublicacion);
denunciaRouter.put("/actualizar", actualizarEstadoDenuncia);
denunciaRouter.get("/denuncias/pendientes", obtenerDenunciasPendientes);

export default denunciaRouter;