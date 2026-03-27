// Main Application Logic - v3
(function() {
const state = {
    messages: [], isTyping: false, messageCount: 0,
    theme: localStorage.getItem('warmchat-theme') || 'dark',
    tier: localStorage.getItem('warmchat-tier') || 'basic',
    advancedUseCount: parseInt(localStorage.getItem('warmchat-adv-count') || '0'),
    userName: localStorage.getItem('warmchat-name') || '',
    userAvatar: localStorage.getItem('warmchat-avatar') || '🧑',
    adsEnabled: false,
    persona: localStorage.getItem('warmchat-persona') || 'default',
    lastTopic: null,
    // AI 頭像自訂
    customAiName: localStorage.getItem('warmchat-ai-name') || '',
    customAiAvatar: localStorage.getItem('warmchat-ai-avatar') || '',
    customAiAvatarUrl: localStorage.getItem('warmchat-ai-custom-avatar') || '',
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
    tierBadge:$('current-tier-badge'),
    personaSelect:$('persona-select'),
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
    updatePersonaSelect();
}

// ===== PERSONA (下拉選單) =====
function updatePersonaSelect() {
    if (!DOM.personaSelect) return;
    const allKeys = Object.keys(PERSONAS);
    // 基礎：5, 中階：8, 進階：全部13
    let keys;
    if (state.tier === 'basic') keys = allKeys.slice(0, 5);
    else if (state.tier === 'intermediate') keys = allKeys.slice(0, 8);
    else keys = allKeys;

    DOM.personaSelect.innerHTML = keys.map(k => {
        const p = PERSONAS[k];
        return `<option value="${k}" ${state.persona===k?'selected':''}>${p.icon} ${p.name}</option>`;
    }).join('');

    if (!keys.includes(state.persona)) {
        state.persona = 'default';
        DOM.personaSelect.value = 'default';
        localStorage.setItem('warmchat-persona', 'default');
    }
}

function onPersonaChange() {
    state.persona = DOM.personaSelect.value;
    localStorage.setItem('warmchat-persona', state.persona);
    // 清除 AI 自訂頭像（切換人設時重置）
    state.customAiName = '';
    state.customAiAvatar = '';
    state.customAiAvatarUrl = '';
    localStorage.removeItem('warmchat-ai-name');
    localStorage.removeItem('warmchat-ai-avatar');
    localStorage.removeItem('warmchat-ai-custom-avatar');
    // 更新 header avatar
    const p = PERSONAS[state.persona];
    const avatarEl = document.querySelector('.avatar-icon');
    if (avatarEl) avatarEl.textContent = (p && state.persona !== 'default') ? p.icon : '💛';
    // 更新 header name
    const nameEl = document.querySelector('.header-title');
    if (nameEl) nameEl.textContent = p ? p.name : '暖心夥伴';
    // 切換人設時重新發起對話
    DOM.msgs.innerHTML = '';
    state.messages = [];
    state.messageCount = 0;
    state.lastTopic = null;
    if (DOM.welcome) DOM.welcome.style.display = 'flex';
}

// ===== PROFILE EDITOR =====
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
    $('pe-avatar-upload').addEventListener('change', (e)=>{
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev)=>{ $('pe-avatar-img').src = ev.target.result; $('pe-avatar-preview').style.display='block'; overlay.querySelectorAll('.pe-av-btn').forEach(x=>x.classList.remove('active')); };
        reader.readAsDataURL(file);
    });
    $('pe-cancel').addEventListener('click',()=>{overlay.classList.remove('visible');setTimeout(()=>overlay.remove(),300);});
    $('pe-save').addEventListener('click',()=>{
        const name = $('pe-name').value.trim();
        const av = overlay.querySelector('.pe-av-btn.active');
        const customImg = $('pe-avatar-img').src;
        const hasCustom = $('pe-avatar-preview').style.display !== 'none' && customImg;
        state.userName = name;
        if (hasCustom) { state.userAvatar = '📷'; state.customAvatarUrl = customImg; localStorage.setItem('warmchat-custom-avatar', customImg); }
        else if (av) { state.userAvatar = av.dataset.av; state.customAvatarUrl = null; localStorage.removeItem('warmchat-custom-avatar'); }
        localStorage.setItem('warmchat-name',state.userName);
        localStorage.setItem('warmchat-avatar',state.userAvatar);
        const profBtn = $('profile-btn');
        if (profBtn) profBtn.innerHTML = state.customAvatarUrl ? `<img src="${state.customAvatarUrl}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;">` : `<span>${state.userAvatar}</span>`;
        // 同步更新左上角 header 圖示
        const headerAvatar = document.querySelector('.avatar-icon');
        if (headerAvatar && state.customAvatarUrl) {
            headerAvatar.innerHTML = `<img src="${state.customAvatarUrl}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">`;
        }
        overlay.classList.remove('visible'); setTimeout(()=>overlay.remove(),300);
    });
}

