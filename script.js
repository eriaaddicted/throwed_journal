const fashionShows = [
    { date: "15.11.2026", time: "19:00", collection: "AA", designer: "user_3", location: "aska", tickets: "120"},
    { date: "22.11.2026", time: "20:30", collection: "SSilk", designer: "user_4", location: "new_friend", tickets: "85"},
    { date: "05.12.2026", time: "18:00", collection: "SS62", designer: "user_5", location: "outofnames", tickets: "95"},
    { date: "12.12.2026", time: "21:00", collection: "FW26", designer: "user_6", location: "act_00", tickets: "soldout(("},
];

const products = [
    { id: 1, name: "THROWED SS01 distressed dress", price: 125000, category: "men", image: "assets1/THROWED SS01 distressed jacket.jpg" },
    { id: 2, name: "THROWED SS02 distressed jacket", price: 109000, category: "women", image: "assets1/THROWED SS02 distressed jacket.jpg" },
    { id: 3, name: "THROWED SS03 distressed jacket", price: 145000, category: "men", image: "assets1/THROWED SS03 distressed leather jacket.jpg" },
    { id: 4, name: "THROWED SS04 distressed jacket", price: 75000, category: "women", image: "assets1/THROWED SS04 distressed leather jacket.jpg" },
    { id: 5, name: "THROWED SS05 BOOTS", price: 32500, category: "women", image: "assets1/THROWED SS05 BOOTS.png" },
    { id: 6, name: "THROWED SS05 DRESS", price: 185000, category: "women", image: "assets1/THROWED SS05 DRESS.png" },
    { id: 7, name: "THROWED SS06 COAT", price: 135000, category: "accessories", image: "assets1/THROWED SS06 COAT.png" },
    { id: 8, name: "THROWED SS13 HAT", price: 25000, category: "accessories", image: "assets1/THROWED SS13 HAT.png" },
    { id: 9, name: "THROWED SS13 DRESS", price: 28500, category: "women", image: "assets1/THROWED SS13 DRESSs.png" },
    { id: 10, name: "THROWED SS07 DRESS", price: 65000, category: "women", image: "assets1/THROWED SS07 DRESS.png" },
    { id: 11, name: "THROWED SS09 DRESS", price: 85000, category: "women", image: "assets1/THROWED SS09 DRESS.png" },
    { id: 12, name: "THROWED SS12 2%1", price: 35000, category: "women", image: "assets1/THROWED SS12 2&1.png" }
];

let cart = JSON.parse(localStorage.getItem('throwed_cart')) || [];
let currentFilter = 'all';
let searchQuery = '';

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const cartCount = document.querySelector('.cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalContainer = document.getElementById('cart-total');
const totalAmount = document.getElementById('total-amount');
const catalogGrid = document.getElementById('catalog-grid');
const searchBox = document.getElementById('search-box');
const filterButtons = document.querySelectorAll('.filter-btn');
const tableBody = document.getElementById('fashion-table-body');

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTable();
    renderCatalog();
    updateCart();
    initEventListeners();
    initResponsiveListeners();
});

function initNavigation() {
    // Собираем ссылки из шапки и ссылки из футера (учитываем клики везде)
    const footerAndNavLinks = document.querySelectorAll('nav a, .footer-links a');
    
    footerAndNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Получаем чистый ID секции из href (например, "about" из "#about")
            const hrefAttr = this.getAttribute('href');
            if (!hrefAttr || hrefAttr === '#') return;
            
            const targetId = hrefAttr.substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                e.preventDefault();
                
                // Проблема 1: Скроллим страницу в самый верх мгновенно
                window.scrollTo({ top: 0, behavior: 'instant' });
                
                // Переключаем активные классы у ссылок меню
                navLinks.forEach(l => l.classList.remove('active'));
                const primaryMenuLink = document.querySelector(`nav a[href="#${targetId}"]`);
                if (primaryMenuLink) primaryMenuLink.classList.add('active');
                
                // Скрываем все секции и показываем целевую
                sections.forEach(section => section.classList.remove('active'));
                targetSection.classList.add('active');
                
                // Проблема 2: Если ушли с about, полностью сбрасываем и гасим интерфейсы мест
                if (targetId !== 'about') {
                    clearAboutPanels();
                    cancelPurchase();
                }
                
                if (targetId === 'cart') {
                    renderCart();
                }
                
                if (window.innerWidth <= 768) {
                    const navbar = document.querySelector('.navbar');
                    if (navbar && navbar.classList.contains('mobile-open')) {
                        navbar.classList.remove('mobile-open');
                    }
                }
            }
        });
    });
}


