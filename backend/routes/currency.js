const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

let ratesCache = null;

const ECB_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

const fetchRatesfromECB = async () => {
    try {
        console.log('Fetching data from our own scraper (ECB)...');
        const response = await axios.get(ECB_URL);
        const xmlData = response.data;

        const $ = cheerio.load(xmlData, { xmlMode: true });

        const rates = {};
        $('Cube[currency]').each((i, element) => {
            const currency = $(element).attr('currency');
            const rate = $(element).attr('rate');
            rates[currency] = parseFloat(rate)
        });
        rates['EUR'] = 1

        console.log('Successfully parsed rates with our scraper.');
        return rates;
    } catch (error) {
        console.error('Our scraper failed to fetch or parse rates:', error.message);
        return null;
    }
};

const getLatestRates = async () => {
    const newRates = await fetchRatesfromECB();

    if (newRates) {
        ratesCache = newRates;
        console.log('Refreshed latest rates cache using our own data source.');
    } else {
        console.log('Could not refresh rates cache, using stale data.')
    }
};

getLatestRates();
setInterval(getLatestRates, 6 * 60 * 60 * 1000);


router.get('/convert', (req, res) => {
    if (!ratesCache) {
        return res.status(503).json({ error: 'Service unavailable: Exchange rates are not loaded yet. Please try again in a moment.'});
    }

    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Please provide from, to, and amount parameters.'});
    }

    const fromRate = ratesCache[from.toUpperCase()];
    const toRate = ratesCache[to.toUpperCase()];

    if (!fromRate || !toRate) {
        return res.status(400).json({ error: 'Invalid currency code provided.'});
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)){
        return res.status(400).json({ error: 'Invalid amount provided. Must be a number'});
    }

    const amountInEur = parsedAmount / fromRate;
    const convertedAmount = amountInEur * toRate;

    res.json({
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount: parsedAmount,
        convertedAmount: parseFloat(convertedAmount.toFixed(2))
    });
});

router.get('/reverse', (req, res) => {

    if (!ratesCache) {
        return res.status(503).json({ error: 'Service Unavailable: Exchange rates are not loaded yet.' });
    }

    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Please provide from, to, and amount parameters.' });
    }

    const fromRate = ratesCache[to.toUpperCase()];  
    const toRate = ratesCache[from.toUpperCase()];

    if (!fromRate || !toRate) {
        return res.status(400).json({ error: 'Invalid or unsupported currency code provided.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
        return res.status(400).json({ error: 'Invalid amount provided. Must be a number.' });
    }

    const amountInEur = parsedAmount / fromRate;
    const convertedAmount = amountInEur * toRate;

    res.json({
        from: to.toUpperCase(),
        to: from.toUpperCase(),
        amount: parsedAmount,
        convertedAmount: parseFloat(convertedAmount.toFixed(2))
    });

});


module.exports = router;