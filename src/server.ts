import app from "./app.js";

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is up on ${process.env.PORT}`)
})