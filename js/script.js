// ===== DATA & VARIABEL GLOBAL =====
let transactions = [];
let transactionIdCounter = 1;
let currentDiscount = 0;
let appliedPromoCode = '';

// Mapping metode pembayaran dengan warna (dark mode compatible)
const paymentMethodColors = {
    'transfer': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'ewallet': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'credit': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'cash': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};
 // Mapping nama metode pembayaran
const paymentMethodNames = {
    'transfer': 'Transfer Bank',
    'ewallet': 'E-Wallet',
    'credit': 'Kartu Kredit',
    'cash': 'Bayar Tunai'
};

// Kode promo
const promoCodes = {
    'DISKONWOY': {discount: 5, type: 'percentage', description: 'diskon 5%'},
    'ANJAYDISKON': {discount: 15, type: 'percentage', description: 'diskon 15%'},
    'DISKON': {discount: 20, type: 'percentage', description: 'diskon 20%'},
    '0232': {discount: 25, type: 'percentage', description: 'diskon 25%'}
};


// ===== DARK MODE FUNCTIONALITY =====
const toggleDarkMode = document.getElementById('toggleDarkMode');
const modeIcon = document.getElementById('modeIcon');
const modeText = document.getElementById('modeText');

function updateDarkModeButton() {
    const isDark = document.documentElement.classList.contains('dark');
    modeIcon.textContent = isDark ? '☀️' : '🌙';
    modeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

toggleDarkMode.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    
    updateDarkModeButton();
});


// ===== MENDAPATKAN ELEMEN DOM =====
const paymentForm = document.getElementById('paymentForm');
const productSelect = document.getElementById('productSelect');
const locationSelect = document.getElementById('locationSelect'); // [TAMBAHAN MINIMAL] 1. Mengambil elemen select lokasi
const quantity = document.getElementById('quantity');
const promoCode = document.getElementById('promoCode');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMessage = document.getElementById('promoMessage');

  // Elemen untuk menampilkan total
const subtotalEl = document.getElementById('subtotal');
const discountEl = document.getElementById('discount');
const discountRow = document.getElementById('discountRow');
const totalAmountEl = document.getElementById('totalAmount');

  // Elemen riwayat transaksi
const transactionList = document.getElementById('transactionList');
const emptyState = document.getElementById('emptyState');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

 // Elemen statistik
const totalTransactionsEl = document.getElementById('totalTransactions');
const totalRevenueEl = document.getElementById('totalRevenue');
const avgTransactionEl = document.getElementById('avgTransaction');

// Modal
const paymentModal = document.getElementById('paymentModal');
const paymentDetails = document.getElementById('paymentDetails');
const closeModalBtn = document.getElementById('closeModalBtn');


