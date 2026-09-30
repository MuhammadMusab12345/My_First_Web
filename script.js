/* ===================================================
   PIZZAFIRE — Main JavaScript
   =================================================== */

// ===== PIZZA BUILDER STATE =====
let pizzaState = {
  size: 'Medium',
  sizePrice: 12.99,
  toppings: [],
  toppingPrice: 1.50,
};
let cartCount = 0;

// ===== LOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      // Auto-open pizza builder after 0.5s
      setTimeout(() => openPizzaBuilder(), 500);
    }
  }, 1800);
});

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('open');
  });
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

// ===== AUTH STATE =====
function initAuth() {
  const user = JSON.parse(localStorage.getItem('pf_loggedIn') || 'null');
  const greet = document.getElementById('userGreeting');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');

  if (user) {
    const firstName = user.name.split(' ')[0];
    if (greet) { greet.textContent = `Hi, ${firstName} 👋`; greet.style.display = 'flex'; }
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (mobileLoginBtn) mobileLoginBtn.textContent = `Hi, ${firstName} 👋`;
  } else {
    if (greet) greet.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

function logout() {
  localStorage.removeItem('pf_loggedIn');
  window.location.reload();
}

// Init on page load
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initScrollAnimations();
});

// ===== PIZZA BUILDER =====
function openPizzaBuilder() {
  const overlay = document.getElementById('pizzaOverlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closePizzaBuilder() {
  const overlay = document.getElementById('pizzaOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('pizzaOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePizzaBuilder();
    });
  }
});

// Escape key to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePizzaBuilder();
});

// ===== SIZE SELECTION =====
function selectSize(btn) {
  // Update active state
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  pizzaState.size = btn.dataset.size;
  pizzaState.sizePrice = parseFloat(btn.dataset.price);
  const scale = parseFloat(btn.dataset.scale);

  // Animate pizza scale
  const pizza = document.getElementById('pizza3d');
  if (pizza) {
    pizza.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    pizza.style.transform = `perspective(400px) rotateX(20deg) scale(${scale})`;
  }

  // Update labels
  const sizeLabel = document.getElementById('sizeLabel');
  const sizeNames = { Small: '8"', Medium: '12"', Large: '14"', XL: '16"' };
  if (sizeLabel) sizeLabel.textContent = `${pizzaState.size} ${sizeNames[pizzaState.size] || ''}`;

  updatePrice();
}

// ===== TOPPING TOGGLE =====
function toggleTopping(checkbox) {
  const topping = checkbox.value;
  const layerId = `tLayer_${topping}`;
  const layer = document.getElementById(layerId);

  if (checkbox.checked) {
    if (!pizzaState.toppings.includes(topping)) pizzaState.toppings.push(topping);
    if (layer) {
      layer.style.transition = 'opacity 0.4s ease';
      layer.style.opacity = '1';
    }
  } else {
    pizzaState.toppings = pizzaState.toppings.filter(t => t !== topping);
    if (layer) layer.style.opacity = '0';
  }
  updatePrice();
}

// ===== PRICE UPDATE =====
function updatePrice() {
  const total = pizzaState.sizePrice + (pizzaState.toppings.length * pizzaState.toppingPrice);

  const livePrice = document.getElementById('livePrice');
  const summTotal = document.getElementById('summTotal');
  const summSize = document.getElementById('summSize');
  const summToppings = document.getElementById('summToppings');

  const formatted = `$${total.toFixed(2)}`;

  if (livePrice) {
    livePrice.style.transform = 'scale(1.1)';
    setTimeout(() => { livePrice.style.transform = 'scale(1)'; }, 200);
    livePrice.textContent = formatted;
  }
  if (summTotal) summTotal.textContent = formatted;
  if (summSize) summSize.textContent = pizzaState.size;
  if (summToppings) {
    summToppings.textContent = pizzaState.toppings.length > 0
      ? pizzaState.toppings.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
      : 'None';
  }
}