// ===== AI PROFILE EDITOR =====
function showAiProfileEditor() {
    const p = PERSONAS[state.persona] || PERSONAS.default;
    const currentName = state.customAiName || p.name;
    const avatars = ['💛','💙','💗','👨','👩','🧑','👩‍🦱','👯','🌸','🧊','😂','👔','📋','🐱','🐶','🐰','🦊','🐻','🐼','🦁','🐯','🦄','👻','🤖','🎭','💎','🔥','⭐','🌈','🎀'];
    const overlay = document.createElement('div');
    overlay.className = 'profile-editor-overlay';
    overlay.innerHTML = `<div class="profile-editor">
        <h3>✏️ 自訂 AI 角色</h3>
        <label>AI 名稱</label>
        <input type="text" id="ai-pe-name" value="${currentName}" placeholder="輸入自訂名稱" maxlength="12">
        <label>選擇頭像</label>
        <div class="pe-avatar-grid">${avatars.map(a=>`<button class="pe-av-btn${(state.customAiAvatar===a)?' active':''}" data-av="${a}">${a}</button>`).join('')}</div>
        <label>或上傳圖片</label>
        <input type="file" id="ai-pe-avatar-upload" accept="image/*" style="margin-bottom:8px">
        <div id="ai-pe-avatar-preview" style="display:${state.customAiAvatarUrl?'block':'none'};text-align:center;margin-bottom:8px;"><img id="ai-pe-avatar-img" src="${state.customAiAvatarUrl||''}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;"></div>
        <div class="pe-actions"><button id="ai-pe-cancel" class="pe-btn">取消</button><button id="ai-pe-save" class="pe-btn primary">儲存</button></div>
    </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(()=>overlay.classList.add('visible'));
    overlay.querySelectorAll('.pe-av-btn').forEach(b=>{
        b.addEventListener('click',()=>{
            overlay.querySelectorAll('.pe-av-btn').forEach(x=>x.classList.remove('active'));
            b.classList.add('active');
            $('ai-pe-avatar-preview').style.display='none';
        });
    });
    $('ai-pe-avatar-upload').addEventListener('change',(e)=>{
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev)=>{ $('ai-pe-avatar-img').src = ev.target.result; $('ai-pe-avatar-preview').style.display='block'; overlay.querySelectorAll('.pe-av-btn').forEach(x=>x.classList.remove('active')); };
        reader.readAsDataURL(file);
    });
    $('ai-pe-cancel').addEventListener('click',()=>{overlay.classList.remove('visible');setTimeout(()=>overlay.remove(),300);});
    $('ai-pe-save').addEventListener('click',()=>{
        const name = $('ai-pe-name').value.trim();
        const av = overlay.querySelector('.pe-av-btn.active');
        const customImg = $('ai-pe-avatar-img').src;
        const hasCustom = $('ai-pe-avatar-preview').style.display !== 'none' && customImg;
        if (name) { state.customAiName = name; localStorage.setItem('warmchat-ai-name', name); }
        if (hasCustom) {
            state.customAiAvatar = '';
            state.customAiAvatarUrl = customImg;
            localStorage.setItem('warmchat-ai-custom-avatar', customImg);
            localStorage.removeItem('warmchat-ai-avatar');
        } else if (av) {
            state.customAiAvatar = av.dataset.av;
            state.customAiAvatarUrl = '';
            localStorage.setItem('warmchat-ai-avatar', av.dataset.av);
            localStorage.removeItem('warmchat-ai-custom-avatar');
        }
        // 更新 header
        const avatarEl = document.querySelector('.avatar-icon');
        if (avatarEl) {
            if (state.customAiAvatarUrl) avatarEl.innerHTML = `<img src="${state.customAiAvatarUrl}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">`;
            else if (state.customAiAvatar) avatarEl.textContent = state.customAiAvatar;
            else { const pp = PERSONAS[state.persona]; avatarEl.textContent = (pp && state.persona !== 'default') ? pp.icon : '💛'; }
        }
        const nameEl = document.querySelector('.header-title');
        if (nameEl && state.customAiName) nameEl.textContent = state.customAiName;
        overlay.classList.remove('visible'); setTimeout(()=>overlay.remove(),300);
    });
}

// ===== MESSAGES =====
function formatTime() {
    const n=new Date(); return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
}
function addMessage(text, type, tierTag) {
    if (DOM.welcome && state.messageCount===0) DOM.welcome.style.display='none';
    const div = document.createElement('div');
    const tierClass = type==='bot' && tierTag ? ` tier-${tierTag}` : '';
    div.className = `message ${type}${tierClass}`;
    let avatarHtml;
    if (type==='user' && state.customAvatarUrl) avatarHtml = `<img src="${state.customAvatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    else if (type==='user') avatarHtml = state.userAvatar;
    else if (type==='bot' && state.customAiAvatarUrl) avatarHtml = `<img src="${state.customAiAvatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    else if (type==='bot' && state.customAiAvatar) avatarHtml = state.customAiAvatar;
    else { const p = PERSONAS[state.persona]; avatarHtml = (p && state.persona !== 'default') ? p.icon : '💛'; }
    let tierBadge = '';
    if (type==='bot' && tierTag) {
        const labels = {basic:'基本',intermediate:'中階',advanced:'進階'};
        tierBadge = `<div class="message-tier-tag ${tierTag}">${tierIcons[tierTag]} ${labels[tierTag]}</div>`;
    }
    const textHtml = text ? text.replace(/\n/g,'<br>') : '';
    div.innerHTML = `<div class="message-avatar">${avatarHtml}</div><div><div class="message-bubble">${tierBadge}${textHtml}</div><div class="message-time">${formatTime()}</div></div>`;
    DOM.msgs.appendChild(div);
    state.messages.push({text,type}); state.messageCount++;
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
        const ads = [{emoji:'☕',title:'休息一下',text:'喝杯咖啡，對自己好一點',cta:'享受生活'},{emoji:'🌻',title:'今天也要加油',text:'每一天都是新的開始',cta:'保持微笑'},{emoji:'🎵',title:'聽首好歌吧',text:'音樂是最好的心靈療癒',cta:'放鬆心情'}];
        const ad = ads[Math.floor(Math.random()*ads.length)];
        DOM.adContent.innerHTML = `<div class="ad-emoji">${ad.emoji}</div><div class="ad-title">${ad.title}</div><div class="ad-text">${ad.text}</div><div class="ad-cta">${ad.cta}</div>`;
        DOM.adOverlay.classList.add('visible');
        DOM.adSkipBtn.disabled=true; DOM.adSkipBtn.classList.remove('ready');
        let sec=5; DOM.adCountdown.textContent=sec; DOM.adSkipCountdown.textContent=sec;
        DOM.adSkipBtn.innerHTML=`請等待 <span>${sec}</span> 秒...`;
        DOM.adProgressBar.style.width='0%';
        const iv=setInterval(()=>{sec--;DOM.adCountdown.textContent=sec;DOM.adProgressBar.style.width=`${((5-sec)/5)*100}%`;DOM.adSkipBtn.innerHTML=`請等待 <span>${sec}</span> 秒...`;if(sec<=0){clearInterval(iv);DOM.adSkipBtn.disabled=false;DOM.adSkipBtn.classList.add('ready');DOM.adSkipBtn.textContent='✨ 繼續聊天';DOM.adProgressBar.style.width='100%';}},1000);
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

    // 對話前後呼應：如果當前分析結果是 general（沒有匹配到特定情境）
    // 但之前有明確的話題，就沿用上一個話題，讓回應前後連貫
    if (analysis.category === 'general' && state.lastTopic && state.lastTopic !== 'general' && state.lastTopic !== 'greeting') {
        analysis.category = state.lastTopic;
    }
    // 記住當前話題（只記非 general 的）
    if (analysis.category !== 'general') {
        state.lastTopic = analysis.category;
    }

    const response = getTierResponse(analysis, state.tier, { persona: state.persona });

    // 延遲回覆：基礎 1.5-2.5s，中階 2-3.5s，進階 2.5-4.5s（讓人覺得有在思考）
    let minDelay, maxDelay;
    if (state.tier === 'basic') { minDelay = 1500; maxDelay = 2500; }
    else if (state.tier === 'intermediate') { minDelay = 2000; maxDelay = 3500; }
    else { minDelay = 2500; maxDelay = 4500; }
    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    setTimeout(()=>{
        DOM.typing.classList.remove('visible'); state.isTyping=false;
        addMessage(response, 'bot', state.tier);
        const pos=['achievement','happy','praise_seek','accomplished','emotion_happy','small_achievement'];
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

// ===== INIT =====
function init() {
    initTheme(); setTier(state.tier);
    const savedCustom = localStorage.getItem('warmchat-custom-avatar');
    if (savedCustom) state.customAvatarUrl = savedCustom;
    if (DOM.personaSelect) {
        updatePersonaSelect();
        DOM.personaSelect.addEventListener('change', onPersonaChange);
        onPersonaChange(); // set initial avatar
    }
    DOM.sendBtn.addEventListener('click', sendMessage);
    DOM.input.addEventListener('keydown', e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
    DOM.input.addEventListener('input', ()=>{DOM.input.style.height='auto';DOM.input.style.height=Math.min(DOM.input.scrollHeight,120)+'px';DOM.sendBtn.disabled=!DOM.input.value.trim();});
    DOM.themeToggle.addEventListener('click', toggleTheme);
    DOM.clearChat.addEventListener('click', ()=>{if(state.messages.length>0){DOM.msgs.innerHTML='';state.messages=[];state.messageCount=0;state.lastTopic=null;if(DOM.welcome)DOM.welcome.style.display='flex';}});
    document.querySelectorAll('.tier-btn').forEach(b=>b.addEventListener('click',()=>setTier(b.dataset.tier)));
    document.querySelectorAll('.starter-chip').forEach(c=>c.addEventListener('click',()=>{DOM.input.value=c.dataset.message;DOM.sendBtn.disabled=false;sendMessage();}));
    document.querySelectorAll('.mood-btn').forEach(b=>b.addEventListener('click',()=>handleMood(b.dataset.mood)));
    // Profile editor button
    const profBtn = document.createElement('button');
    profBtn.className='icon-btn'; profBtn.id='profile-btn'; profBtn.title='自訂形象';
    profBtn.innerHTML = state.customAvatarUrl ? `<img src="${state.customAvatarUrl}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;">` : `<span>${state.userAvatar}</span>`;
    profBtn.addEventListener('click', showProfileEditor);
    document.querySelector('.header-actions').prepend(profBtn);
    // AI avatar click → open AI editor
    const aiAvatarArea = document.querySelector('.header-avatar');
    if (aiAvatarArea) {
        aiAvatarArea.style.cursor = 'pointer';
        aiAvatarArea.title = '點擊自訂 AI 頭像與名稱';
        aiAvatarArea.addEventListener('click', showAiProfileEditor);
    }
    // Init AI name/avatar from saved state
    if (state.customAiName) {
        const nameEl = document.querySelector('.header-title');
        if (nameEl) nameEl.textContent = state.customAiName;
    }
    if (state.customAiAvatarUrl) {
        const avatarEl = document.querySelector('.avatar-icon');
        if (avatarEl) avatarEl.innerHTML = `<img src="${state.customAiAvatarUrl}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">`;
    } else if (state.customAiAvatar) {
        const avatarEl = document.querySelector('.avatar-icon');
        if (avatarEl) avatarEl.textContent = state.customAiAvatar;
    }
    setTimeout(()=>DOM.input.focus(), 500);
    setInterval(()=>{if(Math.random()>0.7)spawnHearts(1);},8000);
}
document.addEventListener('DOMContentLoaded', init);
})();
