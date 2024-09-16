const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

app.use(express.json())

const initailizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server started at http://localhost:/3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

const convertDbResponseObjectToObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDbDirectorToObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
// api to get all movies list

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT * FROM movie ORDER BY movie_id
    `
  const moviesList = await db.all(getMoviesQuery)
  response.send(moviesList.map(convertDbResponseObjectToObject))
})

// api to add movie
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
    INSERT INTO movie (movie_name, director_id,lead_actor)
    VALUES(
      '${movieName}',
      ${directorId},
      '${leadActor}'
    )
  `
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

// api to get a movie

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId}
  `
  const movieDetail = await db.get(getMovieQuery)
  response.send(movieDetail)
})

//api to update movie details

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {movieName, directorId, leadActor} = movieDetails
  const updateMovieDetails = `
    UPDATE movie
    SET movie_name='${movieName}',
    director_id = '${directorId}',
    lead_actor='${leadActor}'
    WHERE movie_id=${movieId}
  `
  await db.run(updateMovieDetails)
  response.send('Movie Details Updated')
})

// api to delete movie
app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteBookQuery = `
    DELETE FROM movie WHERE movie_id=${movieId}
  `
  await db.run(deleteBookQuery)
  response.send('Movie Removed')
})

// api to get directors list

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director ORDER BY director_id
  `
  const directorsList = await db.all(getDirectorsQuery)
  response.send(directorsList.map(convertDbDirectorToObject))
})

// api to get director movies

app.get("/directors/:directorId/movies/", async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovies = `
    SELECT * FROM movie WHERE director_id=${directorId}
  `
  const directorMoviesList = await db.all(getDirectorMovies)
  response.send(directorMoviesList)
})


initailizeDbAndServer()

module.exports = app
