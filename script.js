/* ================================
   PASUMAI - script.js
   Handles: nav, scroll reveal,
   counters, form logic, WhatsApp
   ================================ */

/* ---------- NAVBAR ---------- */
const navbar   = document.getElementById('navbar');
const menuBtn  = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

// Scroll: add/remove .scrolled class
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    menuBtn.classList.toggle('active', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a link is tapped
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', false);
    });
  });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (navLinks && menuBtn &&
      !navLinks.contains(e.target) &&
      !menuBtn.contains(e.target)) {
    navLinks.classList.remove('active');
    menuBtn.classList.remove('active');
  }
});

/* ---------- SCROLL REVEAL ---------- */
const revealEls = document.querySelectorAll(
  '.reveal-up, .reveal-left, .reveal-right, .reveal-scale'
);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
} else {
  // Fallback for old browsers: just show everything
  revealEls.forEach(el => el.classList.add('revealed'));
}

/* ---------- COUNTER ANIMATION ---------- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step = 16;
  const increment = target / (duration / step);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString('en-IN');
  }, step);
}

// Trigger counters when the about section enters view
const statNumbers = document.querySelectorAll('.stat-number[data-target]');

if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(animateCounter);
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const aboutSection = document.getElementById('about');
  if (aboutSection) counterObserver.observe(aboutSection);
} else {
  statNumbers.forEach(el => {
    el.textContent = parseInt(el.dataset.target, 10).toLocaleString('en-IN');
  });
}

/* ---------- ORDER FORM LOGIC ---------- */
(function () {
  var prices = {
    'groundnut': 220,
    'nallennai-mandavellam': 330,
    'nallennai-karupatti': 340,
    'coconut': 380
  };

  var productSelect = document.getElementById('product');
  var quantityInput = document.getElementById('quantity');
  var totalDisplay = document.getElementById('totalAmount');
  var form = document.getElementById('orderForm');
  var successMessage = document.getElementById('successMessage');

  if (!form) return;

  /* ── Live total calculation ── */
  function updateTotal() {
    var product = productSelect.value;
    var qty = parseInt(quantityInput.value) || 0;
    if (product && prices[product]) {
      totalDisplay.textContent = '₹' + (prices[product] * qty).toLocaleString('en-IN');
    } else {
      totalDisplay.textContent = '₹0';
    }
  }

  productSelect.addEventListener('change', updateTotal);
  quantityInput.addEventListener('input', updateTotal);

  /* ── Pre-select product from URL param: contact.html?product=groundnut ── */
  (function () {
    var params  = new URLSearchParams(window.location.search);
    var product = params.get('product');
    if (product && prices[product] !== undefined) {
      productSelect.value = product;
      updateTotal();
    }
  })();

  /* ── Error helpers ── */
  function setError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);
    if (field) field.classList.add('input-error');
    if (error) error.textContent = message;
  }

  function clearError(fieldId, errorId) {
    var field = document.getElementById(fieldId);
    var error = document.getElementById(errorId);
    if (field) field.classList.remove('input-error');
    if (error) error.textContent = '';
  }

  /* ── Clear errors on input / change ── */
  ['name', 'phone', 'address', 'pincode', 'product', 'quantity'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () { clearError(id, id + 'Error'); });
      el.addEventListener('change', function () { clearError(id, id + 'Error'); });
    }
  });

  /* ── Validation ── */
  function validateForm() {
    var valid = true;

    var name = document.getElementById('name').value.trim();
    if (!name) { setError('name', 'nameError', 'Please enter your name'); valid = false; }
    else { clearError('name', 'nameError'); }

    var phone = document.getElementById('phone').value.trim();
    if (!phone) { setError('phone', 'phoneError', 'Please enter your phone number'); valid = false; }
    else if (!/^[0-9]{10}$/.test(phone)) { setError('phone', 'phoneError', 'Enter a valid 10-digit number'); valid = false; }
    else { clearError('phone', 'phoneError'); }

    var address = document.getElementById('address').value.trim();
    if (!address) { setError('address', 'addressError', 'Please enter your delivery address'); valid = false; }
    else { clearError('address', 'addressError'); }

    var pincode = document.getElementById('pincode').value.trim();
    if (pincode && !/^[0-9]{6}$/.test(pincode)) { setError('pincode', 'pincodeError', 'Enter a valid 6-digit pincode'); valid = false; }
    else { clearError('pincode', 'pincodeError'); }

    var product = productSelect.value;
    if (!product) { setError('product', 'productError', 'Please select a product'); valid = false; }
    else { clearError('product', 'productError'); }

    var qty = parseInt(quantityInput.value);
    if (!qty || qty < 1) { setError('quantity', 'quantityError', 'Quantity must be at least 1'); valid = false; }
    else { clearError('quantity', 'quantityError'); }

    return valid;
  }

  /* ── Form Submit ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    var name    = document.getElementById('name').value.trim();
    var phone   = document.getElementById('phone').value.trim();
    var address = document.getElementById('address').value.trim();
    var pincode = document.getElementById('pincode').value.trim();
    var city    = document.getElementById('city').value.trim();
    var product = productSelect.value;
    var qty     = parseInt(quantityInput.value);
    var notes   = document.getElementById('notes').value.trim();
    var businessNumber = document.getElementById('businessNumber').value;

    var productLabel = productSelect.options[productSelect.selectedIndex].text;
    var total = prices[product] * qty;

    // Build full address string
    var fullAddress = address;
    if (city) fullAddress += ', ' + city;
    if (pincode) fullAddress += ' - ' + pincode;

    // Build WhatsApp message
    var message = '🫒 *New Order — Pasumai Oils*\n\n';
    message += '*Name:* ' + name + '\n';
    message += '*Phone:* ' + phone + '\n';
    message += '*Address:* ' + fullAddress + '\n\n';
    message += '*Product:* ' + productLabel + '\n';
    message += '*Quantity:* ' + qty + ' Litre(s)\n';
    message += '*Total:* ₹' + total.toLocaleString('en-IN') + '\n';
    if (notes) {
      message += '\n*Notes:* ' + notes;
    }
    message += '\n\n_Please confirm my order. Thank you!_';

    var encodedMessage = encodeURIComponent(message);
    var whatsappURL = 'https://wa.me/' + businessNumber + '?text=' + encodedMessage;

    // Show success & open WhatsApp
    form.style.display = 'none';
    successMessage.classList.remove('hidden');
    window.open(whatsappURL, '_blank');

    // Auto-reset after 5 seconds
    setTimeout(function () {
      form.reset();
      totalDisplay.textContent = '₹0';
      form.style.display = '';
      successMessage.classList.add('hidden');
    }, 5000);
  });
})();

/* ---------- SMOOTH ANCHOR SCROLL ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});