import axios from 'axios';

const API_BASE_URL = 'http://143.198.196.177:3000';

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const messageDisplay = document.getElementById('message-display');

// --- Form Switching Logic ---
showSignup.addEventListener('click', () => {
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
});

showLogin.addEventListener('click', () => {
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

// --- API Logic ---
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
      email,
      password,
    });

    const token = response.data.token;
    localStorage.setItem('token', token);
    showMessage('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);

  } catch (error) {
    const errorMessage = error.response?.data?.msg || 'An error occurred during login.';
    showMessage(errorMessage, 'error');
  }
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/signup`, {
      username,
      email,
      password,
    });
    
    const token = response.data.token;
    localStorage.setItem('token', token);
    showMessage('Account created! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);

  } catch (error) {
    const errorMessage = error.response?.data?.msg || 'An error occurred during signup.';
    showMessage(errorMessage, 'error');
  }
});

// Helper function to display messages
function showMessage(message, type) {
  messageDisplay.textContent = message;
  messageDisplay.className = type === 'success' ? 'success-message' : 'error-message';
}