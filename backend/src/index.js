import 'dotenv/config'
import express from "express"
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'
import cors from "cors"

const app = express()
const port = 3000

// middleware
app.use(cors()); // communication with frontend
app.use(clerkMiddleware())
app.use(express.json()); // parse JSON

// hello world
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/protected', requireAuth(), (req, res) => {
    res.send('This is a protected route.')
})  
  
app.get('/test', (req, res) => {
    getRawData()
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})