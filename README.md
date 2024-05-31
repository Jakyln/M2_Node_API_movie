# M2_Node_API_movie
Une application chatbot NLP en nodeJS.

Cette application renvoi une réponse complète au film demandé par l'utilisateur.

## Comment l'utiliser?

- Envoyer une requête POST à l'endpoint "/request", avec en body l'objet JSON suivant:
{'query': string}
L'objet retourné est l'objet JSON suivant
{'response': string}

![schemas](https://github.com/Jakyln/M2_Node_API_movie/blob/main/schemas.png?raw=true)
