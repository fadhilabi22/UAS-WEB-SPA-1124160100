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
