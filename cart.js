
const RAZORPAY_FUNCTION =
  "https://seogmslimxytpeoynath.supabase.co/functions/v1/razorpay-payment";

const $ = id => document.getElementById(id);

const countEl = $("count");
const cartItemsEl = $("cartItems");
const subtotalEl = $("subtotal");
const grandtotalEl = $("grandtotal");
const checkoutFormEl = $("checkoutForm");
const payStatusEl = $("payStatus");
const payButton = checkoutFormEl?.querySelector('button[type="submit"]');

const fmt = n => "₹" + Number(n || 0).toLocaleString("en-IN");

const escapeHTML = value => String(value ?? "")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#39;");

// Permanent product identities, matching Supabase.
// Each entry: code, name, price, image.
const catalogueRows = [
  ["festive-0","The Noor Edit",4799,"assets/Nazarana Diwali Gift Hamper.webp"],
  ["festive-1","The Mehr Edit",4799,"assets/Golden Nazarana Diwali Gift Hamper.webp"],
  ["festive-2","The Utsav Edit",2499,"assets/Elegant Nazarana Diwali Gift Set.webp"],
  ["festive-3","The Riwaayat Edit",3499,"assets/Luxury Nazarana Diwali Gift Hamper.webp"],
  ["silver-0","Shree Ganesha Poojan Thali",7499,"assets/silver/image3.webp"],
  ["silver-1","Floral Vine Serving Tray",5499,"assets/silver/image1.webp"],
  ["silver-2","Imperial Horse Carriage",6999,"assets/silver/image2.webp"],
  ["silver-3","Blush Imperial Carriage",7499,"assets/silver/image4.webp"],
  ["silver-4","Floral Vintage Carriage",5499,"assets/silver/image5.webp"],
  ["silver-5","The Regal Lion Goblets — Set of 2",12499,"assets/silver/image6.webp"],
  ["silver-6","Baroque Keepsake Frame",999,"assets/silver/image7.webp"],
  ["silver-7","Regal Heritage Frame",1999,"assets/silver/image8.webp"],
  ["silver-8","Azure Peacock Bowl",2599,"assets/silver/image9.webp"],
  ["silver-9","Mayura Serving Bowl",2499,"assets/silver/image10.webp"],
  ["silver-10","Sage Peacock Pooja Thali",10499,"assets/silver/image11.webp"],
  ["silver-11","Ivory Blossom Tissue Box",4499,"assets/silver/image12.webp"],
  ["silver-12","Sage Blossom Tissue Box",4699,"assets/silver/image13.webp"],
  ["silver-13","Azure Blossom Tissue Box",4699,"assets/silver/image14.webp"],
  ["silver-14","Amber Blossom Tissue Box",4699,"assets/silver/image15.webp"],
  ["silver-15","Gajraj Heritage Urli",4799,"assets/silver/image16.webp"],
  ["silver-16","Mayura Amber Serving Bowl",3099,"assets/silver/image17.webp"],
  ["silver-17","Royal Mayura Filigree Serveware",6799,"assets/silver/image18.webp"],
  ["silver-18","Floral Heritage Frame",1299,"assets/silver/image19.webp"],
  ["silver-19","Rosette Heritage Frame",1299,"assets/silver/image20.webp"]
];

const catalogue = catalogueRows.map(([code,name,price,img]) =>
  ({code,name,price,img})
);

const byCode = new Map(catalogue.map(p => [p.code,p]));

let cart = [];
let priceUpdated = false;
let paymentInProgress = false;

try {
  const saved = JSON.parse(localStorage.getItem("nazaranaCart") || "[]");

  if (Array.isArray(saved)) {
    cart = saved.map(item => {
      if (!item || typeof item !== "object") {
        return {name:"Unrecognised item",unavailable:true};
      }

      let current = null;

      if (item.code && byCode.has(item.code)) {
        const candidate = byCode.get(item.code);
        if (candidate.name === item.name) {
          current = candidate;
        }
      }

      if (!current && !item.code) {
        current = catalogue.find(p =>
          p.name === item.name && p.img === item.img
        ) || null;
      }

      if (!current) {
        return {...item,unavailable:true};
      }

      if (Number(item.price) !== current.price) {
        priceUpdated = true;
      }

      return {...item,...current,unavailable:false};
    });
  }
} catch (error) {
  console.error("Saved bag could not be read:",error);
}

function save() {
  try {
    localStorage.setItem("nazaranaCart",JSON.stringify(cart));
  } catch (error) {
    console.error("Bag could not be saved:",error);
  }
}

function setStatus(message) {
  if (payStatusEl) payStatusEl.textContent = message;
}

