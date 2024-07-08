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

