const CASHFREE_CHECKOUT_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

export const loadCashfreeCheckout = () => new Promise((resolve, reject) => {
  if (window.Cashfree) {
    resolve(window.Cashfree);
    return;
  }

  const existingScript = document.querySelector(`script[src="${CASHFREE_CHECKOUT_URL}"]`);
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(window.Cashfree));
    existingScript.addEventListener('error', () => reject(new Error('Could not load Cashfree checkout.')));
    return;
  }

  const script = document.createElement('script');
  script.src = CASHFREE_CHECKOUT_URL;
  script.async = true;
  script.onload = () => resolve(window.Cashfree);
  script.onerror = () => reject(new Error('Could not load Cashfree checkout.'));
  document.body.appendChild(script);
});

export const openCashfreeHostedCheckout = async ({ paymentSessionId, returnUrl, mode = 'sandbox' }) => {
  const CashfreeFactory = await loadCashfreeCheckout();
  if (!CashfreeFactory) {
    throw new Error('Cashfree checkout is unavailable right now. Please refresh and try again.');
  }

  const cashfree = CashfreeFactory({
    mode
  });

  const result = await cashfree.checkout({
    paymentSessionId,
    redirectTarget: '_self',
    returnUrl
  });

  if (result?.error) {
    throw new Error(result.error.message || 'Cashfree checkout could not be opened.');
  }

  return result;
};
