import express from "express";
import { Signup, Login } from "../../controllers/auth.controller.js";

const Router = express.Router();

Router.post("/signup", Signup);
Router.post("/login", Login);

export default Router;
