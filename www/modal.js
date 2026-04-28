// Custom modal dialog system

function customConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modalOverlay');
        const messageEl = document.getElementById('modalMessage');
        const okBtn = document.getElementById('modalOk');
        const cancelBtn = document.getElementById('modalCancel');

        messageEl.textContent = message;

        if (cancelBtn) cancelBtn.style.display = 'block';

        overlay.classList.add('active');
        okBtn.focus();

        const focusableEls = [okBtn, cancelBtn].filter(el => el && el.style.display !== 'none');

        const cleanup = () => {
            overlay.classList.remove('active');
            okBtn.removeEventListener('click', handleOk);
            if (cancelBtn) cancelBtn.removeEventListener('click', handleCancel);
            document.removeEventListener('keydown', handleKey);
        };

        const handleOk = () => { cleanup(); resolve(true); };
        const handleCancel = () => { cleanup(); resolve(false); };
        const handleKey = (e) => {
            if (e.key === 'Escape') { handleCancel(); return; }
            if (e.key === 'Tab') {
                const first = focusableEls[0];
                const last = focusableEls[focusableEls.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

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

        if (cancelBtn) cancelBtn.style.display = 'none';

        overlay.classList.add('active');
        okBtn.focus();

        const cleanup = () => {
            overlay.classList.remove('active');
            okBtn.removeEventListener('click', handleOk);
            document.removeEventListener('keydown', handleKey);
        };

        const handleOk = () => { cleanup(); resolve(); };
        const handleKey = (e) => {
            if (e.key === 'Escape') { handleOk(); return; }
            if (e.key === 'Tab') {
                e.preventDefault();
                okBtn.focus();
            }
        };

        okBtn.addEventListener('click', handleOk);
        document.addEventListener('keydown', handleKey);
    });
}
