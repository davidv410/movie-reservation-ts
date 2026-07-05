import {Router} from "express";
import { fetchGenres } from "./genres.controller.js";

export const genresRoutes = Router();

genresRoutes.get('/', fetchGenres)