const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export const loadRazorpayCheckout = ({ timeoutMs = 12000 } = {}) => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`);
  const script = existingScript || document.createElement('script');
  let settled = false;

  const cleanup = () => {
    clearTimeout(timeoutId);
    script.removeEventListener('load', handleLoad);
    script.removeEventListener('error', handleError);
  };

  const settleSuccess = () => {
    if (settled) return;
    settled = true;
    cleanup();
    resolve(true);
  };

  const settleError = (message) => {
    if (settled) return;
    settled = true;
    cleanup();
    reject(new Error(message));
  };

  const handleLoad = () => {
    if (window.Razorpay) {
      settleSuccess();
      return;
    }
    settleError('Razorpay checkout script loaded, but Razorpay was not initialized.');
  };

  const handleError = () => settleError('Could not load Razorpay checkout.');
  const timeoutId = window.setTimeout(() => settleError('Razorpay checkout timed out while loading.'), timeoutMs);

  script.addEventListener('load', handleLoad);
  script.addEventListener('error', handleError);

  if (!existingScript) {
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    document.body.appendChild(script);
    return;
  }

  if (window.Razorpay) {
    settleSuccess();
  }
});
