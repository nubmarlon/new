import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const categories = ["All", "Valentines", "Mothers Day", "Fathers Day", "Christmas"];
const products = [
  { id: "v1", name: "Rose Bouquet", category: "Valentines", price: 39.99, image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176", description: "Red roses gift wrap." },
  { id: "v2", name: "Love Mug Set", category: "Valentines", price: 24.5, image: "https://images.unsplash.com/photo-1481391243133-f96216dcb5d2", description: "Matching couple mugs." },
  { id: "v3", name: "Chocolate Box", category: "Valentines", price: 18.0, image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b", description: "Premium mixed chocolates." },
  { id: "m1", name: "Spa Kit", category: "Mothers Day", price: 45.0, image: "https://images.unsplash.com/photo-1607006839247-0fc8f68ef7cf", description: "Relaxation essentials." },
  { id: "m2", name: "Personalized Necklace", category: "Mothers Day", price: 56.0, image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638", description: "Custom initial pendant." },
  { id: "m3", name: "Tea Gift Basket", category: "Mothers Day", price: 32.5, image: "https://images.unsplash.com/photo-1594631661960-5b2e81f6b76d", description: "Herbal tea assortment." },
  { id: "f1", name: "Leather Wallet", category: "Fathers Day", price: 34.99, image: "https://images.unsplash.com/photo-1627123424574-724758594e93", description: "Classic premium wallet." },
  { id: "f2", name: "BBQ Tool Set", category: "Fathers Day", price: 41.75, image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd", description: "Grill tools with case." },
  { id: "f3", name: "Sports Bottle", category: "Fathers Day", price: 16.2, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504", description: "Insulated steel bottle." },
  { id: "c1", name: "Christmas Wreath", category: "Christmas", price: 29.0, image: "https://images.unsplash.com/photo-1512389098783-66b81f86e199", description: "Decorative door wreath." },
  { id: "c2", name: "Holiday Candle Set", category: "Christmas", price: 22.95, image: "https://images.unsplash.com/photo-1603006905003-be475563bc59", description: "Warm festive scents." },
  { id: "c3", name: "Snow Globe", category: "Christmas", price: 19.99, image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543", description: "Musical collectible globe." }
];

let selectedCategory = "All";
let cart = loadCart();
let authMode = "login";
let currentUser = null;

const categoryNav = document.getElementById("category-nav");
const categoryTitle = document.getElementById("category-title");
const productsGrid = document.getElementById("products-grid");
const cartItemsEl = document.getElementById("cart-items");
const subtotalEl = document.getElementById("cart-subtotal");
const cartMessage = document.getElementById("cart-message");
const clearCartBtn = document.getElementById("clear-cart-btn");
const checkoutBtn = document.getElementById("checkout-btn");
const themeToggle = document.getElementById("theme-toggle");
const authTrigger = document.getElementById("auth-trigger");
const authPanel = document.getElementById("auth-panel");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authSubmit = document.getElementById("auth-submit");
const authSwitchMode = document.getElementById("auth-switch-mode");
const authSwitchLabel = document.getElementById("auth-switch-label");
const authMessage = document.getElementById("auth-message");
const userInfo = document.getElementById("user-info");
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

init();

function init() {
  renderCategoryButtons();
  renderProducts();
  renderCart();
  setupTheme();
  bindEvents();
  watchAuth();
}

function bindEvents() {
  clearCartBtn.addEventListener("click", clearCart);
  checkoutBtn.addEventListener("click", checkout);
  themeToggle.addEventListener("click", toggleTheme);
  authTrigger.addEventListener("click", () => authPanel.classList.toggle("hidden"));
  authSwitchMode.addEventListener("click", toggleAuthMode);
  authForm.addEventListener("submit", handleAuthSubmit);
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    showAuthMessage("Logged out successfully.");
  });
}

function renderCategoryButtons() {
  categoryNav.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `btn ${category === selectedCategory ? "btn-primary" : "btn-outline"}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      selectedCategory = category;
      renderCategoryButtons();
      renderProducts();
    });
    categoryNav.appendChild(button);
  });
}

function renderProducts() {
  const filtered = selectedCategory === "All"
    ? products
    : products.filter((product) => product.category === selectedCategory);

  categoryTitle.textContent = selectedCategory === "All" ? "All Products" : selectedCategory;
  productsGrid.innerHTML = "";

  if (!filtered.length) {
    productsGrid.innerHTML = "<p class='message'>No products in this category yet.</p>";
    return;
  }

  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p class="subtitle">${product.description}</p>
      <p class="price">$${product.price.toFixed(2)}</p>
      <button class="btn btn-primary" data-id="${product.id}" type="button">Add to Cart</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      addToCart(product.id);
    });

    productsGrid.appendChild(card);
  });
}

function addToCart(productId) {
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  persistCart();
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  const detailedItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean);

  if (!detailedItems.length) {
    cartItemsEl.innerHTML = "<p class='message'>Your cart is empty.</p>";
    subtotalEl.textContent = "$0.00";
    return;
  }

  let subtotal = 0;
  detailedItems.forEach((item) => {
    const lineTotal = item.product.price * item.quantity;
    subtotal += lineTotal;

    const wrapper = document.createElement("div");
    wrapper.className = "cart-item";
    wrapper.innerHTML = `
      <div class="cart-item-row">
        <strong>${item.product.name}</strong>
        <span>$${lineTotal.toFixed(2)}</span>
      </div>
      <div class="cart-item-row">
        <div class="qty-controls">
          <button class="btn btn-outline" data-action="decrease" data-id="${item.productId}" type="button">-</button>
          <span>${item.quantity}</span>
          <button class="btn btn-outline" data-action="increase" data-id="${item.productId}" type="button">+</button>
        </div>
        <button class="btn btn-outline" data-action="remove" data-id="${item.productId}" type="button">Remove</button>
      </div>
    `;

    wrapper.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        updateCartItem(button.dataset.id, button.dataset.action);
      });
    });
    cartItemsEl.appendChild(wrapper);
  });

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
}

function updateCartItem(productId, action) {
  const target = cart.find((item) => item.productId === productId);
  if (!target) {
    return;
  }
  if (action === "increase") {
    target.quantity += 1;
  } else if (action === "decrease") {
    target.quantity -= 1;
  } else if (action === "remove") {
    target.quantity = 0;
  }
  cart = cart.filter((item) => item.quantity > 0);
  persistCart();
  renderCart();
}

function clearCart() {
  cart = [];
  persistCart();
  renderCart();
  showCartMessage("Cart cleared.");
}

function loadCart() {
  try {
    const raw = localStorage.getItem("giftshop-cart");
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function persistCart() {
  localStorage.setItem("giftshop-cart", JSON.stringify(cart));
}

async function checkout() {
  if (!currentUser) {
    showCartMessage("Please login first to place an order.", true);
    return;
  }
  if (!cart.length) {
    showCartMessage("Your cart is empty.", true);
    return;
  }

  const items = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      id: item.productId,
      name: product?.name ?? "Unknown",
      price: product?.price ?? 0,
      quantity: item.quantity
    };
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    await addDoc(collection(db, "orders"), {
      uid: currentUser.uid,
      email: currentUser.email,
      items,
      total,
      createdAt: serverTimestamp()
    });
    cart = [];
    persistCart();
    renderCart();
    showCartMessage("Order placed successfully.");
  } catch (error) {
    showCartMessage(`Checkout failed: ${error.message}`, true);
  }
}

function toggleAuthMode() {
  authMode = authMode === "login" ? "register" : "login";
  const isLogin = authMode === "login";
  authTitle.textContent = isLogin ? "Login" : "Create Account";
  authSubmit.textContent = isLogin ? "Login" : "Register";
  authSwitchLabel.textContent = isLogin ? "No account?" : "Already have an account?";
  authSwitchMode.textContent = isLogin ? "Create one" : "Login";
  authMessage.textContent = "";
  authMessage.classList.remove("error");
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;

  if (!email || password.length < 6) {
    showAuthMessage("Enter a valid email and password (6+ chars).", true);
    return;
  }

  try {
    if (authMode === "login") {
      await signInWithEmailAndPassword(auth, email, password);
      showAuthMessage("Login successful.");
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      showAuthMessage("Account created successfully.");
    }
    authForm.reset();
    authPanel.classList.add("hidden");
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}

function watchAuth() {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      userEmail.textContent = user.email;
      userInfo.classList.remove("hidden");
      authTrigger.classList.add("hidden");
      authPanel.classList.add("hidden");
    } else {
      userInfo.classList.add("hidden");
      authTrigger.classList.remove("hidden");
    }
  });
}

function setupTheme() {
  const saved = localStorage.getItem("giftshop-theme") || "light";
  document.body.classList.toggle("dark", saved === "dark");
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("giftshop-theme", isDark ? "dark" : "light");
}

function showCartMessage(text, isError = false) {
  cartMessage.textContent = text;
  cartMessage.classList.toggle("error", isError);
}

function showAuthMessage(text, isError = false) {
  authMessage.textContent = text;
  authMessage.classList.toggle("error", isError);
}
