/* const productsData = [
  {
    title: "Свічка «Солодкий рай»",
    images: ["1.jpg"],
    description: "Солодкий аромат ванілі та фруктів. Ідеально для затишку.",
    price: 150
  },
  {
    title: "Свічка «Шоколадний мафін»",
    images: ["2.jpg"],
    description: "Аромат свіжої випічки з нотками шоколаду.",
    price: 170
  },
  {
    title: "Свічка «Ягідний десерт»",
    images: ["3.jpg"],
    description: "Ягідна композиція для романтичного вечора.",
    price: 160
  },
  {
    title: "Свічка «Гранатовий сидр»",
    images: ["garnet1.jpg", "garnet2.jpg", "garnet3.jpg"],
    description: "Соковитий гранат із пряними нотами — яскравий аромат сезону.",
    price: 225
  },
  {
    title: "Свічка «Limoncello Crème»",
    images: ["limoncello1.jpg", "limoncello2.jpg", "limoncello3.jpg"],
    description: "Свіжий лимон з вершковим кремом. Літній настрій у банці.",
    price: 350
  },
  {
    title: "Свічка «Coconut»",
    images: ["coconut1.jpg", "coconut2.jpg", "coconut3.jpg"],
    description: "Кокосова ніжність із тропічним ароматом.",
    price: 280
  },
  {
    title: "Свічка «Бавовна та Ірис»",
    images: ["6.jpg"],
    description: "Легкий аромат бавовни з квітковими нотками ірису.",
    price: 225
  },

{
  title: "Свічка «Toskana»",
  images: ["toskana1.jpg", "toskana2.jpg", "toskana3.jpg"],
  description: "Серія ароматичних свічок з італійським шармом Тоскани.",
  price: 265
},
{
  title: "Свічка «Roses»",
  images: ["roses1.jpg", "roses2.jpg", "roses3.jpg"],
  description: "Романтична серія з ароматом троянд. Ідеально для вечора.",
  price: 240
},
{
  title: "Свічка «Heart Collection»",
  images: ["heart1.jpg", "heart2.jpg", "heart3.jpg"],
  description: "Подарункові свічки у формі серця для особливих моментів.",
  price: 220
}

];

*/


let cart = [];

function addToCart(title, price) {
  const existing = cart.find(item => item.title === title);
  if (existing) {
    if (existing.quantity < 10) {
      existing.quantity += 1;
    } else {
      alert("Максимум 10 одиниць одного товару.");
      return;
    }
  } else {
    cart.push({ title, price, quantity: 1 });
  }
  updateCartCount();
  showCartNotification();
}


function addFromModalToCart(title, price) {
  const input = document.querySelector('#productModalContent input[type="number"]');
  const quantity = parseInt(input.value);

  const existing = cart.find(item => item.title === title);
  if (existing) {
    if (existing.quantity + quantity > 10) {
      alert("Максимум 10 одиниць одного товару.");
      existing.quantity = 10;
    } else {
      existing.quantity += quantity;
    }
  } else {
    cart.push({ title, price, quantity });
  }

  updateCartCount();
  showAddToCartNotification(); // ✅ ПРАВИЛЬНО!
}


 
function getProductPriceByTitle(title) {
  const productElement = [...document.querySelectorAll('.product')].find(el => el.querySelector('h3').textContent === title);
  if (!productElement) return 0;
  const priceText = productElement.querySelector('p').textContent.replace('₴', '');
  return parseInt(priceText);
}


function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").textContent = count;
}

function openCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  cartItemsContainer.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;

    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    itemDiv.innerHTML = `
      <div class="item-info">
        <span class="item-name">${item.title}</span>
        <span class="item-price">₴${item.price} × ${item.quantity} = ₴${itemTotal}</span>
      </div>
      <div class="item-controls">
        <button onclick="changeQuantity(${index}, -1)">−</button>
        <span>${item.quantity}</span>
        <button onclick="changeQuantity(${index}, 1)">+</button>
        <button onclick="removeFromCart(${index})">🗑️</button>
      </div>
    `;

    cartItemsContainer.appendChild(itemDiv);
    total += itemTotal;
  });

  document.getElementById("cartTotal").textContent = `₴${total}`;
  document.getElementById("cartModal").style.display = "block";
}

function closeCart() {
  document.getElementById("cartModal").style.display = "none";
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  openCart();
}

function changeQuantity(index, delta) {
  const item = cart[index];
  item.quantity += delta;
  if (item.quantity < 1) item.quantity = 1;
  if (item.quantity > 10) item.quantity = 10;
  updateCartCount();
  openCart();
}

