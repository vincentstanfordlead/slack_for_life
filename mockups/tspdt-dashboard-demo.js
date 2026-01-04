const rawFilms = [
    { rank: 1, title: 'Citizen Kane', year: 1941, directors: ['Orson Welles'], countries: ['USA'], genres: ['Drama'], points: 998 },
    { rank: 2, title: 'Vertigo', year: 1958, directors: ['Alfred Hitchcock'], countries: ['USA'], genres: ['Mystery', 'Thriller'], points: 978 },
    { rank: 3, title: 'Tokyo Story', year: 1953, directors: ['Yasujiro Ozu'], countries: ['Japan'], genres: ['Drama'], points: 965 },
    { rank: 4, title: 'The Rules of the Game', year: 1939, directors: ['Jean Renoir'], countries: ['France'], genres: ['Drama', 'Satire'], points: 952 },
    { rank: 5, title: 'Sunrise', year: 1927, directors: ['F.W. Murnau'], countries: ['USA'], genres: ['Romance', 'Drama'], points: 941 },
    { rank: 6, title: '2001: A Space Odyssey', year: 1968, directors: ['Stanley Kubrick'], countries: ['UK', 'USA'], genres: ['Science Fiction', 'Adventure'], points: 935 },
    { rank: 7, title: 'The Godfather', year: 1972, directors: ['Francis Ford Coppola'], countries: ['USA'], genres: ['Crime', 'Drama'], points: 930 },
    { rank: 8, title: 'The Godfather Part II', year: 1974, directors: ['Francis Ford Coppola'], countries: ['USA'], genres: ['Crime', 'Drama'], points: 924 },
    { rank: 9, title: 'Seven Samurai', year: 1954, directors: ['Akira Kurosawa'], countries: ['Japan'], genres: ['Adventure', 'Drama'], points: 919 },
    { rank: 10, title: 'The Searchers', year: 1956, directors: ['John Ford'], countries: ['USA'], genres: ['Western'], points: 901 },
    { rank: 11, title: 'Pather Panchali', year: 1955, directors: ['Satyajit Ray'], countries: ['India'], genres: ['Drama'], points: 896 },
    { rank: 12, title: 'Battleship Potemkin', year: 1925, directors: ['Sergei Eisenstein'], countries: ['Soviet Union'], genres: ['Historical', 'Drama'], points: 885 },
    { rank: 13, title: 'Persona', year: 1966, directors: ['Ingmar Bergman'], countries: ['Sweden'], genres: ['Drama', 'Psychological'], points: 873 },
    { rank: 14, title: 'The Mirror', year: 1975, directors: ['Andrei Tarkovsky'], countries: ['Soviet Union'], genres: ['Drama', 'Poetry'], points: 867 },
    { rank: 15, title: 'In the Mood for Love', year: 2000, directors: ['Wong Kar-wai'], countries: ['Hong Kong'], genres: ['Romance', 'Drama'], points: 862 },
    { rank: 16, title: 'Mulholland Drive', year: 2001, directors: ['David Lynch'], countries: ['USA'], genres: ['Mystery', 'Thriller'], points: 854 },
    { rank: 17, title: 'Spirited Away', year: 2001, directors: ['Hayao Miyazaki'], countries: ['Japan'], genres: ['Animation', 'Fantasy'], points: 848 },
    { rank: 18, title: 'The Third Man', year: 1949, directors: ['Carol Reed'], countries: ['UK'], genres: ['Thriller', 'Noir'], points: 842 },
    { rank: 19, title: 'La Dolce Vita', year: 1960, directors: ['Federico Fellini'], countries: ['Italy'], genres: ['Drama'], points: 837 },
    { rank: 20, title: 'Bicycle Thieves', year: 1948, directors: ['Vittorio De Sica'], countries: ['Italy'], genres: ['Drama'], points: 833 },
    { rank: 21, title: 'Rashomon', year: 1950, directors: ['Akira Kurosawa'], countries: ['Japan'], genres: ['Mystery', 'Drama'], points: 829 },
    { rank: 22, title: 'Do the Right Thing', year: 1989, directors: ['Spike Lee'], countries: ['USA'], genres: ['Drama'], points: 821 },
    { rank: 23, title: 'Pulp Fiction', year: 1994, directors: ['Quentin Tarantino'], countries: ['USA'], genres: ['Crime'], points: 818 },
    { rank: 24, title: 'The Battle of Algiers', year: 1966, directors: ['Gillo Pontecorvo'], countries: ['Algeria', 'Italy'], genres: ['War', 'Drama'], points: 812 },
    { rank: 25, title: 'Chungking Express', year: 1994, directors: ['Wong Kar-wai'], countries: ['Hong Kong'], genres: ['Romance', 'Drama'], points: 807 }
];