// ===== SURPRISE ME =====
function surpriseMe() {
  // Random size
  const sizes = document.querySelectorAll('.size-btn');
  const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

  // Clear toppings first
  document.querySelectorAll('.topping-card input').forEach(cb => {
    cb.checked = false;
    toggleTopping(cb);
  });
  pizzaState.toppings = [];

  // Set random size
  selectSize(randomSize);

  // Random toppings (2-4)
  const toppingCheckboxes = Array.from(document.querySelectorAll('.topping-card input'));
  const shuffled = toppingCheckboxes.sort(() => Math.random() - 0.5);
  const count = Math.floor(Math.random() * 3) + 2;
  shuffled.slice(0, count).forEach((cb, i) => {
    setTimeout(() => {
      cb.checked = true;
      toggleTopping(cb);
    }, i * 150);
  });

  // Fun animation
  const pizza = document.getElementById('pizza3d');
  if (pizza) {
    pizza.style.animation = 'none';
    pizza.offsetHeight; // reflow
    pizza.style.animation = '';
    pizza.style.transform = `${pizza.style.transform} rotateZ(360deg)`;
    setTimeout(() => {
      pizza.style.transform = `perspective(400px) rotateX(20deg) scale(${parseFloat(randomSize.dataset.scale)})`;
    }, 600);
  }
}

// ===== ADD TO CART =====
function addToCart() {
  cartCount++;
  const confirm = document.getElementById('cartConfirm');
  const notif = document.getElementById('cartNotif');
  const countEl = document.getElementById('cartCount');

  if (confirm) {
    confirm.classList.add('show');
    setTimeout(() => confirm.classList.remove('show'), 2000);
  }
  if (countEl) countEl.textContent = cartCount;
  if (notif) {
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
  }

  // Save to localStorage
  const order = {
    id: Date.now(),
    size: pizzaState.size,
    toppings: [...pizzaState.toppings],
    price: pizzaState.sizePrice + (pizzaState.toppings.length * pizzaState.toppingPrice),
    time: new Date().toLocaleString(),
  };
  const cart = JSON.parse(localStorage.getItem('pf_cart') || '[]');
  cart.push(order);
  localStorage.setItem('pf_cart', JSON.stringify(cart));
}

// ===== MENU FILTER =====
function filterMenu(cat, btn) {
  // Update tabs
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide cards
  document.querySelectorAll('.menu-card').forEach(card => {
    if (card.dataset.cat === cat) {
      card.style.display = 'block';
      card.style.animation = 'fadeInUp 0.3s ease forwards';
    } else {
      card.style.display = 'none';
    }
  });
}

// ===== PASSWORD TOGGLE (shared between pages) =====
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) {
    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
  }
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const animEls = document.querySelectorAll(
    '.menu-card, .offer-card, .testi-card, .about-feat, .info-card'
  );

  animEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
    observer.observe(el);
  });
}

// ===== INIT PRICE =====
document.addEventListener('DOMContentLoaded', () => {
  updatePrice();
});












// ye be mera code hen

// ===== 3D CARD STACK GALLERY LOGIC =====
const stack = document.getElementById('cardStack');

