/**
 * تطبيق الواجهة الأمامية لمنصة ستامبكوين
 * يتعامل مع واجهة برمجة التطبيقات ويوفر تجربة مستخدم تفاعلية
 */

document.addEventListener('DOMContentLoaded', function() {
    // تهيئات التطبيق
    const API_BASE_URL = '/api';

    // معالج نموذج المعاملات
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
    }

    // معالج نموذج الاتصال
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // التحقق من حالة الخادم عند تحميل الصفحة
    checkServerStatus();
});

/**
 * التحقق من حالة الخادم
 */
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        const data = await response.json();

        if (data.success && data.status === 'running') {
            showNotification('الخادم يعمل بشكل طبيعي', 'success');
        } else {
            showNotification('قد يكون هناك مشكلة في الخادم', 'warning');
        }
    } catch (error) {
        console.error('Error checking server status:', error);
        showNotification('غير قادر على الاتصال بالخادم', 'danger');
    }
}

/**
 * معالجة إرسال نموذج المعاملات
 */
async function handleTransactionSubmit(event) {
    event.preventDefault();

    // جمع البيانات من النموذج
    const formData = {
        amount: document.getElementById('amount').value,
        currency: document.getElementById('currency').value,
        recipient: document.getElementById('recipient').value,
        sender: document.getElementById('sender').value
    };

    // إظهار مؤشر التحميل
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="loading me-2"></span> جاري المعالجة...';
    submitButton.disabled = true;

    try {
        // إرسال الطلب إلى الخادم
        const response = await fetch(`${API_BASE_URL}/transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        // عرض النتيجة
        const resultDiv = document.getElementById('transactionResult');
        if (data.success) {
            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    تم إنشاء المعاملات بنجاح!
                    <br>
                    <strong>معرف المعاملة:</strong> ${data.transaction.id}
                </div>
            `;
            // إعادة تعيين النموذج
            event.target.reset();
        } else {
            resultDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    فشل إنشاء المعاملة: ${data.error || 'خطأ غير معروف'}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error creating transaction:', error);
        const resultDiv = document.getElementById('transactionResult');
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.
            </div>
        `;
    } finally {
        // استعادة زر الإرسال
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
}

/**
 * معالجة إرسال نموذج الاتصال
 */
async function handleContactSubmit(event) {
    event.preventDefault();

    // جمع البيانات من النموذج
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    // إظهار مؤشر التحميل
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="loading me-2"></span> جاري الإرسال...';
    submitButton.disabled = true;

    try {
        // في تطبيق حقيقي، سيتم إرسال البيانات إلى خادم هنا
        console.log('Contact form data:', formData);

        // عرض رسالة نجاح
        const resultDiv = document.getElementById('contactResult');
        resultDiv.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                شكراً لتواصلك معنا! سنرد عليك في أقرب وقت ممكن.
            </div>
        `;

        // إعادة تعيين النموذج
        event.target.reset();
    } catch (error) {
        console.error('Error submitting contact form:', error);
        const resultDiv = document.getElementById('contactResult');
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.
            </div>
        `;
    } finally {
        // استعادة زر الإرسال
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
}

/**
 * عرض إشعار للمستخدم
 */
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);

    // إغلاق الإشعار بعد 5 ثواني
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

/**
 * تنسيق التاريخ
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * الحصول على حالة المعاملة باللغة العربية
 */
function getTransactionStatus(status) {
    const statusMap = {
        'created': 'تم الإنشاء',
        'pending': 'قيد الانتظار',
        'confirmed': 'مؤكد',
        'failed': 'فشل',
        'cancelled': 'ملغى'
    };
    return statusMap[status] || status;
}

/**
 * عرض قائمة المعاملات
 */
async function displayTransactions() {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);
        const data = await response.json();

        if (data.success && data.transactions.length > 0) {
            const transactionsHtml = data.transactions.map(transaction => `
                <div class="transaction-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="mb-1">المعاملة #${transaction.id}</h5>
                            <p class="mb-1">
                                <strong>المبلغ:</strong> ${transaction.amount} ${transaction.currency}
                            </p>
                            <p class="mb-1">
                                <strong>المرسل:</strong> ${transaction.sender} | 
                                <strong>المستلم:</strong> ${transaction.recipient}
                            </p>
                            <p class="mb-0">
                                <strong>التاريخ:</strong> ${formatDate(transaction.timestamp)}
                            </p>
                        </div>
                        <span class="transaction-status status-${transaction.status}">
                            ${getTransactionStatus(transaction.status)}
                        </span>
                    </div>
                </div>
            `).join('');

            document.getElementById('transactionsList').innerHTML = transactionsHtml;
        } else {
            document.getElementById('transactionsList').innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    لا توجد معاملات
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        document.getElementById('transactionsList').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i>
                غير قادر على جلب المعاملات. يرجى المحاولة مرة أخرى.
            </div>
        `;
    }
}
