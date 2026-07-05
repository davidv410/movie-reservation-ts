import {db} from "../db/db.js";
import {genres} from "../db/schema.js";

export class GenresService {
    async fetchGenres(){
        return db.select().from(genres)
    }
}