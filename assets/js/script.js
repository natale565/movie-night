// ===== Config =====
// Keys come from the .env file (see .env.example). Vite swaps these in at build time.
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'advanced-movie-search.p.rapidapi.com';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const STORAGE_KEY = 'titleSearches';
const MAX_RECENT_SEARCHES = 8;

const genreMapping = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Science Fiction': 878,
  'TV Movie': 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

// ===== Helpers =====
const $ = (id) => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hasValue(value) {
  return value && value !== 'N/A';
}

function posterHTML(src, alt) {
  if (!src) {
    return `<div class="poster poster-placeholder" role="img" aria-label="No poster available">
              <i class="fa-solid fa-film"></i>
            </div>`;
  }
  return `<img src="${escapeHTML(src)}" class="poster" alt="${escapeHTML(alt)} poster" loading="lazy">`;
}

// ===== Status / loading / empty states =====
function showStatus(message, type = 'danger') {
  $('statusMessage').innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${escapeHTML(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

function clearStatus() {
  $('statusMessage').innerHTML = '';
}

function showLoading(label) {
  $('movieResults').innerHTML = `
    <div class="loading-state">
      <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      <span>${escapeHTML(label)}</span>
    </div>`;
}

function showEmptyState() {
  $('movieResults').innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-clapperboard d-block"></i>
      <h3>Nothing playing yet</h3>
      <p class="mb-0">Search for a title above or browse by genre to get started.</p>
    </div>`;
}

// ===== Search by title (OMDb) =====
async function fetchMovieByTitle(title, { save = true } = {}) {
  clearStatus();
  showLoading(`Searching for "${title}"...`);

  try {
    const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);

    const data = await response.json();
    if (data.Response === 'False') {
      const notFound = /not found/i.test(data.Error || '');
      throw new Error(
        notFound ? `We couldn't find "${title}". Check the spelling and try again.` : data.Error
      );
    }

    renderTitleResult(data);
    if (save) saveTitleSearch(data.Title);
  } catch (error) {
    console.error('Error fetching movie:', error);
    showEmptyState();
    showStatus(error.message || 'Something went wrong. Please try again.');
  }
}

function renderTitleResult(movie) {
  const rottenTomatoes = movie.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')?.Value;
  const poster = hasValue(movie.Poster) ? movie.Poster : null;
  const genres = hasValue(movie.Genre) ? movie.Genre.split(',').map((g) => g.trim()) : [];

  const meta = [movie.Year, movie.Rated, movie.Runtime]
    .filter(hasValue)
    .map((m) => `<span>${escapeHTML(m)}</span>`)
    .join('');

  const ratings = [
    hasValue(movie.imdbRating) && { value: `${movie.imdbRating}/10`, source: 'IMDb' },
    hasValue(rottenTomatoes) && { value: rottenTomatoes, source: 'Rotten Tomatoes' },
    hasValue(movie.Metascore) && { value: movie.Metascore, source: 'Metacritic' },
  ].filter(Boolean);

  const credits = [
    ['Director', movie.Director],
    ['Starring', movie.Actors],
  ].filter(([, value]) => hasValue(value));

  $('movieResults').innerHTML = `
    <h2 class="results-heading">Showing results for <strong>${escapeHTML(movie.Title)}</strong></h2>
    <article class="movie-feature">
      <div>${posterHTML(poster, movie.Title)}</div>
      <div>
        <h3 class="movie-feature-title">${escapeHTML(movie.Title)}</h3>
        <div class="meta-line">${meta}</div>
        <div>${genres.map((g) => `<span class="chip">${escapeHTML(g)}</span>`).join('')}</div>
        ${ratings.length ? `
          <div class="ratings">
            ${ratings.map((r) => `
              <div class="rating">
                <div class="rating-value">${escapeHTML(r.value)}</div>
                <div class="rating-source">${escapeHTML(r.source)}</div>
              </div>`).join('')}
          </div>` : ''}
        ${hasValue(movie.Plot) ? `<p class="plot">${escapeHTML(movie.Plot)}</p>` : ''}
        ${credits.length ? `
          <dl class="credits">
            ${credits.map(([label, value]) => `<dt>${label}</dt><dd>${escapeHTML(value)}</dd>`).join('')}
          </dl>` : ''}
      </div>
    </article>`;
}

