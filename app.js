
const products = [
  {code:"festive-0",name:"The Noor Edit",price:4799,img:"assets/Nazarana Diwali Gift Hamper.webp",desc:"Festive curation · Signature presentation"},
  {code:"festive-1",name:"The Mehr Edit",price:4799,img:"assets/Golden Nazarana Diwali Gift Hamper.webp",desc:"A golden festive celebration"},
  {code:"festive-2",name:"The Utsav Edit",price:2499,img:"assets/Elegant Nazarana Diwali Gift Set.webp",desc:"Elegant gifting · Thoughtfully composed"},
  {code:"festive-3",name:"The Riwaayat Edit",price:3499,img:"assets/Luxury Nazarana Diwali Gift Hamper.webp",desc:"Our elevated Diwali signature"}
];

const silverProducts = [
  {code:"silver-0",name:"Shree Ganesha Poojan Thali",price:7499,img:"assets/silver/image3.webp",desc:"Ceremonial silver-coated poojan thali",group:"ritual"},
  {code:"silver-1",name:"Floral Vine Serving Tray",price:5499,img:"assets/silver/image1.webp",desc:"Floral silver-coated serving tray",group:"serveware"},
  {code:"silver-2",name:"Imperial Horse Carriage",price:6999,img:"assets/silver/image2.webp",desc:"Statement horse carriage serveware",group:"carriages"},
  {code:"silver-3",name:"Blush Imperial Carriage",price:7499,img:"assets/silver/image4.webp",desc:"Blush-accented imperial carriage",group:"carriages"},
  {code:"silver-4",name:"Floral Vintage Carriage",price:5499,img:"assets/silver/image5.webp",desc:"Floral vintage carriage serveware",group:"carriages"},
  {code:"silver-5",name:"The Regal Lion Goblets — Set of 2",price:12499,img:"assets/silver/image6.webp",desc:"Lion-detail statement goblets",group:"statement"},
  {code:"silver-6",name:"Baroque Keepsake Frame",price:999,img:"assets/silver/image7.webp",desc:"Ornate silver-coated keepsake frame",group:"frames"},
  {code:"silver-7",name:"Regal Heritage Frame",price:1999,img:"assets/silver/image8.webp",desc:"Statement heritage photo frame",group:"frames"},
  {code:"silver-8",name:"Azure Peacock Bowl",price:2599,img:"assets/silver/image9.webp",desc:"Azure peacock-inspired serving bowl",group:"bowls"},
  {code:"silver-9",name:"Mayura Serving Bowl",price:2499,img:"assets/silver/image10.webp",desc:"Peacock-inspired silver serving bowl",group:"bowls"},
  {code:"silver-10",name:"Sage Peacock Pooja Thali",price:10499,img:"assets/silver/image11.webp",desc:"Sage and silver festive serving ensemble",group:"serveware"},
  {code:"silver-11",name:"Ivory Blossom Tissue Box",price:4499,img:"assets/silver/image12.webp",desc:"Ivory floral silver-coated tissue box",group:"tissue"},
  {code:"silver-12",name:"Sage Blossom Tissue Box",price:4699,img:"assets/silver/image13.webp",desc:"Sage floral silver-coated tissue box",group:"tissue"},
  {code:"silver-13",name:"Azure Blossom Tissue Box",price:4699,img:"assets/silver/image14.webp",desc:"Azure floral silver-coated tissue box",group:"tissue"},
  {code:"silver-14",name:"Amber Blossom Tissue Box",price:4699,img:"assets/silver/image15.webp",desc:"Amber floral silver-coated tissue box",group:"tissue"},
  {code:"silver-15",name:"Gajraj Heritage Urli",price:4799,img:"assets/silver/image16.webp",desc:"Elephant-motif tiered heritage urli",group:"statement"},
  {code:"silver-16",name:"Mayura Amber Serving Bowl",price:3099,img:"assets/silver/image17.webp",desc:"Mayura bowl with warm amber detailing",group:"bowls"},
  {code:"silver-17",name:"Royal Mayura Filigree Serveware",price:6799,img:"assets/silver/image18.webp",desc:"Royal peacock filigree serveware",group:"bowls"},
  {code:"silver-18",name:"Floral Heritage Frame",price:1299,img:"assets/silver/image19.webp",desc:"Floral silver-coated heritage frame",group:"frames"},
  {code:"silver-19",name:"Rosette Heritage Frame",price:1299,img:"assets/silver/image20.webp",desc:"Rosette and songbird heritage frame",group:"frames"}
];

const catalogue = [...products, ...silverProducts];
const byCode = new Map(catalogue.map(p => [p.code, p]));

const fmt = n => "₹" + Number(n || 0).toLocaleString("en-IN");

const escapeHTML = value => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("nazaranaCart") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function reconcileItem(item) {
  if (!item || typeof item !== "object") {
    return {name:"Unrecognised item",unavailable:true};
  }

  let match = null;

  if (item.code && byCode.has(item.code)) {
    const candidate = byCode.get(item.code);

    // Prevent a previously reused code from selecting
    // a different product.
    if (item.name === candidate.name) {
      match = candidate;
    }
  }

  // Recover older carts that did not save product codes.
  if (!match && !item.code) {
    match = catalogue.find(p =>
      p.name === item.name && p.img === item.img
    ) || null;
  }

  return match
    ? {...match}
    : {...item,unavailable:true};
}

let cart = loadCart().map(reconcileItem);

function save() {
  try {
    localStorage.setItem("nazaranaCart", JSON.stringify(cart));
  } catch (error) {
    console.error("Unable to save bag:", error);
  }
}

save();

const grid = document.getElementById("products");

