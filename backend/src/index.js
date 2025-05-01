import 'dotenv/config';
import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express';
import { MongoClient, ServerApiVersion } from "mongodb"
import NodeCache from "node-cache"

// initialize client variables
const app = express()
const port = 3000                     
const cache = new NodeCache()
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.5pxx9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const openaiClient = new OpenAI({apiKey: process.env.OPENAI_API_KEY})
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

let db
let frontendData // stores data from database read, if empty then read the database and populate this value, otherwise simply return this value

// middleware
app.use(cors()); // communication with frontend
app.use(clerkMiddleware())
app.use(express.json()); // parse JSON

// plan
// 1. scrape the data in a json format: complete
// 2. iterate over the json and store that in mongodb cluster: complete
// 3. send the data from the mongodb cluster to the frontend

// scrapes google for internship data
async function getRawData() {
    const scrapedData = await axios.get('https://serpapi.com/search', {
        params: {
            engine: "google_jobs",
            q: "engineering+internships+summer+2025",
            location: "United States",
            gl: "us",
            hl: "en",
            api_key: process.env.SERPAPI_KEY
        }, 
    })

    const parsedData = scrapedData.data["jobs_results"] // this is an array of jsons
    return parsedData
}

// helper function uses OpenAI API to provide human readable analysis
async function analyzeData(inputData, promptType) {
    let systemPrompt;

    if (promptType === "description") {
        systemPrompt = `
            You are an AI assistant designed to analyze job descriptions. 
            When provided with a job description, generate a concise two-sentence summary that highlights 
            the core responsibilities and scope of the job. Focus on the tasks, role, and work environment, 
            making sure to capture the essence of what the job entails without unnecessary details. 
            The summary should be professional and clear.
        `;
    } else if (promptType === "qualifications") {
        systemPrompt = `
            You are an AI assistant designed to analyze job qualifications. 
            When provided with a list of qualifications, generate a two-sentence summary that highlights 
            the key educational requirements, skills, and experience needed for the role. 
            Focus on the essential qualifications that the candidate must possess, ensuring that the summary 
            is succinct and professional.
        `;
    } else if (promptType === "responsibilities") {
        systemPrompt = `
            You are an AI assistant designed to analyze job responsibilities. 
            When provided input text of responsibilities, generate a two-sentence summary that captures 
            the primary duties and functions expected from the candidate. 
            Focus on the tasks and roles that the candidate will be performing in this position, ensuring 
            clarity and conciseness in the summary.
        `;
    }
    
    const analyzedData = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: inputData}
          ]
    })

    return analyzedData.choices[0].message.content
}   

// parses data that was scraped and will upload it to MongoDB Atlas 
async function parseData(inputData) {    
    const splitData = inputData.sort(() => 0.5 - Math.random()).slice(0, 4)
    // AI analysis for for the description, qualifications, and responsibilities 
    const jsonList = []

    for (const element of splitData) {
        // check if all three values actually exist before passing into OpenAI API
        const descriptionText = element.description || `The description is ${element.title}`
        const qualificationsText = element.job_highlights && element.job_highlights[0]?.items 
        ? element.job_highlights[0].items.toString() 
        : `Infer the qualifications based on ${element.title}`;
        const responsibilitiesText = element.job_highlights && element.job_highlights[2]?.items 
        ? element.job_highlights[2].items.toString() 
        : `Infer the responsibilities based on ${element.title}`;

        // need to process the description, qualifications, and responsibilities
        const description = await analyzeData(descriptionText, "description")
        const qualifications = await analyzeData(qualificationsText, "qualifications")
        const responsibilities = await analyzeData(responsibilitiesText, "responsibilities")

        // console.log(description)
        // console.log(qualifications)
        // console.log(responsibilities)

        const tempJSON = {
            "title": element.title,
            "company_name": element.company_name,
            "location": element.location,
            "description": description,
            "qualifications": qualifications,
            "responsibilities": responsibilities,
            "url": element.job_link || element.share_link || element.link || "URL not provided"
        }
        jsonList.push(tempJSON)
    }
    return jsonList
}

// database setup
async function run() {
    // Connect the client to the server
    await mongoClient.connect();
    // Send a ping to confirm a successful connection
    await mongoClient.db("NewSpaceV2").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

await run()

// backend

// read values from the database and send it to the frontend
app.get('/api/read', async (req, res) => {
    if (!frontendData) {
        try {
            console.log('Cache miss, reading from database')
            db = mongoClient.db("NewSpaceV2")
            const col = db.collection("jobs")
            const cursor = col.find({})
            const results = await cursor.toArray()
            console.log(results)
            // error handling if database is empty (ideally should not happen)
            if (results.length === 0) {
                console.log("Database is empty")
                res.redirect('/')
            } else {
                cache.set('job_listings', results)
                frontendData = cache.get('job_listings')
                console.log(frontendData)
                // redirect back to page
                // res.redirect('/')
                res.send(cache.get('job_listings'))
            }  
        } catch (err) {
            console.log(err.stack);
            // redirect back to page
            res.redirect('/')
        }
    } else {
        console.log("Cache hit!")
        console.log(cache.get('job_listings'))
        // redirect back to page
        // res.redirect('/')
        res.send(cache.get('job_listings'))
    }
})

// testing endpoint (will need to be authenticated later)
app.get('/api/test', async (req, res) => {
    try {
        db = mongoClient.db("NewSpaceV2")
        const col = db.collection("jobs")
        const rawData = await getRawData()
        console.log(rawData) // debugging
        const formattedData = await parseData(rawData)  
        console.log(formattedData) // debugging
        const result = await col.insertMany(formattedData);
        console.log(`${result.insertedCount} document(s) were inserted`);
    } catch (err) {
        console.log(err.stack);
    }
    // redirect back to page
    res.redirect('/')
})

app.get('/api/clear', async (req, res) => {
    try {
        db = mongoClient.db("NewSpaceV2")
        const col = db.collection("jobs")
        const result = await col.deleteMany({});
        console.log(`${result.deletedCount} document(s) were deleted.`);
        // delete the cache so that the frontend is updated properly
        cache.del('job_listings')
        frontendData = false
    } catch (err) {
        console.log(err.stack);
        res.redirect('/')
    }
    // redirect back to page
    res.redirect('/')
})

// hello world
app.get('/', (req, res) => {
    res.send('Hello World!')
})

// authenticated endpoint for testing purposes as of now
app.get('/protected', requireAuth(), (req, res) => {
    res.send('This is a protected route.')
})  

// sanity
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})