function showCartNotification() {
  const notification = document.getElementById("cartNotification");
  notification.style.display = "flex";

  setTimeout(() => {
    notification.style.display = "none";
  }, 2000);
}



function renderProducts(products) {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";

    const img = document.createElement("img");
    img.src = product.images[0];

    img.alt = product.title;
    img.addEventListener("click", () => openProductModal(product.title));

    const h3 = document.createElement("h3");
    h3.textContent = product.title;

    const p = document.createElement("p");
    p.textContent = `₴${product.price}`;

    const btn = document.createElement("button");
    btn.className = "order-direct-btn";
    btn.textContent = "Замовити";
    btn.addEventListener("click", () => openProductModal(product.title));

    div.appendChild(img);
    div.appendChild(h3);
    div.appendChild(p);
    div.appendChild(btn);

    container.appendChild(div);
  });
}




document.addEventListener("DOMContentLoaded", function () {
fetch("products.json")

  .then(res => res.json())
  .then(data => {
    window.productsData = data;
    renderProducts(data);
  })
  .catch(err => {
    console.error("Помилка завантаження товарів:", err);
  });

  const deliverySelect = document.getElementById("delivery");
  const warning = document.getElementById("ukrpostWarning");
  const submitBtn = document.getElementById("submitOrderBtn");

  if (deliverySelect && warning && submitBtn) {
    deliverySelect.addEventListener("change", function () {
      if (this.value === "Укрпошта") {
        warning.style.display = "block";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.6";
        submitBtn.style.cursor = "not-allowed";
      } else {
        warning.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
      }
    });
  }
});



document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

 const name = this.name.value.trim();
const surname = this.surname.value.trim();
const phone = this.phone.value.trim();
const city = this.address.value.trim(); // місто
const delivery = this.delivery.value;
const warehouse = this.warehouse.value.trim(); // номер відділення

if (cart.length === 0) {
  alert("Кошик порожній!");
  return;
}

let message = `🛒 *Нове замовлення!*\n\n`;
message += `👤 Ім’я: ${name} ${surname}\n📞 Телефон: ${phone}\n`;
message += `🏙 Місто: ${city}\n🏤 Відділення: ${warehouse}\n🚚 Пошта: ${delivery}\n\n`;
message += `🕯 *Товари:*\n`;

let total = 0;
cart.forEach((item, i) => {
  const itemTotal = item.price * item.quantity;
  message += `${i + 1}) ${item.title} — ₴${item.price} × ${item.quantity} = ₴${itemTotal}\n`;
  total += itemTotal;
});

message += `\n💰 *Разом:* ₴${total}`;


  const token = "8049436425:AAHZ-SSBjhu5C8JfSvjhgyHT7i6UOVlx2F0";
  const chatId = "702004730";

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  })
    .then((res) => {
      if (res.ok) {
        alert("Замовлення відправлено! Ми зв’яжемося з вами.");
        closeCart();
        this.reset();
        cart = [];
        updateCartCount();
      } else {
        alert("Помилка при відправленні замовлення. Спробуйте пізніше.");
      }
    })
    .catch((err) => {
      console.error("Telegram error:", err);
      alert("Помилка з'єднання з Telegram.");
    });
});

// Зміна кількості на картці товару
function changeProductQty(button, delta) {
  const container = button.parentElement;
  const input = container.querySelector("input");
  let value = parseInt(input.value);
  value += delta;

  if (value < 1) value = 1;
  if (value > 10) value = 10;

  input.value = value;
}

// Додавання товару з кількістю
function addToCartWithQty(title, price, button) {
  const quantityInput = button.previousElementSibling.querySelector("input");
  const quantity = parseInt(quantityInput.value);

  const existing = cart.find(item => item.title === title);
  if (existing) {
    if (existing.quantity + quantity > 10) {
      alert("Максимум 10 одиниць одного товару.");
      existing.quantity = 10;
    } else {
      existing.quantity += quantity;
    }
  } else {
    cart.push({ title, price, quantity });
  }

  updateCartCount();
  showCartNotification();
}


let currentImageIndex = 0;




