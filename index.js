//lancer app :node --env-file=.env index.js
import pkg from "@lmstudio/sdk";
import express from 'express';
import MovieDataService from "./MovieDataService.js";
import path from 'path';
import { fileURLToPath } from 'url';
const { LMStudioClient } = pkg;
const app = express();
const port = 3000;
const client = new LMStudioClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())

// Load a model
const gemma2b = await client.llm.load("lmstudio-ai/gemma-2b-it-GGUF");

// Create a text completion prediction
// const prediction = gemma2b.complete("The meaning of life is");

let str = "";
// Stream the response
/* for await (const text of prediction) {
  //process.stdout.write(text);
  //str += text;
} */

async function llm(query){
  const prediction = gemma2b.respond([
    { role: "system", content: "Donne moi un nom de film et je te dirais la date." },
    { role: "user", content: "Inception" },
    { role: "system", content: "Inception est sorti en 2010. Un autre !" },
    { role: "user", content: "voiture" },
    { role: "system", content: "Je ne connais pas ce film. Peut tu m'en dire un autre ?" },
    { role: "user", content: query },
  ]);
  for await (const text of prediction) {
    str += text;
  }
  /* await MovieDataService.findMovieByName(query).then((res) => {
     str+= res;
     //process.stdout.write(res.data[0].original_title);
     str = res.data;
   }); */
}

async function llm2(query){
  const prediction = gemma2b.respond([
    { role: 'system', content: "Fait une réponse courte" },
    { role: 'user', content: query },
  ]);
  
    for await (const text of prediction) {
      str += text;
    }
}

// app.get('/request', async (req, res) => {
//   if (req.query.query){
//     str = "";
//     await llm1(req.query.query)
//     res.send(str)
//   }
//   else{
//     res.send("Vous devez renseigner le paramettre 'query'.")
//   }
// })

// api chatbot
app.post('/request', async (req, res) => {
  if (req.body.query){
    str = "";
    await llm2(req.body.query)
    res.send({response: str})
  }
  else{
    res.send({response: "Vous devez renseigner le paramettre 'query'."})
  }
})

// Index page
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}...`)
})





/* const fetch = require('node-fetch');

const url = 'https://api.themoviedb.org/3/search/movie?query=tenet&include_adult=false&language=en-US&page=1';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OTJjMjhjMzBjOTgyNDI2YzNkOTNiZGMyZTE4MTc5YiIsInN1YiI6IjY2NDViYmFhNDM0MzZkM2M0ZDk1MzRlMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.AWbEA25VbwLLP1eAqnX6ruFAWR7cStxSIVRT3kxZ7ew'
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err)); */