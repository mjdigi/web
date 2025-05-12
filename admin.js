const db = firebase.firestore();
const auth = firebase.auth();

// Check if the user is an admin
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'login.html';  // Redirect to login if not logged in
  }
  db.collection('users').doc(user.uid).get().then(doc => {
    const userData = doc.data();
    if (userData.role !== 'admin') {
      alert('You are not authorized to access the admin panel.');
      window.location.href = 'home.html';  // Redirect to home if not admin
    }
  }).catch(err => console.error('Error checking user role:', err));
});

// Load Orders
function loadOrders() {
  document.getElementById('orders-container').style.display = 'block';
  document.getElementById('menu-container').style.display = 'none';

  const ordersList = document.getElementById('order-list');
  ordersList.textContent = 'Loading orders...';

  db.collection('orders').get().then(snapshot => {
    ordersList.innerHTML = '';
    if (snapshot.empty) {
      ordersList.textContent = 'No orders available.';
      return;
    }

    snapshot.forEach(doc => {
      const order = doc.data();
      const orderDiv = document.createElement('div');
      orderDiv.classList.add('order-item');
      orderDiv.innerHTML = `
        <div><strong>Order ID:</strong> ${doc.id}</div>
        <div><strong>Status:</strong> ${order.status}</div>
        <div><strong>Items:</strong> ${order.items.join(', ')}</div>
        <button onclick="updateOrderStatus('${doc.id}')">Update Status</button>
      `;
      ordersList.appendChild(orderDiv);
    });
  }).catch(err => {
    console.error('Error loading orders:', err);
    ordersList.textContent = 'Failed to load orders.';
  });
}

// Update Order Status
function updateOrderStatus(orderId) {
  const newStatus = prompt('Enter new status (e.g., Pending, Shipped, Delivered):');
  if (newStatus) {
    db.collection('orders').doc(orderId).update({
      status: newStatus
    }).then(() => {
      alert('Order status updated!');
      loadOrders();  // Refresh the orders list
    }).catch(err => {
      alert('Failed to update order status.');
      console.error('Error updating order:', err);
    });
  }
}

// Load Menu
function loadMenu() {
  document.getElementById('orders-container').style.display = 'none';
  document.getElementById('menu-container').style.display = 'block';

  const menuList = document.getElementById('menu-list');
  menuList.textContent = 'Loading menu...';

  db.collection('menu').get().then(snapshot => {
    menuList.innerHTML = '';
    if (snapshot.empty) {
      menuList.textContent = 'No menu items available.';
      return;
    }

    snapshot.forEach(doc => {
      const menuItem = doc.data();
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('menu-item');
      itemDiv.innerHTML = `
        <div><strong>${menuItem.name}</strong> - ₹${menuItem.price}</div>
        <div>${menuItem.description}</div>
        <button onclick="deleteMenuItem('${doc.id}')">Delete</button>
      `;
      menuList.appendChild(itemDiv);
    });
  }).catch(err => {
    console.error('Error loading menu:', err);
    menuList.textContent = 'Failed to load menu.';
  });
}

// Delete Menu Item
function deleteMenuItem(itemId) {
  if (confirm('Are you sure you want to delete this menu item?')) {
    db.collection('menu').doc(itemId).delete().then(() => {
      alert('Menu item deleted successfully!');
      loadMenu();  // Refresh the menu list after deletion
    }).catch(err => {
      alert('Failed to delete menu item.');
      console.error('Error deleting item:', err);
    });
  }
}

// Add New Menu Item
document.getElementById('add-menu-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('menu-name').value;
  const price = parseFloat(document.getElementById('menu-price').value);
  const description = document.getElementById('menu-description').value;

  if (!name || isNaN(price) || price <= 0) {
    alert('Please enter valid menu item details.');
    return;
  }

  db.collection('menu').add({
    name: name,
    price: price,
    description: description
  }).then(() => {
    alert('Menu item added successfully!');
    loadMenu();  // Refresh the menu list
  }).catch(err => {
    console.error('Error adding menu item:', err);
    alert('Failed to add menu item.');
  });
});

// Logout Function
function logout() {
  auth.signOut().then(() => {
    window.location.href = 'login.html';  // Redirect to login
  }).catch(err => {
    console.error('Error logging out:', err);
    alert('Failed to log out.');
  });
}
