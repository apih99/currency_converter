const axios = require('axios');
const cheerio = require('cheerio');

const ECB_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

async function getRates() {
    try {
        console.log('Fetching data from the European Central Bank...');
        const response = await axios.get(ECB_URL);
        const xmlData = response.data;

        const $ = cheerio.load(xmlData, { xmlMode: true });

        const rates = {};
        $('Cube[currency]').each((i, element) => {
            const currency = $(element).attr('currency');
            const rate = $(element).attr('rate');
            rates[currency] = parseFloat(rate);
        });

        rates['EUR'] = 1
        console.log('Successfully parsed rates. ');
        return rates;
    } catch(error) {
        console.error('Failed to fetch or parse rates:', error.message);
        return null;
    }
}

async function convert(from, to, amount) {
    const rates = await getRates();

    if (!rates) {
        console.log("Could not perform conversion.");
        return;
    }

    if (!rates[from] || !rates[to]) {
        console.log("Invalid currency code provided.");
        return;
    }

    const amountInEur = amount / rates[from];
    const convertedAmount = amountInEur * rates[to];

    console.log(`\n--- Conversion Result ---`);
    console.log(`${amount} ${from} = ${convertedAmount.toFixed(2)} ${to}`);
}

convert('USD', 'MYR', 1);