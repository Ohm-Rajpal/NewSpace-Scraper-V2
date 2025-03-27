import 'dotenv/config';
import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express';

const openaiClient = new OpenAI({apiKey: process.env.OPENAI_API_KEY})
const app = express()
const port = 3000

// middleware
app.use(cors()); // communication with frontend
app.use(clerkMiddleware())
app.use(express.json()); // parse JSON

// plan
// 1. scrape the data in a json format: complete
// 2. iterate over the json and store that in mongodb cluster: almost complete
// 3. send the data from the mongodb cluster to the frontend

// scrapes google for internship data
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

    const parsedData = scrapedData.data["jobs_results"] // this is an array of jsons
    parseData(parsedData)
}


// helper function uses OpenAI API to analyze the data and give a simplified output as a sentence
// this is due to certain parameters in the scraped data being inconsistent formatting wise 
async function analyzeData(inputData, promptType) {
    let systemPrompt = null;

    if (promptType == "description") {
        systemPrompt = `
        You are an AI assistant designed to analyze job descriptions. When provided with a job description, generate a concise two-sentence summary that highlights the core responsibilities and scope of the job. Focus on the tasks, role, and work environment, making sure to capture the essence of what the job entails without unnecessary details. The summary should be professional and clear.
        `;
    } else if (promptType == "qualifications") {
        systemPrompt = `
        You are an AI assistant designed to analyze job qualifications. When provided with a list of qualifications, generate a two-sentence summary that highlights the key educational requirements, skills, and experience needed for the role. Focus on the essential qualifications that the candidate must possess, ensuring that the summary is succinct and professional.
        `
    } else {
        systemPrompt = `
        You are an AI assistant designed to analyze job responsibilities. When provided input text of responsibilities, generate a two-sentence summary that captures the primary duties and functions expected from the candidate. Focus on the tasks and roles that the candidate will be performing in this position, ensuring clarity and conciseness in the summary.
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
    const splitData = inputData.slice(0, 1)
    // for every iteration, we will upload this info to a mongodb cluster
    // additionally for the description, qualifications, and responsibilities do an AI analysis for simplification
    splitData.forEach(async (element) => {
        console.log(element.title)
        console.log(element.company_name)
        console.log(element.location)
        // description
        console.log(description)
        // qualifications
        console.log(element.job_highlights[0].title)
        console.log(element.job_highlights[0].items.toString())
        // responsibilities
        console.log(element.job_highlights[2].title)
        console.log(element.job_highlights[2].items.toString())
    });
}

// hello world
app.get('/', (req, res) => {
    res.send('Hello World!')
})

// authenticated endpoint for testing purposes as of now
app.get('/protected', requireAuth(), (req, res) => {
    res.send('This is a protected route.')
})  
  
// testing endpoint
app.get('/test', async (req, res) => {
    console.log('hit endpoint')
    await getRawData()
    res.redirect('/')
})

// sanity
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})