// ==================== Guest Access Restrictions ====================
// This file implements all guest access limitations

// Function to check if user is a guest
function isGuestUser() {
  const userType = localStorage.getItem('userType');
  return userType === 'guest';
}

// Function to set up guest restrictions on page load
function setupGuestRestrictions() {
  if (!isGuestUser()) {
    return; // Not a guest, no restrictions needed
  }

  console.log('Setting up guest restrictions...');

  // 1. Hide/Disable "Add from Map" functionality
  disableMapCitySelection();

  // 2. Disable detailed city analysis
  disableDetailedAnalysis();

  // 3. Modify tracker to show only random cities
  setupRandomCityViewing();

  // 4. Add visual indicators for guest status
  addGuestBadge();
  addUpgradePrompt();

  // 5. Keep health recommendations enabled (guests CAN access this)
  // No action needed - health tab is accessible by default

  console.log('Guest restrictions applied successfully');
}

// 1. Disable adding custom cities from the map
function disableMapCitySelection() {
  // Disable map click functionality
  if (typeof window.map !== 'undefined' && window.map) {
    try {
      // For Leaflet maps, use off method if available
      if (typeof window.map.off === 'function') {
        window.map.off('click');
      }
      // Alternative: disable dragging and interactions
      if (window.map.dragging) {
        // Keep dragging enabled but remove click handlers
      }
    } catch (error) {
      console.log('Map click handlers already handled:', error);
    }
    
    // Disable all "Add City" buttons in map popups
    const style = document.createElement('style');
    style.innerHTML = `
      .leaflet-popup-content button[onclick*="addCityFromMap"] {
        display: none !important;
      }
      .map-controls .btn-primary {
        pointer-events: none;
        opacity: 0.5;
      }
    `;
    document.head.appendChild(style);
  }

  // Hide any "Add from Map" buttons
  setTimeout(() => {
    const mapButtons = document.querySelectorAll('button[onclick*="addCityFromMap"]');
    mapButtons.forEach(btn => {
      btn.style.display = 'none';
    });
  }, 1000);

  console.log('Map city selection disabled for guest');
}

// 2. Disable detailed city analysis
function disableDetailedAnalysis() {
  // Disable the Analysis tab or show limited view
  const analysisTab = document.getElementById('analysis-tab');
  if (analysisTab) {
    analysisTab.addEventListener('click', (e) => {
      if (isGuestUser()) {
        e.preventDefault();
        e.stopPropagation();
        showGuestRestrictionModal('detailed analysis');
      }
    });
  }

  // Hide detailed pollutant insights section
  const style = document.createElement('style');
  style.innerHTML = `
    .guest-user #analysis .detailed-analysis,
    .guest-user #analysis .pollutant-insights,
    .guest-user #analysis .comparison-charts {
      display: none !important;
    }
    .guest-user #analysis::before {
      content: "📊 Detailed analysis is not available for guest users. Please register to access advanced analytics.";
      display: block;
      padding: 2rem;
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      text-align: center;
      font-size: 1.1rem;
      color: #856404;
      margin: 1rem 0;
    }
  `;
  document.head.appendChild(style);

  console.log('Detailed analysis disabled for guest');
}

