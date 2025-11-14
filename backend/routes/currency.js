const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
let ratesCache = null;

const getLatestRates = async () => {
  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/EUR`);
    ratesCache = response.data.conversion_rates;
    console.log('Refreshed latest rates cache.');
  } catch (error) {
    console.error('Failed to fetch latest rates:', error.message);
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