// ===== FUNGSI UTILITY =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}
 function getCurrentTime() {
    const now = new Date();
    return now.toLocaleString('id-ID', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}
function generateTransactionId() {
    return 'TRX' + Date.now().toString().substr(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
}


// ===== FUNGSI KALKULASI =====
function calculateSubtotal() {
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    if (!selectedOption || !selectedOption.dataset.price) return 0;
    
    const price = parseInt(selectedOption.dataset.price);
    const qty = parseInt(quantity.value) || 1;
    return price * qty;
}
function calculateDiscount(subtotal, promoData) {
    if (!promoData) return 0;
    
    if (promoData.type === 'percentage') {
        return Math.round(subtotal * promoData.discount / 100);
    } else {
        return Math.min(promoData.discount, subtotal);
    }
}
function updateTotal() {
    const subtotal = calculateSubtotal();
    const promoData = appliedPromoCode ? promoCodes[appliedPromoCode] : null;
    const discount = calculateDiscount(subtotal, promoData);
    const total = subtotal - discount;

    subtotalEl.textContent = formatCurrency(subtotal);
    
    if (discount > 0) {
        discountEl.textContent = '-' + formatCurrency(discount);
        discountRow.classList.remove('hidden');
    } else {
        discountRow.classList.add('hidden');
    }
    
    totalAmountEl.textContent = formatCurrency(total);
    currentDiscount = discount;
}


// ===== FUNGSI PROMO CODE =====
function applyPromoCode() {
    const code = promoCode.value.trim().toUpperCase();
    
    if (!code) {
        showPromoMessage('Masukkan kode promo terlebih dahulu', 'error');
        return;
    }

    if (!promoCodes[code]) {
        showPromoMessage('Kode promo tidak valid', 'error');
        return;
    }

    appliedPromoCode = code;
    updateTotal();
    showPromoMessage(`Kode promo "${code}" berhasil diterapkan! ${promoCodes[code].description}`, 'success');
    promoCode.disabled = true;
    applyPromoBtn.textContent = 'Diterapkan';
    applyPromoBtn.disabled = true;
    applyPromoBtn.classList.remove('bg-green-500', 'hover:bg-green-600', 'dark:bg-green-600', 'dark:hover:bg-green-700');
    applyPromoBtn.classList.add('bg-gray-400', 'dark:bg-gray-600');
}
function showPromoMessage(message, type) {
    promoMessage.textContent = message;
    promoMessage.classList.remove('hidden', 'text-red-500', 'text-green-500', 'dark:text-red-400', 'dark:text-green-400');
    if (type === 'error') {
        promoMessage.classList.add('text-red-500', 'dark:text-red-400');
    } else {
        promoMessage.classList.add('text-green-500', 'dark:text-green-400');
    }
}
function resetPromoCode() {
    appliedPromoCode = '';
    currentDiscount = 0;
    promoCode.value = '';
    promoCode.disabled = false;
    applyPromoBtn.textContent = 'Terapkan';
    applyPromoBtn.disabled = false;
    applyPromoBtn.classList.remove('bg-gray-400', 'dark:bg-gray-600');
    applyPromoBtn.classList.add('bg-green-500', 'hover:bg-green-600', 'dark:bg-green-600', 'dark:hover:bg-green-700');
    promoMessage.classList.add('hidden');
    updateTotal();
}


// ===== FUNGSI RIWAYAT TRANSAKSI =====
function loadTransactions() {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
    renderTransactions();
    updateStatistics();
}
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}
function renderTransactions() {
    transactionList.innerHTML = '';
    if (transactions.length === 0) {
        emptyState.classList.remove('hidden');
        clearHistoryBtn.classList.add('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    clearHistoryBtn.classList.remove('hidden');
    
    const template = document.getElementById('transactionTemplate');

    transactions.slice().reverse().forEach(transaction => { // Pakai slice().reverse() agar urutan benar
        const clone = document.importNode(template.content, true);
        clone.querySelector('.transaction-customer').textContent = transaction.customerName;
        clone.querySelector('.transaction-product').textContent = `${transaction.productName} (${transaction.quantity}x)`;
        clone.querySelector('.transaction-amount').textContent = formatCurrency(transaction.totalAmount);
        clone.querySelector('.transaction-time').textContent = transaction.timestamp;
        
        // [TAMBAHAN MINIMAL] 2. Menampilkan data lokasi di riwayat
        if (transaction.locationName) {
            clone.querySelector('.transaction-location').textContent = transaction.locationName;
        }

        const methodSpan = clone.querySelector('.transaction-method');
        methodSpan.textContent = paymentMethodNames[transaction.paymentMethod];
        methodSpan.className = 'transaction-method px-2 py-1 rounded-full font-medium'; // Reset class
        methodSpan.classList.add(...(paymentMethodColors[transaction.paymentMethod] || '').split(' '));

        transactionList.appendChild(clone); // Pakai appendChild agar urutan benar
    });
}
function updateStatistics() {
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    totalTransactionsEl.textContent = totalTransactions;
    totalRevenueEl.textContent = formatCurrency(totalRevenue);
    avgTransactionEl.textContent = formatCurrency(avgTransaction);
}
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Anda yakin ingin menghapus semua riwayat transaksi?')) {
        transactions = [];
        saveTransactions();
        renderTransactions();
        updateStatistics();
    }
});


