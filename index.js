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
const prediction = gemma2b.complete("The meaning of life is");

let str = "";
// Stream the response
/* for await (const text of prediction) {
  //process.stdout.write(text);
  //str += text;
} */


app.get('/', (req, res) => {
  res.send(`${str}`)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}...`)
})