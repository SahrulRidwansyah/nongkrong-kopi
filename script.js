// =====================
// FIREBASE SETUP
// =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBmCHF913mWEfGPwoNQ8iy6hIdQLxnitKg",
    authDomain: "nongkrong-kopi.firebaseapp.com",
    databaseURL: "https://nongkrong-kopi-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nongkrong-kopi",
    storageBucket: "nongkrong-kopi.firebasestorage.app",
    messagingSenderId: "848822844634",
    appId: "1:848822844634:web:1f8c0f617e9e59aad979e3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =====================
// HAMBURGER MENU
// =====================
const navbarNav = document.querySelector('.navbar-nav');
const hamburger = document.querySelector('#hamburger-menu');

hamburger.onclick = () => {
    navbarNav.classList.toggle('active');
}

document.addEventListener('click', function(e) {
    if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
        navbarNav.classList.remove('active');
    }
});

// =====================
// SEARCH FILTER MENU
// =====================
const searchIcon = document.querySelector('#search');
const searchWrapper = document.createElement('div');
searchWrapper.innerHTML = `
  <div id="search-bar" style="display:none; position:fixed; top:70px; left:0; right:0; z-index:9998; background:rgba(1,1,1,0.95); padding:1rem 7%; border-bottom:1px solid #513c28;">
    <input type="text" id="search-input" placeholder="Cari menu..." style="width:100%; padding:1rem 2rem; font-size:1.4rem; background:#1a1a1a; color:#fff; border:1px solid #513c28; border-radius:5rem; outline:none; font-family:'Poppins',sans-serif;">
  </div>
`;
document.body.prepend(searchWrapper);

const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const menuCards = document.querySelectorAll('.menu-card');

searchIcon.addEventListener('click', (e) => {
    e.preventDefault();
    if (searchBar.style.display === 'none') {
        searchBar.style.display = 'block';
        searchInput.focus();
    } else {
        searchBar.style.display = 'none';
        searchInput.value = '';
        menuCards.forEach(card => card.style.display = 'block');
    }
});

searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.toLowerCase();
    menuCards.forEach(card => {
        const title = card.querySelector('.menu-card-title').textContent.toLowerCase();
        card.style.display = title.includes(keyword) ? 'block' : 'none';
    });
});

// =====================
// QTY CONTROL
// =====================
document.querySelectorAll('.menu-card').forEach(card => {
    const minus = card.querySelector('.minus');
    const plus = card.querySelector('.plus');
    const count = card.querySelector('.qty-count');

    plus.addEventListener('click', () => {
        count.textContent = parseInt(count.textContent) + 1;
    });

    minus.addEventListener('click', () => {
        if (parseInt(count.textContent) > 0) {
            count.textContent = parseInt(count.textContent) - 1;
        }
    });
});

// =====================
// HARGA MENU
// =====================
const menuPrices = {
    '- Americano Hot -': 18000,
    '- Ice Americano -': 18000,
    '- Latte Art -': 35000,
    '- Long Black -': 19000,
    '- Matcha -': 20000,
    '- Milk Tea -': 25000,
    '- Choco Milk -': 25000,
    '- Glass of Water -': 5000,
};

function formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
}

// =====================
// MODAL ORDER
// =====================
const orderModal = document.getElementById('order-modal');
const orderSummary = document.getElementById('order-summary');
const cancelOrder = document.getElementById('cancel-order');
const confirmOrder = document.getElementById('confirm-order');
const openModalBtn = document.getElementById('open-order-modal');
const successNotif = document.getElementById('order-success');
const successMsg = document.getElementById('success-msg');

openModalBtn.addEventListener('click', () => {
    const orders = [];
    let total = 0;

    menuCards.forEach(card => {
        const qty = parseInt(card.querySelector('.qty-count').textContent);
        if (qty > 0) {
            const name = card.querySelector('.menu-card-title').textContent.trim();
            const price = menuPrices[name] || 0;
            const subtotal = price * qty;
            total += subtotal;
            orders.push({ name, qty, subtotal });
        }
    });

    if (orders.length === 0) {
        alert('Pilih menu dulu bre!');
        return;
    }

    orderSummary.innerHTML = orders.map(o => `
        <div class="order-item">
            <span class="item-name">${o.name} x${o.qty}</span>
            <span class="item-price">${formatRupiah(o.subtotal)}</span>
        </div>
    `).join('') + `
        <div class="order-total">
            <span>Total</span>
            <span>${formatRupiah(total)}</span>
        </div>
    `;

    orderModal.classList.add('active');
});

cancelOrder.addEventListener('click', () => {
    orderModal.classList.remove('active');
});

orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        orderModal.classList.remove('active');
    }
});

// =====================
// KONFIRMASI & KIRIM KE FIREBASE
// =====================
confirmOrder.addEventListener('click', async () => {
    const name = document.getElementById('customer-name').value.trim();
    const table = document.getElementById('customer-table').value.trim();

    if (!name) {
        alert('Nama wajib diisi bre!');
        return;
    }
    if (!table || table < 1) {
        alert('Nomor meja wajib diisi bre!');
        return;
    }

    // Kumpulin pesanan
    const orders = [];
    let total = 0;
    menuCards.forEach(card => {
        const qty = parseInt(card.querySelector('.qty-count').textContent);
        if (qty > 0) {
            const itemName = card.querySelector('.menu-card-title').textContent.trim();
            const price = menuPrices[itemName] || 0;
            const subtotal = price * qty;
            total += subtotal;
            orders.push({ nama_menu: itemName, qty, harga_satuan: price, subtotal });
        }
    });

    // Data yang dikirim ke Firebase
    const orderData = {
        nama_customer: name,
        nomor_meja: parseInt(table),
        items: orders,
        total_harga: total,
        status: 'pending',
        waktu: new Date().toLocaleString('id-ID')
    };

    try {
        // Kirim ke Firebase
        confirmOrder.textContent = 'Mengirim...';
        confirmOrder.disabled = true;

        await push(ref(db, 'pesanan'), orderData);

        // Tutup modal
        orderModal.classList.remove('active');

        // Notifikasi sukses
        successMsg.textContent = `Pesanan ${name} di meja ${table} berhasil dikirim ke dapur!`;
        successNotif.classList.add('show');
        setTimeout(() => successNotif.classList.remove('show'), 4000);

        // Reset semua
        menuCards.forEach(card => {
            card.querySelector('.qty-count').textContent = '0';
        });
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-table').value = '';

    } catch (error) {
        alert('Gagal kirim pesanan bre, coba lagi!');
        console.error(error);
    } finally {
        confirmOrder.textContent = 'Pesan!';
        confirmOrder.disabled = false;
        feather.replace();
    }
});