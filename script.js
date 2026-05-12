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

  var orderItemsContainer = document.getElementById('orderItems');
  var addItemBtn = document.getElementById('addItemBtn');
  var totalDisplay = document.getElementById('totalAmount');
  var form = document.getElementById('orderForm');
  var successMessage = document.getElementById('successMessage');

  if (!form || !orderItemsContainer) return;

  function createProductSelect() {
    var select = document.createElement('select');
    select.className = 'product';
    select.required = true;
    select.innerHTML =
      '<option value="">Choose a product…</option>' +
      '<option value="groundnut">Groundnut Oil — ₹220 / Litre</option>' +
      '<option value="nallennai-mandavellam">Nallennai (Mandavellam) — ₹330 / Litre</option>' +
      '<option value="nallennai-karupatti">Nallennai (Karupatti) — ₹340 / Litre</option>' +
      '<option value="coconut">Coconut Oil — ₹380 / Litre</option>';
    return select;
  }

  function createOrderItem(productValue, qtyValue) {
    var wrapper = document.createElement('div');
    wrapper.className = 'order-item';

    var row = document.createElement('div');
    row.className = 'order-item-row';

    var select = createProductSelect();
    select.value = productValue || '';

    var qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.className = 'quantity';
    qtyInput.placeholder = 'Qty';
    qtyInput.min = '1';
    qtyInput.value = qtyValue || 1;
    qtyInput.required = true;

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-item';
    removeBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="7" y1="7" x2="17" y2="17"/><line x1="17" y1="7" x2="7" y2="17"/></svg><span>Remove</span>';
    removeBtn.addEventListener('click', function () {
      if (orderItemsContainer.children.length > 1) {
        wrapper.remove();
        updateTotal();
      }
    });

    row.appendChild(select);
    row.appendChild(qtyInput);
    row.appendChild(removeBtn);

    var errorContainer = document.createElement('div');
    errorContainer.className = 'order-item-errors';
    var productError = document.createElement('span');
    productError.className = 'error-message productError';
    var qtyError = document.createElement('span');
    qtyError.className = 'error-message quantityError';

    errorContainer.appendChild(productError);
    errorContainer.appendChild(qtyError);

    wrapper.appendChild(row);
    wrapper.appendChild(errorContainer);

    select.addEventListener('change', function () {
      clearOrderItemError(wrapper);
      updateTotal();
    });
    qtyInput.addEventListener('input', function () {
      clearOrderItemError(wrapper);
      updateTotal();
    });

    return wrapper;
  }

  function addOrderItem(productValue, qtyValue) {
    orderItemsContainer.appendChild(createOrderItem(productValue, qtyValue));
  }

  function getOrderItems() {
    return Array.from(orderItemsContainer.querySelectorAll('.order-item')).map(function (wrapper) {
      return {
        wrapper: wrapper,
        productInput: wrapper.querySelector('.product'),
        qtyInput: wrapper.querySelector('.quantity'),
        product: wrapper.querySelector('.product').value,
        qty: parseInt(wrapper.querySelector('.quantity').value, 10) || 0
      };
    });
  }

  function updateTotal() {
    var total = 0;
    getOrderItems().forEach(function (item) {
      if (item.product && prices[item.product]) {
        total += prices[item.product] * item.qty;
      }
    });
    totalDisplay.textContent = '₹' + total.toLocaleString('en-IN');
  }

  addItemBtn.addEventListener('click', function () {
    addOrderItem();
  });

  addOrderItem();
  updateTotal();

  function setError(input, errorEl, message) {
    if (input) input.classList.add('input-error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearOrderItemError(wrapper) {
    wrapper.querySelectorAll('.error-message').forEach(function (el) {
      el.textContent = '';
    });
    wrapper.querySelectorAll('.input-error').forEach(function (el) {
      el.classList.remove('input-error');
    });
  }

  function validateForm() {
    var valid = true;

    var name = document.getElementById('name').value.trim();
    if (!name) { setError(document.getElementById('name'), document.getElementById('nameError'), 'Please enter your name'); valid = false; }
    else { clearOrderItemError(document.getElementById('name').parentNode); }

    var phone = document.getElementById('phone').value.trim();
    if (!phone) { setError(document.getElementById('phone'), document.getElementById('phoneError'), 'Please enter your phone number'); valid = false; }
    else if (!/^[0-9]{10}$/.test(phone)) { setError(document.getElementById('phone'), document.getElementById('phoneError'), 'Enter a valid 10-digit number'); valid = false; }
    else { clearOrderItemError(document.getElementById('phone').parentNode); }

    var address = document.getElementById('address').value.trim();
    if (!address) { setError(document.getElementById('address'), document.getElementById('addressError'), 'Please enter your delivery address'); valid = false; }
    else { clearOrderItemError(document.getElementById('address').parentNode); }

    var pincode = document.getElementById('pincode').value.trim();
    if (pincode && !/^[0-9]{6}$/.test(pincode)) { setError(document.getElementById('pincode'), document.getElementById('pincodeError'), 'Enter a valid 6-digit pincode'); valid = false; }
    else { clearOrderItemError(document.getElementById('pincode').parentNode); }

    var items = getOrderItems();
    items.forEach(function (item) {
      var productError = item.wrapper.querySelector('.productError');
      var qtyError = item.wrapper.querySelector('.quantityError');
      clearOrderItemError(item.wrapper);

      if (!item.product) {
        setError(item.productInput, productError, 'Please select a product');
        valid = false;
      }
      if (!item.qty || item.qty < 1) {
        setError(item.qtyInput, qtyError, 'Quantity must be at least 1');
        valid = false;
      }
    });

    return valid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    var name = document.getElementById('name').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var address = document.getElementById('address').value.trim();
    var pincode = document.getElementById('pincode').value.trim();
    var city = document.getElementById('city').value.trim();
    var notes = document.getElementById('notes').value.trim();
    var businessNumber = document.getElementById('businessNumber').value;

    var items = getOrderItems();
    var total = 0;
    var productLines = items.map(function (item, index) {
      var productLabel = item.productInput.options[item.productInput.selectedIndex].text;
      if (item.product && prices[item.product]) {
        total += prices[item.product] * item.qty;
      }
      return '*Item ' + (index + 1) + ':* ' + productLabel + ' — ' + item.qty + ' Litre(s)';
    }).join('\n');

    var fullAddress = address;
    if (city) fullAddress += ', ' + city;
    if (pincode) fullAddress += ' - ' + pincode;

    var message = '🫒 *New Order — Pasumai Oils*\n\n';
    message += '*Name:* ' + name + '\n';
    message += '*Phone:* ' + phone + '\n';
    message += '*Address:* ' + fullAddress + '\n\n';
    message += productLines + '\n';
    message += '*Total:* ₹' + total.toLocaleString('en-IN') + '\n';
    if (notes) {
      message += '\n*Notes:* ' + notes;
    }
    message += '\n\n_Please confirm my order. Thank you!_';

    var encodedMessage = encodeURIComponent(message);
    var whatsappURL = 'https://wa.me/' + businessNumber + '?text=' + encodedMessage;

    form.style.display = 'none';
    successMessage.classList.remove('hidden');
    window.open(whatsappURL, '_blank');

    setTimeout(function () {
      form.reset();
      totalDisplay.textContent = '₹0';
      orderItemsContainer.innerHTML = '';
      addOrderItem();
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