/* ================================
   PASUMAI - script.js
   Handles: nav, scroll reveal,
   counters, form logic
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

/* ---------- CONTACT FORM ---------- */
const orderForm   = document.getElementById('orderForm');
const successMsg  = document.getElementById('successMessage');
const productSel  = document.getElementById('product');
const quantityIn  = document.getElementById('quantity');
const totalAmount = document.getElementById('totalAmount');

const prices = {
  groundnut:              220,
  'nallennai-mandavellam': 330,
  'nallennai-karupatti':   340,
  coconut:                380
};

function updateTotal() {
  if (!productSel || !quantityIn || !totalAmount) return;
  const price = prices[productSel.value] || 0;
  const qty   = Math.max(1, parseInt(quantityIn.value, 10) || 1);
  const total = price * qty;
  totalAmount.textContent = total > 0 ? '₹' + total.toLocaleString('en-IN') : '₹0';
}

if (productSel)  productSel.addEventListener('change',  updateTotal);
if (quantityIn)  quantityIn.addEventListener('input',   updateTotal);

// Pre-select product from URL param: contact.html?product=groundnut
(function () {
  if (!productSel) return;
  const params  = new URLSearchParams(window.location.search);
  const product = params.get('product');
  if (product && prices[product] !== undefined) {
    productSel.value = product;
    updateTotal();
  }
})();

// Form validation helpers
function showError(fieldId, errorId, msg) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (field)  field.closest('.form-group').classList.add('error');
  if (error)  error.textContent = msg;
}

function clearErrors() {
  document.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));
  document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
}

function validateForm() {
  clearErrors();
  let valid = true;

  const name    = document.getElementById('name');
  const phone   = document.getElementById('phone');
  const product = document.getElementById('product');
  const qty     = document.getElementById('quantity');

  if (!name || !name.value.trim()) {
    showError('name', 'nameError', 'Please enter your name.');
    valid = false;
  }

  if (!phone || !phone.value.trim()) {
    showError('phone', 'phoneError', 'Please enter your phone number.');
    valid = false;
  } else if (!/^[6-9]\d{9}$/.test(phone.value.replace(/\s/g, ''))) {
    showError('phone', 'phoneError', 'Enter a valid 10-digit Indian mobile number.');
    valid = false;
  }

  if (!product || !product.value) {
    showError('product', 'productError', 'Please select a product.');
    valid = false;
  }

  if (!qty || parseInt(qty.value, 10) < 1) {
    showError('quantity', 'quantityError', 'Quantity must be at least 1 litre.');
    valid = false;
  }

  return valid;
}

if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Simulate order submission (replace with real API / WhatsApp deep-link as needed)
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Submitting…';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      orderForm.classList.add('hidden');
      orderForm.style.display = 'none';
      if (successMsg) {
        successMsg.classList.remove('hidden');
        successMsg.style.display = '';
      }
    }, 800);
  });
}

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