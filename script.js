let data = [];
let fuse;
const itemsPerPage = 50;
let currentPage = 1;
let totalItems = 0;

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
    displayResults(data.slice(0, itemsPerPage));
    setupPagination(totalItems);
}

function initializeFuse() {
    fuse = new Fuse(data, {
        keys: Object.keys(data[0]),
        threshold: 0.3
    });
}

document.getElementById('searchInput').addEventListener('input', debounce(function(e) {
    const searchTerm = e.target.value;
    let results;
    if (searchTerm) {
        results = fuse.search(searchTerm).map(result => result.item);
    } else {
        results = data;
    }
    currentPage = 1;
    displayResults(results.slice(0, itemsPerPage));
    setupPagination(results.length);
}, 300));

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    results.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.textContent = Object.values(row).join(' | ');
        resultsDiv.appendChild(rowDiv);
    });
}

function setupPagination(totalItems) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
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
    const searchTerm = document.getElementById('searchInput').value;
    let results = searchTerm ? fuse.search(searchTerm).map(result => result.item) : data;
    const startIndex = (currentPage - 1) * itemsPerPage;
    displayResults(results.slice(startIndex, startIndex + itemsPerPage));
    
    const totalPages = Math.ceil(results.length / itemsPerPage);
    document.querySelector('#pagination span').textContent = `Page ${currentPage} of ${totalPages}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

loadAllData();