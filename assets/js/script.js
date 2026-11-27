// ===== Config =====
// Keys come from the .env file (see .env.example). Vite swaps these in at build time.
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'advanced-movie-search.p.rapidapi.com';
const STREAMING_API_HOST = 'streaming-availability.p.rapidapi.com';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const STORAGE_KEY = 'titleSearches';
const GENRE_STORAGE_KEY = 'genreSearches';
const MAX_RECENT_SEARCHES = 8;
let searchVersion = 0;

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
  const requestVersion = ++searchVersion;
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

    if (requestVersion !== searchVersion) return;
    renderTitleResult(data);
    if (save) saveTitleSearch(data.Title);
  } catch (error) {
    if (requestVersion !== searchVersion) return;
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
        <div class="streaming-options mt-3">
          <button type="button" class="btn btn-ghost btn-sm" data-streaming-title="${escapeHTML(movie.Title)}">
            Where to stream
          </button>
          <div class="streaming-results mt-2"></div>
        </div>
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
  $('clearSearches').classList.toggle(
    'd-none',
    searches.length === 0 && getRecentGenreSearches().length === 0
  );

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

function getRecentGenreSearches() {
  try {
    const searches = JSON.parse(localStorage.getItem(GENRE_STORAGE_KEY)) || [];
    if (!Array.isArray(searches)) return [];

    return searches.flatMap((search) => {
      if (!search || typeof search !== 'object') return [];
      const id = search.id ?? search.url?.match(/with_genres=(\d+)/)?.[1];
      const name = search.name || Object.keys(genreMapping).find(
        (genre) => genreMapping[genre] === Number(id)
      );
      return id && name ? [{ id: String(id), name: String(name) }] : [];
    });
  } catch {
    return [];
  }
}

function saveGenreSearch(genreId, genreName) {
  const searches = getRecentGenreSearches().filter((search) => search.id !== String(genreId));
  searches.unshift({ id: genreId, name: genreName });
  localStorage.setItem(GENRE_STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)));
  renderGenreSearches();
}

function renderGenreSearches() {
  const listEl = $('previous-genre-searches');
  const searches = getRecentGenreSearches();
  $('clearSearches').classList.toggle(
    'd-none',
    searches.length === 0 && getRecentSearches().length === 0
  );
  listEl.innerHTML = '';

  searches.forEach(({ id, name }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recent-item';
    button.textContent = name;
    button.title = name;
    button.addEventListener('click', () => fetchMoviesByGenre(id, name, { save: false }));
    listEl.appendChild(button);
  });
}

// ===== Browse by genre (RapidAPI Advanced Movie Search) =====
async function fetchMoviesByGenre(genreId, genreName, { save = true, page = 1 } = {}) {
  const requestVersion = page === 1 ? ++searchVersion : searchVersion;
  clearStatus();
  const loadMoreButton = $('loadMoreMovies');
  if (page === 1) {
    showLoading(`Loading ${genreName} movies...`);
  } else if (loadMoreButton) {
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = 'Loading...';
  }

  try {
    const url = `https://${RAPIDAPI_HOST}/discover/movie?with_genres=${genreId}&page=${page}`;
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
    if (requestVersion !== searchVersion) return;

    if (save && page === 1) saveGenreSearch(genreId, genreName);
    renderGenreResults(genreId, genreName, data.results || [], data.page || page, data.total_pages || page);
  } catch (error) {
    if (requestVersion !== searchVersion) return;
    console.error('Error fetching genre:', error);
    if (page === 1) showEmptyState();
    else if (loadMoreButton) {
      loadMoreButton.disabled = false;
      loadMoreButton.textContent = 'Load more movies';
    }
    showStatus('We couldn’t load that genre right now. Please try again in a moment.');
  }
}

function renderGenreResults(genreId, genreName, movies, currentPage, totalPages) {
  if (!movies.length && currentPage === 1) {
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
            <div class="d-flex flex-wrap gap-2">
              <button type="button" class="btn btn-ghost btn-sm" data-title="${escapeHTML(movie.title)}">
                View details
              </button>
              <button type="button" class="btn btn-ghost btn-sm" data-streaming-title="${escapeHTML(movie.title)}">
                Where to stream
              </button>
            </div>
            <div class="streaming-results mt-2"></div>
          </div>
        </article>
      </div>`;
  }).join('');

  if (currentPage === 1) {
    $('movieResults').innerHTML = `
      <h2 class="results-heading">Popular in <strong>${escapeHTML(genreName)}</strong></h2>
      <div id="genreResultsGrid" class="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4"></div>`;
  }
  $('genreResultsGrid').insertAdjacentHTML('beforeend', cards);
  $('loadMoreMovies')?.remove();

  if (currentPage < totalPages) {
    const button = document.createElement('button');
    button.id = 'loadMoreMovies';
    button.type = 'button';
    button.className = 'btn btn-ghost mt-4';
    button.textContent = 'Load more movies';
    button.addEventListener('click', () => {
      fetchMoviesByGenre(genreId, genreName, { save: false, page: currentPage + 1 });
    });
    $('movieResults').appendChild(button);
  }
}

async function fetchStreamingOptions(title, container) {
  container.textContent = 'Searching streaming services...';
  if (!RAPIDAPI_KEY) {
    container.textContent = 'Streaming search is not configured.';
    return;
  }

  const url = new URL(`https://${STREAMING_API_HOST}/shows/search/title`);
  url.searchParams.set('country', 'us');
  url.searchParams.set('title', title);
  url.searchParams.set('series_granularity', 'show');
  url.searchParams.set('show_type', 'movie');
  url.searchParams.set('output_language', 'en');

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': STREAMING_API_HOST,
      },
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const data = await response.json();
    const show = Array.isArray(data) ? data[0] : data;
    const options = show?.streamingOptions?.us || [];
    container.replaceChildren();

    const links = options.filter((option) => {
      try {
        return new URL(option.link).protocol === 'https:';
      } catch {
        return false;
      }
    });

    if (!links.length) {
      container.textContent = 'No streaming options found.';
      return;
    }

    links.forEach((option) => {
      const link = document.createElement('a');
      link.className = 'btn btn-ghost btn-sm me-2 mb-2';
      link.href = option.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = option.service?.name || 'Watch';
      container.appendChild(link);
    });
  } catch (error) {
    console.error('Error fetching streaming options:', error);
    container.textContent = 'Could not load streaming options. Please try again.';
  }
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
    const streamingButton = event.target.closest('[data-streaming-title]');
    if (streamingButton) {
      fetchStreamingOptions(
        streamingButton.dataset.streamingTitle,
        streamingButton.closest('.streaming-options')?.querySelector('.streaming-results') ||
          streamingButton.closest('.movie-card-body').querySelector('.streaming-results')
      );
      return;
    }

    const button = event.target.closest('[data-title]');
    if (button) {
      fetchMovieByTitle(button.dataset.title);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Recent searches
  $('clearSearches').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(GENRE_STORAGE_KEY);
    renderRecentSearches();
    renderGenreSearches();
  });

  renderRecentSearches();
  renderGenreSearches();
  showEmptyState();
});
