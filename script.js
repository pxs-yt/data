let data = [];
let fuse;
const itemsPerPage = 50;
let currentPage = 1;
let totalItems = 0;
let currentResults = [];

async function loadAllData() {
    let chunkNumber = 1;
    while (true) {
        try {
            const response = await fetch(`data_chunk_${chunkNumber}.json`);
            if (!response.ok) break;
            const chunkData = await response.json();
            data = data.concat(chunkData);
            totalItems += chunkData.length;
            chunkNumber++;
            console.log(`Loaded chunk ${chunkNumber - 1} with ${chunkData.length} items`);
        } catch (error) {
            console.error('Error loading chunk:', error);
            break;
        }
    }
    console.log(`Total items loaded: ${totalItems}`);
    initializeFuse();
    displayResults([], 0);
    setupPagination(0);
}

function initializeFuse() {
    fuse = new Fuse(data, {
        keys: Object.keys(data[0]),
        threshold: 0.3
    });
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        currentResults = fuse.search(searchTerm).map(result => result.item);
    } else {
        currentResults = [];
    }
    currentPage = 1;
    displayResults(currentResults.slice(0, itemsPerPage), currentResults.length);
    setupPagination(currentResults.length);
}

document.getElementById('searchButton').addEventListener('click', performSearch);

document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function displayResults(results, totalResults) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found. Please try a different search term.</p>';
        return;
    }

    const resultsInfo = document.createElement('p');
    resultsInfo.textContent = `Showing ${results.length} of ${totalResults} results`;
    resultsDiv.appendChild(resultsInfo);

    results.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'result-item';

        // Assuming the first two fields are the most relevant
        const keys = Object.keys(row);
        const mainField = document.createElement('h3');
        mainField.textContent = row[keys[0]];
        rowDiv.appendChild(mainField);

        const subField = document.createElement('p');
        subField.textContent = row[keys[1]];
        rowDiv.appendChild(subField);

        // Add a "View More" button
        const viewMoreBtn = document.createElement('button');
        viewMoreBtn.textContent = 'View More';
        viewMoreBtn.className = 'view-more-btn';
        viewMoreBtn.addEventListener('click', () => showFullDetails(row));
        rowDiv.appendChild(viewMoreBtn);

        resultsDiv.appendChild(rowDiv);
    });
}

function showFullDetails(row) {
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'full-details';

    Object.entries(row).forEach(([key, value]) => {
        const field = document.createElement('p');
        field.innerHTML = `<strong>${key}:</strong> ${value}`;
        detailsDiv.appendChild(field);
    });

    // Create a modal to display the full details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.appendChild(detailsDiv);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => document.body.removeChild(modal));
    modal.appendChild(closeBtn);

    document.body.appendChild(modal);
}

function setupPagination(totalItems) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return;

    const prevButton = createPaginationButton('Prev', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePage();
        }
    });
    paginationDiv.appendChild(prevButton);

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationDiv.appendChild(pageInfo);

    const nextButton = createPaginationButton('Next', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePage();
        }
    });
    paginationDiv.appendChild(nextButton);
}

function createPaginationButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'pagination-button';
    button.addEventListener('click', onClick);
    return button;
}

function updatePage() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    displayResults(currentResults.slice(startIndex, startIndex + itemsPerPage), currentResults.length);
    
    const totalPages = Math.ceil(currentResults.length / itemsPerPage);
    document.querySelector('#pagination span').textContent = `Page ${currentPage} of ${totalPages}`;
}

loadAllData();