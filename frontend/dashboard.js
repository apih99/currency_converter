import axios from 'axios';

const API_BASE_URL = 'http://143.198.196.177:3000';

// --- Auth Guard ---
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/index.html';
}

// Create an authenticated Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-auth-token': token,
  },
});

// --- DOM Elements ---
const usernameDisplay = document.getElementById('username-display');
const logoutBtn = document.getElementById('logout-btn');
const converterForm = document.getElementById('converter-form');
const converterResult = document.getElementById('converter-result');
const fromCurrencyInput = document.getElementById('from-currency');
const toCurrencyInput = document.getElementById('to-currency');
const amountInput = document.getElementById('amount');
const favoritesList = document.getElementById('favorites-list');
const addFavoriteForm = document.getElementById('add-favorite-form');
const favFromInput = document.getElementById('fav-from');
const favToInput = document.getElementById('fav-to');

// --- Currency Converter Logic ---
converterForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const from = fromCurrencyInput.value;
  const to = toCurrencyInput.value;
  const amount = amountInput.value;
  
  if (!from || !to || !amount) {
    converterResult.textContent = 'Please fill all fields.';
    converterResult.style.color = '#ff4444';
    return;
  }
  
  try {
    // NOTE: The convert endpoint is public, so we don't need the authenticated 'api' instance, but it's fine to use it.
    const response = await api.get(`/api/currency/convert?from=${from}&to=${to}&amount=${amount}`);
    const data = response.data;
    
    converterResult.textContent = `${data.amount} ${data.from} = ${data.convertedAmount.toFixed(2)} ${data.to}`;
    converterResult.style.color = '#00ff00';
    
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Conversion failed.';
    converterResult.textContent = errorMessage;
    converterResult.style.color = '#ff4444';
  }
});

// --- Favorites Logic ---
const fetchFavorites = async () => {
  try {
    const response = await api.get('/api/favorites');
    const favorites = response.data;
    
    favoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<li>No favorites saved.</li>';
    } else {
        favorites.forEach(pair => {
            const [from, to] = pair.split('-');
            
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${from} / ${to}</span>
                <button class="delete-fav-btn" data-from="${from}" data-to="${to}">X</button>
            `;
            favoritesList.appendChild(li);
        });
    }
    
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    favoritesList.innerHTML = '<li>Error loading favorites.</li>';
  }
};

addFavoriteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const from = favFromInput.value;
  const to = favToInput.value;

  if (!from || !to) return;
  
  try {
    await api.post('/api/favorites', { from, to });
    favFromInput.value = '';
    favToInput.value = '';
    fetchFavorites();
  } catch (error) {
    console.error('Failed to add favorite:', error);
    alert('Could not add favorite.');
  }
});

favoritesList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-fav-btn')) {
        const from = event.target.dataset.from;
        const to = event.target.dataset.to;

        if (confirm(`Are you sure you want to delete ${from}-${to}?`)) {
            try {
                await api.delete('/api/favorites', { data: { from, to } });
                fetchFavorites();
            } catch (error) {
                console.error('Failed to delete favorite:', error);
                alert('Could not delete favorite.');
            }
        }
    }
});

// --- Initial Page Load ---
async function initializeDashboard() {
  try {
    const response = await api.get('/api/users/profile');
    const user = response.data;
    usernameDisplay.textContent = user.username;
    
    fetchFavorites();

  } catch (error) {
    console.error('Failed to fetch profile:', error);
    localStorage.removeItem('token');
    window.location.href = '/index.html';
  }
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/index.html';
});

initializeDashboard();