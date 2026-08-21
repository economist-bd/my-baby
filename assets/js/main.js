/* main.js — সব পাবলিক পেইজের জন্য শেয়ার্ড UI লজিক */

const MASCOT_SVG = `<svg viewBox="0 0 100 100" class="mascot" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="52" r="34" fill="#FFC93C" stroke="#2D2A4A" stroke-width="4"/>
  <path d="M22 40 L14 20 L36 32 Z" fill="#FF6F59" stroke="#2D2A4A" stroke-width="4" stroke-linejoin="round"/>
  <path d="M78 40 L86 20 L64 32 Z" fill="#FF6F59" stroke="#2D2A4A" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="38" cy="50" r="7" fill="#fff" stroke="#2D2A4A" stroke-width="3"/>
  <circle cx="62" cy="50" r="7" fill="#fff" stroke="#2D2A4A" stroke-width="3"/>
  <circle cx="38" cy="50" r="2.6" fill="#2D2A4A"/>
  <circle cx="62" cy="50" r="2.6" fill="#2D2A4A"/>
  <path d="M45 62 Q50 68 55 62" stroke="#2D2A4A" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;

function pathPrefix(){
  return location.pathname.includes("/pages/") || location.pathname.includes("/admin") ? "../" : "";
}

async function renderHeader(activeSlug){
  const root = document.getElementById("site-header");
  if(!root) return;
  const prefix = pathPrefix();
  const menu = await Store.getMenu();
  const settings = await Store.getSettings();

  const itemHtml = (item) => {
    const hasChildren = item.children && item.children.length;
    const isActive = activeSlug && item.link.includes(activeSlug);
    return `<li class="${isActive?'active':''}">
      <a href="${item.link.replace(/^\//,'').startsWith('index')?prefix+'index.html':(item.link.startsWith('/')? prefix+item.link.slice(1): item.link)}">
        ${item.label} ${hasChildren?'<span>▾</span>':''}
      </a>
      ${hasChildren?`<div class="dropdown">${item.children.map(c=>`<a href="${prefix+c.link.replace(/^\//,'')}">${c.label}</a>`).join('')}</div>`:''}
    </li>`;
  };

  root.innerHTML = `
  <div class="nav-wrap">
    <a href="${prefix}index.html" class="brand">
      ${MASCOT_SVG}
      <span>${settings.siteName||'রঙিন দুনিয়া'}<span class="tag">${settings.tagline||'শিশুদের রঙিন শেখার জগৎ'}</span></span>
    </a>
    <ul class="nav-links" id="navLinks">
      ${menu.map(itemHtml).join('')}
    </ul>
    <div class="nav-actions">
      <button class="btn btn-primary btn-sm no-print" onclick="window.print()">🖨️ প্রিন্ট</button>
      <button class="burger" id="burgerBtn" aria-label="মেনু খুলুন">☰</button>
    </div>
  </div>`;

  document.getElementById("burgerBtn").addEventListener("click", ()=>{
    document.getElementById("navLinks").classList.toggle("mobile-open");
  });
  document.querySelectorAll(".nav-links > li").forEach(li=>{
    const link = li.querySelector(":scope > a");
    if(li.querySelector(".dropdown")){
      link.addEventListener("click",(e)=>{
        if(window.innerWidth <= 900){ e.preventDefault(); li.classList.toggle("open"); }
      });
    }
  });
}

async function renderFooter(){
  const root = document.getElementById("site-footer");
  if(!root) return;
  const prefix = pathPrefix();
  const pages = await Store.getPages();
  const settings = await Store.getSettings();
  const visible = pages.filter(p=>!p.hidden);
  const half = Math.ceil(visible.length/2);

  root.innerHTML = `
  <div class="container footer-grid">
    <div>
      <div class="footer-brand">${MASCOT_SVG}${settings.siteName||'রঙিন দুনিয়া'}</div>
      <p style="max-width:34ch; color:rgba(255,255,255,.7); font-size:.92rem;">${settings.tagline||'বাংলাদেশের শিশুদের জন্য গল্প, বিজ্ঞান, ছড়া আর আঁকিবুঁকির এক রঙিন ঠিকানা।'}</p>
      <div class="social-row">
        <a href="#" aria-label="ফেসবুক">📘</a>
        <a href="#" aria-label="ইউটিউব">▶️</a>
        <a href="#" aria-label="ইনস্টাগ্রাম">📷</a>
      </div>
    </div>
    <div>
      <h4>বিভাগসমূহ</h4>
      ${visible.slice(0,half).map(p=>`<a href="${prefix}pages/${p.slug}.html">${p.icon} ${p.title}</a>`).join('')}
    </div>
    <div>
      <h4>আরও দেখুন</h4>
      ${visible.slice(half).map(p=>`<a href="${prefix}pages/${p.slug}.html">${p.icon} ${p.title}</a>`).join('')}
    </div>
    <div>
      <h4>প্রশাসন</h4>
      <a href="${prefix}admin.html">⚙️ অ্যাডমিন প্যানেল</a>
      <a href="${prefix}pages/contact.html">✉️ যোগাযোগ করুন</a>
    </div>
  </div>
  <div class="foot-bottom">© ${new Date().getFullYear()} ${settings.siteName||'রঙিন দুনিয়া'} — সকল স্বত্ব সংরক্ষিত। তৈরি হয়েছে ভালোবাসা দিয়ে 💛</div>`;
}

function catIcon(slug){
  const map = {stories:"📖",science:"🔬",rhymes:"🎵",art:"🎨",games:"⚽",videos:"🎬",gallery:"🖼️"};
  return map[slug] || "✨";
}

function timeAgo(iso){
  const d = new Date(iso);
  return d.toLocaleDateString("bn-BD", {day:"numeric", month:"long", year:"numeric"});
}

function postCardHtml(post, prefix){
  return `<a href="${prefix}pages/post.html?id=${post.id}" class="post-card">
    <div class="thumb">${post.cover ? `<img src="${post.cover}" alt="${post.title}">` : catIcon(post.category)}</div>
    <div class="body">
      <div class="meta"><span>${catIcon(post.category)} ${post.category}</span><span>·</span><span>${timeAgo(post.date)}</span></div>
      <h3>${post.title}</h3>
      <p>${post.excerpt||''}</p>
      <div class="tags"><span class="pill">বিস্তারিত পড়ো ➜</span></div>
    </div>
  </a>`;
}

function toast(msg){
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 2400);
}

document.addEventListener("DOMContentLoaded", ()=>{
  const active = document.body.getAttribute("data-active");
  renderHeader(active);
  renderFooter();
});

// main.js এখন ES মডিউল হিসেবে লোড হয়, তাই এর ভেতরের ফাংশনগুলো এমনিতে অন্য
// ইনলাইন <script type="module"> ব্লক থেকে সরাসরি দেখা যায় না — তাই window
// এর সাথে যুক্ত করে দেওয়া হলো, যেন প্রতিটি পেইজের বুট-স্ক্রিপ্ট এগুলো ব্যবহার করতে পারে।
window.toast = toast;
window.postCardHtml = postCardHtml;
window.timeAgo = timeAgo;
window.catIcon = catIcon;
window.renderHeader = renderHeader;
window.renderFooter = renderFooter;
