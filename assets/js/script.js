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

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault(); //

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
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch movie data. Please try again.');
      });
  });
  
  const formEl = $('#form');
  const genreInputEl = $('#movieGenre')

  $( function() {
    const availableGenres = [
      "ActionScript",
      "AppleScript",
      "Asp",
      "BASIC",
      "C",
      "C++",
      "Clojure",
      "COBOL",
      "ColdFusion",
      "Erlang",
      "Fortran",
      "Groovy",
      "Haskell",
      "Java",
      "JavaScript",
      "Lisp",
      "Perl",
      "PHP",
      "Python",
      "Ruby",
      "Scala",
      "Scheme"
    ];
    $( "#movieGenre" ).autocomplete({
      source: availableGenres
    });
  } );