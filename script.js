// Hamburger menu
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

// Search filter menu
const searchIcon = document.querySelector('#search');
const searchWrapper = document.createElement('div');
searchWrapper.innerHTML = `
  <div id="search-bar" style="display:none; position:fixed; top:70px; left:0; right:0; z-index:9998; background:rgba(1,1,1,0.95); padding:1rem 7%; border-bottom:1px solid #513c28;">
    <input type="text" id="search-input" placeholder="Cari menu..." style="width:100%; padding:1rem 2rem; font-size:1.4rem; background:#1a1a1a; color:#fff; border:1px solid #513c28; border-radius:5rem; outline:none;">
  </div>
`;
document.body.prepend(searchWrapper);

const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const menuCards = document.querySelectorAll('.menu-card');

// Toggle search bar
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

// Filter menu cards
searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.toLowerCase();
    menuCards.forEach(card => {
        const title = card.querySelector('.menu-card-title').textContent.toLowerCase();
        card.style.display = title.includes(keyword) ? 'block' : 'none';
    });
});

// Qty control
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