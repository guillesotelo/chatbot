const express = require("express")
const morgan = require("morgan")
const cors = require('cors')
const app = express()
const path = require('path')
const fs = require('fs')
const { htmlBuildingTemplate } = require("./src/templates/buildingTemplate")
const dotenv = require('dotenv')
dotenv.config()
const { createProxyMiddleware } = require("http-proxy-middleware"); // Import the proxy middleware

app.use((_, res, next) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    next()
})

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}))
app.use(morgan("dev"))

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true, parameterLimit: 1000000 }));

app.use("/api", createProxyMiddleware({
    target: "http://localhost:5000", // URL of the actual API running on Gunicorn
    changeOrigin: true, // Adjusts the origin of the host header to match the target URL
}));

app.use((err, _, res, __) => {
    console.error(err.stack)
    res.status(500).send("Something broke!")
})

const PORT = process.env.PORT || 3000

const buildPath = path.resolve(__dirname, 'build') || ''
const indexHtmlPath = buildPath ? path.resolve(buildPath, 'index.html') : ''
const indexExists = buildPath && indexHtmlPath && fs.existsSync(indexHtmlPath)

if (process.env.NODE_ENV === 'production' && indexExists) {
    app.use(express.static(path.join(__dirname, 'build')))
    app.get('*', (_, res) => {
        res.sendFile(indexHtmlPath, (err) => {
            if (err) {
                console.error('Building app...', err)
                res.status(500).send(htmlBuildingTemplate)
            }
        })
    })
}

app.get('/health', (_, res) => {
    res.status(200).send('Chatbot Server [Status: OK]')
})

app.listen(PORT, () => console.log(`Server listening on Port: ${PORT}...`))

console.log(process.env)
console.log({ buildPath, indexHtmlPath, indexExists });



module.exports = app