function initTable() {
    fashionShows.forEach((show, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${show.date}</td>
            <td>${show.time}</td>
            <td>${show.collection}</td>
            <td>${show.designer}</td>
            <td>${show.location}</td>
            <td>${show.tickets}</td>
        `;
        
        row.addEventListener('click', function() {
            this.classList.toggle('highlighted');
        });
        
        tableBody.appendChild(row);
    });
}

document.getElementById('highlight-even').addEventListener('click', function() {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        if (index % 2 === 1) { 
            row.classList.add('highlighted');
        }
    });
});

document.getElementById('clear-highlight').addEventListener('click', function() {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        row.classList.remove('highlighted');
    });
});

document.getElementById('sort-date').addEventListener('click', function() {
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const dateA = a.cells[0].textContent.split('.').reverse().join('');
        const dateB = b.cells[0].textContent.split('.').reverse().join('');
        return dateA.localeCompare(dateB);
    });
    
    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
});

function renderCatalog() {
    catalogGrid.innerHTML = '';
    
    let filteredProducts = products;
    
    if (currentFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === currentFilter);
    }
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(query)
        );
    }
    
    if (filteredProducts.length === 0) {
        catalogGrid.innerHTML = '<p class="empty-message">No items found</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const productName = product.name.length > 35 
            ? product.name.substring(0, 32) + '...' 
            : product.name;
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <h3 class="product-title" title="${product.name}">${productName}</h3>
            <div class="product-price">${formatPrice(product.price)} ₽</div>
            <div class="product-actions">
                <button class="action-btn add-to-cart" data-id="${product.id}">add to cart</button>
                <button class="action-btn details-btn" data-id="${product.id}">details</button>
            </div>
        `;
        catalogGrid.appendChild(productCard);
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
    
    document.querySelectorAll('.details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            showProductDetails(productId);
        });
    });
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    }
    
    localStorage.setItem('throwed_cart', JSON.stringify(cart));
    updateCart();
    showNotification(`${product.name} added to cart`);
}