function openProductModal(title) {
  const product = (window.productsData || []).find(p => p.title === title);

  if (!product) return;

  const images = product.images;
  currentImageIndex = 0;

  const html = `
    <h2>${product.title}</h2>

    <div class="modal-image-container">
      <button class="modal-arrow left" onclick="event.stopPropagation(); changeImage(-1)">&#10094;</button>
      <img id="sliderImage" src="${images[0]}" class="modal-image" style="cursor: zoom-in;" onclick="openFullScreen(this.src)" />

      <button class="modal-arrow right" onclick="event.stopPropagation(); changeImage(1)">&#10095;</button>
    </div>

    <div class="modal-tabs">
      <button class="tab-button active" onclick="switchTab('description')">Опис</button>
      <button class="tab-button" onclick="switchTab('reviews')">Відгуки</button>
      <button class="tab-button" onclick="switchTab('specs')">Характеристики</button>
    </div>

    <div class="tab-content">
      <div id="description" class="tab-section active">
        <p>${product.description}</p>
      </div>
      <div id="reviews" class="tab-section">
        <p>Ще немає відгуків. Будьте першим!</p>
      </div>
      <div id="specs" class="tab-section">
        <ul>
          <li>Матеріал: натуральний віск</li>
          <li>Аромат: тропічний</li>
          <li>Час горіння: ~30 год</li>
        </ul>
      </div>
    </div>

    <div class="quantity-control">
      <button onclick="changeProductQty(this, -1)">−</button>
      <input type="number" value="1" min="1" max="10" readonly />
      <button onclick="changeProductQty(this, 1)">+</button>
    </div>
    <button class="order-btn" onclick="addFromModalToCart('${product.title}', ${product.price})">Замовити</button>
  `;

  const modalContent = document.getElementById("productModalContent");
  modalContent.innerHTML = html;
  modalContent.dataset.images = JSON.stringify(images);
  document.getElementById("productModal").style.display = "block";
}



function changeImage(direction) {
  const modalContent = document.getElementById("productModalContent");
  const images = JSON.parse(modalContent.dataset.images);
  const imageElement = document.getElementById("sliderImage");

  currentImageIndex += direction;
  if (currentImageIndex < 0) currentImageIndex = images.length - 1;
  if (currentImageIndex >= images.length) currentImageIndex = 0;

  imageElement.classList.add("fade-out");
  setTimeout(() => {
    imageElement.src = images[currentImageIndex];
    imageElement.classList.remove("fade-out");
  }, 200);
}

function closeProductModal() {
  document.getElementById("productModal").style.display = "none";
}



function switchTab(tabId) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));

  document.querySelector(`.tab-button[onclick*="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

document.addEventListener("DOMContentLoaded", function () {
  const deliverySelect = document.getElementById("deliverySelect");
  const warning = document.getElementById("ukrpostWarning");

  deliverySelect.addEventListener("change", function () {
    if (this.value === "Укрпошта") {
      warning.style.display = "block";
    } else {
      warning.style.display = "none";
    }
  });
});


function openFullScreen(imageSrc) {
  const fullscreenOverlay = document.createElement("div");
  fullscreenOverlay.style.position = "fixed";
  fullscreenOverlay.style.top = "0";
  fullscreenOverlay.style.left = "0";
  fullscreenOverlay.style.width = "100%";
  fullscreenOverlay.style.height = "100%";
  fullscreenOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
  fullscreenOverlay.style.display = "flex";
  fullscreenOverlay.style.justifyContent = "center";
  fullscreenOverlay.style.alignItems = "center";
  fullscreenOverlay.style.zIndex = "3000";
  fullscreenOverlay.style.cursor = "zoom-out";

  const fullImg = document.createElement("img");
  fullImg.src = imageSrc;
  fullImg.style.maxWidth = "90%";
  fullImg.style.maxHeight = "90%";
  fullImg.style.boxShadow = "0 0 20px rgba(255,255,255,0.3)";
  fullImg.alt = "Зображення";

  fullscreenOverlay.appendChild(fullImg);

  fullscreenOverlay.addEventListener("click", () => {
    document.body.removeChild(fullscreenOverlay);
  });

  document.body.appendChild(fullscreenOverlay);
}


document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const products = document.querySelectorAll(".product");
  const noResults = document.getElementById("noResults");

  let matches = 0;

  products.forEach((product) => {
    const title = product.querySelector("h3").textContent.toLowerCase();
    const match = title.includes(query);
    product.style.display = match ? "block" : "none";
    if (match) matches++;
  });

  if (matches === 0) {
    noResults.style.display = "block";
  } else {
    noResults.style.display = "none";
  }
});

  }
});




document.getElementById("openCategories").addEventListener("click", () => {
  document.getElementById("categoryPanel").classList.add("open");
});

document.getElementById("closeCategories").addEventListener("click", () => {
  document.getElementById("categoryPanel").classList.remove("open");
});


function showAddToCartNotification() {
  const notification = document.getElementById("addToCartNotification");
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 2000);
}

