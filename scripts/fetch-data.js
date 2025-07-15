#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const path = require('path');

// Forza spreadsheet CSV export URL
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1mIJQIalcnsRUkwReVpmMlcaw17dYZtk-Xejwk_jSFJo/export?format=csv';

/**
 * Fetch CSV data from Google Sheets
 */
function fetchCSVData() {
    return new Promise((resolve, reject) => {
        https.get(SPREADSHEET_URL, (res) => {
            // Handle redirects
            if (res.statusCode === 307 || res.statusCode === 302) {
                const redirectUrl = res.headers.location;
                https.get(redirectUrl, (redirectRes) => {
                    let data = '';
                    redirectRes.on('data', chunk => data += chunk);
                    redirectRes.on('end', () => resolve(data));
                });
                return;
            }
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

/**
 * Parse CSV data into structured format
 */
function parseCSVData(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = parseCSVRow(lines[0]);
    
    const races = [];
    const eventGroups = {};
    
    for (let i = 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]);
        if (row.length < 3) continue; // Need at least event, car, shareCode
        
        const tune = {
            event: row[0] || '',
            class: row[1] || '',
            car: row[2] || '',
            creator: row[3] || '',
            raceType: row[4] || '',
            tuneName: row[5] || '',
            shareCode: row[6] || '',
            notes: row[7] || ''
        };
        
        // Skip empty rows or header-like rows
        if (!tune.shareCode || !tune.car || tune.shareCode.includes('SHARE CODE')) continue;
        
        // Clean up the share code (remove extra spaces/formatting)
        tune.shareCode = tune.shareCode.replace(/\s+/g, ' ').trim();
        
        // Group by event
        const eventKey = tune.event.trim();
        if (eventKey && !eventKey.includes('Last Updated')) {
            if (!eventGroups[eventKey]) {
                eventGroups[eventKey] = [];
            }
            eventGroups[eventKey].push(tune);
        }
    }
    
    // Convert to array format and limit to 3 tunes per event
    Object.keys(eventGroups).forEach(eventName => {
        if (eventName.trim()) {
            races.push({
                event: eventName,
                tunes: eventGroups[eventName].slice(0, 3) // Max 3 tunes per race
            });
        }
    });
    
    return {
        lastUpdated: new Date().toISOString(),
        races: races
    };
}

/**
 * Parse a single CSV row handling quoted fields
 */
function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

/**
 * Save data to JSON file
 */
function saveToJSON(data) {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'tunes.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${filePath}`);
    console.log(`Found ${data.races.length} races with tunes`);
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('Fetching spreadsheet data...');
        const csvData = await fetchCSVData();
        
        
        console.log('Parsing CSV data...');
        const parsedData = parseCSVData(csvData);
        
        console.log('Saving to JSON...');
        saveToJSON(parsedData);
        
        console.log('✅ Data fetch complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { fetchCSVData, parseCSVData, saveToJSON };