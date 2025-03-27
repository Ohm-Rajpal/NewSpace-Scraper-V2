import 'dotenv/config'
import express from "express"
import axios from "axios"
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'
import cors from "cors"

const app = express()
const port = 3000

// middleware
app.use(cors()); // communication with frontend
app.use(clerkMiddleware())
app.use(express.json()); // parse JSON

// plan
// 1. scrape the data in a json format: complete
// 2. iterate over the json and store that in mongodb cluster
// 3. send the data from the mongodb cluster to the frontend

async function getRawData() {
    const scrapedData = await axios.get('https://serpapi.com/search', {
        params: {
            engine: "google_jobs",
            q: "aerospace+engineering+internships+summer+2025",
            location: "United States",
            gl: "us",
            hl: "en",
            api_key: process.env.SERPAPI_KEY
        }, 
    })

    const parsedData = scrapedData.data["jobs_results"]
    console.log(parsedData)
}


// hello world
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/protected', requireAuth(), (req, res) => {
    res.send('This is a protected route.')
})  
  
app.get('/test', (req, res) => {
    getRawData()
    res.redirect('/')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})