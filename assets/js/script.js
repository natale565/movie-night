const searchFormEl = document.getElementById('taskForm');
const movieTitle = document.getElementById('movieTitle').value;
const genre = document.getElementById('genre').value;
 const year = document.getElementById('year').value;

searchFormEl.addEventListener('submit', function(event) {
    event.preventDefault();

    if (movieTitle !== "") {
        console.log("Movie title is filled out. Form can be submitted.");
    
        if ((genre !== "" && year === "") || (year !== "" && genre === "")) {
            console.log("Either genre or year is filled out. The other is required.");
            // Add your form submission logic here
            const post = { movieTitle, genre, year };
            let posts = JSON.parse(localStorage.getItem('movies')) || [];
            posts.push(post);
            localStorage.setItem('movies', JSON.stringify(posts));
    
            // Redirect to search results page
            window.location.href = 'search-results.html';
        } else {
            console.log("Either genre or year should be filled out, and the other is required.");
        }
    } else {
        console.log("Movie title is required.");
    }
});