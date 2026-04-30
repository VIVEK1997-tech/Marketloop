export const submitPayuCheckout = (checkout) => {
  if (!checkout?.paymentUrl) {
    throw new Error('PayU checkout URL is missing');
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkout.paymentUrl;
  form.style.display = 'none';

  Object.entries(checkout).forEach(([key, value]) => {
    if (value === undefined || value === null || key === 'paymentUrl' || key === 'gateway') return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};