// ===== Recent searches (localStorage) =====
function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTitleSearch(title) {
  const searches = getRecentSearches().filter((s) => s.toLowerCase() !== title.toLowerCase());
  searches.unshift(title);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)));
  renderRecentSearches();
}

function renderRecentSearches() {
  const listEl = $('previous-title-searches');
  const searches = getRecentSearches();
  $('clearSearches').classList.toggle('d-none', searches.length === 0);

  if (!searches.length) {
    listEl.innerHTML = '<p class="recent-empty">Your searches will show up here.</p>';
    return;
  }

  listEl.innerHTML = '';
  searches.forEach((search) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recent-item';
    button.textContent = search;
    button.title = search;
    button.addEventListener('click', () => fetchMovieByTitle(search, { save: false }));
    listEl.appendChild(button);
  });
}

// ===== Browse by genre (RapidAPI Advanced Movie Search) =====
async function fetchMoviesByGenre(genreId, genreName) {
  clearStatus();
  showLoading(`Loading ${genreName} movies...`);

  try {
    const url = `https://${RAPIDAPI_HOST}/discover/movie?with_genres=${genreId}&page=1`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'No movies found');

    renderGenreResults(genreName, data.results || []);
  } catch (error) {
    console.error('Error fetching genre:', error);
    showEmptyState();
    showStatus('We couldn’t load that genre right now. Please try again in a moment.');
  }
}

function renderGenreResults(genreName, movies) {
  if (!movies.length) {
    showEmptyState();
    showStatus(`No ${genreName} movies found.`, 'warning');
    return;
  }

  const cards = movies.map((movie) => {
    const poster = movie.poster_path ? POSTER_BASE_URL + movie.poster_path : null;
    const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
    const score = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : null;

    return `
      <div class="col">
        <article class="movie-card">
          <div class="poster-wrap">
            ${posterHTML(poster, movie.title)}
            ${score ? `<span class="score-badge"><i class="fa-solid fa-star me-1"></i>${score}</span>` : ''}
          </div>
          <div class="movie-card-body">
            <h3 class="movie-card-title">${escapeHTML(movie.title)}</h3>
            ${year ? `<div class="movie-card-year">${escapeHTML(year)}</div>` : ''}
            <p class="movie-card-overview">${escapeHTML(movie.overview || 'No description available.')}</p>
            <button type="button" class="btn btn-ghost btn-sm" data-title="${escapeHTML(movie.title)}">
              View details
            </button>
          </div>
        </article>
      </div>`;
  }).join('');

  $('movieResults').innerHTML = `
    <h2 class="results-heading">Popular in <strong>${escapeHTML(genreName)}</strong></h2>
    <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">${cards}</div>`;
}

function closeGenreModal() {
  const modalEl = $('formModal');
  bootstrap.Modal.getOrCreateInstance(modalEl).hide();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  if (!OMDB_API_KEY || !RAPIDAPI_KEY) {
    console.warn('Missing API keys. Copy .env.example to .env and add your keys.');
  }

  // Title search
  $('movieName').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $('movieTitleInput');
    const title = input.value.trim();
    if (!title) {
      showStatus('Please enter a movie title.', 'warning');
      input.focus();
      return;
    }
    fetchMovieByTitle(title);
    input.value = '';
  });

  // Genre dropdown + modal form
  const genreSelect = $('movieGenre');
  Object.entries(genreMapping).forEach(([name, id]) => {
    genreSelect.add(new Option(name, id));
  });

  $('taskForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const genreId = genreSelect.value;
    if (!genreId) return;
    const genreName = genreSelect.options[genreSelect.selectedIndex].textContent;
    closeGenreModal();
    fetchMoviesByGenre(genreId, genreName);
    genreSelect.value = '';
  });

  // "View details" on genre cards -> look the movie up on OMDb
  $('movieResults').addEventListener('click', (event) => {
    const button = event.target.closest('[data-title]');
    if (button) {
      fetchMovieByTitle(button.dataset.title);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Recent searches
  $('clearSearches').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    renderRecentSearches();
  });

  renderRecentSearches();
  showEmptyState();
});
