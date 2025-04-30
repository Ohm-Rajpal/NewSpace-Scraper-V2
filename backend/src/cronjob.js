// src/cronjob.js
import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Setup proper paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log(`No .env file found at ${envPath}, trying default location`);
  dotenv.config();
}

// Get the backend URL from environment variables
let backendUrl = process.env.BACKEND_URL;

if (!backendUrl) {
  console.error('Error: BACKEND_URL environment variable is not set');
  process.exit(1);
}

// Remove trailing slash if it exists
backendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

console.log(`Running cron job at ${new Date().toISOString()}`);
console.log(`Using backend URL: ${backendUrl}`);

async function runTasks() {
  try {
    // Call the clear endpoint
    console.log('Calling /api/clear endpoint...');
    const clearResponse = await axios.get(`${backendUrl}/api/clear`);
    console.log(`Successfully called clear endpoint (status: ${clearResponse.status})`);
    
    // Wait a moment before making the next request
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Call the test endpoint
    console.log('Calling /api/test endpoint...');
    const testResponse = await axios.get(`${backendUrl}/api/test`);
    console.log(`Successfully called test endpoint (status: ${testResponse.status})`);
    
    console.log(`Cron job completed at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error running cron tasks:', error.message);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data:`, error.response.data);
    }
    process.exit(1);
  }
}

runTasks();