// ===== EVENT LISTENERS =====
productSelect.addEventListener('change', updateTotal);
quantity.addEventListener('input', updateTotal);
applyPromoBtn.addEventListener('click', applyPromoCode);

paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    
    // [TAMBAHAN MINIMAL] 3. Mengambil data dari dropdown lokasi saat submit
    const selectedLocationOption = locationSelect.options[locationSelect.selectedIndex];
    const locationValue = selectedLocationOption.value;
    const locationName = selectedLocationOption.textContent;

    const selectedProductOption = productSelect.options[productSelect.selectedIndex];
    const productValue = selectedProductOption.value;
    const productName = selectedProductOption.textContent.split(' - ')[0];
    const productPrice = parseInt(selectedProductOption.dataset.price);
    const qty = parseInt(quantity.value);
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const subtotal = calculateSubtotal();
    const discount = currentDiscount;
    const totalAmount = subtotal - discount;

    // [TAMBAHAN MINIMAL] 4. Menambahkan validasi untuk lokasi dan produk
    if (!customerName || !customerEmail || !locationValue || !productValue || !qty || !paymentMethod) {
        alert('Harap lengkapi semua bidang yang wajib diisi (Nama, Email, Tempat, Produk, dan Metode Pembayaran).');
        return;
    }

    const newTransaction = {
        id: generateTransactionId(),
        customerName,
        customerEmail,
        // [TAMBAHAN MINIMAL] 5. Menyimpan data lokasi ke objek transaksi
        location: locationValue,
        locationName: locationName,
        productName,
        quantity: qty,
        unitPrice: productPrice,
        subtotal,
        discount,
        totalAmount,
        paymentMethod,
        promoCode: appliedPromoCode || 'Tidak Ada',
        timestamp: getCurrentTime()
    };

    transactions.push(newTransaction);
    saveTransactions();
    renderTransactions();
    updateStatistics();
    
    showPaymentConfirmation(newTransaction);

    paymentForm.reset();
    resetPromoCode();
    updateTotal();
});

function showPaymentConfirmation(transaction) {
    paymentDetails.innerHTML = `
        <p class="flex justify-between"><span>ID Transaksi:</span> <strong>${transaction.id}</strong></p>
        <p class="flex justify-between"><span>Nama Pelanggan:</span> <span>${transaction.customerName}</span></p>
        <p class="flex justify-between"><span>Email:</span> <span>${transaction.customerEmail}</span></p>
        
        <p class="flex justify-between"><span>Lokasi:</span> <span>${transaction.locationName}</span></p>

        <p class="flex justify-between"><span>Produk:</span> <span>${transaction.productName} (${transaction.quantity}x)</span></p>
        <p class="flex justify-between"><span>Harga Satuan:</span> <span>${formatCurrency(transaction.unitPrice)}</span></p>
        <p class="flex justify-between"><span>Subtotal:</span> <span>${formatCurrency(transaction.subtotal)}</span></p>
        <p class="flex justify-between"><span>Diskon:</span> <span>-${formatCurrency(transaction.discount)}</span></p>
        <p class="flex justify-between"><span>Metode Pembayaran:</span> <span>${paymentMethodNames[transaction.paymentMethod]}</span></p>
        <p class="flex justify-between text-lg font-semibold border-t pt-2 mt-2"><span>Total Dibayar:</span> <span>${formatCurrency(transaction.totalAmount)}</span></p>
        <p class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2"><span>Waktu Transaksi:</span> <span>${transaction.timestamp}</span></p>
    `;
    paymentModal.classList.remove('hidden');
    paymentModal.classList.add('flex');
}

closeModalBtn.addEventListener('click', () => {
    paymentModal.classList.add('hidden');
    paymentModal.classList.remove('flex');
});


// ===== INISIALISASI =====
// [CATATAN] Blok ini ada di versi awalmu, jadi kita pertahankan
document.addEventListener('DOMContentLoaded', () => {
    updateDarkModeButton();
    loadTransactions();
    updateTotal();
});