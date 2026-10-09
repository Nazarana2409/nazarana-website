
const RAZORPAY_FUNCTION =
  "https://seogmslimxytpeoynath.supabase.co/functions/v1/razorpay-payment";

const $ = (id) => document.getElementById(id);

const countEl = $("count");
const cartItemsEl = $("cartItems");
const subtotalEl = $("subtotal");
const grandtotalEl = $("grandtotal");
const checkoutFormEl = $("checkoutForm");
const payStatusEl = $("payStatus");
const payButton = checkoutFormEl?.querySelector('button[type="submit"]');

let cart = [];

try {
  const stored = JSON.parse(localStorage.getItem("nazaranaCart") || "[]");
  cart = Array.isArray(stored) ? stored : [];
} catch (error) {
  console.error("Cart storage error:", error);
}

let paymentInProgress = false;

const fmt = (value) =>
  "₹" + Number(value || 0).toLocaleString("en-IN");

function save() {
  localStorage.setItem("nazaranaCart", JSON.stringify(cart));
}

function draw() {
  if (countEl) countEl.textContent = String(cart.length);

  if (cartItemsEl) {
    cartItemsEl.innerHTML = cart.length
      ? cart.map((p, i) => `
          <article class="cart-row">
            <img src="${p.img}">
            <div>
              <h3>${p.name}</h3>
              <p>${fmt(p.price)}</p>
              <button type="button" onclick="remove(${i})">
                Remove
              </button>
            </div>
          </article>
        `).join("")
      : `
          <div class="empty-cart">
            <h2>Your bag is empty.</h2>
            <a class="secondary" href="index.html">
              Continue shopping
            </a>
          </div>
        `;
  }

  const total = cart.reduce(
    (sum, product) => sum + Number(product.price || 0),
    0
  );

  if (subtotalEl) subtotalEl.textContent = fmt(total);
  if (grandtotalEl) grandtotalEl.textContent = fmt(total);

  if (payButton) payButton.disabled = !cart.length;
}

function remove(index) {
  if (paymentInProgress) return;
  cart.splice(index, 1);
  save();
  draw();
}

window.remove = remove;

function setStatus(message) {
  if (payStatusEl) payStatusEl.textContent = message;
}

function setBusy(busy) {
  paymentInProgress = busy;

  if (payButton) {
    payButton.disabled = busy || !cart.length;
    payButton.textContent = busy
      ? "PREPARING PAYMENT..."
      : "PROCEED TO SECURE PAYMENT";
  }
}

async function requestPayment(payload) {
  let response;

  try {
    response = await fetch(RAZORPAY_FUNCTION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Payment network error:", error);
    throw new Error(
      "Could not connect to the payment service. Please check your internet connection and try again."
    );
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    console.error("Invalid payment response:", error);
    throw new Error(
      "The payment service returned an unexpected response. Please try again."
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
      data.error ||
      "The payment service could not process this request."
    );
  }

  return data;
}

function ensureRazorpayLoaded() {
  if (typeof window.Razorpay !== "function") {
    throw new Error(
      "The secure payment gateway could not load. Please refresh the page and try again."
    );
  }
}

if (checkoutFormEl) {
  checkoutFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!cart.length || paymentInProgress) return;

    const customer = Object.fromEntries(
      new FormData(checkoutFormEl).entries()
    );

    setBusy(true);
    setStatus("Preparing secure payment...");

    try {
      ensureRazorpayLoaded();

      const order = await requestPayment({
        action: "create_order",
        cart,
        customer
      });

      if (!order.key_id || !order.order_id || !order.amount) {
        throw new Error(
          "The payment service returned incomplete order details."
        );
      }

      let paymentCompleted = false;

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Nazarana",
        description: "An offering with love and respect",
        order_id: order.order_id,

        prefill: {
          name: customer.name || "",
          email: customer.email || "",
          contact: customer.phone || ""
        },

        theme: {
          color: "#6f1d2b"
        },

        handler: async (paymentResponse) => {
          paymentCompleted = true;
          setStatus("Verifying payment...");

          try {
            const verification = await requestPayment({
              action: "verify_payment",
              razorpay_order_id:
                paymentResponse.razorpay_order_id,
              razorpay_payment_id:
                paymentResponse.razorpay_payment_id,
              razorpay_signature:
                paymentResponse.razorpay_signature
            });

            if (!verification.verified) {
              throw new Error("Payment verification was unsuccessful.");
            }

            localStorage.removeItem("nazaranaCart");

            window.location.href =
              "success.html?order=" +
              encodeURIComponent(
                verification.order_number || ""
              );
          } catch (error) {
            console.error("Payment verification error:", error);

            setStatus(
              "Payment may have been received, but verification could not be completed. Please contact Nazarana before attempting another payment."
            );
          }
        },

        modal: {
          ondismiss: () => {
            if (!paymentCompleted) {
              setStatus("Payment was not completed.");
              setBusy(false);
            }
          }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        const description =
          response?.error?.description ||
          "The payment was unsuccessful.";

        setStatus(description);
        setBusy(false);
      });

      razorpay.open();

      setStatus("Complete your payment in the secure Razorpay window.");
    } catch (error) {
      console.error("Payment initiation error:", error);

      setStatus(
        error?.message ||
        "We couldn't start the payment. Please try again."
      );

      setBusy(false);
    }
  });
}

draw();