const filmDataset = rawFilms.map((film) => {
    const decade = `${Math.floor(film.year / 10) * 10}s`;
    const searchText = [
        film.title,
        film.year,
        film.directors.join(' '),
        film.countries.join(' '),
        film.genres.join(' ')
    ].join(' ').toLowerCase();
    return {
        ...film,
        decade,
        searchText
    };
});

const state = {
    filters: {
        searchTerm: '',
        countries: [],
        genres: [],
        decades: [],
        directors: []
    },
    filteredFilms: filmDataset,
    watched: new Map()
};

let dom = {};
let watchFeedbackTimer = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
    cacheDom();
    populateFilterOptions();
    attachEventListeners();
    updateFilteredFilms();
    renderWatchedList();
    updateRecommendations();
    renderSmokeTests(runSmokeTests());

    dom.summaryTotalBaseline.textContent = filmDataset.length;
    dom.datasetTotal.textContent = filmDataset.length;
}

function cacheDom() {
    dom = {
        datasetTotal: document.getElementById('dataset-total'),
        searchInput: document.getElementById('search-term'),
        countryFilter: document.getElementById('country-filter'),
        genreFilter: document.getElementById('genre-filter'),
        decadeFilter: document.getElementById('decade-filter'),
        directorFilter: document.getElementById('director-filter'),
        filtersSummary: document.getElementById('filters-summary'),
        filmTableBody: document.querySelector('#film-table tbody'),
        summaryTotal: document.getElementById('summary-total'),
        summaryTotalBaseline: document.getElementById('summary-total-baseline'),
        summaryCountries: document.getElementById('summary-countries'),
        summaryGenres: document.getElementById('summary-genres'),
        summaryDecades: document.getElementById('summary-decades'),
        resetFiltersButton: document.getElementById('reset-filters'),
        watchedSelector: document.getElementById('watched-selector'),
        addWatchedButton: document.getElementById('add-watched'),
        clearWatchedButton: document.getElementById('clear-watched'),
        watchedList: document.getElementById('watched-list'),
        watchedCount: document.getElementById('watched-count'),
        watchFeedback: document.getElementById('watch-feedback'),
        predictedCount: document.getElementById('predicted-count'),
        preferenceSummary: document.getElementById('preference-summary'),
        recommendationsList: document.getElementById('recommendations-list'),
        testSummary: document.getElementById('test-summary'),
        testResults: document.getElementById('test-results')
    };
}

function populateFilterOptions() {
    setSelectOptions(dom.countryFilter, getUniqueValues('countries'));
    setSelectOptions(dom.genreFilter, getUniqueValues('genres'));
    setSelectOptions(dom.decadeFilter, getUniqueDecades());
    setSelectOptions(dom.directorFilter, getUniqueValues('directors'));

    const watchedOptions = filmDataset
        .slice()
        .sort((a, b) => a.rank - b.rank)
        .map((film) => ({
            value: String(film.rank),
            label: `#${film.rank} — ${film.title} (${film.year})`
        }));

    setSelectOptions(dom.watchedSelector, watchedOptions, {
        includePlaceholder: true,
        placeholderText: 'Select a film'
    });
}

