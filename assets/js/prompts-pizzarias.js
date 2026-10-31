(() => {
  const form = document.getElementById('purchase-form');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const error = document.getElementById('form-error');
      error.classList.add('hidden');
      if (!form.reportValidity()) return;
      const customer = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        whatsapp: form.elements.whatsapp.value.trim()
      };
      button.disabled = true;
      button.textContent = 'Enviando…';
      try {
        const body = new URLSearchParams({ action: 'purchase', ...customer, website: '' });
        const response = await fetch('/enviar-compra-prompts.php', {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'Accept': 'application/json' }, body
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message || 'Não foi possível enviar seus dados.');
        sessionStorage.setItem('promptsPizzariasCustomer', JSON.stringify(customer));
        window.location.href = '/pagamento-prompts-para-pizzarias.html';
      } catch (e) {
        error.textContent = 'Não conseguimos enviar seus dados agora. Confira sua conexão e tente novamente.';
        error.classList.remove('hidden');
        button.disabled = false;
        button.textContent = 'Confirmar compra — R$ 6,99';
      }
    });
  }

  const copyButton = document.getElementById('copy-pix');
  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const code = document.getElementById('pix-code');
      const status = document.getElementById('copy-status');
      try {
        await navigator.clipboard.writeText(code.value);
        status.textContent = 'Código Pix copiado. Cole no aplicativo do seu banco.';
      } catch (e) {
        code.focus(); code.select();
        status.textContent = 'Selecione e copie o código Pix acima.';
      }
    });
  }

  const paidButton = document.getElementById('paid-button');
  if (paidButton) {
    paidButton.addEventListener('click', async () => {
      const error = document.getElementById('paid-error');
      error.classList.add('hidden');
      let customer;
      try { customer = JSON.parse(sessionStorage.getItem('promptsPizzariasCustomer') || 'null'); } catch (e) {}
      if (!customer) {
        error.textContent = 'Não encontramos os dados desta compra neste navegador. Volte à página de compra e preencha o formulário novamente.';
        error.classList.remove('hidden'); return;
      }
      paidButton.disabled = true;
      paidButton.textContent = 'Registrando aviso…';
      try {
        const body = new URLSearchParams({ action: 'paid', ...customer, website: '' });
        const response = await fetch('/enviar-compra-prompts.php', {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'Accept': 'application/json' }, body
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message || 'Não foi possível registrar o aviso.');
        window.location.href = '/obrigado-prompts-para-pizzarias.html';
      } catch (e) {
        error.textContent = 'Não conseguimos registrar o aviso agora. Tente novamente em instantes.';
        error.classList.remove('hidden');
        paidButton.disabled = false;
        paidButton.textContent = 'Já paguei';
      }
    });
  }
})();
