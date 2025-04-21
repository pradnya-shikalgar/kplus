// DOM Elements
const authModal = document.getElementById('authModal');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const userAvatarBtn = document.getElementById('userAvatarBtn');
const bookNowBtn = document.getElementById('bookNowBtn');
const mainContent = document.getElementById('mainContent');

// Auth Form Elements
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupPhone = document.getElementById('signupPhone');
const signupPassword = document.getElementById('signupPassword');
const signupConfirmPassword = document.getElementById('signupConfirmPassword');

// Slider Elements
const sliderContainer = document.getElementById('sliderContainer');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.slider-dot');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

// FAQ Toggle
const faqItems = document.querySelectorAll('.faq-item');

// Current slide index
let currentSlide = 0;
const totalSlides = slides.length;

// Initialize the app
function init() {
  // Show auth modal by default
  authModal.classList.add('active');
  
  // Check if user is already logged in
  if (isLoggedIn()) {
    showMainContent();
  }
  
  setupEventListeners();
  initSlider();
  updateAuthUI();
}

// Show main content after login
function showMainContent() {
  authModal.classList.remove('active');
  mainContent.style.display = 'block';
}

// Set up all event listeners
function setupEventListeners() {
  // Auth tabs
  loginTab.addEventListener('click', showLoginForm);
  signupTab.addEventListener('click', showSignupForm);
  
  // Book now button
  bookNowBtn.addEventListener('click', () => {
    alert('Redirecting to booking page...');
  });

  // User avatar button (logout)
  userAvatarBtn.addEventListener('click', handleLogout);
  
  // FAQ items
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });

  // Auth form submissions
  document.getElementById('loginSubmitBtn').addEventListener('click', handleLogin);
  document.getElementById('signupSubmitBtn').addEventListener('click', handleSignup);
}

// User management functions
function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUser(user) {
  const users = getUsers();
  if (users.some(u => u.email === user.email)) {
    return false;
  }
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  return true;
}

function validateUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  return user && user.password === password;
}

function isLoggedIn() {
  return !!localStorage.getItem('currentUser');
}

// Format user data for text file
function formatUserData(user) {
  return `=== KPlus User Details ===
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone}
Joined: ${new Date(user.joined).toLocaleString()}
Last Login: ${new Date().toLocaleString()}
===============================
`;
}

// Create and download user data as text file
function downloadUserData(user) {
  const data = formatUserData(user);
  const blob = new Blob([data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KPlus_User_${user.name.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Login handler
// Login handler
async function handleLogin() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      downloadUserData(data.user);
      updateAuthUI();
      showMainContent();
      alert('Login successful!');
    } else {
      alert(data.message || 'Login failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again later.');
  }
}
// Signup handler
async function handleSignup() {
  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const phone = signupPhone.value.trim();
  const password = signupPassword.value;
  const confirmPassword = signupConfirmPassword.value;

  // Validation
  if (!name || !email || !phone || !password || !confirmPassword) {
    alert('Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  if (!validateEmail(email)) {
    alert('Please enter a valid email address');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      downloadUserData(data.user);
      updateAuthUI();
      showMainContent();
      alert('Registration successful!');
    } else {
      alert(data.message || 'Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again later.');
  }
}

// Email validation helper
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}




function updateAuthUI() {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  if (userData) {
    const nameParts = userData.name.split(' ');
    let initials = '';
    if (nameParts.length >= 2) {
      initials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
    } else {
      initials = nameParts[0].substring(0, 2);
    }
    
    userAvatarBtn.textContent = initials.toUpperCase();
    userAvatarBtn.style.display = 'flex';
    bookNowBtn.textContent = 'Book Now';
  } else {
    userAvatarBtn.style.display = 'none';
    bookNowBtn.textContent = 'Login to Book';
  }
}

// Logout handler
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('currentUser');
    authModal.classList.add('active');
    mainContent.style.display = 'none';
    updateAuthUI();
    alert('Logged out successfully!');
  }
}

// Slider functions
function initSlider() {
  showSlide(currentSlide);
  setInterval(() => nextSlide(), 5000);
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  dots.forEach((dot, index) => dot.addEventListener('click', () => goToSlide(index)));
}

function showSlide(index) {
  sliderContainer.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  currentSlide = index;
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  showSlide(currentSlide);
}

function goToSlide(index) {
  currentSlide = index;
  showSlide(currentSlide);
}

// Auth modal functions
function showLoginForm() {
  loginTab.classList.add('active');
  signupTab.classList.remove('active');
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
  resetForms();
}

function showSignupForm() {
  loginTab.classList.remove('active');
  signupTab.classList.add('active');
  loginForm.classList.remove('active');
  signupForm.classList.add('active');
  resetForms();
}

function resetForms() {
  loginEmail.value = '';
  loginPassword.value = '';
  signupName.value = '';
  signupEmail.value = '';
  signupPhone.value = '';
  signupPassword.value = '';
  signupConfirmPassword.value = '';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);