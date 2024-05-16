//lancer app :node --env-file=.env index.js
import 'dotenv/config';
import pkg from "@lmstudio/sdk";
import express from 'express';
import MovieDataService from "./MovieDataService.js";
const { LMStudioClient } = pkg;
const app = express();
const port = 3000;
const client = new LMStudioClient();

// Load a model
//const gemma2b = await client.llm.load("lmstudio-ai/gemma-2b-it-GGUF");
const gemma2b = await client.llm.get({ path: "lmstudio-ai/gemma-2b-it-GGUF" });

// Create a text completion prediction
let str = "";

async function llm(query){
  /* const prediction = gemma2b.respond([
    { role: "system", content: "Bonjour ! Je suis un AI assistant expert en films." },
    { role: "user", content: "A partir de maintenant, lorsque tu détecte un nom de film dans mes questions, je veux que tu l'isole et le mette à la fin de ta réponse formaté de cette facon 'Film:\"{NOM_DE_FILM}\"'!" },
    { role: "system", content: "D'accord, je vais garder cela à l'esprit ! Si tu as besoin de discuter de films, n'hésite pas à en mentionner un dans ta question, et je veillerai à inclure son nom à la fin de ma réponse. sans oublier les guiellements autour du nom comme ci : Film:\"{NOM_DE_FILM}\" " },
    { role: "user", content: query },
  ]); */

  const prompt = `Quel est le nom du film dans la phrase suivante ? Attention, nous voulons seulement le titre. La phrase est : "${query}". Réponse :`;
  const prediction = gemma2b.complete(prompt);

    /*const prediction = gemma2b.respond([
      { role: "system", content: "Donne moi un nom de film et je te dirais la date." },
      { role: "user", content: "Inception" },
      { role: "system", content: "Inception est sorti en 2010. Un autre !" },
      { role: "user", content: "voiture" },
      { role: "system", content: "Je ne connais pas ce film. Peut tu m'en dire un autre ?" },
      { role: "user", content: query },
    ]); */

    for await (const text of prediction) {
      str += text;
    }

   await MovieDataService.findMovieByName(str).then((res) => {
     process.stdout.write(`|${str}`);
     str = res.data;
   });
}


app.get('/request', async (req, res) => {
  if (req.query.query){
    str = "";
    await llm(req.query.query);
    res.send(str);
  }
  else{
    res.send("Vous devez renseigner le paramettre 'query'.")
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}...`)
})