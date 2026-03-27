// Main Application Logic
(function() {
const state = {
    messages: [], isTyping: false, messageCount: 0,
    theme: localStorage.getItem('warmchat-theme') || 'dark',
    tier: localStorage.getItem('warmchat-tier') || 'basic',
    advancedUseCount: parseInt(localStorage.getItem('warmchat-adv-count') || '0'),
    userName: localStorage.getItem('warmchat-name') || '',
    userAvatar: localStorage.getItem('warmchat-avatar') || '🧑',
    adsEnabled: false // Set to true to enable ads
};

const $ = id => document.getElementById(id);
const DOM = {
    chatArea:$('chat-area'), msgs:$('messages-container'), welcome:$('welcome-section'),
    typing:$('typing-indicator'), input:$('message-input'), sendBtn:$('send-btn'),
    themeToggle:$('theme-toggle'), clearChat:$('clear-chat'),
    moodPopup:$('mood-popup'), hearts:$('floating-hearts'),
    adOverlay:$('ad-overlay'), adContent:$('ad-content'), adSkipBtn:$('ad-skip-btn'),
    adProgressBar:$('ad-progress-bar'), adCountdown:$('ad-countdown'),
    adSkipCountdown:$('ad-skip-countdown'), tierDesc:$('tier-desc-text'),
    tierBadge:$('current-tier-badge')
};

// ===== THEME =====
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    DOM.themeToggle.querySelector('.theme-icon').textContent = state.theme==='dark'?'☀️':'🌙';
}
function toggleTheme() {
    state.theme = state.theme==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('warmchat-theme', state.theme);
    DOM.themeToggle.querySelector('.theme-icon').textContent = state.theme==='dark'?'☀️':'🌙';
}

// ===== TIER =====
const tierDescs = {
    basic:'簡短友善的聊天，像朋友打招呼 🤗',
    intermediate:'有溫度的對話，會追問關心你 💝',
    advanced:'像知心好友一樣，跟你深入聊聊 👑'
};
const tierIcons = {basic:'💬',intermediate:'💝',advanced:'👑'};
const tierLabels = {basic:'基本模式',intermediate:'中階模式',advanced:'進階模式'};

function setTier(t) {
    state.tier = t;
    localStorage.setItem('warmchat-tier', t);
    document.querySelectorAll('.tier-btn').forEach(b => b.classList.toggle('active', b.dataset.tier===t));
    DOM.tierDesc.textContent = tierDescs[t];
    DOM.tierBadge.innerHTML = `<span class="tier-badge-icon">${tierIcons[t]}</span><span class="tier-badge-label">${tierLabels[t]}</span>`;
}

// ===== PROFILE EDITOR (Avatar + Name + Image Upload) =====
function showProfileEditor() {
    const avatars = ['🧑','👩','👨','🧒','👧','👦','🐱','🐶','🐰','🦊','🐻','🐼','🦁','🐯','🦄','🌸','⭐','🌈','🍀','🎀','👻','🤖','🎭','💎','🔥'];
    const overlay = document.createElement('div');
    overlay.className = 'profile-editor-overlay';
    overlay.innerHTML = `
    <div class="profile-editor">
        <h3>自訂你的形象 ✨</h3>
        <div class="pe-section"><label>你的暱稱</label>
        <input type="text" id="pe-name" class="pe-input" placeholder="輸入暱稱（選填）" value="${state.userName}" maxlength="20"></div>
        <div class="pe-section"><label>選擇頭像</label>
        <div class="pe-avatars">${avatars.map(a=>`<button class="pe-av-btn${a===state.userAvatar?' active':''}" data-av="${a}">${a}</button>`).join('')}</div></div>
        <div class="pe-section"><label>或上傳自訂頭像</label>
        <input type="file" id="pe-avatar-upload" accept="image/*" class="pe-input" style="padding:8px">
        <div id="pe-avatar-preview" style="display:none;margin-top:8px;text-align:center;">
            <img id="pe-avatar-img" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid var(--primary);">
        </div></div>
        <div class="pe-actions">
            <button class="pe-cancel" id="pe-cancel">取消</button>
            <button class="pe-save" id="pe-save">儲存 💛</button>
        </div>
    </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(()=>overlay.classList.add('visible'));
    overlay.querySelectorAll('.pe-av-btn').forEach(b=>{
        b.addEventListener('click',()=>{
            overlay.querySelectorAll('.pe-av-btn').forEach(x=>x.classList.remove('active'));
            b.classList.add('active');
            $('pe-avatar-preview').style.display='none';
        });
    });
    // Image upload for custom avatar
    $('pe-avatar-upload').addEventListener('change', (e)=>{
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev)=>{
            $('pe-avatar-img').src = ev.target.result;
            $('pe-avatar-preview').style.display='block';
            overlay.querySelectorAll('.pe-av-btn').forEach(x=>x.classList.remove('active'));
        };
        reader.readAsDataURL(file);
    });
    $('pe-cancel').addEventListener('click',()=>{overlay.classList.remove('visible');setTimeout(()=>overlay.remove(),300);});
    $('pe-save').addEventListener('click',()=>{
        const name = $('pe-name').value.trim();
        const av = overlay.querySelector('.pe-av-btn.active');
        const customImg = $('pe-avatar-img').src;
        const hasCustom = $('pe-avatar-preview').style.display !== 'none' && customImg;
        state.userName = name;
        if (hasCustom) {
            state.userAvatar = '📷'; // placeholder - store data URL
            state.customAvatarUrl = customImg;
            localStorage.setItem('warmchat-custom-avatar', customImg);
        } else if (av) {
            state.userAvatar = av.dataset.av;
            state.customAvatarUrl = null;
            localStorage.removeItem('warmchat-custom-avatar');
        }
        localStorage.setItem('warmchat-name',state.userName);
        localStorage.setItem('warmchat-avatar',state.userAvatar);
        // Update profile button
        const profBtn = $('profile-btn');
        if (profBtn) profBtn.innerHTML = state.customAvatarUrl
            ? `<img src="${state.customAvatarUrl}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;">`
            : `<span>${state.userAvatar}</span>`;
        overlay.classList.remove('visible'); setTimeout(()=>overlay.remove(),300);
    });
}

// ===== MESSAGES =====
function formatTime() {
    const n=new Date(); return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
}
function addMessage(text, type, tierTag) {
    if (DOM.welcome && state.messageCount===0) DOM.welcome.style.display='none';
    const time = formatTime();
    const div = document.createElement('div');
    const tierClass = type==='bot' && tierTag ? ` tier-${tierTag}` : '';
    div.className = `message ${type}${tierClass}`;
    let avatarHtml;
    if (type==='user' && state.customAvatarUrl) {
        avatarHtml = `<img src="${state.customAvatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
        avatarHtml = type==='user' ? state.userAvatar : '💛';
    }
    let tierBadge = '';
    if (type==='bot' && tierTag) {
        const labels = {basic:'基本',intermediate:'中階',advanced:'進階'};
        tierBadge = `<div class="message-tier-tag ${tierTag}">${tierIcons[tierTag]} ${labels[tierTag]}</div>`;
    }
    const textHtml = text ? text.replace(/\n/g,'<br>') : '';
    div.innerHTML = `<div class="message-avatar">${avatarHtml}</div><div><div class="message-bubble">${tierBadge}${textHtml}</div><div class="message-time">${time}</div></div>`;
    DOM.msgs.appendChild(div);
    state.messages.push({text,type,time}); state.messageCount++;
    requestAnimationFrame(()=>{DOM.chatArea.scrollTop=DOM.chatArea.scrollHeight;});
}