function hasUnavailable() {
  return cart.some(p => p.unavailable);
}

function setBusy(busy) {
  paymentInProgress = busy;

  if (payButton) {
    payButton.disabled = busy || !cart.length || hasUnavailable();
    payButton.textContent = busy
      ? "PREPARING PAYMENT..."
      : "PROCEED TO SECURE PAYMENT";
  }
}

function draw() {
  if (countEl) countEl.textContent = String(cart.length);

  if (cartItemsEl) {
    cartItemsEl.innerHTML = cart.length
      ? cart.map((p,i) => `
          <article class="cart-row">
            ${p.unavailable ? "" :
              `<img src="${escapeHTML(p.img)}" alt="${escapeHTML(p.name)}">`}
            <div>
              <h3>${escapeHTML(p.name)}</h3>
              <p>${p.unavailable
                ? "Unavailable or unrecognised product"
                : fmt(p.price)}</p>
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
    (sum,p) => sum + (p.unavailable ? 0 : Number(p.price || 0)),
    0
  );

  if (subtotalEl) subtotalEl.textContent = fmt(total);
  if (grandtotalEl) grandtotalEl.textContent = fmt(total);

  setBusy(false);

  if (hasUnavailable()) {
    setStatus(
      "Some saved gifts are no longer recognised. They remain in your bag, but must be removed before checkout."
    );
  } else if (priceUpdated) {
    setStatus(
      "Your bag has been updated with the latest listed prices. Please review your total before payment."
    );
  } else {
    setStatus("");
  }
}

function remove(index) {
  if (paymentInProgress) return;
  cart.splice(index,1);
  save();
  draw();
}

window.remove = remove;

async function requestPayment(payload) {
  let response;

  try {
    response = await fetch(RAZORPAY_FUNCTION,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Payment connection error:",error);
    throw new Error(
      "Could not connect to the payment service. Please check your connection."
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The payment service returned an invalid response.");
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || result.error || "Unable to prepare payment."
    );
  }

  return result;
}

if (checkoutFormEl) {
  checkoutFormEl.addEventListener("submit",async event => {
    event.preventDefault();

    if (!cart.length || hasUnavailable() || paymentInProgress) return;

    if (typeof window.Razorpay !== "function") {
      setStatus("The secure payment gateway did not load. Please refresh.");
      return;
    }

    const customer = Object.fromEntries(
      new FormData(checkoutFormEl).entries()
    );

    setBusy(true);
    setStatus("Preparing secure payment...");

    try {
      const order = await requestPayment({
        action:"create_order",
        cart:cart.map(p => ({code:p.code})),
        customer
      });

      if (!order.key_id || !order.order_id || !order.amount) {
        throw new Error("Incomplete payment order details.");
      }

      let paymentCompleted = false;

      const razorpay = new window.Razorpay({
        key:order.key_id,
        amount:order.amount,
        currency:order.currency || "INR",
        name:"Nazarana",
        description:"An offering with love and respect",
        order_id:order.order_id,

        prefill:{
          name:customer.name || "",
          email:customer.email || "",
          contact:customer.phone || ""
        },

        theme:{color:"#6f1d2b"},

        handler:async paymentResponse => {
          paymentCompleted = true;
          setStatus("Verifying payment...");

          try {
            const verification = await requestPayment({
              action:"verify_payment",
              razorpay_order_id:paymentResponse.razorpay_order_id,
              razorpay_payment_id:paymentResponse.razorpay_payment_id,
              razorpay_signature:paymentResponse.razorpay_signature
            });

            if (!verification.verified) {
              throw new Error("Payment verification was unsuccessful.");
            }

            localStorage.removeItem("nazaranaCart");

            location.href = "success.html?order=" +
              encodeURIComponent(verification.order_number || "");

          } catch (error) {
            console.error("Verification error:",error);
            setStatus(
              "Payment may have been received, but verification could not be completed. Please contact Nazarana before attempting another payment."
            );
          }
        },

        modal:{
          ondismiss:() => {
            if (!paymentCompleted) {
              setStatus("Payment was not completed.");
              setBusy(false);
            }
          }
        }
      });

      razorpay.on("payment.failed",response => {
        setStatus(
          response?.error?.description ||
          "Payment was unsuccessful. Please try again."
        );
        setBusy(false);
      });

      razorpay.open();
      setStatus("Complete your payment in the Razorpay window.");

    } catch (error) {
      console.error("Checkout error:",error);
      setStatus(error.message || "Unable to start payment.");
      setBusy(false);
    }
  });
}

save();
draw();
