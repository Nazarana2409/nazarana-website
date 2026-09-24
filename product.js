const festive=[{name:'The Noor Edit',price:4799,img:'assets/Nazarana Diwali Gift Hamper.webp',desc:'A festive curation, thoughtfully composed for warm celebrations.'},{name:'The Mehr Edit',price:4799,img:'assets/Golden Nazarana Diwali Gift Hamper.webp',desc:'A luminous festive selection with an elegant golden mood.'},{name:'The Utsav Edit',price:2499,img:'assets/Elegant Nazarana Diwali Gift Set.webp',desc:'A refined festive gift, designed for thoughtful giving.'},{name:'The Riwaayat Edit',price:3699,img:'assets/Luxury Nazarana Diwali Gift Hamper.webp',desc:'A signature festive curation inspired by the warmth of tradition.'}];
const silver=[
{name:'Shree Ganesha Poojan Thali',price:7499,img:'assets/silver/image3.webp',desc:'An ornate ceremonial poojan thali centred around Shree Ganesha.'},
{name:'Floral Vine Serving Tray',price:5499,img:'assets/silver/image1.webp',desc:'An elegant serving tray detailed with delicate floral vines.'},
{name:'Imperial Horse Carriage',price:6999,img:'assets/silver/image2.webp',desc:'A sculptural horse carriage serveware piece with regal detailing.'},
{name:'Blush Imperial Carriage',price:7499,img:'assets/silver/image4.webp',desc:'A blush-accented carriage designed as a memorable statement gift.'},
{name:'Floral Vintage Carriage',price:5499,img:'assets/silver/image5.webp',desc:'A vintage-inspired floral carriage with graceful detailing.'},
{name:'The Regal Lion Goblets — Set of 2',price:12499,img:'assets/silver/image6.webp',desc:'A pair of statement goblets finished with regal lion motifs.'},
{name:'Baroque Keepsake Frame',price:999,img:'assets/silver/image7.webp',desc:'An ornate baroque-style frame for treasured photographs.'},
{name:'Regal Heritage Frame',price:1999,img:'assets/silver/image8.webp',desc:'A richly detailed heritage frame with timeless character.'},
{name:'Azure Peacock Bowl',price:2599,img:'assets/silver/image9.webp',desc:'A peacock-inspired serving bowl accented in luminous azure.'},
{name:'Mayura Serving Bowl',price:2499,img:'assets/silver/image10.webp',desc:'A graceful peacock-inspired bowl for serving or display.'},
{name:'Sage Peacock Serving Set',price:10499,img:'assets/silver/image11.webp',desc:'A coordinated sage and silver serving ensemble for festive tables.'},
{name:'Ivory Blossom Tissue Box',price:4499,img:'assets/silver/image12.webp',desc:'An ivory tissue box finished with delicate floral ornamentation.'},
{name:'Sage Blossom Tissue Box',price:4699,img:'assets/silver/image13.webp',desc:'A sage-toned tissue box with elegant blossom detailing.'},
{name:'Azure Blossom Tissue Box',price:4699,img:'assets/silver/image14.webp',desc:'An azure tissue box with refined silver floral accents.'},
{name:'Amber Blossom Tissue Box',price:4699,img:'assets/silver/image15.webp',desc:'A warm amber tissue box with ornate blossom detailing.'},
{name:'Gajraj Heritage Urli',price:4799,img:'assets/silver/image16.webp',desc:'A tiered heritage urli elevated by sculpted elephant motifs.'},
{name:'Mayura Amber Serving Bowl',price:3099,img:'assets/silver/image17.webp',desc:'A Mayura-inspired bowl with warm amber accents.'},
{name:'Royal Mayura Filigree Serveware',price:6799,img:'assets/silver/image18.webp',desc:'Intricate peacock filigree serveware made for statement gifting.'},
{name:'Floral Heritage Frame',price:1299,img:'assets/silver/image19.webp',desc:'An oval heritage frame surrounded by sculpted florals.'},
{name:'Rosette Heritage Frame',price:1299,img:'assets/silver/image20.webp',desc:'A romantic heritage frame with roses and songbird details.'}];
const q=new URLSearchParams(location.search), type=q.get('type')||'silver', id=Number(q.get('id')||0), p=(type==='festive'?festive:silver)[id];
if(!p) location.href='index.html'; const fmt=n=>'₹'+n.toLocaleString('en-IN');
document.title=p.name+' — Nazarana'; pimg.src=p.img;pimg.alt=p.name;pname.textContent=p.name;pprice.textContent=fmt(p.price);pdesc.textContent=p.desc;
let cart=JSON.parse(localStorage.getItem('nazaranaCart')||'[]'); count.textContent=cart.length;padd.onclick=()=>{cart.push(p);localStorage.setItem('nazaranaCart',JSON.stringify(cart));count.textContent=cart.length;padd.textContent='Added to Bag';setTimeout(()=>padd.textContent='Add to Bag',1200)};