// ===== AD SYSTEM =====
function shouldShowAd() {
    if (!state.adsEnabled) return false;
    if (state.tier==='intermediate') return true;
    if (state.tier==='advanced') { state.advancedUseCount++; localStorage.setItem('warmchat-adv-count',state.advancedUseCount); return state.advancedUseCount%3===0; }
    return false;
}
function showAd() {
    return new Promise(resolve => {
        const ads = [
            {emoji:'☕',title:'休息一下',text:'喝杯咖啡，對自己好一點',cta:'享受生活'},
            {emoji:'🌻',title:'今天也要加油',text:'每一天都是新的開始',cta:'保持微笑'},
            {emoji:'🎵',title:'聽首好歌吧',text:'音樂是最好的心靈療癒',cta:'放鬆心情'},
        ];
        const ad = ads[Math.floor(Math.random()*ads.length)];
        DOM.adContent.innerHTML = `<div class="ad-emoji">${ad.emoji}</div><div class="ad-title">${ad.title}</div><div class="ad-text">${ad.text}</div><div class="ad-cta">${ad.cta}</div>`;
        DOM.adOverlay.classList.add('visible');
        DOM.adSkipBtn.disabled=true; DOM.adSkipBtn.classList.remove('ready');
        let sec=5; DOM.adCountdown.textContent=sec; DOM.adSkipCountdown.textContent=sec;
        DOM.adSkipBtn.innerHTML=`請等待 <span>${sec}</span> 秒...`;
        DOM.adProgressBar.style.width='0%';
        const iv=setInterval(()=>{
            sec--; DOM.adCountdown.textContent=sec;
            DOM.adProgressBar.style.width=`${((5-sec)/5)*100}%`;
            DOM.adSkipBtn.innerHTML=`請等待 <span>${sec}</span> 秒...`;
            if(sec<=0){clearInterval(iv);DOM.adSkipBtn.disabled=false;DOM.adSkipBtn.classList.add('ready');DOM.adSkipBtn.textContent='✨ 繼續聊天';DOM.adProgressBar.style.width='100%';}
        },1000);
        const handler=()=>{if(!DOM.adSkipBtn.disabled){DOM.adOverlay.classList.remove('visible');DOM.adSkipBtn.removeEventListener('click',handler);resolve();}};
        DOM.adSkipBtn.addEventListener('click',handler);
    });
}

