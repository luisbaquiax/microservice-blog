import { Router } from "express";
import Like from "../models/likes";

import { darLike, quitarLike, verificarSiYaDioLike } from "../controllers/like_controller";

const likeRouter = Router();

likeRouter.post("/like", darLike);
likeRouter.delete("/like", quitarLike);
likeRouter.get("/verificar/:id_usuario/:id_publicacion", verificarSiYaDioLike);

export default likeRouter;