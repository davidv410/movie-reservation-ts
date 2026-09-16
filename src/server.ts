import 'dotenv/config'
import './services/queues/email.worker.js'
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is up on ${process.env.PORT}`)
})