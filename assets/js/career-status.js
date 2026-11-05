(() => {
    const openingTime = new Date('2026-11-01T00:00:00+07:00').getTime();
    const deadlineTime = new Date('2026-11-06T23:59:00+07:00').getTime();

    if (!Number.isFinite(deadlineTime)) {
        throw new Error('Batas waktu pendaftaran karier tidak valid.');
    }
    window.careerDeadlineTime = deadlineTime;

    const deadlineLabel = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
    }).format(deadlineTime);

    function updateCareerStatus() {
        const now = Date.now();
        const isOpen = now >= openingTime;
        const isClosed = now >= deadlineTime;
        const isLastDay = isOpen && !isClosed && now >= deadlineTime - 24 * 60 * 60 * 1000;

        document.querySelectorAll('.vacancy-link').forEach((link) => {
            const menuItem = link.closest('li');
            if (menuItem) menuItem.hidden = isClosed;
        });
        document.querySelectorAll('.vacancy-badge').forEach((badge) => {
            badge.hidden = !isOpen || isClosed;
        });

        document.querySelectorAll('.career-announcement-shell').forEach((shell) => {
            shell.hidden = isClosed || (document.body.classList.contains('careers-page') && !isOpen);
        });
        document.querySelectorAll('.career-announcement-copy').forEach((copy) => {
            copy.textContent = isLastDay
                ? copy.dataset.lastday
                : isOpen
                    ? copy.dataset.open
                    : copy.dataset.before;
        });
        document.querySelectorAll('.career-announcement').forEach((announcement) => {
            announcement.setAttribute(
                'aria-label',
                isLastDay
                    ? `Peringatan: pendaftaran lowongan kerja berakhir besok, ${deadlineLabel}. Klik untuk melamar.`
                    : isOpen
                        ? `Pendaftaran lowongan kerja Ria Busana Parung ditutup pada ${deadlineLabel} WIB. Klik untuk melamar.`
                        : 'Informasi lowongan kerja Ria Busana Parung akan segera dibuka.'
            );
        });
    }

    updateCareerStatus();
    window.setInterval(updateCareerStatus, 60 * 1000);
})();