function attachEventListeners() {
    dom.searchInput.addEventListener('input', (event) => {
        state.filters.searchTerm = event.target.value.trim();
        updateFilteredFilms();
    });

    [dom.countryFilter, dom.genreFilter, dom.decadeFilter, dom.directorFilter].forEach((select) => {
        select.addEventListener('change', () => {
            state.filters.countries = getSelectedValues(dom.countryFilter);
            state.filters.genres = getSelectedValues(dom.genreFilter);
            state.filters.decades = getSelectedValues(dom.decadeFilter);
            state.filters.directors = getSelectedValues(dom.directorFilter);
            updateFilteredFilms();
        });
    });

    dom.resetFiltersButton.addEventListener('click', () => {
        resetFilters();
    });

    dom.addWatchedButton.addEventListener('click', () => {
        addWatchedFilm();
    });

    dom.clearWatchedButton.addEventListener('click', () => {
        if (state.watched.size === 0) {
            setWatchFeedback('Your watch list is already empty.', 'info');
            return;
        }
        state.watched.clear();
        renderWatchedList();
        updateRecommendations();
        setWatchFeedback('Cleared watched films list.', 'info');
    });

    dom.watchedList.addEventListener('click', (event) => {
        const button = event.target.closest('.remove-watched');
        if (!button) return;
        const rank = Number.parseInt(button.dataset.rank, 10);
        if (Number.isNaN(rank)) return;
        const film = state.watched.get(rank);
        if (film) {
            state.watched.delete(rank);
            renderWatchedList();
            updateRecommendations();
            setWatchFeedback(`Removed “${film.title}” from your watched list.`, 'info');
        }
    });
}

function updateFilteredFilms() {
    state.filteredFilms = applyFilters(filmDataset, state.filters);
    renderFiltersSummary();
    renderSummary();
    renderTable();
}

function renderFiltersSummary() {
    const { searchTerm, countries, genres, decades, directors } = state.filters;
    const activeFilters = [
        searchTerm ? `search: “${searchTerm}”` : null,
        countries.length ? `${countries.length} countr${countries.length === 1 ? 'y' : 'ies'}` : null,
        genres.length ? `${genres.length} genre${genres.length === 1 ? '' : 's'}` : null,
        decades.length ? `${decades.length} decade${decades.length === 1 ? '' : 's'}` : null,
        directors.length ? `${directors.length} director${directors.length === 1 ? '' : 's'}` : null
    ].filter(Boolean);

    dom.filtersSummary.textContent = activeFilters.length
        ? `Active filters — ${activeFilters.join(' · ')}`
        : 'No filters applied. Showing the default ranking.';
}

function renderSummary() {
    const films = state.filteredFilms;
    const countriesCount = getDistributionCount(films, 'countries');
    const topGenreEntry = getTopEntry(films, 'genres');
    const topDecadeEntry = getTopEntry(films, 'decade');

    dom.summaryTotal.textContent = films.length;
    dom.summaryCountries.textContent = countriesCount;
    dom.summaryGenres.textContent = topGenreEntry || '—';
    dom.summaryDecades.textContent = topDecadeEntry || '—';
}

