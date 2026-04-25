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

        const cleanup = () => {
            overlay.classList.remove('active');
            okBtn.removeEventListener('click', handleOk);
            if (cancelBtn) cancelBtn.removeEventListener('click', handleCancel);
            document.removeEventListener('keydown', handleKey);
        };

        const handleOk = () => { cleanup(); resolve(true); };
        const handleCancel = () => { cleanup(); resolve(false); };
        const handleKey = (e) => { if (e.key === 'Escape') handleCancel(); };

        okBtn.addEventListener('click', handleOk);
        if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
        document.addEventListener('keydown', handleKey);
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

        const cleanup = () => {
            overlay.classList.remove('active');
            okBtn.removeEventListener('click', handleOk);
            document.removeEventListener('keydown', handleKey);
        };

        const handleOk = () => { cleanup(); resolve(); };
        const handleKey = (e) => { if (e.key === 'Escape') handleOk(); };

        okBtn.addEventListener('click', handleOk);
        document.addEventListener('keydown', handleKey);
    });
}