if (stack) {
  const cards = Array.from(stack.getElementsByClassName('stack-card'));
  const nextBtn = document.getElementById('stackNextBtn');

  function updateStack() {
    cards.forEach((card, index) => {
      if (index === 0) {
        card.style.transform = "translateY(0) scale(1) rotate(0deg)";
        card.style.opacity = "1";
        card.style.zIndex = cards.length;
        card.style.pointerEvents = "auto";
      } else if (index < 3) {
        const translateY = index * 25;
        const scale = 1 - index * 0.05;
        const rotate = index * 3;

        card.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
        card.style.opacity = "0.9";
        card.style.zIndex = cards.length - index;
        card.style.pointerEvents = "none";
      } else {
        card.style.transform = "translateY(60px) scale(0.8) rotate(10deg)";
        card.style.opacity = "0";
        card.style.zIndex = 0;
        card.style.pointerEvents = "none";
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const topCard = cards.shift();

      topCard.style.transform = "translateX(150%) rotate(30deg) scale(0.9)";
      topCard.style.opacity = "0";

      setTimeout(() => {
        stack.appendChild(topCard);
        cards.push(topCard);
        updateStack();
      }, 300);
    });
  }

  // Pehli baar stack load karne ke liye call kiya
  updateStack();
}




































// ===== SHALE PIZZASS — EXPLICIT DISCRETE HIGHLIGHT CATEGORY ENGINE =====
let activeMenuItem = { name: "", basePrice: 0, imagePath: "" };

function filterMenuCategory(categoryName) {
  // 1. Saare menu buttons se active class clear karein taake dual styling bug na bane
  const buttons = document.querySelectorAll('.menu-tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  // 2. Sirf clicked target button ko active state dein
  const currentTargetButton = document.getElementById(`tab-${categoryName}`);
  if (currentTargetButton) {
    currentTargetButton.classList.add('active');
  }

  // 3. Grid elements matrix show/hide processing
  const cards = document.querySelectorAll('.menu-item-node');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (categoryName === 'all' || cardCat === categoryName) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function openMenuDetails(name, image, desc, price) {
  activeMenuItem.name = name;
  activeMenuItem.basePrice = parseInt(price);
  activeMenuItem.imagePath = image;

  document.getElementById('modalMenuTitle').innerText = name;
  document.getElementById('modalMenuDesc').innerText = desc;
  document.getElementById('modalMenuImg').src = image;
  document.getElementById('modalMenuQty').value = 1;

  recalculateMenuModalPrice();
  document.getElementById('menuDetailModal').classList.add('md-modal-visible');
}

function closeMenuDetails() {
  document.getElementById('menuDetailModal').classList.remove('md-modal-visible');
}

function adjustMenuQuantity(direction) {
  let qtyField = document.getElementById('modalMenuQty');
  let currentQuantity = parseInt(qtyField.value) || 1;
  let computedQuantity = currentQuantity + direction;

  if (computedQuantity < 1) computedQuantity = 1;
  qtyField.value = computedQuantity;

  recalculateMenuModalPrice();
}

function recalculateMenuModalPrice() {
  let currentQty = parseInt(document.getElementById('modalMenuQty').value) || 1;
  let dynamicTotal = activeMenuItem.basePrice * currentQty;
  document.getElementById('modalMenuPrice').innerText = "Rs. " + dynamicTotal.toLocaleString();
}

function submitMenuToCart() {
  let endQty = parseInt(document.getElementById('modalMenuQty').value) || 1;
  if (typeof addToCartDirect === "function") {
    for (let loop = 0; loop < endQty; loop++) {
      addToCartDirect(activeMenuItem.name, activeMenuItem.basePrice);
    }
  } else {
    alert(`${endQty}x ${activeMenuItem.name} added to Cart!`);
  }
  closeMenuDetails();
}

function triggerMenuDirectBuy() {
  let endQty = parseInt(document.getElementById('modalMenuQty').value) || 1;
  let operationalTotal = activeMenuItem.basePrice * endQty;
  alert(`Express Checkout for ${endQty}x ${activeMenuItem.name} (Rs. ${operationalTotal.toLocaleString()}) 🔥`);
  closeMenuDetails();
}


















































































// ===== SHALE PIZZASS — 3D DECK CONSOLE LOGIC ENGINE (FIXED FUNCTION NAME) =====
let offersConsoleArray = [];
let isConsoleAnimating = false;

document.addEventListener("DOMContentLoaded", () => {
  initOffers3DFlipConsole();
});

function initOffers3DFlipConsole() {
  const stackContainer = document.getElementById("offers3DConsoleStack");
  if (!stackContainer) return;

  offersConsoleArray = Array.from(stackContainer.getElementsByClassName("offer-console-card"));
  arrangeOffers3DConsoleLayers();
}

function arrangeOffers3DConsoleLayers() {
  offersConsoleArray.forEach((card, index) => {
    card.classList.remove('active-front', 'layer-middle', 'layer-back', 'flip-out-process');

    if (index === 0) {
      card.classList.add('active-front');
      card.style.pointerEvents = "auto";
    } else if (index === 1) {
      card.classList.add('layer-middle');
      card.style.pointerEvents = "none";
    } else if (index === 2) {
      card.classList.add('layer-back');
      card.style.pointerEvents = "none";
    } else {
      card.style.opacity = "0";
      card.style.zIndex = "0";
      card.style.pointerEvents = "none";
    }
  });
}

function rotateOffersDeckStack(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  if (offersConsoleArray.length <= 1 || isConsoleAnimating) return;

  isConsoleAnimating = true;
  const frontCard = offersConsoleArray[0];
  frontCard.classList.add('flip-out-process');

  setTimeout(() => {
    const stackContainer = document.getElementById("offers3DConsoleStack");
    if (stackContainer) {
      offersConsoleArray.shift();
      stackContainer.appendChild(frontCard);
      offersConsoleArray.push(frontCard);

      arrangeOffers3DConsoleLayers();
      isConsoleAnimating = false;
    }
  }, 700);
}

// Yeh function ab direct aapke website ke original function 'openMenuModal' ko trigger karega
function handleOfferCardClick(cardElement, name, price, image, desc) {
  if (isConsoleAnimating) return;

  if (offersConsoleArray[0] === cardElement) {
    // Targetting your website's exact core function
    if (typeof openMenuModal === "function") {
      openMenuModal(name, price, image, desc);
    } else {
      alert("Menu modal function not found!");
    }
  }
}





































// Default menu category on page load
document.addEventListener("DOMContentLoaded", () => {
  filterMenuCategory("pizza");
});





























// ===== ABOUT 3D CAROUSEL =====

document.addEventListener("DOMContentLoaded", () => {

  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  let rotationY = 0;
  let startX = 0;
  let isDragging = false;

  function updateCarousel() {
    carousel.style.transform =
      `perspective(1200px) rotateY(${rotationY}deg)`;
  }

  // Card Flip
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", (e) => {

      if (isDragging) return;

      card.classList.toggle("flipped");
      e.stopPropagation();
    });
  });

  // Mouse
  carousel.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const moveX = e.clientX - startX;
    rotationY += moveX * 0.3;
    startX = e.clientX;

    updateCarousel();
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Touch
  carousel.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  carousel.addEventListener("touchmove", (e) => {
    const moveX = e.touches[0].clientX - startX;

    rotationY += moveX * 0.3;
    startX = e.touches[0].clientX;

    updateCarousel();
  });

});




