// Custom modal dialog system

function customConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modalOverlay');
        const messageEl = document.getElementById('modalMessage');
        const okBtn = document.getElementById('modalOk');
        const cancelBtn = document.getElementById('modalCancel');

        messageEl.textContent = message;

        // Show cancel button for confirm
        if (cancelBtn) cancelBtn.style.display = 'block';

        overlay.classList.add('active');

        const handleOk = () => {
            overlay.classList.remove('active');
            okBtn.removeEventListener('click', handleOk);
            if (cancelBtn) cancelBtn.removeEventListener('click', handleCancel);
            resolve(true);
        };

        const handleCancel = () => {
            overlay.classList.remove('active');
            okBtn.removeEventListener('click', handleOk);
            if (cancelBtn) cancelBtn.removeEventListener('click', handleCancel);
            resolve(false);
        };

        okBtn.addEventListener('click', handleOk);
        if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
    });
}

function customAlert(message) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modalOverlay');
        const messageEl = document.getElementById('modalMessage');
        const okBtn = document.getElementById('modalOk');
        const cancelBtn = document.getElementById('modalCancel');

        messageEl.textContent = message;

        // Hide cancel button for alert
        if (cancelBtn) cancelBtn.style.display = 'none';

        overlay.classList.add('active');

        const handleOk = () => {
            overlay.classList.remove('active');
            okBtn.removeEventListener('click', handleOk);
            resolve();
        };

        okBtn.addEventListener('click', handleOk);
    });
}
