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
const gemma2b = await client.llm.get({ path: "lmstudio-ai/gemma-2b-it-GGUF" });

// Create a text completion prediction
let movieName = "";
let jsonAPI = "";
let readableJson = "";

async function llm(query){
  //Isoler le nom du film à partir du user input
  const promptMovieName = `Quel est le nom du film dans la phrase suivante ? Attention, nous voulons seulement le titre. La phrase est : "${query}". Réponse :`;
  const predictionOfMovieName = gemma2b.complete(promptMovieName);
//répond moi en json, formater ex : {reponse : tenet}
    for await (const text of predictionOfMovieName) {
      movieName += text;
    }

  //Recup appel json API externe movies
   await MovieDataService.findMovieByName(movieName).then((res) => {
     process.stdout.write(`|${movieName}`);
     jsonAPI = JSON.stringify(res.data.results[0]);
   });

  //LLM traduit en textuel le json
  //Bonjour, j'aime beacoup Tenet, c'est mon film préféré !
  //Ne génère pas de code Python, uniquement du HTML formaté selon les instructions ci-dessous
  const promptReadableJson = `
    A partir de cet objet JSON, présente-moi ce film sous forme de liste à puces en HTML :

    Format attendu :

    <ul>
      <li><strong>Titre :</strong> [title]</li>
      <li><strong>Année de sortie :</strong> [release_date]</li>
      <li><strong>Langue :</strong> [original_language]</li>
      <li><strong>Synopsis :</strong> [overview]</li>
      <li><strong>Rang :</strong> [popularity]</li>
    </ul>

    Voici les données du film :
    ${jsonAPI}
  `;
  const predictionOfReadableJson = gemma2b.complete(promptReadableJson);
  for await (const text of predictionOfReadableJson) {
    readableJson += text;
  }
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
