(() => {
    const now = Date.now();
    const openingTime = new Date('2026-11-01T00:00:00+07:00').getTime();
    const deadlineTime = window.careerDeadlineTime;
    const isCareerPage = document.body.classList.contains('careers-page');
    const isHomePage = document.body.id === 'beranda';

    if ((!isCareerPage && !isHomePage) || now < openingTime || now >= deadlineTime) return;

    const deadlineLabel = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
    }).format(deadlineTime);
    const isLastDay = now >= deadlineTime - 24 * 60 * 60 * 1000;
    const dialog = document.createElement('dialog');
    dialog.className = 'career-popup';
    dialog.setAttribute('aria-labelledby', 'career-popup-title');

    const title = document.createElement('h2');
    title.id = 'career-popup-title';
    title.textContent = isLastDay ? 'Lowongan berakhir besok!' : 'Lowongan segera ditutup!';

    const message = document.createElement('p');
    message.textContent = isLastDay
        ? `Segera daftar sebelum pendaftaran lowongan kerja Ria Busana Parung ditutup besok, ${deadlineLabel} WIB.`
        : `Segera daftarkan diri sebelum lowongan kerja Ria Busana Parung ditutup pada ${deadlineLabel} WIB.`;

    const actions = document.createElement('div');
    actions.className = 'career-popup-actions';

    const closeButton = document.createElement('button');
    closeButton.className = 'career-popup-close';
    closeButton.type = 'button';
    closeButton.textContent = 'Tutup';
    closeButton.addEventListener('click', () => dialog.close());

    const actionLink = document.createElement('a');
    actionLink.className = 'career-popup-action';
    actionLink.href = 'karier.html';
    actionLink.textContent = 'Lihat lowongan';

    actions.append(closeButton, actionLink);
    dialog.append(title, message, actions);
    document.body.append(dialog);

    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });

    const deadlineTimer = window.setTimeout(() => {
        if (dialog.open) dialog.close();
    }, Math.max(0, deadlineTime - Date.now()));
    dialog.addEventListener('close', () => window.clearTimeout(deadlineTimer), { once: true });

    function showPopup() {
        if (!dialog.isConnected || dialog.open) return;
        dialog.showModal();
    }

    const preloader = document.querySelector('#preloader');
    if (!isHomePage || !preloader) {
        showPopup();
        return;
    }

    if (preloader.classList.contains('hide') && getComputedStyle(preloader).visibility === 'hidden') {
        showPopup();
        return;
    }

    let fallbackTimer;
    const finishPreloader = () => {
        if (!preloader.classList.contains('hide')) return;
        if (getComputedStyle(preloader).visibility !== 'hidden') {
            fallbackTimer = window.setTimeout(finishPreloader, 100);
            return;
        }
        window.clearTimeout(fallbackTimer);
        preloader.removeEventListener('transitionend', onPreloaderTransitionEnd);
        observer.disconnect();
        showPopup();
    };
    const onPreloaderTransitionEnd = (event) => {
        if (event.target === preloader && event.propertyName === 'opacity') finishPreloader();
    };
    const observer = new MutationObserver(() => {
        if (!preloader.classList.contains('hide')) return;
        fallbackTimer = window.setTimeout(finishPreloader, 700);
    });

    preloader.addEventListener('transitionend', onPreloaderTransitionEnd);
    observer.observe(preloader, { attributes: true, attributeFilter: ['class'] });
})();
