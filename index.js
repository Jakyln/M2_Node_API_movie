//lancer app :node --env-file=.env index.js
import 'dotenv/config';
import express from 'express';
import MovieDataService from "./MovieDataService.js";
import path from 'path';
import { fileURLToPath } from 'url';
/* import pkg from "@lmstudio/sdk";
const { LMStudioClient } = pkg; */
const app = express();
const port = 3000;
// const client = new LMStudioClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())

// Load models
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuration requise pour GoogleGenerativeAI
const configuration = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);

// initialisation de modèle
const geminiId = "gemini-1.5-flash";
const geminiFlash = configuration.getGenerativeModel({ model: geminiId });









/* import bodyParserpackage from "body-parser";
const bodyParser = bodyParserpackage;
import { generateResponse } from "./controller/index.js";

//middleware to parse the body content to JSON
app.use(bodyParser.json());

app.post("/generate", generateResponse);

app.get("/generate", (req, res) => {
  res.send(history);
});
 */







// Create a text completion prediction
let movieName = "";
let jsonAPI = "";
let readableJson = "";

async function llm(query){
  movieName = "";
  //Isoler le nom du film à partir du user input
  const promptMovieName = `Quel est le nom du film dans la phrase suivante ? Attention, nous voulons seulement le titre. La phrase est : "${query}". Réponse :`;
  const predictionOfMovieName = geminiFlash.generateContent(promptMovieName);
//répond moi en json, formater ex : {reponse : tenet}
     //connecter à chatgpt. il verif qu'on a bien extrait le nom dans la bonne langue, sans erreurs
    for await (const text of predictionOfMovieName) {
      movieName += text;
    }

  //Recup appel json API externe movies
   await MovieDataService.findMovieByName(movieName).then((res) => {
     process.stdout.write(`|${movieName}`);
     //connecter à chatgpt. Si L'api renvoie plusieurs résultats, on prend une map avec l'index et le nom du film. On demande à chat gpt d'analyser la prompt user initial et de ressortir le bon id. On choisit celui ci dans jsonapi
     jsonAPI = JSON.stringify(res.data.results[0]);
   });

  //LLM traduit en textuel le json
  //Bonjour, j'aime beacoup Tenet, c'est mon film préféré !
  //Ne génère pas de code Python, uniquement du HTML formaté selon les instructions ci-dessous
  const promptReadableJson =  `
   A partir de l'objet JSON que je vais t'envoyer, dis moi ce que tu sais du film. Evidemment, je ne veux pas que tu m'énumère les propriétés de l'objet JSON en lui même. Tu peux également complémenter avec tes propres informations. L'objet JSON : ${jsonAPI}`
  const predictionOfReadableJson = await geminiFlash.generateContent(promptReadableJson);
  const response = await predictionOfReadableJson.response;
  readableJson = response.text();
}

// Index page
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}...`)
})


app.post('/request', async (req, res) => {
  if (req.body.query){
    readableJson = "";
    await llm(req.body.query)
    res.send({response: readableJson})
  }
  else{
    res.send({response: "Vous devez renseigner le paramettre 'query'."})
  }
})

/*
L'utilisateur envoie une phrase input avec un nom de film
On lance un prompt pour dire aux llm de ressortir uniquement le nom du film à partir de la phrase
Avec ce nom de film on fait un appel API TMDB pour aller chercher le json des infos de ce film
On envoie ce json

-- futur
On cache la réponse llm completion
on lance ensuite une autre réponse llm completion, avec comme contexte une demande de ressortir en mode language le fichier json recu de l'api
on lance ensuite une réponse llm chatbot, avec comme contexte, le résultat de la réponse précédante
*/




   /* 
   const predictionChatbot = gemma2b.respond([
    { role: "system", content: "Bonjour, je suis une IA experte en films. Parlons de film ensemble !" },
    { role: "user", content: `${movieName}` },
    { role: "system", content:  },
    { role: "user", content: "voiture" },
    { role: "system", content: "Je ne connais pas ce film. Peut tu m'en dire un autre ?" },
    { role: "user", content: query },
  ]);

  for await (const text of predictionReadableJson) {
    readableJson += text;
  }

  Faire un schéma du resumé suivant

A partir d'un input utilisateur parlant d'un film, le llm présente les données du film à partir du JSON d'une api distante
    */