function showNotification(message) {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        document.body.removeChild(oldNotification);
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: rgba(56, 55, 55, 0.95);
        color: var(--pure-white);
        padding: 12px 20px;
        border-radius: 2px;
        z-index: 10000;
        font-weight: 300;
        letter-spacing: 1px;
        animation: slideIn 0.3s ease;
        border: 1px solid var(--light-gray);
        font-size: 0.9rem;
        backdrop-filter: blur(5px);
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    const shortMessage = message.length > 40 
        ? message.substring(0, 37) + '...' 
        : message;
    
    notification.textContent = shortMessage;
    notification.title = message; 
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (document.getElementById('cart').classList.contains('active')) {
        renderCart();
    }
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        const emptyCartImage = "assets1/dont.png";
        
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-image">
                    <img src="${emptyCartImage}" alt="Empty cart" loading="lazy">
                </div>
                <p class="empty-message">Your cart is empty</p>
            </div>
        `;
        cartTotalContainer.classList.add('hidden');
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        const itemName = item.name.length > 45 
            ? item.name.substring(0, 42) + '...' 
            : item.name;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title" title="${item.name}">${itemName}</h3>
                <div class="cart-item-price">${formatPrice(item.price)} ₽</div>
                <div class="cart-item-controls">
                    <button class="action-btn decrease-btn" data-id="${item.id}">−</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="action-btn increase-btn" data-id="${item.id}">+</button>
                    <button class="action-btn remove-btn" data-id="${item.id}">remove</button>
                </div>
                <div class="cart-item-subtotal">
                    Subtotal: <span class="subtotal-amount">${formatPrice(itemTotal)} ₽</span>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    totalAmount.textContent = formatPrice(total);
    cartTotalContainer.classList.remove('hidden');
    
    attachCartEventListeners();
}

function attachCartEventListeners() {
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateCartItemQuantity(productId, 1);
        });
    });
    
    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateCartItemQuantity(productId, -1);
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            alert(`Order placed for ${formatPrice(total)} ₽! Thank you for your purchase.`);
            cart = [];
            localStorage.setItem('throwed_cart', JSON.stringify(cart));
            updateCart();
        });
    }
}

function updateCartItemQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        localStorage.setItem('throwed_cart', JSON.stringify(cart));
        updateCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('throwed_cart', JSON.stringify(cart));
    updateCart();
    showNotification('Item removed from cart');
}

function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: rgba(45, 45, 45, 0.98); padding: 30px; max-width: 500px; width: 100%; border: 1px solid var(--light-gray); backdrop-filter: blur(15px); position: relative;">
            <button id="modal-close-btn" style="position: absolute; top: 15px; right: 15px; background: transparent; border: none; color: var(--off-white); font-size: 1.5rem; cursor: pointer; z-index: 2;">×</button>
            
            <div style="width: 100%; height: 250px; overflow: hidden; margin-bottom: 20px; border: 1px solid var(--light-gray);">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
            </div>
            
            <h2 style="color: var(--pure-white); margin-bottom: 15px; font-weight: 300; font-size: 1.5rem; font-family: 'Ostrovsky-Bold_0', sans-serif;">${product.name}</h2>
            
            <p style="margin-bottom: 10px; color: var(--off-white); font-size: 0.9rem;">
                Category: <span style="color: var(--burgundy);">${getCategoryName(product.category)}</span>
            </p>
            
            <p style="font-size: 1.4rem; color: var(--burgundy); margin-bottom: 20px; font-weight: 300;">
                ${formatPrice(product.price)} ₽
            </p>
            
            <p style="margin-bottom: 25px; color: var(--off-white); line-height: 1.6; font-size: 0.95rem;">
                 65% вискоза, 30% полиамид, 5% эластан. grab it while you can!!
            </p>
            
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button id="modal-add-to-cart" style="padding: 10px 20px; background-color: var(--burgundy); color: var(--pure-white); border: none; cursor: pointer; letter-spacing: 1px; font-weight: 300; flex: 1; min-width: 150px; font-size: 0.9rem;">
                    add to cart
                </button>
                <button id="modal-close" style="padding: 10px 20px; background-color: transparent; border: 1px solid var(--light-gray); color: var(--off-white); cursor: pointer; letter-spacing: 1px; font-weight: 300; flex: 1; min-width: 100px; font-size: 0.9rem;">
                    close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('modal-add-to-cart').addEventListener('click', function() {
        addToCart(productId);
        document.body.removeChild(modal);
    });
    
    document.getElementById('modal-close').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    document.getElementById('modal-close-btn').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    const closeModal = () => document.body.removeChild(modal);
    const handleEsc = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    
    document.addEventListener('keydown', handleEsc);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function getCategoryName(category) {
    const names = {
        'women': 'Womenswear',
        'men': 'Menswear',
        'accessories': 'Accessories'
    };
    return names[category] || category;
}

function initEventListeners() {
    searchBox.addEventListener('input', function() {
        searchQuery = this.value;
        renderCatalog();
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.getAttribute('data-filter');
            renderCatalog();
        });
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .product-card {
            transition: transform 0.3s ease, border-color 0.3s ease;
        }
        
        .product-title {
            font-family: 'Ostrovsky-Bold_0', sans-serif ;
        }
        
        .action-btn {
            transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .product-modal > div {
                padding: 20px !important;
                max-width: 90% !important;
            }
            
            .product-modal h2 {
                font-size: 1.3rem !important;
            }
            
            .product-modal p {
                font-size: 0.9rem !important;
            }
            
            .product-modal button {
                font-size: 0.85rem !important;
                padding: 8px 15px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

function initResponsiveListeners() {
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            renderCatalog();
            if (document.getElementById('cart').classList.contains('active')) {
                renderCart();
            }
        }, 250);
    });
}

const SEAT_PRICE = 1990;
let eventsData = {
    1: { totalAvailable: 12, selected: Array(12).fill(false),purchased: Array(12).fill(false) },
    2: { totalAvailable: 12, selected: Array(12).fill(false),purchased: Array(12).fill(false) },
    3: { totalAvailable: 12, selected: Array(12).fill(false),purchased: Array(12).fill(false) }
};

document.addEventListener("DOMContentLoaded", function() {
    initSeatGrids();
    initHotspotHoverEffects();
    interceptTabNavigation();
});


function interceptTabNavigation() {
    const navLinks = document.querySelectorAll('nav a, .footer-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const targetHref = this.getAttribute('href');
            if (targetHref !== '#about') {
                clearAboutPanels();
            }
        });
    });
}


function clearAboutPanels() {
    document.querySelectorAll('.seat-panel').forEach(panel => {
        panel.style.display = "none";
        panel.querySelector('.panel-footer').style.display = "none";
    });
    document.querySelectorAll('.lines-overlay path').forEach(path => {
        path.style.strokeDashoffset = "1000";
        path.setAttribute('d', '');
    });
    
    Object.keys(eventsData).forEach(id => {
        eventsData[id].selected.fill(false);
    });
    initSeatGrids();
}


function initSeatGrids() {
    Object.keys(eventsData).forEach(eventId => {
        const grid = document.querySelector(`#panel-event-${eventId} .seats-grid`);
        if (!grid) return;
        grid.innerHTML = '';

        for (let i = 0; i < 12; i++) {
            const seat = document.createElement('div');
            seat.className = 'seat-item';
            
            const row = Math.floor(i / 4) + 1;
            const col = (i % 4) + 1;
            seat.setAttribute('data-index', i);
            seat.setAttribute('data-row', row);
            seat.setAttribute('data-col', col);

            
            if (eventsData[eventId].purchased && eventsData[eventId].purchased[i]) {
                seat.style.background = "#4A4A4A"; 
                seat.style.borderColor = "transparent";
                seat.style.cursor = "not-allowed";
                seat.style.opacity = "0.4"; 
                grid.appendChild(seat);
                continue; 
            }
            

            
            if (eventsData[eventId].selected[i]) {
                seat.style.background = "var(--burgundy)";
                seat.style.borderColor = "var(--pure-white)";
            }

            seat.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                const isSelected = !eventsData[eventId].selected[idx];
                eventsData[eventId].selected[idx] = isSelected;

                if (isSelected) {
                    this.style.background = "var(--burgundy)";
                    this.style.borderColor = "var(--pure-white)";
                } else {
                    this.style.background = "transparent";
                    this.style.borderColor = "var(--light-gray)";
                }
                updatePanelCalculations(eventId);
            });
            grid.appendChild(seat);
        }
    });
}