// ===== SEND MESSAGE =====
async function sendMessage() {
    const text = DOM.input.value.trim();
    if (!text || state.isTyping) return;
    addMessage(text, 'user');
    DOM.input.value=''; DOM.input.style.height='auto'; DOM.sendBtn.disabled=true;
    if (shouldShowAd()) await showAd();
    state.isTyping=true;
    DOM.typing.classList.add('visible');
    requestAnimationFrame(()=>{DOM.chatArea.scrollTop=DOM.chatArea.scrollHeight;});
    const analysis = analyzeMessage(text);
    const response = getTierResponse(analysis, state.tier);
    const delay = Math.min(600 + response.length*8, 2200);
    setTimeout(()=>{
        DOM.typing.classList.remove('visible'); state.isTyping=false;
        addMessage(response, 'bot', state.tier);
        const pos=['achievement','happy','praise_seek','accomplished','emotion_happy'];
        if(pos.includes(analysis.category)) spawnCelebration(); else spawnHearts(2);
        if(state.messageCount>0 && state.messageCount%8===0) showMoodPopup();
    }, delay);
}

// ===== EFFECTS =====
function spawnHearts(n) {
    const e=['💛','💕','✨','🌟','💫','🫶','🌸'];
    for(let i=0;i<n;i++){setTimeout(()=>{const h=document.createElement('div');h.className='floating-heart';h.textContent=e[Math.floor(Math.random()*e.length)];h.style.left=`${20+Math.random()*60}%`;h.style.bottom='80px';h.style.animationDuration=`${4+Math.random()*3}s`;DOM.hearts.appendChild(h);setTimeout(()=>h.remove(),7000);},i*200);}
}
function spawnCelebration() {
    const e=['🎉','🎊','✨','⭐','🌟','💛','🥳','🏆'];
    const cx=window.innerWidth/2, cy=window.innerHeight/2;
    for(let i=0;i<10;i++){setTimeout(()=>{const el=document.createElement('div');el.className='celebration-emoji';el.textContent=e[Math.floor(Math.random()*e.length)];el.style.left=cx+'px';el.style.top=cy+'px';const a=(Math.PI*2*i)/10,d=80+Math.random()*120;el.style.setProperty('--tx',`${Math.cos(a)*d}px`);el.style.setProperty('--ty',`${Math.sin(a)*d-50}px`);document.body.appendChild(el);setTimeout(()=>el.remove(),1500);},i*50);}
    spawnHearts(4);
}
function showMoodPopup(){DOM.moodPopup.classList.add('visible');setTimeout(()=>DOM.moodPopup.classList.remove('visible'),5000);}
function handleMood(mood){
    DOM.moodPopup.classList.remove('visible');
    const r={better:'太好了！那我就放心了 🥰',same:'沒事沒事 我繼續陪你 💛',worse:'那我們再聊聊吧 我不走的 💛'};
    setTimeout(()=>{state.isTyping=true;DOM.typing.classList.add('visible');setTimeout(()=>{DOM.typing.classList.remove('visible');state.isTyping=false;addMessage(r[mood],'bot',state.tier);spawnHearts(2);},1200);},500);
}

// ===== EVENTS =====
function init() {
    initTheme(); setTier(state.tier);
    // Restore custom avatar
    const savedCustom = localStorage.getItem('warmchat-custom-avatar');
    if (savedCustom) state.customAvatarUrl = savedCustom;
    DOM.sendBtn.addEventListener('click', sendMessage);
    DOM.input.addEventListener('keydown', e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
    DOM.input.addEventListener('input', ()=>{DOM.input.style.height='auto';DOM.input.style.height=Math.min(DOM.input.scrollHeight,120)+'px';DOM.sendBtn.disabled=!DOM.input.value.trim();});
    DOM.themeToggle.addEventListener('click', toggleTheme);
    DOM.clearChat.addEventListener('click', ()=>{if(state.messages.length>0){DOM.msgs.innerHTML='';state.messages=[];state.messageCount=0;if(DOM.welcome)DOM.welcome.style.display='flex';}});
    document.querySelectorAll('.tier-btn').forEach(b=>b.addEventListener('click',()=>setTier(b.dataset.tier)));
    document.querySelectorAll('.starter-chip').forEach(c=>c.addEventListener('click',()=>{DOM.input.value=c.dataset.message;DOM.sendBtn.disabled=false;sendMessage();}));
    document.querySelectorAll('.mood-btn').forEach(b=>b.addEventListener('click',()=>handleMood(b.dataset.mood)));
    // Profile editor button
    const profBtn = document.createElement('button');
    profBtn.className='icon-btn'; profBtn.id='profile-btn'; profBtn.title='自訂形象';
    profBtn.innerHTML = state.customAvatarUrl
        ? `<img src="${state.customAvatarUrl}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;">`
        : `<span>${state.userAvatar}</span>`;
    profBtn.addEventListener('click', showProfileEditor);
    document.querySelector('.header-actions').prepend(profBtn);
    setTimeout(()=>DOM.input.focus(), 500);
    setInterval(()=>{if(Math.random()>0.7)spawnHearts(1);},8000);
}
document.addEventListener('DOMContentLoaded', init);
})();
