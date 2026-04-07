document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('footerInfoModal');
  const modalTitle = document.getElementById('footerModalTitle');
  const modalBody = document.getElementById('footerModalBody');
  const closeButton = document.getElementById('footerModalClose');
  const overlay = document.getElementById('footerModalOverlay');
  const openButtons = document.querySelectorAll('.footer-modal-btn');

  if (!modal || !modalTitle || !modalBody) return;

  const openModal = (title, content) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    modalTitle.textContent = '';
    modalBody.innerHTML = '';
  };

  openButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const title = button.dataset.modalTitle || 'Информация';
      const content = button.dataset.modalContent || '<p>Информация отсутствует.</p>';
      openModal(title, content);
    });
  });

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
});