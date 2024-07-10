// const searchFormEl = document.getElementById('taskForm');

// searchFormEl.addEventListener('submit', function(event) {
//     event.preventDefault();
//     const movieTitle = document.getElementById('movieTitle').value;
//     const genre = document.getElementById('genre').value;
//     const year = document.getElementById('year').value;
//     const apiKey='af9c33c6'

//     if (movieTitle !== "") {
//         console.log("Movie title is filled out. Form can be submitted.");
    
//         if ((genre !== "" && year === "") || (year !== "" && genre === "")) {
//             console.log("Either genre or year is filled out. The other is required.");
//             // Add your form submission logic here
//             const post = { movieTitle, genre, year };
//             let posts = JSON.parse(localStorage.getItem('movies')) || [];
//             posts.push(post);
//             localStorage.setItem('movies', JSON.stringify(posts));
    
//             // Redirect to search results page
//             window.location.href = 'search-results.html';
//         } else {
//             console.log("Either genre or year should be filled out, and the other is required.");
//         }
//     } else {
//         console.log("Movie title is required.");
//     }
// });

// Search by movie title function and get movie title/details/year/image/genre
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
        console.log(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch movie data. Please try again.');
      });
  });

// Search movie by genre function
document.getElementById('').addEventListener('submit', function(event) { //Update getElementById to correct form
    event.preventDefault();

    const apiKey = '2155496cf9mshec9d20788864224p1f59bajsn1d032f45b0ba';
    const apiUrl = 'https://moviesminidatabase.p.rapidapi.com/movie/byGen/';
    const movieGenre = document.getElementById('').value.trim(); //Update getElementById to correct input field

    getMovieGenre(movieGenre, apiKey, apiUrl);
});

function getMovieGenre(movieGenre, apiKey, apiUrl) {
    const url = new URL(apiUrl);
    url.searchParams.append('genre', encodeURIComponent(movieGenre));
    url.searchParams.append('type', 'movie');

    fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'moviesminidatabase.p.rapidapi.com',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.Response === 'False') {
            throw new Error(data.Error || 'Movies not found');
        }
        console.log(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch movie data. Please try again.');
    });
};

//Search by year function
document.getElementById('').addEventListener('submit', function(event) { //Update getElementById to correct form
    event.preventDefault();

    const movieYear = document.getElementById('').value.trim(); //Update getElementById to correct input field
    if (movieYear === '') {
      alert('Please enter a movie Year');
      return;
    }
  
    const apiKey = 'af9c33c6';
    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&y=${movieYear}`;
  
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
        console.log(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch movie data. Please try again.');
      });
  });

//Get where to stream function
document.getElementById('').addEventListener('submit', function(event) { //Update getElementById to correct form
    event.preventDefault();

    const apiKey = '2155496cf9mshec9d20788864224p1f59bajsn1d032f45b0ba';
    const apiUrl = 'https://streaming-availability.p.rapidapi.com/shows/search/title';
    const streamLocation = document.getElementById('').value.trim(); //Update getElementById to correct input field

    getStreaming(streamLocation, apiKey, apiUrl);
});

function getStreaming(streamLocation, apiKey, apiUrl) {
    const url = new URL(apiUrl);
    url.searchParams.append('series_granularity', 'show');
    url.searchParams.append('show_type', 'movie');
    url.searchParams.append('output_language', 'en');
    url.searchParams.append('where_to_stream', streamLocation);

    fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.Response === 'False') {
            throw new Error(data.Error || 'Movies not found');
        }
        console.log(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch movie data. Please try again.');
    });
};


  
$(document).ready(function() {
    const availableGenres = [
      "Action",
      "Adventure",
      "Animation",
      "Comedy",
      "Crime",
      "Drama",
      "Fantasy",
      "Horror",
      "Mystery",
      "Romance",
      "Science Fiction",
      "Thriller",
      "Western"
    ];

    $('#movieGenreModal').autocomplete({
      source: availableGenres
    });

    // Hide the modal after adding task
//     $('#formModal').modal('hide');
  });

//function to display movie details from title/year search
//function displayMovieDetails(movieData){
//     const movieResults = document.getElementById('Where to display the movie');
//     movieResults.innerHTML=`
//      <div class="card">
//       <div class="card-body">
//            <img src="${data.Poster}" alt="Movie Poster">
// //         <h5 class="card-title">${movieData.Title} (${movieData.Year})</h5>
// //         <p class="card-text">Genre:${movieData.Genre}</p>
// //         <p class="card-text">Plot:${movieData.Plot}</p>
// //         <p class="card-text">IMDB Rating:${movieData.imdbRating}</p>
//       </div>
//     </div>
//   `;
// }
 // Get the modal element
 let modal = document.getElementById('formModal');

 // Get the button that opens the modal
 let openModalBtn = document.querySelector('[data-bs-target="#formModal"]');
 
 // Get the form inside the modal
 let form = document.getElementById('taskForm');
 
 // Get the input fields inside the form
 let movieGenreInput = document.getElementById('movieGenre');
 let movieYearInput = document.getElementById('movieYear');
 
 // When the user clicks the button to open the modal
 openModalBtn.addEventListener('click', function() {
   modal.style.display = 'block';
 });
 
 // When the user clicks the close button or outside of the modal, close it
 modal.addEventListener('click', function(event) {
   if (event.target === modal) {
     modal.style.display = 'none';
   }
 });
 
 // When the form is submitted
 form.addEventListener('submit', function(event) {
   event.preventDefault(); // Prevent the default form submission
 
   // Get the values entered by the user
   let movieGenre = movieGenreInput.value;
   let movieYear = movieYearInput.value;
 
   // Perform any necessary actions with the form data (e.g., submit to a server, update UI, etc.)
 
   // Close the modal after form submission
   modal.style.display = 'none';
 
   // Optionally, you can reset the form fields
   form.reset();
 });
 