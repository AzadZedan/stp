document.addEventListener('DOMContentLoaded', function() {
    // زر الاتصال بالمحفظة
    const connectButton = document.getElementById('connect-wallet');
    const walletDetails = document.getElementById('wallet-details');

    if (connectButton) {
        connectButton.addEventListener('click', connectWallet);
    }

    // دالة الاتصال بالمحفظة
    async function connectWallet() {
        try {
            // في تطبيق حقيقي، هنا سنستخدم Web3 أو أي مكتبة محفظة أخرى
            // محاكاة الاتصال بالمحفظة
            const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

            // عرض معلومات المحفظة
            walletDetails.innerHTML = `
                <h3>المحفظة متصلة</h3>
                <p>العنوان: ${address}</p>
                <p>الرصيد: <span id="balance">جاري التحميل...</span></p>
                <button id="disconnect-wallet">اتصل بمحفظة أخرى</button>
            `;

            // إضافة مستمع حدث لزر فصل المحفظة
            const disconnectButton = document.getElementById('disconnect-wallet');
            if (disconnectButton) {
                disconnectButton.addEventListener('click', disconnectWallet);
            }

            // جلب الرصيد
            fetchBalance(address);

        } catch (error) {
            console.error('Error connecting to wallet:', error);
            walletDetails.innerHTML = '<p>فشل الاتصال بالمحفظة. يرجى المحاولة مرة أخرى.</p>';
        }
    }

    // دالة فصل المحفظة
    function disconnectWallet() {
        walletDetails.innerHTML = '<p>اتصل بمحفظتك لعرض المعلومات</p>';
    }

    // دالة جلب الرصيد
    async function fetchBalance(address) {
        try {
            const response = await fetch(`/api/balance?address=${address}`);
            if (response.ok) {
                const data = await response.json();
                const balanceElement = document.getElementById('balance');
                if (balanceElement) {
                    balanceElement.textContent = `${data.balance} ${data.currency}`;
                }
            } else {
                throw new Error('Failed to fetch balance');
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
            const balanceElement = document.getElementById('balance');
            if (balanceElement) {
                balanceElement.textContent = 'خطأ في جلب الرصيد';
            }
        }
    }
});