function updatePanelCalculations(eventId) {
    const data = eventsData[eventId];
    const selectedCount = data.selected.filter(Boolean).length;
    const panel = document.getElementById(`panel-event-${eventId}`);
    
    panel.querySelector('.avail-count').textContent = data.totalAvailable - selectedCount;
    panel.querySelector('.price-val').textContent = (selectedCount * SEAT_PRICE).toLocaleString();
    panel.querySelector('.panel-footer').style.display = selectedCount > 0 ? "block" : "none";
}


function initHotspotHoverEffects() {
    document.querySelectorAll('.event-hotspot').forEach(hotspot => {
        hotspot.addEventListener('mouseenter', function() {
            const eventId = this.getAttribute('data-event');
            const panel = document.getElementById(`panel-event-${eventId}`);
            const path = document.getElementById(`line-event-${eventId}`);
            
            if (!panel || !path || panel.style.display === "block") return;

            const container = document.querySelector('.interactive-video-container');
            const rect = container.getBoundingClientRect();
            const hRect = hotspot.getBoundingClientRect();

            
            const startX = hRect.left - rect.left + hRect.width / 2;
            const startY = hRect.top - rect.top + hRect.height / 2;
            
           
            const endX = panel.offsetLeft + panel.offsetWidth / 2;
            const endY = panel.offsetTop;

            
            path.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
            path.style.strokeDashoffset = "0";
            
            
            setTimeout(() => {
                panel.style.display = "block";
                updatePanelCalculations(eventId);
            }, 350);
        });
    });
}


function triggerCheckout() {
    const modal = document.getElementById('checkout-modal');
    const video = document.getElementById('checkout-video');
    
    modal.style.display = "flex";
    
    if (video) {
        video.currentTime = 0;
        video.play().catch(err => console.log("Видео ожидает фокуса"));
    }
    buildReceiptData();
}

function buildReceiptData() {
    const listContainer = document.getElementById('receipt-items-list');
    listContainer.innerHTML = '';
    let globalTotal = 0;

    Object.keys(eventsData).forEach(eventId => {
        eventsData[eventId].selected.forEach((selected, idx) => {
            if (selected) {
                globalTotal += SEAT_PRICE;
                const panel = document.getElementById(`panel-event-${eventId}`);
                const seat = panel.querySelectorAll('.seat-item')[idx];
                
                const row = seat.getAttribute('data-row');
                const col = seat.getAttribute('data-col');

                const item = document.createElement('div');
                item.style.display = "flex";
                item.style.justify = "space-between";
                item.style.padding = "3px 0";
                item.innerHTML = `<span>EVENT ${eventId} (Row: ${row}, Col: ${col})</span><span>${SEAT_PRICE} руб</span>`;
                listContainer.appendChild(item);
            }
        });
    });
    document.getElementById('receipt-total-price').textContent = `${globalTotal.toLocaleString()} руб`;
}

function confirmPurchase() {
    document.getElementById('ticket-receipt-area').style.display = "none";
    document.getElementById('modal-actions-bar').style.display = "none";
    document.getElementById('success-screen-area').style.display = "flex";

    Object.keys(eventsData).forEach(id => {
        
        for (let i = 0; i < eventsData[id].selected.length; i++) {
            if (eventsData[id].selected[i]) {
                eventsData[id].purchased[i] = true;  
                eventsData[id].selected[i] = false;  
                eventsData[id].totalAvailable -= 1;  
            }
        }
    });

    
    initSeatGrids();

    setTimeout(() => {
        cancelPurchase(); 
        clearAboutPanels(); 
    }, 3000);
}

