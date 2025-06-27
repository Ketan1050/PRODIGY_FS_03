document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const cartItemCountSpan = document.getElementById('cart-item-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const categoryFilter = document.getElementById('category-filter');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const applyPriceFilterButton = document.getElementById('apply-price-filter');
    const sortBySelect = document.getElementById('sort-by');
    const checkoutButton = document.getElementById('checkout-button');
    const ordersList = document.getElementById('orders-list');
    const emptyOrdersMessage = document.getElementById('empty-orders-message');

    let allProducts = [];

    // --- Utility Functions ---

    // Fetches cart items from the server
    async function fetchCartItems() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("No token found, not fetching cart.");
            return [];
        }
        try {
            const response = await fetch('/api/cart', {
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                     console.log("Authentication failed for cart items. User might be logged out.");
                     // Optionally, clear token and redirect to login
                     // localStorage.removeItem('token');
                     // window.location.href = 'login.html';
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cart = await response.json();
            return cart;
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return [];
        }
    }

    // Updates the cart count displayed in the header
    async function updateCartCount() {
        const cartItems = await fetchCartItems();
        const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        if (cartItemCountSpan) {
            cartItemCountSpan.textContent = itemCount;
        }
    }


    // --- Product Rendering ---

    function renderProducts(productsToRender) {
        if (!productGrid) return; // Exit if not on the product listing page

        productGrid.innerHTML = ''; // Clear existing products
        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p>No products found matching your criteria.</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.image_url || 'https://via.placeholder.com/150'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description ? product.description.substring(0, 70) + '...' : ''}</p>
                <div class="price">₹${product.price.toLocaleString('en-IN')}</div>
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            `;
            productGrid.appendChild(productCard);
        });

        // Add event listeners for "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                addToCart(productId);
            });
        });
    }

    // --- Shopping Cart Logic (Server-side interaction) ---

    async function addToCart(productId, quantity = 1) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to add items to your cart.');
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ productId, quantity })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message || 'Product added to cart!');
                updateCartCount();
                if (window.location.pathname.includes('cart.html')) {
                    renderCartItems(); // Re-render cart if on cart page
                }
            } else {
                alert(`Failed to add to cart: ${data.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('An error occurred while adding to cart.');
        }
    }

    async function removeFromCart(cartItemId) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`/api/cart/${cartItemId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message || 'Item removed from cart.');
                updateCartCount();
                renderCartItems(); // Re-render cart
            } else {
                alert(`Failed to remove item: ${data.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert('An error occurred while removing item from cart.');
        }
    }

    async function updateCartItemQuantity(cartItemId, newQuantity) {
        const token = localStorage.getItem('token');
        if (!token) return;

        if (newQuantity < 1) {
            // If quantity goes to 0 or less, remove the item
            removeFromCart(cartItemId);
            return;
        }

        try {
            const response = await fetch(`/api/cart/${cartItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            const data = await response.json();
            if (response.ok) {
                // alert(data.message || 'Cart item quantity updated.');
                updateCartCount();
                renderCartItems(); // Re-render cart
            } else {
                alert(`Failed to update quantity: ${data.message || response.statusText}`);
                renderCartItems(); // Re-render to revert to correct quantity if error
            }
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            alert('An error occurred while updating quantity.');
            renderCartItems(); // Re-render in case of network error
        }
    }

    async function renderCartItems() {
        if (!cartItemsContainer) return;

        const cartItems = await fetchCartItems();
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cartItems.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItemsContainer.style.display = 'none';
            if (checkoutButton) checkoutButton.disabled = true;
        } else {
            emptyCartMessage.style.display = 'none';
            cartItemsContainer.style.display = 'block';
            if (checkoutButton) checkoutButton.disabled = false;

            cartItems.forEach(item => {
                total += item.price * item.quantity;

                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="${item.image_url || 'https://via.placeholder.com/80'}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="price">₹${item.price.toLocaleString('en-IN')}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button data-id="${item.cart_item_id}" data-action="decrease">-</button>
                        <input type="number" value="${item.quantity}" min="1" data-id="${item.cart_item_id}">
                        <button data-id="${item.cart_item_id}" data-action="increase">+</button>
                    </div>
                    <div class="cart-item-remove">
                        <button data-id="${item.cart_item_id}">Remove</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });

            // Add event listeners for quantity buttons and remove button
            cartItemsContainer.querySelectorAll('.cart-item-quantity button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const cartItemId = event.target.dataset.id;
                    const action = event.target.dataset.action;
                    const inputElement = event.target.parentNode.querySelector('input');
                    let currentQuantity = parseInt(inputElement.value);

                    if (action === 'increase') {
                        currentQuantity++;
                    } else if (action === 'decrease') {
                        currentQuantity--;
                    }
                    updateCartItemQuantity(cartItemId, currentQuantity);
                });
            });

            cartItemsContainer.querySelectorAll('.cart-item-quantity input').forEach(input => {
                input.addEventListener('change', (event) => {
                    const cartItemId = event.target.dataset.id;
                    const newQuantity = parseInt(event.target.value);
                    updateCartItemQuantity(cartItemId, newQuantity);
                });
            });

            cartItemsContainer.querySelectorAll('.cart-item-remove button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const cartItemId = event.target.dataset.id;
                    removeFromCart(cartItemId);
                });
            });
        }
        if (cartTotalSpan) {
            cartTotalSpan.textContent = total.toLocaleString('en-IN');
        }
    }

    if (checkoutButton) {
        checkoutButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to proceed to checkout.');
                window.location.href = 'login.html';
                return;
            }

            const cartItems = await fetchCartItems();
            if (cartItems.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            if (!confirm('Are you sure you want to place this order?')) {
                return;
            }

            try {
                // You'd ideally collect shipping address details from a form here
                const shippingAddress = prompt("Please enter your shipping address:", "123 Main St, Anytown, State, 12345");
                if (!shippingAddress) {
                    alert("Order cancelled: Shipping address is required.");
                    return;
                }

                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ shipping_address: shippingAddress })
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message || 'Order placed successfully!');
                    updateCartCount(); // Cart is cleared on server
                    renderCartItems(); // Re-render cart to show it's empty
                    window.location.href = 'orders.html'; // Redirect to orders page
                } else {
                    alert(`Failed to place order: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error during checkout:', error);
                alert('An error occurred during checkout.');
            }
        });
    }

    // --- Orders Page Logic ---
    async function fetchAndRenderOrders() {
        if (!ordersList) return; // Exit if not on orders page

        const token = localStorage.getItem('token');
        if (!token) {
            emptyOrdersMessage.style.display = 'block';
            emptyOrdersMessage.textContent = 'Please log in to view your orders.';
            ordersList.style.display = 'none';
            return;
        }

        try {
            const response = await fetch('/api/orders', {
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    emptyOrdersMessage.style.display = 'block';
                    emptyOrdersMessage.textContent = 'Session expired or unauthorized. Please log in again.';
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    // Consider redirecting to login page
                } else {
                    emptyOrdersMessage.style.display = 'block';
                    emptyOrdersMessage.textContent = `Error loading orders: ${response.statusText}`;
                }
                ordersList.innerHTML = '';
                return;
            }

            const orders = await response.json();
            ordersList.innerHTML = ''; // Clear existing orders

            if (orders.length === 0) {
                emptyOrdersMessage.style.display = 'block';
                ordersList.style.display = 'none';
            } else {
                emptyOrdersMessage.style.display = 'none';
                ordersList.style.display = 'block';

                orders.forEach(order => {
                    const orderCard = document.createElement('div');
                    orderCard.classList.add('order-card');
                    const orderDate = new Date(order.order_date).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    orderCard.innerHTML = `
                        <div class="order-header">
                            <h3>Order ID: #${order.id}</h3>
                            <span class="status ${order.status}">${order.status.toUpperCase()}</span>
                        </div>
                        <div class="order-details">
                            <p><strong>Order Date:</strong> ${orderDate}</p>
                            <p><strong>Total Amount:</strong> ₹${order.total_amount.toLocaleString('en-IN')}</p>
                            <p><strong>Shipping Address:</strong> ${order.shipping_address || 'Not provided'}</p>
                        </div>
                        <div class="order-items">
                            <h4>Items:</h4>
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <img src="${item.image_url || 'https://via.placeholder.com/50'}" alt="${item.name}">
                                    <div class="order-item-info">
                                        <h4>${item.name}</h4>
                                        <p>Quantity: ${item.quantity} | Price: ₹${item.price_at_purchase.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    ordersList.appendChild(orderCard);
                });
            }

        } catch (error) {
            console.error('Error fetching orders:', error);
            emptyOrdersMessage.style.display = 'block';
            emptyOrdersMessage.textContent = 'An error occurred while loading your orders.';
            ordersList.innerHTML = '';
        }
    }


    // --- Filtering and Sorting (Client-side) ---

    function applyFiltersAndSort() {
        let filteredProducts = [...allProducts];

        // Search Filter
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        }

        // Category Filter
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        if (selectedCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
        }

        // Price Filter
        const minPrice = minPriceInput ? parseFloat(minPriceInput.value) : 0;
        const maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) : Infinity;
        filteredProducts = filteredProducts.filter(product =>
            product.price >= minPrice && product.price <= maxPrice
        );

        // Sorting
        const sortOption = sortBySelect ? sortBySelect.value : 'default';
        filteredProducts.sort((a, b) => {
            if (sortOption === 'price-asc') {
                return a.price - b.price;
            } else if (sortOption === 'price-desc') {
                return b.price - a.price;
            } else if (sortOption === 'name-asc') {
                return a.name.localeCompare(b.name);
            } else if (sortOption === 'name-desc') {
                return b.name.localeCompare(a.name);
            }
            return 0; // Default or no sort
        });

        renderProducts(filteredProducts);
    }

    // --- Event Listeners for Filters/Sort ---

    if (searchButton) {
        searchButton.addEventListener('click', applyFiltersAndSort);
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                applyFiltersAndSort();
            }
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFiltersAndSort);
    }

    if (applyPriceFilterButton) {
        applyPriceFilterButton.addEventListener('click', applyFiltersAndSort);
    }

    if (sortBySelect) {
        sortBySelect.addEventListener('change', applyFiltersAndSort);
    }


    // --- Initialization ---

    // Fetch products from the server and render on index.html
    if (productGrid) {
        fetch('/api/products')
            .then(response => response.json())
            .then(products => {
                allProducts = products;
                applyFiltersAndSort(); // Initial render with filters
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    // If on the cart page, render cart items
    if (cartItemsContainer) {
        renderCartItems();
    }

    // If on the orders page, fetch and render orders
    if (ordersList) {
        fetchAndRenderOrders();
    }

    // Always update cart count in header on page load
    updateCartCount();
});