function renderTable() {
    dom.filmTableBody.innerHTML = '';

    if (!state.filteredFilms.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.textContent = 'No films match the current filters. Adjust the selections above to continue exploring.';
        cell.style.color = 'var(--text-secondary)';
        row.appendChild(cell);
        dom.filmTableBody.appendChild(row);
        return;
    }

    const fragment = document.createDocumentFragment();
    state.filteredFilms
        .slice()
        .sort((a, b) => a.rank - b.rank)
        .forEach((film) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${film.rank}</td>
                <td>${film.title}</td>
                <td>${film.year}</td>
                <td>${film.directors.join(', ')}</td>
                <td>${film.countries.join(', ')}</td>
                <td>${film.genres.join(', ')}</td>
                <td>${film.points}</td>
            `;
            fragment.appendChild(row);
        });

    dom.filmTableBody.appendChild(fragment);
}

function addWatchedFilm() {
    const value = dom.watchedSelector.value;
    const rank = Number.parseInt(value, 10);

    if (!value || Number.isNaN(rank)) {
        setWatchFeedback('Please select a film before adding it to your watched list.', 'error');
        return;
    }

    if (state.watched.has(rank)) {
        setWatchFeedback('That film is already in your watched list.', 'info');
        dom.watchedSelector.value = '';
        return;
    }

    const film = filmByRank(rank);
    if (!film) {
        setWatchFeedback('Unable to locate the selected film. Please try again.', 'error');
        return;
    }

    state.watched.set(rank, film);
    renderWatchedList();
    updateRecommendations();
    dom.watchedSelector.value = '';
    setWatchFeedback(`Added “${film.title}” to your watched films.`, 'success');
}

function renderWatchedList() {
    dom.watchedList.innerHTML = '';
    const watchedFilms = Array.from(state.watched.values()).sort((a, b) => a.rank - b.rank);

    if (!watchedFilms.length) {
        const empty = document.createElement('li');
        empty.className = 'empty';
        empty.textContent = 'No films logged yet. Add titles to unlock personalized insights.';
        dom.watchedList.appendChild(empty);
        dom.watchedCount.textContent = '0';
        return;
    }

    const fragment = document.createDocumentFragment();
    watchedFilms.forEach((film) => {
        const item = document.createElement('li');
        item.className = 'watched-item';
        item.innerHTML = `
            <span class="watched-title">#${film.rank} — ${film.title} (${film.year})</span>
            <button type="button" class="remove-watched" data-rank="${film.rank}" aria-label="Remove ${film.title} from watched list">×</button>
        `;
        fragment.appendChild(item);
    });

    dom.watchedList.appendChild(fragment);
    dom.watchedCount.textContent = watchedFilms.length;
}

function updateRecommendations() {
    const watchedFilms = Array.from(state.watched.values());
    const profile = computePreferenceProfile(watchedFilms);
    const recommendations = buildRecommendations(profile, filmDataset, watchedFilms);
    const predictedTotal = computePredictedCount(profile);

    dom.predictedCount.textContent = predictedTotal;
    renderPreferenceSummary(profile);
    renderRecommendationList(recommendations);
}

function renderPreferenceSummary(profile) {
    if (!profile.watchedCount) {
        dom.preferenceSummary.textContent = 'Add watched films to uncover personalized insights.';
        return;
    }

    const sections = [];
    if (profile.topGenres.length) {
        sections.push(
            `Genres: ${profile.topGenres
                .map(([value, count]) => `${value} (${count})`)
                .join(', ')}`
        );
    }
    if (profile.topDirectors.length) {
        sections.push(
            `Directors: ${profile.topDirectors
                .map(([value, count]) => `${value} (${count})`)
                .join(', ')}`
        );
    }
    if (profile.topCountries.length) {
        sections.push(
            `Countries: ${profile.topCountries
                .map(([value, count]) => `${value} (${count})`)
                .join(', ')}`
        );
    }

    dom.preferenceSummary.textContent = sections.join(' · ');
}

function renderRecommendationList(recommendations) {
    dom.recommendationsList.innerHTML = '';
    if (!recommendations.length) {
        const item = document.createElement('li');
        item.className = 'empty';
        item.textContent = 'No recommendation candidates available. Try adding more watched films or resetting filters.';
        dom.recommendationsList.appendChild(item);
        return;
    }

    const fragment = document.createDocumentFragment();
    recommendations.forEach((film) => {
        const item = document.createElement('li');
        item.innerHTML = `
            <span class="title">${film.title}</span>
            <span class="meta">#${film.rank} • ${film.year} • ${film.directors.join(', ')} • ${film.countries.join(', ')}</span>
        `;
        fragment.appendChild(item);
    });

    dom.recommendationsList.appendChild(fragment);
}

function resetFilters() {
    state.filters = {
        searchTerm: '',
        countries: [],
        genres: [],
        decades: [],
        directors: []
    };
    dom.searchInput.value = '';
    [dom.countryFilter, dom.genreFilter, dom.decadeFilter, dom.directorFilter].forEach((select) => {
        Array.from(select.options).forEach((option) => {
            option.selected = false;
        });
    });
    updateFilteredFilms();
    setWatchFeedback('Filters reset. Showing default ordering.', 'info');
}

function setWatchFeedback(message, type = 'info') {
    if (!dom.watchFeedback) return;
    dom.watchFeedback.textContent = message;
    dom.watchFeedback.className = `feedback ${type}`;

    if (watchFeedbackTimer) {
        clearTimeout(watchFeedbackTimer);
    }

    watchFeedbackTimer = setTimeout(() => {
        dom.watchFeedback.textContent = '';
        dom.watchFeedback.className = 'feedback';
    }, 4200);
}

function setSelectOptions(select, values, options = {}) {
    select.innerHTML = '';
    if (options.includePlaceholder) {
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = options.placeholderText ?? 'Select an option';
        select.appendChild(placeholder);
    }
    values.forEach((entry) => {
        const option = document.createElement('option');
        if (typeof entry === 'object') {
            option.value = entry.value;
            option.textContent = entry.label;
        } else {
            option.value = entry;
            option.textContent = entry;
        }
        select.appendChild(option);
    });
}

function getUniqueValues(key) {
    const set = new Set();
    filmDataset.forEach((film) => {
        const rawValue = film[key];
        const values = Array.isArray(rawValue) ? rawValue : [rawValue];
        values.forEach((value) => set.add(value));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function getUniqueDecades() {
    const set = new Set(filmDataset.map((film) => film.decade));
    return Array.from(set).sort((a, b) => {
        const decadeA = Number.parseInt(a, 10);
        const decadeB = Number.parseInt(b, 10);
        return decadeA - decadeB;
    });
}

function getSelectedValues(select) {
    return Array.from(select.selectedOptions)
        .map((option) => option.value)
        .filter(Boolean);
}

function applyFilters(data, filters) {
    const searchTerm = (filters.searchTerm ?? '').toLowerCase();
    const countryFilters = filters.countries ?? [];
    const genreFilters = filters.genres ?? [];
    const decadeFilters = filters.decades ?? [];
    const directorFilters = filters.directors ?? [];

    return data.filter((film) => {
        if (searchTerm && !film.searchText.includes(searchTerm)) {
            return false;
        }

        if (countryFilters.length && !countryFilters.some((country) => film.countries.includes(country))) {
            return false;
        }

        if (genreFilters.length && !genreFilters.some((genre) => film.genres.includes(genre))) {
            return false;
        }

        if (decadeFilters.length && !decadeFilters.includes(film.decade)) {
            return false;
        }

        if (directorFilters.length && !directorFilters.some((director) => film.directors.includes(director))) {
            return false;
        }

        return true;
    });
}

function getDistributionCount(films, key) {
    const set = new Set();
    films.forEach((film) => {
        const value = film[key];
        const values = Array.isArray(value) ? value : [value];
        values.forEach((entry) => set.add(entry));
    });
    return set.size;
}

function getTopEntry(films, key) {
    if (!films.length) return null;
    const distribution = buildDistribution(films, key);
    if (!distribution.length) return null;
    const [value, count] = distribution[0];
    return `${value} (${count})`;
}

function buildDistribution(films, key) {
    const counts = new Map();
    films.forEach((film) => {
        const value = film[key];
        const values = Array.isArray(value) ? value : [value];
        values.forEach((entry) => {
            if (!entry) return;
            counts.set(entry, (counts.get(entry) ?? 0) + 1);
        });
    });
    return Array.from(counts.entries()).sort((a, b) => {
        if (b[1] === a[1]) {
            return a[0].localeCompare(b[0]);
        }
        return b[1] - a[1];
    });
}

function computePreferenceProfile(watchedFilms) {
    const watchedCount = watchedFilms.length;
    if (!watchedCount) {
        return {
            watchedCount: 0,
            topGenres: [],
            topDirectors: [],
            topCountries: [],
            topDecades: [],
            preferenceStrength: 0
        };
    }

    const topGenres = buildDistribution(watchedFilms, 'genres').slice(0, 3);
    const topDirectors = buildDistribution(watchedFilms, 'directors').slice(0, 3);
    const topCountries = buildDistribution(watchedFilms, 'countries').slice(0, 3);
    const topDecades = buildDistribution(watchedFilms, 'decade').slice(0, 3);

    const preferenceStrength =
        ((topGenres[0]?.[1] ?? 0) + (topDirectors[0]?.[1] ?? 0) + (topCountries[0]?.[1] ?? 0)) /
        Math.max(1, watchedCount);

    return {
        watchedCount,
        topGenres,
        topDirectors,
        topCountries,
        topDecades,
        preferenceStrength
    };
}

function buildRecommendations(profile, sourceFilms, watchedFilms, limit = 5) {
    const watchedRanks = new Set(watchedFilms.map((film) => film.rank));

    if (!profile.watchedCount) {
        return sourceFilms
            .slice()
            .sort((a, b) => a.rank - b.rank)
            .slice(0, limit);
    }

    return sourceFilms
        .filter((film) => !watchedRanks.has(film.rank))
        .map((film) => ({
            film,
            score: computeRecommendationScore(film, profile)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry) => entry.film);
}

function computeRecommendationScore(film, profile) {
    const { watchedCount } = profile;
    const normalize = (value) => value / Math.max(1, watchedCount);
    const weight = (index, base) => base * (1 - index * 0.2);

    let score = 0;

    profile.topGenres.forEach(([genre, count], index) => {
        if (film.genres.includes(genre)) {
            score += weight(index, 4.2) * normalize(count);
        }
    });

    profile.topDirectors.forEach(([director, count], index) => {
        if (film.directors.includes(director)) {
            score += weight(index, 4.8) * normalize(count);
        }
    });

    profile.topCountries.forEach(([country, count], index) => {
        if (film.countries.includes(country)) {
            score += weight(index, 3.2) * normalize(count);
        }
    });

    profile.topDecades.forEach(([decade, count], index) => {
        if (film.decade === decade) {
            score += weight(index, 2.6) * normalize(count);
        }
    });

    score += (1100 - film.rank) * 0.05;
    score += film.points * 0.01;

    return score;
}

function computePredictedCount(profile) {
    if (!profile.watchedCount) return 0;
    const lift = Math.min(10, Math.round(profile.preferenceStrength * 1.2));
    return profile.watchedCount + lift;
}

function filmByRank(rank) {
    return filmDataset.find((film) => film.rank === rank) ?? null;
}

function runSmokeTests() {
    const tests = [
        {
            name: 'Country filter (Japan) returns expected 4 films',
            run: () => applyFilters(filmDataset, { countries: ['Japan'] }).length === 4
        },
        {
            name: 'Genre filter (Drama) includes “Citizen Kane”',
            run: () => applyFilters(filmDataset, { genres: ['Drama'] }).some((film) => film.title === 'Citizen Kane')
        },
        {
            name: 'Decade filter (1950s) finds six films',
            run: () => applyFilters(filmDataset, { decades: ['1950s'] }).length === 6
        },
        {
            name: 'Director filter (Wong Kar-wai) returns two titles',
            run: () => applyFilters(filmDataset, { directors: ['Wong Kar-wai'] }).length === 2
        },
        {
            name: 'Recommendations exclude watched selections',
            run: () => {
                const watched = [filmByRank(7), filmByRank(8), filmByRank(23)];
                const profile = computePreferenceProfile(watched);
                const recommendations = buildRecommendations(profile, filmDataset, watched);
                return (
                    recommendations.length === 5 &&
                    recommendations.every((film) => !watched.some((watchedFilm) => watchedFilm.rank === film.rank))
                );
            }
        },
        {
            name: 'Predicted total watched never falls below logged count',
            run: () => {
                const watched = [filmByRank(15), filmByRank(25), filmByRank(3), filmByRank(17)];
                const profile = computePreferenceProfile(watched);
                return computePredictedCount(profile) >= watched.length;
            }
        }
    ];

    return tests.map((test) => ({
        name: test.name,
        passed: Boolean(test.run())
    }));
}

function renderSmokeTests(results) {
    const total = results.length;
    const passed = results.filter((result) => result.passed).length;
    dom.testSummary.textContent = `${passed}/${total} smoke tests passed.`;

    dom.testResults.innerHTML = '';
    const fragment = document.createDocumentFragment();

    results.forEach((result) => {
        const item = document.createElement('li');
        item.className = result.passed ? 'pass' : 'fail';
        item.textContent = `${result.passed ? '✅' : '❌'} ${result.name}`;
        fragment.appendChild(item);
    });

    dom.testResults.appendChild(fragment);
}