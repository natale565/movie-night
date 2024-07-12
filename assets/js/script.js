// Display movie details function
function displayTitleMovies(movie, streamingOptions) {
  const movieResultsEl = document.getElementById('movieResults');
  const headerElement = document.createElement('h4');
  headerElement.textContent = `Showing Results For: ${movie.Title}`;
  movieResultsEl.innerHTML = '';
  movieResultsEl.appendChild(headerElement);
  
  const movieHTML = `
    <div class="card mb-4">
      <div class="row g-0">
        <div class="col-md-4">
          <img src="${movie.Poster}" class="img-fluid rounded-start" alt="${movie.Title}">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${movie.Title}</h5>
            <p class="card-text">Year: ${movie.Year}</p>
            <p class="card-text">Genre: ${movie.Genre}</p>
            <p class="card-text">🍅Rotten Tomatoes Score: ${movie.Ratings.find(rating => rating.Source === 'Rotten Tomatoes').Value}</p>
            <p class="card-text">${movie.Plot}</p>
            <button class="btn btn-info btn-sm" id="streamingOptionsBtn">Streaming Options</button>
            <div id="streaming-options"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  movieResultsEl.innerHTML += movieHTML;
}

document.addEventListener('DOMContentLoaded', function() {
  // Event listener for movie search form
  document.getElementById('movieName').addEventListener('submit', function(event) {
    event.preventDefault();

    const movieTitle = document.getElementById('movieTitleInput').value.trim();
    if (movieTitle === '') {
      alert('Please enter a movie title');
      return;
    }
  
    const apiKey = 'af9c33c6';
    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(movieTitle)}`;
  
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.Response === 'False') {
          throw new Error(data.Error || 'Movie not found');
        }
        displayTitleMovies(data); 
        saveTitleSearch(movieTitle);
        
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch movie data. Please try again.');
      });
      
      document.getElementById('movieTitleInput').value = '';  
  });

  displayPreviousTitleSearches();

  function saveTitleSearch(movieTitle) {
    let searches = JSON.parse(localStorage.getItem('titleSearches')) || [];
    searches.push(movieTitle);
    localStorage.setItem('titleSearches', JSON.stringify(searches));
    displayPreviousTitleSearches();
  }

  function displayPreviousTitleSearches() {
    const previousTitleSearchEl = document.getElementById('previous-title-searches');
    previousTitleSearchEl.innerHTML = '';

    let searches = JSON.parse(localStorage.getItem('titleSearches')) || [];
    searches.forEach(search => {
      const searchButton = document.createElement('button');
      searchButton.classList.add('btn', 'btn-outline-secondary', 'mb-2', 'full-width-button');
      searchButton.textContent = search;
      searchButton.addEventListener('click', function() {
        fetchMovieDetailsAndDisplay(search);
      });

      previousTitleSearchEl.appendChild(searchButton);
    });
  }

  function fetchMovieDetailsAndDisplay(movieTitle) {
    const apiKey = 'af9c33c6';
    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(movieTitle)}`;
  
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.Response === 'False') {
          throw new Error(data.Error || 'Movie not found');
        }
        displayTitleMovies(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch movie data. Please try again.');
      });
  }
  
});
// End of movie title and display functions

// Get movie genre and display functions
function displayGenreMovies(genreName, movies) {
  const movieResultsElement = document.getElementById('movieResults');
  movieResultsElement.innerHTML = '';

  const headerElement = document.createElement('h5');
  headerElement.textContent = `Showing Search Results For: ${genreName}`;
  headerElement.classList.add('mb-4');
  movieResultsElement.appendChild(headerElement);

  const posterBaseUrl = 'https://image.tmdb.org/t/p/w500';
  
  movies.forEach(movie => {
    const posterPath = movie.poster_path ? posterBaseUrl + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Poster';
    const movieCard = `
      <div class="card mb-4">
        <div class="row">
          <div class="col-md-4">
            <img src="${posterPath}" class="img-fluid rounded-start" alt="${movie.title}">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
              <p class="card-text">⭐️IMDb Rating: ${movie.vote_average}/10 </p>
              <p class="card-text">${movie.overview}</p>
             <button class="btn btn-info btn-sm" id="streamingOptionsBtn">Streaming Options</button>
            <div id="streaming-options"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    movieResultsElement.innerHTML += movieCard;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Your existing code for genre selection and form submission

  // Example usage:
  // fetchMoviesByGenre(apiKey, apiUrl, genreName); // This function should call displayGenreMovies with the correct parameters
});


const genreMapping = {
  "Action": 28,
  "Adventure": 12,
  "Animation": 16,
  "Comedy": 35,
  "Crime": 80,
  "Documentary": 99,
  "Drama": 18,
  "Family": 10751,
  "Fantasy": 14,
  "History": 36,
  "Horror": 27,
  "Music": 10402,
  "Mystery": 9648,
  "Romance": 10749,
  "Science Fiction": 878,
  "TV Movie": 10770,
  "Thriller": 53,
  "War": 10752,
  "Western": 37
};


