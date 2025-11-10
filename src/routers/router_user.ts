import { Router } from "express";
import { registerUser, loginUser, getUserProfile, getUsersWithPersona } from "../controllers/user_controller";

const routerUser = Router();

routerUser.post("/register", registerUser);
routerUser.post("/login", loginUser);
routerUser.get("/", getUsersWithPersona);
routerUser.get("/:id_usuario", getUserProfile);

export default routerUser;