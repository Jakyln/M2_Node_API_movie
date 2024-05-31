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
