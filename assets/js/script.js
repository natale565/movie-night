const openModalBtn = document.getElementById('openModal');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const omdbApiKey = 'af9c33c6';


openModalBtn.addEventListener('click', function() {
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


function fetchOmdbData(data){
const movieTitle = document.getElementbyId('movieInput').value.trim();
 if (movieTitle === '') {
    alert('Please enter movie title');
    return;
 }
 const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(movieTitle)}`;

 fetch(apiUrl)
 .then(response => response.json())
 .then(data => {
    if (data.response === 'True') {
        const movieDetails = `
        <h2> ${data.Title} ($data.Year) </h2>
        <p>Plot:${data.plot}</p>
        <p>IMDB Rating:${data.imdbRating}</p>`
    console.log(movieDetails)
    } else {
        console.log('Movie not found');
    }
 })
 .catch(error => {
    console.error('Error fetching data', error);
 });
}
