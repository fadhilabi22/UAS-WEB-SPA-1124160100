// [PERBAIKAN UTAMA] Seluruh kode dibungkus agar berjalan setelah HTML siap.
document.addEventListener('DOMContentLoaded', () => {

    // ===== DATA & VARIABEL GLOBAL =====
    let transactions = [];
    let currentDiscount = 0;
    let appliedPromoCode = '';

    // Mapping metode pembayaran dengan warna
    const paymentMethodColors = {
        'transfer': 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
        'ewallet': 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
        'credit': 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
        'cash': 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200'
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
        'DISKONWOY': { discount: 5, type: 'percentage', description: 'diskon 5%' },
        'ANJAYDISKON': { discount: 15, type: 'percentage', description: 'diskon 15%' },
        'DISKON': { discount: 20, type: 'percentage', description: 'diskon 20%' },
        '0232': { discount: 25, type: 'percentage', description: 'diskon 25%' }
    };

    // ===== MENDAPATKAN ELEMEN DOM =====
    const paymentForm = document.getElementById('paymentForm');
    const productSelect = document.getElementById('productSelect');
    const locationSelect = document.getElementById('locationSelect');
    const quantity = document.getElementById('quantity');
    const promoCodeInput = document.getElementById('promoCode'); // Mengganti nama variabel agar lebih jelas
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const promoMessage = document.getElementById('promoMessage');
    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount');
    const discountRow = document.getElementById('discountRow');
    const totalAmountEl = document.getElementById('totalAmount');
    const transactionList = document.getElementById('transactionList');
    const emptyState = document.getElementById('emptyState');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const totalTransactionsEl = document.getElementById('totalTransactions');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const avgTransactionEl = document.getElementById('avgTransaction');
    const paymentModal = document.getElementById('paymentModal');
    const paymentDetails = document.getElementById('paymentDetails');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const toggleDarkModeBtn = document.getElementById('toggleDarkMode');
    const modeIcon = document.getElementById('modeIcon');
    const modeText = document.getElementById('modeText');

    // ===== FUNGSI UTILITY =====
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }
    function getCurrentTime() {
        return new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }).replace(/\./g, ':');
    }
    function generateTransactionId() {
        return 'TRX' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(2, 6).toUpperCase();
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
    function applyPromo() { // Mengganti nama fungsi agar lebih jelas
        const code = promoCodeInput.value.trim().toUpperCase();

        if (!code) return showPromoMessage('Masukkan kode promo terlebih dahulu', 'error');
        if (!promoCodes[code]) return showPromoMessage('Kode promo tidak valid', 'error');

        appliedPromoCode = code;
        updateTotal();
        showPromoMessage(`Kode promo "${code}" berhasil diterapkan! ${promoCodes[code].description}`, 'success');
        promoCodeInput.disabled = true;
        applyPromoBtn.textContent = 'Diterapkan';
        applyPromoBtn.disabled = true;
        applyPromoBtn.classList.add('bg-gray-400', 'dark:bg-gray-600', 'cursor-not-allowed');
        applyPromoBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
    }
    function showPromoMessage(message, type) {
        promoMessage.textContent = message;
        promoMessage.className = 'mt-2 text-sm'; // Reset class
        promoMessage.classList.add(type === 'error' ? 'text-red-500' : 'text-green-500', 'dark:text-red-400', 'dark:text-green-400');
    }
    function resetPromo() { // Mengganti nama fungsi agar lebih jelas
        appliedPromoCode = '';
        currentDiscount = 0;
        promoCodeInput.value = '';
        promoCodeInput.disabled = false;
        applyPromoBtn.textContent = 'Terapkan';
        applyPromoBtn.disabled = false;
        applyPromoBtn.classList.remove('bg-gray-400', 'dark:bg-gray-600', 'cursor-not-allowed');
        applyPromoBtn.classList.add('bg-green-500', 'hover:bg-green-600');
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
        const hasTransactions = transactions.length > 0;

        emptyState.classList.toggle('hidden', hasTransactions);
        clearHistoryBtn.classList.toggle('hidden', !hasTransactions);

        const template = document.getElementById('transactionTemplate');
        
        // [PERBAIKAN] Menggunakan slice().reverse() agar urutan selalu terbaru di atas
        transactions.slice().reverse().forEach(transaction => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.transaction-customer').textContent = transaction.customerName;
            clone.querySelector('.transaction-product').textContent = `${transaction.productName} (${transaction.quantity}x)`;
            clone.querySelector('.transaction-amount').textContent = formatCurrency(transaction.totalAmount);
            clone.querySelector('.transaction-time').textContent = transaction.timestamp;

            if (transaction.locationName) {
                clone.querySelector('.transaction-location').textContent = transaction.locationName;
            }

            const methodSpan = clone.querySelector('.transaction-method');
            methodSpan.textContent = paymentMethodNames[transaction.paymentMethod];
            methodSpan.className = 'transaction-method px-2 py-1 rounded-full font-medium';
            methodSpan.classList.add(...(paymentMethodColors[transaction.paymentMethod] || '').split(' '));

            transactionList.appendChild(clone);
        });
    }
    function updateStatistics() {
        const totalCount = transactions.length;
        const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const avgTransaction = totalCount > 0 ? totalRevenue / totalCount : 0;

        totalTransactionsEl.textContent = totalCount;
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

    // ===== EVENT LISTENERS FORM & MODAL =====
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // [PERBAIKAN] Validasi yang lebih kuat
        const formData = {
            customerName: document.getElementById('customerName').value.trim(),
            customerEmail: document.getElementById('customerEmail').value.trim(),
            location: locationSelect.value,
            product: productSelect.value,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value
        };

        const errorMessages = {
            customerName: 'Nama Pelanggan', customerEmail: 'Email', location: 'Tempat',
            product: 'Produk', paymentMethod: 'Metode Pembayaran'
        };

        for (const [key, value] of Object.entries(formData)) {
            if (!value) {
                alert(`Harap lengkapi kolom "${errorMessages[key]}" terlebih dahulu.`);
                return;
            }
        }
        
        const newTransaction = {
            id: generateTransactionId(),
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            location: formData.location,
            locationName: locationSelect.options[locationSelect.selectedIndex].text,
            productName: productSelect.options[productSelect.selectedIndex].text.split(' - ')[0],
            quantity: parseInt(quantity.value, 10),
            unitPrice: parseInt(productSelect.options[productSelect.selectedIndex].dataset.price, 10),
            subtotal: calculateSubtotal(),
            discount: currentDiscount,
            totalAmount: calculateSubtotal() - currentDiscount,
            paymentMethod: formData.paymentMethod,
            promoCode: appliedPromoCode || 'Tidak Ada',
            timestamp: getCurrentTime()
        };

        transactions.push(newTransaction);
        saveTransactions();
        renderTransactions();
        updateStatistics();
        
        showPaymentConfirmation(newTransaction);

        paymentForm.reset();
        resetPromo();
        updateTotal();
    });

    function showPaymentConfirmation(transaction) {
        paymentDetails.innerHTML = `
            <p class="flex justify-between"><span>ID Transaksi:</span> <strong>${transaction.id}</strong></p>
            <p class="flex justify-between"><span>Nama:</span> <span>${transaction.customerName}</span></p>
            <p class="flex justify-between"><span>Lokasi:</span> <span>${transaction.locationName}</span></p>
            <p class="flex justify-between"><span>Produk:</span> <span>${transaction.productName} (${transaction.quantity}x)</span></p>
            <hr class="my-2 border-dashed dark:border-gray-600">
            <p class="flex justify-between"><span>Subtotal:</span> <span>${formatCurrency(transaction.subtotal)}</span></p>
            <p class="flex justify-between text-green-500"><span>Diskon:</span> <span>-${formatCurrency(transaction.discount)}</span></p>
            <p class="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>Total:</span> <span>${formatCurrency(transaction.totalAmount)}</span></p>
        `;
        paymentModal.classList.remove('hidden');
        paymentModal.classList.add('flex');
    }

    closeModalBtn.addEventListener('click', () => {
        paymentModal.classList.add('hidden');
        paymentModal.classList.remove('flex');
    });

    [locationSelect, productSelect, quantity].forEach(el => el.addEventListener('input', updateTotal));
    applyPromoBtn.addEventListener('click', applyPromo);
    promoCodeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyPromo(); });

    // ===== FUNGSI DARK MODE =====
    function setupDarkMode() {
        const updateDarkModeVisuals = () => {
            const isDark = document.documentElement.classList.contains('dark');
            modeIcon.textContent = isDark ? '☀️' : '🌙';
            modeText.textContent = isDark ? 'Light' : 'Dark';
        };

        toggleDarkModeBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            updateDarkModeVisuals();
        });

        updateDarkModeVisuals();
    }

    // ===== INISIALISASI HALAMAN =====
    function init() {
        setupDarkMode();
        loadTransactions();
        updateTotal();
    }

    init(); // Jalankan semua persiapan awal
});