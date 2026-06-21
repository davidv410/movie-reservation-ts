export class AppError extends Error {
        constructor(public statusCode: number, message: string){
            super(message)
    }
}

export interface MovieParams {
    id: string;
}