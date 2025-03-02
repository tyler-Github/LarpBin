document.addEventListener('DOMContentLoaded', () => {
    const itemsPerPage = 10;
    let currentPage = 1;

    function renderPastes() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pagePastes = pastes.slice(start, end);

        const container = document.getElementById('pastes-container');
        container.innerHTML = '';

        pagePastes.forEach(paste => {
            const pasteElement = document.createElement('div');
            pasteElement.classList.add('paste-item');
            pasteElement.innerHTML = `<a style="color: ${paste.text_color} !important;" href="/paste?id=${paste.id}">${paste.title}</a>`;
            container.appendChild(pasteElement);
        });

        document.getElementById('pageNumbers').innerText = `Page ${currentPage} of ${Math.ceil(pastes.length / itemsPerPage)}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === Math.ceil(pastes.length / itemsPerPage);
    }

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPastes();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < Math.ceil(pastes.length / itemsPerPage)) {
            currentPage++;
            renderPastes();
        }
    });

    if (pastes.length > 0) {
        document.getElementById('pagination-container').style.display = 'flex';
        renderPastes();
    }
});