// VPN Checker Website - Main JavaScript

// Global variables
let map, lookupMap;

// Map functionality
function showMap(lat, lon) {
  if (map) {
    map.remove();
  }
  
  map = L.map('map').setView([lat, lon], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  L.marker([lat, lon]).addTo(map);
}

function showLookupMap(lat, lon) {
  if (lookupMap) {
    lookupMap.remove();
  }
  
  lookupMap = L.map('lookup-map').setView([lat, lon], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(lookupMap);
  
  L.marker([lat, lon]).addTo(lookupMap);
}

// IP checking functionality
async function checkIP() {
  const ipEl = document.getElementById('ip');
  const locEl = document.getElementById('location');
  const ispEl = document.getElementById('isp');
  
  ipEl.textContent = locEl.textContent = ispEl.textContent = 'Loading...';
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const ipRes = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (!ipRes.ok) throw new Error('IP service unavailable');
    const ipData = await ipRes.json();
    const ip = ipData.ip;
    
    const geoController = new AbortController();
    const geoTimeout = setTimeout(() => geoController.abort(), 10000);
    
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: geoController.signal
    });
    clearTimeout(geoTimeout);
    
    if (!geoRes.ok) throw new Error('Location service unavailable');
    const geo = await geoRes.json();
    
    if (geo.error) {
      throw new Error(geo.reason || 'Unable to get location data');
    }
    
    ipEl.textContent = geo.ip || ip;
    locEl.textContent = `${geo.city || 'Unknown'}, ${geo.country_name || 'Unknown'}`;
    ispEl.textContent = geo.org || 'Unknown ISP';
    
    if (geo.latitude && geo.longitude) {
      showMap(geo.latitude, geo.longitude);
    }
    
  } catch (error) {
    console.error('IP check failed:', error);
    if (error.name === 'AbortError') {
      ipEl.textContent = 'Request timeout';
      locEl.textContent = 'Please try again';
      ispEl.textContent = 'Timeout';
    } else {
      ipEl.textContent = 'Service unavailable';
      locEl.textContent = 'Please check connection';
      ispEl.textContent = 'Error';
    }
  }
}

// IP lookup functionality
async function lookupIP() {
  const ip = document.getElementById('lookup-input').value.trim();
  const ipEl = document.getElementById('lookup-ip');
  const locEl = document.getElementById('lookup-location');
  const ispEl = document.getElementById('lookup-isp');
  
  // Input validation
  if (!ip) {
    ipEl.textContent = 'Please enter an IP';
    locEl.textContent = 'No input provided';
    ispEl.textContent = 'Error';
    return;
  }
  
  // Basic IP format validation
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    ipEl.textContent = 'Invalid IP format';
    locEl.textContent = 'Please check IP address';
    ispEl.textContent = 'Invalid';
    return;
  }
  
  ipEl.textContent = locEl.textContent = ispEl.textContent = 'Loading...';
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (!geoRes.ok) throw new Error('Lookup service unavailable');
    const geo = await geoRes.json();
    
    if (geo.error) {
      throw new Error(geo.reason || 'Invalid IP address');
    }
    
    ipEl.textContent = geo.ip || ip;
    locEl.textContent = `${geo.city || 'Unknown'}, ${geo.country_name || 'Unknown'}`;
    ispEl.textContent = geo.org || 'Unknown ISP';
    
    if (geo.latitude && geo.longitude) {
      showLookupMap(geo.latitude, geo.longitude);
    }
    
  } catch (error) {
    console.error('IP lookup failed:', error);
    if (error.name === 'AbortError') {
      ipEl.textContent = 'Request timeout';
      locEl.textContent = 'Please try again';
      ispEl.textContent = 'Timeout';
    } else {
      ipEl.textContent = 'Lookup failed';
      locEl.textContent = 'Service unavailable';
      ispEl.textContent = 'Error';
    }
  }
}

// Mobile menu functionality
function initMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const body = document.body;
  
  if (!navToggle || !nav) return;
  
  // Toggle mobile menu
  navToggle.addEventListener('click', function() {
    const isOpen = nav.classList.contains('open');
    
    if (isOpen) {
      // Close menu
      nav.classList.remove('open');
      this.classList.remove('active');
      body.style.overflow = '';
      this.setAttribute('aria-expanded', 'false');
    } else {
      // Open menu
      nav.classList.add('open');
      this.classList.add('active');
      body.style.overflow = 'hidden'; // Prevent background scroll
      this.setAttribute('aria-expanded', 'true');
    }
  });
  
  // Close menu when clicking on nav links
  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
      body.style.overflow = '';
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
  
  // Close menu when clicking outside (on overlay)
  nav.addEventListener('click', (e) => {
    if (e.target === nav) {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
      body.style.overflow = '';
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
      body.style.overflow = '';
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
});
