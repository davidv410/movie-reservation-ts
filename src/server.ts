import 'dotenv/config'
import express from 'express';
import signup from './routes/auth/signup.js'
import login from './routes/auth/login.js'
import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import logout from './routes/auth/logout.js';

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/sign-up', signup)
app.use('/login', login)
app.use('/logout', logout)

app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is up on ${process.env.PORT}`)
})