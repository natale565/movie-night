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

 // Hide the modal after adding task
  $('#formModal').modal('hide');


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

  // Optionally, you cannn reset the form fields
  form.reset();
});

