const auth = firebase.auth();
const db = firebase.firestore();

const menuList = document.getElementById('menu-list');
const cartCountSpan = document.getElementById('cart-item-count');
let cartItemList = JSON.parse(localStorage.getItem('cartItems')) || [];

// Auth check
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

// Update cart count in header
function updateCartCount() {
    const total = cartItemList.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = total;
    cartCountSpan.style.display = total > 0 ? 'inline-block' : 'none';
}

// Add item to cart
function addToCart(itemId, name, price, description) {
    const existing = cartItemList.find(item => item.id === itemId);

    if (existing) {
        existing.quantity++;
    } else {
        cartItemList.push({ id: itemId, name, price, description, quantity: 1 });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItemList));
    updateCartCount();
    alert(`${name} added to cart!`);
}

// Load menu from Firestore
async function loadMenu() {
    try {
        const snapshot = await db.collection('menu').get();
        menuList.innerHTML = '';

        if (snapshot.empty) {
            menuList.innerHTML = '<p>No items available at the moment.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const item = doc.data();
            const itemId = doc.id;

            const li = document.createElement('li');
            li.classList.add('menu-item');
            li.innerHTML = `
                <div class="item-details">
                    <span>${item.name}</span>
                    <em>₹${item.price.toFixed(2)}</em>
                    <p>${item.description || ''}</p>
                </div>
                <button class="add-to-cart-button"
                        data-id="${itemId}"
                        data-name="${item.name}"
                        data-price="${item.price}"
                        data-description="${item.description || ''}">
                    Add to Cart
                </button>
            `;

            menuList.appendChild(li);
        });

        // Attach events
        attachAddToCartEvents();
    } catch (error) {
        console.error("Error loading menu:", error);
        menuList.innerHTML = '<p>Failed to load menu. Please try again later.</p>';
    }
}

// Attach event listeners for Add to Cart buttons
function attachAddToCartEvents() {
    document.querySelectorAll('.add-to-cart-button').forEach(button => {
        button.addEventListener('click', e => {
            const btn = e.currentTarget;
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const description = btn.dataset.description;
            addToCart(id, name, price, description);
        });
    });
}

// Filter menu on search input
function filterMenu() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    document.querySelectorAll('.menu-item').forEach(item => {
        const name = item.querySelector('span').textContent.toLowerCase();
        const desc = item.querySelector('p').textContent.toLowerCase();
        item.style.display = (name.includes(term) || desc.includes(term)) ? 'flex' : 'none';
    });
}

// Navigation actions
function logout() {
    auth.signOut().then(() => window.location.href = 'login.html')
        .catch(err => {
            console.error("Logout failed:", err);
            alert("Error logging out.");
        });
}

function goToCart() {
    localStorage.setItem('cartItems', JSON.stringify(cartItemList));
    window.location.href = 'cart.html';
}

function goToOrders() {
    window.location.href = 'orders.html';
}

// Initialize page
loadMenu();
updateCartCount();