if (grid) {
  grid.innerHTML = products.map((p,i) => `
    <article class="card">
      <a class="product-link" href="product.html?type=festive&id=${i}">
        <img src="${p.img}" alt="${escapeHTML(p.name)}">
      </a>
      <div class="card-row">
        <div>
          <h3>${escapeHTML(p.name)}</h3>
          <p>${escapeHTML(p.desc)}</p>
          <strong>${fmt(p.price)}</strong>
        </div>
        <button class="add" onclick="add(${i})">Add to bag</button>
      </div>
    </article>
  `).join("");
}

const silverGrid = document.getElementById("silverProducts");

const groups = [
  {key:"ritual",label:"Sacred Gifting",title:"For auspicious beginnings",layout:"single"},
  {key:"serveware",label:"Statement Serveware",title:"Made for the centre of the table",layout:"pair"},
  {key:"carriages",label:"The Carriage Edit",title:"Sculptural pieces with presence",layout:"wide"},
  {key:"bowls",label:"The Mayura Edit",title:"Peacock-inspired serveware",layout:"four"},
  {key:"tissue",label:"The Blossom Edit",title:"A palette of refined details",layout:"four"},
  {key:"frames",label:"Heritage Frames",title:"Keepsakes, beautifully framed",layout:"four portrait"},
  {key:"statement",label:"Collector’s Pieces",title:"Designed to be remembered",layout:"pair"}
];

function silverCard(p) {
  const i = silverProducts.indexOf(p);

  return `
    <article class="silver-card">
      <a class="product-link" href="product.html?type=silver&id=${i}">
        <div class="silver-media">
          <img src="${p.img}" alt="${escapeHTML(p.name)}" loading="lazy">
        </div>
      </a>
      <div class="silver-info">
        <div>
          <h3>${escapeHTML(p.name)}</h3>
          <p>${escapeHTML(p.desc)}</p>
          <strong>${fmt(p.price)}</strong>
        </div>
        <button class="add" onclick="addSilver(${i})">Add to bag</button>
      </div>
    </article>
  `;
}

if (silverGrid) {
  silverGrid.innerHTML = groups.map(g => {
    const items = silverProducts.filter(p => p.group === g.key);

    return `
      <section class="silver-group ${g.layout}">
        <div class="silver-group-head">
          <p class="eyebrow">${g.label}</p>
          <h3>${g.title}</h3>
        </div>
        <div class="silver-row">${items.map(silverCard).join("")}</div>
      </section>
    `;
  }).join("");
}

const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");

function add(i) {
  if (!products[i]) return;
  cart.push({...products[i]});
  save();
  render();
  openBag();
}

function addSilver(i) {
  if (!silverProducts[i]) return;
  cart.push({...silverProducts[i]});
  save();
  render();
  openBag();
}

function removeItem(i) {
  cart.splice(i,1);
  save();
  render();
}

function render() {
  const count = document.getElementById("count");
  const cartContainer = document.getElementById("cart");
  const total = document.getElementById("total");

  if (count) count.textContent = cart.length;

  if (cartContainer) {
    cartContainer.innerHTML = cart.length
      ? cart.map((p,i) => `
          <div class="cart-item">
            ${p.unavailable ? "" : `<img src="${p.img}" alt="">`}
            <div>
              <h4>${escapeHTML(p.name)}</h4>
              <p>${p.unavailable
                ? "Product needs review before checkout"
                : fmt(p.price)}</p>
              <button class="add" onclick="removeItem(${i})">Remove</button>
            </div>
          </div>
        `).join("")
      : '<p style="padding:30px 0;color:#777">Your bag is waiting for something thoughtful.</p>';
  }

  if (total) {
    total.textContent = fmt(cart.reduce(
      (sum,p) => sum + (p.unavailable ? 0 : Number(p.price || 0)),
      0
    ));
  }
}

function openBag() {
  drawer?.classList.add("open");
  overlay?.classList.add("open");
}

function closeBag() {
  drawer?.classList.remove("open");
  overlay?.classList.remove("open");
}

const bagBtn = document.getElementById("bagBtn");
const closeBtn = document.getElementById("close");
const checkoutBtn = document.getElementById("checkout");

if (bagBtn) bagBtn.onclick = openBag;
if (closeBtn) closeBtn.onclick = closeBag;
if (overlay) overlay.onclick = closeBag;

if (checkoutBtn) {
  checkoutBtn.onclick = () => {
    if (!cart.length) {
      alert("Add a gift to your bag first.");
    } else if (cart.some(p => p.unavailable)) {
      alert("One or more saved gifts need review. Please remove unavailable items before checkout.");
    } else {
      location.href = "cart.html";
    }
  };
}

render();

/* CORPORATE NAVIGATION DROPDOWN */

const corporateDropdown = document.querySelector(".nav-dropdown");
const corporateTrigger = document.querySelector(".nav-dropdown-trigger");

if (corporateDropdown && corporateTrigger) {
  corporateTrigger.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    const isOpen = corporateDropdown.classList.toggle("open");
    corporateTrigger.setAttribute("aria-expanded",String(isOpen));
  });

  document.addEventListener("click", event => {
    if (!corporateDropdown.contains(event.target)) {
      corporateDropdown.classList.remove("open");
      corporateTrigger.setAttribute("aria-expanded","false");
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      corporateDropdown.classList.remove("open");
      corporateTrigger.setAttribute("aria-expanded","false");
      corporateTrigger.blur();
    }
  });

  corporateDropdown.querySelectorAll(".nav-dropdown-menu a")
    .forEach(link => {
      link.addEventListener("click",() => {
        corporateDropdown.classList.remove("open");
        corporateTrigger.setAttribute("aria-expanded","false");
      });
    });
}