// ===== ABOUT 3D CAROUSEL =====

document.addEventListener("DOMContentLoaded", () => {

  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  let rotationY = 0;
  let startX = 0;
  let isDragging = false;
  let hasMoved = false;

  function updateCarousel() {
    carousel.style.transform =
      `perspective(1200px) rotateY(${rotationY}deg)`;
  }

  // ===== CARD FLIP =====
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", (e) => {

      // Drag hua ho to flip na karo
      if (hasMoved) return;

      card.classList.toggle("flipped");
      e.stopPropagation();
    });
  });

  // ===== MOUSE DRAG =====
  carousel.addEventListener("mousedown", (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const moveX = e.clientX - startX;

    if (Math.abs(moveX) > 3) {
      hasMoved = true;
    }

    rotationY += moveX * 0.3;
    startX = e.clientX;

    updateCarousel();
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;

    setTimeout(() => {
      hasMoved = false;
    }, 50);
  });

  // ===== TOUCH DRAG =====
  carousel.addEventListener("touchstart", (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.touches[0].clientX;
  });

  carousel.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    const moveX = e.touches[0].clientX - startX;

    if (Math.abs(moveX) > 3) {
      hasMoved = true;
    }

    rotationY += moveX * 0.3;
    startX = e.touches[0].clientX;

    updateCarousel();
  });

  document.addEventListener("touchend", () => {
    isDragging = false;

    setTimeout(() => {
      hasMoved = false;
    }, 50);
  });

});






















document.querySelectorAll('.card').forEach(card => {

  card.addEventListener('click', function () {

    document.querySelectorAll('.card').forEach(c => {
      if (c !== this) {
        c.classList.remove('active');
      }
    });

    this.classList.toggle('active');

  });

});