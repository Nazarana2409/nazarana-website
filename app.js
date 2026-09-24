const products=[
{name:'The Noor Edit',price:4799,img:'assets/Nazarana Diwali Gift Hamper.webp',desc:'Festive curation · Signature presentation'},
{name:'The Mehr Edit',price:4799,img:'assets/Golden Nazarana Diwali Gift Hamper.webp',desc:'A golden festive celebration'},
{name:'The Utsav Edit',price:2499,img:'assets/Elegant Nazarana Diwali Gift Set.webp',desc:'Elegant gifting · Thoughtfully composed'},
{name:'The Riwaayat Edit',price:3499,img:'assets/Luxury Nazarana Diwali Gift Hamper.webp',desc:'Our elevated Diwali signature'}];

const silverProducts=[
{name:'Shree Ganesha Poojan Thali',price:7499,img:'assets/silver/image3.webp',desc:'Ceremonial silver-coated poojan thali',group:'ritual'},
{name:'Floral Vine Serving Tray',price:5499,img:'assets/silver/image1.webp',desc:'Floral silver-coated serving tray',group:'serveware'},
{name:'Imperial Horse Carriage',price:6999,img:'assets/silver/image2.webp',desc:'Statement horse carriage serveware',group:'carriages'},
{name:'Blush Imperial Carriage',price:7499,img:'assets/silver/image4.webp',desc:'Blush-accented imperial carriage',group:'carriages'},
{name:'Floral Vintage Carriage',price:5499,img:'assets/silver/image5.webp',desc:'Floral vintage carriage serveware',group:'carriages'},
{name:'The Regal Lion Goblets — Set of 2',price:12499,img:'assets/silver/image6.webp',desc:'Lion-detail statement goblets',group:'statement'},
{name:'Baroque Keepsake Frame',price:999,img:'assets/silver/image7.webp',desc:'Ornate silver-coated keepsake frame',group:'frames'},
{name:'Regal Heritage Frame',price:1999,img:'assets/silver/image8.webp',desc:'Statement heritage photo frame',group:'frames'},
{name:'Azure Peacock Bowl',price:2599,img:'assets/silver/image9.webp',desc:'Azure peacock-inspired serving bowl',group:'bowls'},
{name:'Mayura Serving Bowl',price:2499,img:'assets/silver/image10.webp',desc:'Peacock-inspired silver serving bowl',group:'bowls'},
{name:'Sage Peacock Pooja Thali',price:10499,img:'assets/silver/image11.webp',desc:'Sage and silver festive serving ensemble',group:'serveware'},
{name:'Ivory Blossom Tissue Box',price:4499,img:'assets/silver/image12.webp',desc:'Ivory floral silver-coated tissue box',group:'tissue'},
{name:'Sage Blossom Tissue Box',price:4699,img:'assets/silver/image13.webp',desc:'Sage floral silver-coated tissue box',group:'tissue'},
{name:'Azure Blossom Tissue Box',price:4699,img:'assets/silver/image14.webp',desc:'Azure floral silver-coated tissue box',group:'tissue'},
{name:'Amber Blossom Tissue Box',price:4699,img:'assets/silver/image15.webp',desc:'Amber floral silver-coated tissue box',group:'tissue'},
{name:'Gajraj Heritage Urli',price:4799,img:'assets/silver/image16.webp',desc:'Elephant-motif tiered heritage urli',group:'statement'},
{name:'Mayura Amber Serving Bowl',price:3099,img:'assets/silver/image17.webp',desc:'Mayura bowl with warm amber detailing',group:'bowls'},
{name:'Royal Mayura Filigree Serveware',price:6799,img:'assets/silver/image18.webp',desc:'Royal peacock filigree serveware',group:'bowls'},
{name:'Floral Heritage Frame',price:1299,img:'assets/silver/image19.webp',desc:'Floral silver-coated heritage frame',group:'frames'},
{name:'Rosette Heritage Frame',price:1299,img:'assets/silver/image20.webp',desc:'Rosette and songbird heritage frame',group:'frames'}];

let cart=JSON.parse(localStorage.getItem('nazaranaCart')||'[]');const fmt=n=>'₹'+n.toLocaleString('en-IN');
const grid=document.getElementById('products');grid.innerHTML=products.map((p,i)=>`<article class="card"><a class="product-link" href="product.html?type=festive&id=${i}"><img src="${p.img}" alt="${p.name}"></a><div class="card-row"><div><h3>${p.name}</h3><p>${p.desc}</p><strong>${fmt(p.price)}</strong></div><button class="add" onclick="add(${i})">Add to bag</button></div></article>`).join('');

const silverGrid=document.getElementById('silverProducts');
const groups=[
 {key:'ritual',label:'Sacred Gifting',title:'For auspicious beginnings',layout:'single'},
 {key:'serveware',label:'Statement Serveware',title:'Made for the centre of the table',layout:'pair'},
 {key:'carriages',label:'The Carriage Edit',title:'Sculptural pieces with presence',layout:'wide'},
 {key:'bowls',label:'The Mayura Edit',title:'Peacock-inspired serveware',layout:'four'},
 {key:'tissue',label:'The Blossom Edit',title:'A palette of refined details',layout:'four'},
 {key:'frames',label:'Heritage Frames',title:'Keepsakes, beautifully framed',layout:'four portrait'},
 {key:'statement',label:'Collector’s Pieces',title:'Designed to be remembered',layout:'pair'}
];
function silverCard(p){const i=silverProducts.indexOf(p);return `<article class="silver-card"><a class="product-link" href="product.html?type=silver&id=${i}"><div class="silver-media"><img src="${p.img}" alt="${p.name}" loading="lazy"></div></a><div class="silver-info"><div><h3>${p.name}</h3><p>${p.desc}</p><strong>${fmt(p.price)}</strong></div><button class="add" onclick="addSilver(${i})">Add to bag</button></div></article>`}
silverGrid.innerHTML=groups.map(g=>{const items=silverProducts.filter(p=>p.group===g.key);return `<section class="silver-group ${g.layout}"><div class="silver-group-head"><p class="eyebrow">${g.label}</p><h3>${g.title}</h3></div><div class="silver-row">${items.map(silverCard).join('')}</div></section>`}).join('');
function save(){localStorage.setItem('nazaranaCart',JSON.stringify(cart))}function add(i){cart.push(products[i]);save();render();openBag()}function addSilver(i){cart.push(silverProducts[i]);save();render();openBag()}function render(){document.getElementById('count').textContent=cart.length;document.getElementById('cart').innerHTML=cart.length?cart.map((p,i)=>`<div class="cart-item"><img src="${p.img}"><div><h4>${p.name}</h4><p>${fmt(p.price)}</p><button class="add" onclick="removeItem(${i})">Remove</button></div></div>`).join(''):'<p style="padding:30px 0;color:#777">Your bag is waiting for something thoughtful.</p>';document.getElementById('total').textContent=fmt(cart.reduce((s,p)=>s+p.price,0))}function removeItem(i){cart.splice(i,1);save();render()}function openBag(){drawer.classList.add('open');overlay.classList.add('open')}function closeBag(){drawer.classList.remove('open');overlay.classList.remove('open')}const drawer=document.getElementById('drawer'),overlay=document.getElementById('overlay');document.getElementById('bagBtn').onclick=openBag;document.getElementById('close').onclick=closeBag;overlay.onclick=closeBag;document.getElementById('checkout').onclick=()=>{if(cart.length) location.href='cart.html'; else alert('Add a gift to your bag first.')};render();
