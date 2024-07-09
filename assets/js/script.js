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

// Search by movie title logic to console log
// document.getElementById('form').addEventListener('submit', function(event) {
//     event.preventDefault();

//     const movieTitle = document.getElementById('movieTitleInput').value.trim();
//     if (movieTitle === '') {
//       alert('Please enter a movie title');
//       return;
//     }
  
//     const apiKey = 'af9c33c6';
//     const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(movieTitle)}`;
  
//     fetch(apiUrl)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         return response.json();
//       })
//       .then(data => {
//         if (data.Response === 'False') {
//           throw new Error(data.Error || 'Movie not found');
//         }
//         console.log(data);
//       })
//       .catch(error => {
//         console.error('Error fetching data:', error);
//         alert('Failed to fetch movie data. Please try again.');
//       });
//   });

// function displayMovieDetails(movieData){
//     const movieResults = document.getElementById('Where to display the movie');
//     movieResults.innerHTML=`
//      <div class="card">
//       <div class="card-body">
//         <h5 class="card-title">${movieData.Title} (${movieData.Year})</h5>
//         <p class="card-text">Genre:${movieData.Genre}</p>
//         <p class="card-text">Plot:${movieData.Plot}</p>
//         <p class="card-text">IMDB Rating:${movieData.imdbRating}</p>
//       </div>
//     </div>
//   `;
// }

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const apiKey = '2155496cf9mshec9d20788864224p1f59bajsn1d032f45b0ba';
    const apiUrl = 'https://moviesdatabase.p.rapidapi.com/titles/search/title/';
    const movieTitle = document.getElementById('movieTitleInput').value.trim();

    getMovieDetails(movieTitle, apiKey, apiUrl);
});

function getMovieDetails(movieTitle, apiKey, apiUrl) {
    const url = new URL(apiUrl + encodeURIComponent(movieTitle));
    url.searchParams.append('exact', 'true');
    url.searchParams.append('titleType', 'movie');

    fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'moviesdatabase.p.rapidapi.com',
            'useQueryString': true
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);

    })
    .catch(error => {
        console.error('Error fetching movie details:', error);
    });
}
