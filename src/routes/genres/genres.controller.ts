import type { Request, Response, NextFunction } from "express";
import {GenresService} from "../../services/genres.service.js";
import {AppError} from "../../types.js";

const genresService = new GenresService();

export const fetchGenres = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const response = await genresService.fetchGenres()
        if(!response){ throw new AppError(404, "Not Found") }
        res.status(200).json(response);
    }catch (err){
        next(err)
    }
}