document.addEventListener('DOMContentLoaded', function() {
    const genreSelect = document.getElementById('movieGenre');
    for (const genre in genreMapping) {
      const genreId = genreMapping[genre];
      genreSelect.innerHTML += `<option value="${genreId}">${genre}</option>`;
    }
    
    document.getElementById('taskForm').addEventListener('submit', function(event) {
      event.preventDefault();
  
      const apiKey = '2155496cf9mshec9d20788864224p1f59bajsn1d032f45b0ba';
      const baseApiUrl = 'https://advanced-movie-search.p.rapidapi.com/discover/movie?with_genres=';
      const genreSelect = document.getElementById('movieGenre');
      const selectedGenreId = genreSelect.value;
  
      if (!selectedGenreId) {
        alert('Please select a movie genre.');
        return;
      }

      const selectedOption = genreSelect.options[genreSelect.selectedIndex];
      const genreName = selectedOption ? selectedOption.textContent : 'Unknown Genre';
      const apiUrl = `${baseApiUrl}${selectedGenreId}&page=1`;
  
      fetchMoviesByGenre(apiKey, apiUrl, genreName);

      document.getElementById('movieGenre').value = '';
    });
  });
  
  function fetchMoviesByGenre(apiKey, apiUrl, genreName) {
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'advanced-movie-search.p.rapidapi.com'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch movie data. Server returned ' + response.status + ' ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data.error) {
        throw new Error(data.error.message || 'Movies not found');
      }
  
      displayGenreMovies(genreName, data.results);
      saveGenreSearch(apiUrl);
      closeModal();
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      alert('Failed to fetch movie data. Please try again later.');
    });
  }
  
function fetchMoviesByGenre(apiKey, apiUrl) {
  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'advanced-movie-search.p.rapidapi.com'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch movie data. Server returned ' + response.status + ' ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    if (data.error) {
      throw new Error(data.error.message || 'Movies not found');
    }
    
    const genreSelect = document.getElementById('movieGenre');
    const selectedOption = genreSelect.options[genreSelect.selectedIndex];
    const genreName = selectedOption ? selectedOption.textContent : 'Unknown Genre';
    
    console.log(data);
    displayGenreMovies(genreName, data.results);
    saveGenreSearch(apiUrl);
    closeModal();
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    alert('Failed to fetch movie data. Please try again later.');
  });
}


function saveGenreSearch(genreUrl) {
  let searches = JSON.parse(localStorage.getItem('genreSearches')) || [];
  searches.push(genreUrl);
  localStorage.setItem('genreSearches', JSON.stringify(searches));
}

function closeModal() {
  const modalElement = document.getElementById('formModal');
  const modal = bootstrap.Modal.getInstance(modalElement);
  modal.hide();
}
//End of search by genre and display functions

// Get where to stream function
// document.getElementById('movieName').addEventListener('submit', function(event) {
//   event.preventDefault();

//   const apiKey = '2155496cf9mshec9d20788864224p1f59bajsn1d032f45b0ba';
//   const apiUrl = 'https://streaming-availability.p.rapidapi.com/shows/search/title';
//   const movieName = document.getElementById('movieTitleInput').value;

//   getStreaming(movieName, apiKey, apiUrl);
// });


// document.getElementById('movieName').addEventListener('submit', function(event) {
//   event.preventDefault();

//   const apiKey = '2155496cf9mshec9d20788864224p1f59bajsn1d032f45b0ba';
//   const apiUrl = 'https://streaming-availability.p.rapidapi.com/shows/search/title';
//   const movieName = document.getElementById('movieTitleInput').value;

//   getStreaming(movieName, apiKey, apiUrl);
// });

// function getStreaming(movieName, apiKey, apiUrl) {
//   const url = new URL(apiUrl);
//   url.searchParams.append('country', 'us');
//   url.searchParams.append('title', movieName);
//   url.searchParams.append('series_granularity', 'show');
//   url.searchParams.append('show_type', 'movie');
//   url.searchParams.append('output_language', 'en');

//   fetch(url, {
//     method: 'GET',
//     headers: {
//       'x-rapidapi-key': apiKey,
//       'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
//     }
//   })
//   .then(response => {
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     return response.json();
//   })
//   .then(data => {
//     if (data.Response === 'False') {
//       throw new Error(data.Error || 'Movies not found');
//     } else {
//       // Process the data here, like displaying streaming platforms
//       console.log(data);
//     }
//   })
//   .catch(error => {
//     console.error('Error fetching data:', error);
//     alert('Failed to fetch movie data. Please try again.');
//   });
// }
