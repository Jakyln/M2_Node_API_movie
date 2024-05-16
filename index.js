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

async function llm1(query){
  const prediction = gemma2b.complete(query);
  
    for await (const text of prediction) {
      str += text;
    }
}

async function llm2(query){
  const prediction = gemma2b.respond(
    [{ role: 'system', content: "Tu dois trouver le verbe de la phrase suivante en donnant une réponse la plus courte possible." },
    { role: 'user', content: query }]
  );
  
    for await (const text of prediction) {
      str += text;
    }
}


app.get('/request', async (req, res) => {
  if (req.query.query){
    str = "";
    await llm1(req.query.query)
    res.send(str)
  }
  else{
    res.send("Vous devez renseigner le paramettre 'query'.")
  }
})

app.get('/request2', async (req, res) => {
  if (req.query.query){
    str = "";
    await llm2(req.query.query)
    res.send(str)
  }
  else{
    res.send("Vous devez renseigner le paramettre 'query'.")
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}...`)
})