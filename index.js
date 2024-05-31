//lancer app :node --env-file=.env index.js
import 'dotenv/config';
import express from 'express';
import MovieDataService from "./MovieDataService.js";
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();
const port = 3000;
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())

import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuration requise pour GoogleGenerativeAI
const configuration = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);

// initialisation de modèle
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
]; 

// initialisation de modèle
const geminiId = "gemini-1.5-flash";
const geminiFlash = configuration.getGenerativeModel({ model: geminiId, safetySettings });


// Fonction qui recherche un titre de film dans la phrase passé en paramètre pour récupérer des information
// via l'api TMDB. Le LLM cherche le film qui correspond le mieux dans la liste et génère un résultat
// qui sera retourné à l'utilisateur.
// Si l'api TMBD n'a pas retourné de résultat ou si aucun titre de film n'a été trouvé dans la phrase
// passé en paramètre, alors on retourne une réponse indiquant ce qui a échoué.
async function llm(query) {
  let jsonAPI = "";
  let readableJson = "";

  //Isoler le nom du film à partir du user input
  const promptMovieName = `
  Quel est le nom du film dans la phrase suivante ? 
  Si tu remarque des fautes, tu peux les corriger implicitement sans m'en informer. 
  Attention, nous voulons seulement le titre. C'est très important car ta réponse sera envoyé à une API externe pour trouver le film. 
  Si tu ne trouve pas de titre de film dans la réponse, répond par une chaine vide "".
  La phrase est : "${query}"`;
  const generatedMovieName = await geminiFlash.generateContent(promptMovieName);
  const movieNameResponse = await generatedMovieName.response;
  const movieName = movieNameResponse.text(); 
  
  // Si pas de titre de film, répondre que l'on a pas trouvé 
  if (movieName.trim() === '""') {
    readableJson = "Je n'ai pas trouvé de nom de film dans votre requête."
    return readableJson
  } 
  else {
    //Recup appel json API externe movies 
    let movieArraySimplified = [];
    let movieArrayJSON = [];
    await MovieDataService.findMovieByName(movieName).then((res) => {
      process.stdout.write(`|${movieName}\n`);
      movieArrayJSON = res.data; 
      //Si L'api renvoie plusieurs résultats, on fait donne la liste à Gemini pour qu'il l'analyse et ressorte le bon titre
      if(movieArrayJSON){
        for (let index = 0; index < res.data.results.length; index++) {
          const element = res.data.results[index];
          movieArraySimplified.push(element.title);
        }
      }
      
    });

 


    const promptVerifRightMovie = `
    J'ai fait une demande à une API de film à partir d'un titre en entré, et il m'a ressorti une liste.
    Cependant, le titre en entré n'est parfois pas exact et l'api renverra une erreur.
    J'ai besoin que tu analyse cette liste, et qui tu ressorte l'élément qui correspond le mieux au titre d'entré envoyé par l'utilisateur.  
    Attention, je ne veux pas que ta réponse soit une phrase, je veux uniquement le titre et rien d'autre, car ta réponse sera envoyé à l'api en question. 
    Le titre d'entré : "${movieName}". La liste : "${movieArraySimplified}".
    `; 
 
    const verifRightMovie = await geminiFlash.generateContent(promptVerifRightMovie);
    const responseVerifRightMovie = await verifRightMovie.response; 
    const titleRightMovie = responseVerifRightMovie.text();
    let indexRightMovie = -1; 
    process.stdout.write(`\n|${titleRightMovie},`); 
    for (let index = 0; index < movieArraySimplified.length; index++) { 
      const title = movieArraySimplified[index];
      if (title.trim() === titleRightMovie.trim()) { 
        indexRightMovie = index;
      }
    }

    if(movieArrayJSON){
      jsonAPI = movieArrayJSON.results[indexRightMovie];
    }
 
    //LLM traduit en textuel le json
    const promptReadableJson = `
    A partir de l'objet JSON que je vais t'envoyer, dis moi ce que tu sais du film. 
    Evidemment, je ne veux pas que tu m'énumère les propriétés de l'objet JSON en lui même. 
    Tu peux également complémenter avec tes propres informations. L'objet JSON : ${JSON.stringify(jsonAPI)}`
    const predictionOfReadableJson = await geminiFlash.generateContent(promptReadableJson);
    const response = await predictionOfReadableJson.response; 
    readableJson = response.text();

    // Si l'api TMBD n'a pas renvoyé de résultat, on répond que l'on a pas trouvé
    if (!jsonAPI) {
      readableJson = "Je n'ai pas trouvé d'information à propos du film que vous m'avez donné." 
      return readableJson
    }
  }
  return readableJson
}

// Index page (utilisé pour les tests)
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.listen(port, () => { 
  console.log(`Example app listening on port ${port}...`)
})


// Endpoint qui traite l'entrée de l'utilisateur pour chercher quel film est mentionné 
// et renvoyer un prompt généré à partir des résultats fournis par l'api TMDB
app.post('/request', async (req, res) => {
  if (req.body.query) {
    const response = await llm(req.body.query)
    res.send({ response: response })
  }
  else {
    res.send({ response: "Vous devez renseigner le paramettre 'query'." }) 
  }
})

/*
L'utilisateur envoie une phrase input avec un nom de film
On lance un prompt pour dire aux llm de ressortir uniquement le nom du film à partir de la phrase
Avec ce nom de film on fait un appel API TMDB pour aller chercher le json des infos de ce film
On envoie ce json

A partir d'un input utilisateur parlant d'un film, le llm présente les données du film à partir du JSON d'une api distante

*/