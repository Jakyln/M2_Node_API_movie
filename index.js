import pkg from "@lmstudio/sdk";
import express from 'express';

//const express = require('express')

const { LMStudioClient } = pkg;

const app = express();
const port = 3000;
const client = new LMStudioClient();

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
}


app.get('/request', async (req, res) => {
  if (req.query.query){
    str = "";
    await llm(req.query.query)
    res.send(str)
  }
  else{
    res.send("Vous devez renseigner le paramettre 'query'.")
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}...`)
})