import Axios from "axios";

const MOVIE_API_URL = process.env.TMDB_MOVIE_API_KEY;
const baseUrl = "https://api.themoviedb.org/3";

class MovieDataService {
    /* addMovie(data) {
        return Axios.post(`${baseUrl}/Movie`, data);
    } */

    findMovieByName(movieName) {
        return Axios.get(`${baseUrl}/search/movie?query=${encodeURIComponent(movieName)}&language=fr-FR&api_key=${MOVIE_API_URL}`);
    }


    
}
export default new MovieDataService();

//https://api.themoviedb.org/3/search/movie?query=Jack+Reacher&api_key=692c28c30c982426c3d93bdc2e18179b