// 3. Setup random city viewing only
function setupRandomCityViewing() {
  // Override the addRandomCity function to use guest API
  if (typeof window.addRandomCity !== 'undefined') {
    const originalAddRandomCity = window.addRandomCity;
    window.addRandomCity = async function() {
      try {
        const response = await fetch('/api/guest/random-city', {
          headers: getRequestHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch random city');
        }
        
        const data = await response.json();
        if (data.success) {
          displayGuestCity(data.city);
        }
      } catch (error) {
        console.error('Error adding random city:', error);
        showNotification('Error loading city data', 'error');
      }
    };
  }

  // Disable manual city input/selection
  const cityInputs = document.querySelectorAll('input[type="text"][placeholder*="city" i]');
  cityInputs.forEach(input => {
    input.disabled = true;
    input.placeholder = 'Guest users can only view random cities';
  });

  console.log('Random city viewing setup for guest');
}

// Display guest city data (basic AQI only)
function displayGuestCity(city) {
  const pollutionCards = document.getElementById('pollutionCards');
  if (!pollutionCards) return;

  // Create a simplified card with basic air quality data
  const card = createGuestCityCard(city);
  pollutionCards.innerHTML = ''; // Clear existing
  pollutionCards.appendChild(card);

  // Update counter
  const trackedCount = document.getElementById('userTrackedCitiesCount');
  if (trackedCount) {
    trackedCount.textContent = '1';
  }
}

// Create a card with limited data for guests
function createGuestCityCard(city) {
  const card = document.createElement('div');
  card.className = 'city-card mb-3';
  
  const aqiLevel = getAQILevel(city.aqi);
  
  card.innerHTML = `
    <div class="card h-100 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="card-title">${city.name}</h5>
          <span class="badge bg-${aqiLevel.color}">${city.aqi}</span>
        </div>
        <p class="card-text mb-2">
          <strong>Air Quality:</strong> ${aqiLevel.label}
        </p>
        <div class="row text-center mb-2">
          <div class="col-6">
            <small class="text-muted">PM2.5</small>
            <div><strong>${city.pm25 || 'N/A'}</strong></div>
          </div>
          <div class="col-6">
            <small class="text-muted">PM10</small>
            <div><strong>${city.pm10 || 'N/A'}</strong></div>
          </div>
        </div>
        <div class="alert alert-info py-2 mb-0">
          <small>
            <i class="bi bi-info-circle"></i> 
            Guest users see basic air quality data only. 
            <a href="/" class="alert-link">Register</a> for detailed pollutant analysis.
          </small>
        </div>
      </div>
    </div>
  `;
  
  return card;
}

// Make it globally accessible
window.createGuestCityCard = createGuestCityCard;

// Helper function to get AQI level
function getAQILevel(aqi) {
  if (aqi <= 50) return { label: 'Good', color: 'success' };
  if (aqi <= 100) return { label: 'Moderate', color: 'warning' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'orange' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'danger' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'danger' };
  return { label: 'Hazardous', color: 'dark' };
}

// 4. Add visual indicators
function addGuestBadge() {
  const navbarBrand = document.querySelector('.navbar-brand');
  if (navbarBrand && !document.querySelector('.guest-badge')) {
    const guestBadge = document.createElement('span');
    guestBadge.className = 'badge bg-warning text-dark ms-2 guest-badge';
    guestBadge.textContent = '👤 Guest Mode';
    navbarBrand.appendChild(guestBadge);
  }

  // Add guest class to body
  document.body.classList.add('guest-user');
}

function addUpgradePrompt() {
  const heroSection = document.querySelector('.hero-section') || document.querySelector('.container');
  if (heroSection && !document.querySelector('.guest-upgrade-prompt')) {
    const upgradePrompt = document.createElement('div');
    upgradePrompt.className = 'alert alert-warning alert-dismissible fade show mb-3 guest-upgrade-prompt';
    upgradePrompt.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
        <div class="flex-grow-1">
          <h6 class="alert-heading mb-1">Guest Access Limitations</h6>
          <ul class="mb-2 small">
            <li>❌ Cannot add custom cities from the map</li>
            <li>❌ Limited to viewing random city data only</li>
            <li>❌ Cannot access detailed city analysis</li>
            <li>✅ Can view basic air quality data</li>
            <li>✅ Access to health recommendations</li>
          </ul>
          <a href="/" class="btn btn-sm btn-primary">
            <i class="bi bi-person-plus"></i> Register Now for Full Access
          </a>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    
    const container = document.querySelector('.container');
    if (container && container.firstChild) {
      container.insertBefore(upgradePrompt, container.firstChild);
    }
  }
}

// Show modal explaining restriction
function showGuestRestrictionModal(feature) {
  const modal = `
    <div class="modal fade" id="guestRestrictionModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-warning">
            <h5 class="modal-title">
              <i class="bi bi-lock-fill"></i> Feature Restricted
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Access to <strong>${feature}</strong> is not available for guest users.</p>
            <p>Please register for a free account to unlock:</p>
            <ul>
              <li>Add custom cities from the map</li>
              <li>Track unlimited cities</li>
              <li>Access detailed pollutant analysis</li>
              <li>View historical data and trends</li>
              <li>Export data and reports</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Stay as Guest</button>
            <a href="/" class="btn btn-primary">Register Now</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.getElementById('guestRestrictionModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Add and show modal
  document.body.insertAdjacentHTML('beforeend', modal);
  const modalElement = new bootstrap.Modal(document.getElementById('guestRestrictionModal'));
  modalElement.show();
}

// Add headers for API requests based on user type
function getRequestHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');

  if (userType === 'guest') {
    headers['User-Type'] = 'guest';
  } else if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Override fetch to always include proper headers
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  // Only modify API calls
  if (typeof url === 'string' && url.startsWith('/api/')) {
    options.headers = {
      ...options.headers,
      ...getRequestHeaders()
    };
  }
  return originalFetch(url, options);
};

// Initialize guest restrictions on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupGuestRestrictions);
} else {
  setupGuestRestrictions();
}

console.log('Guest features module loaded');