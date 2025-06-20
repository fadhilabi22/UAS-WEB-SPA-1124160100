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