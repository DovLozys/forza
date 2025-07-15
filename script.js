// Global variables
let tuneData = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadTuneData();
});

/**
 * Load tune data from JSON file
 */
async function loadTuneData() {
    try {
        const response = await fetch('data/tunes.json');
        if (!response.ok) {
            throw new Error('Failed to load tune data');
        }
        
        tuneData = await response.json();
        displayTuneData();
    } catch (error) {
        console.error('Error loading tune data:', error);
        showError();
    }
}

/**
 * Display the tune data in the UI
 */
function displayTuneData() {
    const loadingElement = document.getElementById('loading');
    const racesContainer = document.getElementById('races-container');
    const lastUpdatedElement = document.getElementById('last-updated');
    
    // Hide loading
    loadingElement.classList.add('hidden');
    
    // Show last updated date
    if (tuneData.lastUpdated) {
        const date = new Date(tuneData.lastUpdated);
        lastUpdatedElement.textContent = `Last updated: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
    
    // Clear existing content
    racesContainer.innerHTML = '';
    
    // Create race cards
    tuneData.races.forEach(race => {
        const raceCard = createRaceCard(race);
        racesContainer.appendChild(raceCard);
    });
}

/**
 * Create a race card element
 */
function createRaceCard(race) {
    const raceCard = document.createElement('div');
    raceCard.className = 'race-card';
    
    const raceTitle = document.createElement('div');
    raceTitle.className = 'race-title';
    raceTitle.textContent = race.event;
    raceCard.appendChild(raceTitle);
    
    const tunesGrid = document.createElement('div');
    tunesGrid.className = 'tunes-grid';
    
    race.tunes.forEach(tune => {
        const tuneCard = createTuneCard(tune);
        tunesGrid.appendChild(tuneCard);
    });
    
    raceCard.appendChild(tunesGrid);
    return raceCard;
}

/**
 * Create a tune card element
 */
function createTuneCard(tune) {
    const tuneCard = document.createElement('div');
    tuneCard.className = 'tune-card';
    
    // Car name
    const carName = document.createElement('div');
    carName.className = 'car-name';
    carName.textContent = tune.car;
    tuneCard.appendChild(carName);
    
    // Creator
    const creator = document.createElement('div');
    creator.className = 'tune-creator';
    creator.textContent = `by ${tune.creator}`;
    tuneCard.appendChild(creator);
    
    // Tune info (class and type)
    const tuneInfo = document.createElement('div');
    tuneInfo.className = 'tune-info';
    
    const tuneClass = document.createElement('div');
    tuneClass.className = 'tune-class';
    tuneClass.textContent = tune.class;
    tuneInfo.appendChild(tuneClass);
    
    const tuneType = document.createElement('div');
    tuneType.className = 'tune-type';
    tuneType.textContent = tune.raceType;
    tuneInfo.appendChild(tuneType);
    
    tuneCard.appendChild(tuneInfo);
    
    // Share code with copy button
    const shareCodeContainer = document.createElement('div');
    shareCodeContainer.className = 'share-code-container';
    
    const shareCode = document.createElement('div');
    shareCode.className = 'share-code';
    shareCode.textContent = tune.shareCode;
    shareCodeContainer.appendChild(shareCode);
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => copyShareCode(tune.shareCode, copyBtn);
    shareCodeContainer.appendChild(copyBtn);
    
    tuneCard.appendChild(shareCodeContainer);
    
    // Notes (if available)
    if (tune.notes && tune.notes.trim()) {
        const notes = document.createElement('div');
        notes.className = 'tune-notes';
        notes.textContent = tune.notes;
        tuneCard.appendChild(notes);
    }
    
    return tuneCard;
}

/**
 * Copy share code to clipboard
 */
async function copyShareCode(shareCode, buttonElement) {
    try {
        await navigator.clipboard.writeText(shareCode);
        
        // Visual feedback
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Copied!';
        buttonElement.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.classList.remove('copied');
        }, 2000);
        
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Visual feedback
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Copied!';
        buttonElement.classList.add('copied');
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.classList.remove('copied');
        }, 2000);
    }
}

/**
 * Show error message
 */
function showError() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const racesContainer = document.getElementById('races-container');
    
    loadingElement.classList.add('hidden');
    racesContainer.classList.add('hidden');
    errorElement.classList.remove('hidden');
}