function cancelPurchase() {
    const modal = document.getElementById('checkout-modal');
    const video = document.getElementById('checkout-video');
    if (video) video.pause();
    
    modal.style.display = "none";
    document.getElementById('ticket-receipt-area').style.display = "block";
    document.getElementById('modal-actions-bar').style.display = "flex";
    document.getElementById('success-screen-area').style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector('.interactive-video-container');
    const hotspots = document.querySelectorAll('.event-hotspot');
    const panels = document.querySelectorAll('.seat-panel');

    
    const lineDirections = {
        "hotspot-1": { dx: -250, dy: 50,  length: -200 }, 
        "hotspot-2": { dx: -300, dy: 160,  length: -190 }, 
        "hotspot-3": { dx: 300, dy: 60,  length: 200 }   
    };

    
    function calculateSingleLinePath(hotspot) {
        const id = hotspot.id;
        const config = lineDirections[id];
        if (!config) return;

        
        const hLeft = hotspot.offsetLeft;
        const hTop = hotspot.offsetTop;

       
        const cornerX = hLeft + config.dx;
        const cornerY = hTop + config.dy;

        
        const endX = cornerX + config.length;
        const endY = cornerY;

        
        const path = document.getElementById(`line-event-${hotspot.dataset.event}`);
        if (path) {
            path.setAttribute('d', `M ${hLeft} ${hTop} L ${cornerX} ${cornerY} L ${endX} ${endY}`);
            
            
            const totalLength = path.getTotalLength();
            path.style.strokeDasharray = totalLength;

            
            if (!path.classList.contains('line-active')) {
                path.style.strokeDashoffset = totalLength;
            }
        }

        
        const panel = document.getElementById(`panel-event-${hotspot.dataset.event}`);
        if (panel) {
            const minX = Math.min(cornerX, endX);
            panel.style.left = `${minX}px`;
            panel.style.top = `${endY + 10}px`; 
        }
    }

    
    function updateLinesAndPanels() {
        hotspots.forEach(hotspot => calculateSingleLinePath(hotspot));
    }

    
    updateLinesAndPanels();
    window.addEventListener('resize', updateLinesAndPanels);

    

    
    function deactivateEvent(eventId) {
        const path = document.getElementById(`line-event-${eventId}`);
        const panel = document.getElementById(`panel-event-${eventId}`);
        
        if (panel) {
            panel.classList.remove('panel-active');
            
            setTimeout(() => {
                if (!panel.classList.contains('panel-active')) {
                    panel.style.display = 'none';
                }
            }, 300);
        }
        
        if (path) {
            path.classList.remove('line-active');
            
            const totalLength = path.getTotalLength();
            path.style.strokeDashoffset = totalLength;
        }
    }

    hotspots.forEach(hotspot => {
        const eventId = hotspot.dataset.event;
        const path = document.getElementById(`line-event-${eventId}`);
        const panel = document.getElementById(`panel-event-${eventId}`);

        
        hotspot.addEventListener('mouseenter', () => {
            if (panel.classList.contains('panel-active')) return;

            
            calculateSingleLinePath(hotspot);

            path.classList.add('line-active');
            path.style.strokeDashoffset = "0"; 
            
            setTimeout(() => {
                if (path.classList.contains('line-active')) {
                    panel.style.display = 'block';
                    setTimeout(() => panel.classList.add('panel-active'), 10);
                }
            }, 400); 
        });

        
        hotspot.addEventListener('mouseleave', () => {
            if (!panel.classList.contains('panel-active')) {
                deactivateEvent(eventId);
            }
        });
        
        
        hotspot.addEventListener('click', (e) => {
            e.stopPropagation(); 

            if (panel.classList.contains('panel-active')) {
                deactivateEvent(eventId);
            } else {
                calculateSingleLinePath(hotspot);
                path.classList.add('line-active');
                path.style.strokeDashoffset = "0";
                
                panel.style.display = 'block';
                setTimeout(() => panel.classList.add('panel-active'), 10);
            }
        });
    });

    
    document.addEventListener('click', (e) => {
        panels.forEach(panel => {
            if (!panel.contains(e.target) && !e.target.classList.contains('event-hotspot')) {
                const eventId = panel.id.replace('panel-event-', '');
                deactivateEvent(eventId);
            }
        });
    });

    
    panels.forEach(panel => {
        panel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
});