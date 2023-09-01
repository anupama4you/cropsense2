import { Configuration, OpenAIApi } from "openai";
import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from './database/db.js';
import router from './database/routes.js'

const configuration = new Configuration({
    organization: "org-b3Y1ILtBwy8Bb77EVwceDrf6",
    apiKey: "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"
});

const openai = new OpenAIApi(configuration)

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use('/', router);
 
app.post("/", async (req, res) => {
    const {prompt} = req.body;

    // console.log("incoming message:", prompt)

    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        max_tokens: 512,
        temperature: 0,
        prompt: prompt
    })

    res.send({
        completion: completion.data.choices[0].text
    })
})

app.listen(port, () => {
    console.log(`chat-gpt API testing app listening at http://localhost:${port})`)
});