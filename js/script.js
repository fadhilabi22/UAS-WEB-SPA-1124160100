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
            'ANJAYDISKON': {discount: 15, type: 'percentage', description: 'diskon 15%'}, // Corrected description
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
        
        // Format mata uang Rupiah
        function formatCurrency(amount) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount);
        }
         // Format waktu
        function getCurrentTime() {
            const now = new Date();
            return now.toLocaleString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
 // Generate transaction ID
        function generateTransactionId() {
            return 'TRX' + Date.now().toString().substr(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
        }
 // ===== FUNGSI KALKULASI =====
        
        // Hitung subtotal
        function calculateSubtotal() {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            if (!selectedOption || !selectedOption.dataset.price) return 0;
            
            const price = parseInt(selectedOption.dataset.price);
            const qty = parseInt(quantity.value) || 1;
            return price * qty;
        }

          // Hitung diskon
        function calculateDiscount(subtotal, promoData) {
            if (!promoData) return 0;
            
            if (promoData.type === 'percentage') {
                return Math.round(subtotal * promoData.discount / 100);
            } else {
                return Math.min(promoData.discount, subtotal);
            }
        }
          // Update tampilan total
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
        
        // Terapkan kode promo
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
 // Tampilkan pesan promo
        function showPromoMessage(message, type) {
            promoMessage.textContent = message;
            promoMessage.classList.remove('hidden', 'text-red-500', 'text-green-500', 'dark:text-red-400', 'dark:text-green-400');
            if (type === 'error') {
                promoMessage.classList.add('text-red-500', 'dark:text-red-400');
            } else {
                promoMessage.classList.add('text-green-500', 'dark:text-green-400');
            }
        }
  // Reset promo code
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

        // Muat transaksi dari Local Storage
        function loadTransactions() {
            const storedTransactions = localStorage.getItem('transactions');
            if (storedTransactions) {
                transactions = JSON.parse(storedTransactions);
                if (transactions.length > 0) {
                    // Pastikan transactionIdCounter lebih besar dari ID transaksi terakhir
                    const lastTransactionIdNum = Math.max(...transactions.map(t => parseInt(t.id.replace('TRX', '').substring(0, 8)) || 0));
                    transactionIdCounter = lastTransactionIdNum + 1;
                }
            }
            renderTransactions();
            updateStatistics();
        }

        // Simpan transaksi ke Local Storage
        function saveTransactions() {
            localStorage.setItem('transactions', JSON.stringify(transactions));
        }
 // Render (tampilkan) daftar transaksi
        function renderTransactions() {
            transactionList.innerHTML = ''; // Kosongkan daftar sebelum render ulang
            if (transactions.length === 0) {
                emptyState.classList.remove('hidden');
                clearHistoryBtn.classList.add('hidden');
                return;
            } else {
                emptyState.classList.add('hidden');
                clearHistoryBtn.classList.remove('hidden');
            }

            const template = document.getElementById('transactionTemplate');

            transactions.forEach(transaction => {
                const clone = document.importNode(template.content, true);
                clone.querySelector('.transaction-customer').textContent = transaction.customerName;
                clone.querySelector('.transaction-product').textContent = `${transaction.productName} (${transaction.quantity}x)`;
                clone.querySelector('.transaction-amount').textContent = formatCurrency(transaction.totalAmount);
                clone.querySelector('.transaction-time').textContent = transaction.timestamp;
                
                const methodSpan = clone.querySelector('.transaction-method');
                methodSpan.textContent = paymentMethodNames[transaction.paymentMethod];
                methodSpan.className += ` ${paymentMethodColors[transaction.paymentMethod]}`;

                transactionList.prepend(clone); // Tambahkan ke paling atas
            });
        }