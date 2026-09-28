let cart = JSON.parse(
  localStorage.getItem("nazaranaCart") || "[]"
);

const RAZORPAY_FUNCTION =
  "https://seogmslimxytpeoynath.supabase.co/functions/v1/razorpay-payment";

const fmt = (n) =>
  "₹" + n.toLocaleString("en-IN");

const save = () =>
  localStorage.setItem(
    "nazaranaCart",
    JSON.stringify(cart)
  );

function draw() {
  count.textContent = cart.length;

  cartItems.innerHTML = cart.length
    ? cart
        .map(
          (p, i) => `
            <article class="cart-row">
              <img src="${p.img}">
              <div>
                <h3>${p.name}</h3>
                <p>${fmt(p.price)}</p>
                <button onclick="remove(${i})">
                  Remove
                </button>
              </div>
            </article>
          `
        )
        .join("")
    : `
        <div class="empty-cart">
          <h2>Your bag is empty.</h2>
          <a class="secondary" href="index.html">
            Continue shopping
          </a>
        </div>
      `;

  const total = cart.reduce(
    (sum, product) =>
      sum + Number(product.price || 0),
    0
  );

  subtotal.textContent =
    grandtotal.textContent =
      fmt(total);
}

function remove(i) {
  cart.splice(i, 1);
  save();
  draw();
}

draw();

checkoutForm.onsubmit = async (e) => {
  e.preventDefault();

  if (!cart.length) return;

  const customer =
    Object.fromEntries(
      new FormData(checkoutForm)
    );

  const total = cart.reduce(
    (sum, product) =>
      sum + Number(product.price || 0),
    0
  );

  payStatus.textContent =
    "Preparing secure payment…";

  try {
    const response = await fetch(
      RAZORPAY_FUNCTION,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_order",
          amount_inr: total,
        }),
      }
    );

    const order = await response.json();

    if (!response.ok || !order.success) {
      throw new Error(
        order.message ||
          "Order creation failed"
      );
    }

    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency || "INR",

      name: "Nazarana",

      description:
        "An offering with love and respect",

      order_id: order.order_id,

      prefill: {
        name: customer.name || "",
        email: customer.email || "",
        contact: customer.phone || "",
      },

      theme: {
        color: "#6f1d2b",
      },

      handler: async (paymentResponse) => {
        payStatus.textContent =
          "Verifying payment…";

        try {
          const verifyResponse =
            await fetch(
              RAZORPAY_FUNCTION,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  action: "verify_payment",

                  razorpay_order_id:
                    paymentResponse
                      .razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse
                      .razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse
                      .razorpay_signature,
                }),
              }
            );

          const verification =
            await verifyResponse.json();

          if (
            !verifyResponse.ok ||
            !verification.success ||
            !verification.verified
          ) {
            throw new Error(
              verification.message ||
                "Payment verification failed"
            );
          }

          localStorage.removeItem(
            "nazaranaCart"
          );

          location.href =
            "success.html?order=" +
            encodeURIComponent(
              verification.order_id
            );
        } catch (error) {
          console.error(error);

          payStatus.textContent =
            "Payment received, but verification could not be completed. Please contact Nazarana before attempting another payment.";
        }
      },

      modal: {
        ondismiss: function () {
          payStatus.textContent =
            "Payment was not completed.";
        },
      },
    };

    if (typeof Razorpay === "undefined") {
      throw new Error(
        "Razorpay Checkout is not loaded."
      );
    }

    const razorpay =
      new Razorpay(options);

    razorpay.open();
  } catch (error) {
    console.error(error);

    payStatus.textContent =
      "We couldn't start the payment. Please try again.";
  }
};
