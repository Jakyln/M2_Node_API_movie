import 'dotenv/config';
import GoogleGenerativeAIPackage from "@google/generative-ai";
const { GoogleGenerativeAI } = GoogleGenerativeAIPackage;

// Configuration requise pour GoogleGenerativeAI
const configuration = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);

// initialisation de modèle
const modelId = "gemini-1.5-flash";
const model = configuration.getGenerativeModel({ model: modelId, generationConfig });


/* const generationConfig = {
    stopSequences: ["red"],
    maxOutputTokens: 200,
    temperature: 0.9,
    topP: 0.1,
    topK: 16,
  }; */
  
//const model = configuration.getGenerativeModel({ model: modelId, generationConfig });

export const history = [];



/**
 * Génère une réponse sur la base de demande de l'utilisateur.
 * @param {Object} req - L'objet de requête.
 * @param {Object} res - L'objet de reponse.
 * @returns {Promise} - Une promesse qui se résout lorsque la réponse est envoyée.
 */
export const generateResponse = async (req, res) => {
    try {
      const { prompt } = req.body;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log(text);
  
      history.push(text);
      console.log(history);
  
      res.send({ response: text });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  