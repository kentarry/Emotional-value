// Main Application Logic - v3
(function() {
const state = {
    messages: [], isTyping: false, messageCount: 0,
    theme: localStorage.getItem('warmchat-theme') || 'dark',
    tier: 'basic',
    advancedUseCount: parseInt(localStorage.getItem('warmchat-adv-count') || '0'),
    userName: localStorage.getItem('warmchat-name') || '',
    userAvatar: localStorage.getItem('warmchat-avatar') || '🧑',
    adsEnabled: true,
    persona: localStorage.getItem('warmchat-persona') || 'default',
    lastTopic: null,
    // AI 頭像自訂
    customAiName: localStorage.getItem('warmchat-ai-name') || '',
    customAiAvatar: localStorage.getItem('warmchat-ai-avatar') || '',
    customAiAvatarUrl: localStorage.getItem('warmchat-ai-custom-avatar') || '',
    customAiSubtitle: localStorage.getItem('warmchat-ai-subtitle') || '',
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
    // 更新 header avatar（保留自訂 AI 頭像）
    const p = PERSONAS[state.persona];
    const avatarEl = document.querySelector('.avatar-icon');
    if (state.customAiAvatarUrl) {
        if (avatarEl) avatarEl.innerHTML = `<img src="${state.customAiAvatarUrl}" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (state.customAiAvatar) {
        if (avatarEl) avatarEl.textContent = state.customAiAvatar;
    } else {
        if (avatarEl) avatarEl.textContent = (p && state.persona !== 'default') ? p.icon : '💛';
    }
    // 更新 header name（保留自訂名稱）
    const nameEl = document.querySelector('.header-title');
    if (state.customAiName) {
        if (nameEl) nameEl.textContent = state.customAiName;
    } else {
        if (nameEl) nameEl.textContent = p ? p.name : '暖心夥伴';
    }
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
    const currentSub = state.customAiSubtitle || '隨時在這裡陪伴你 ✨';
    const avatars = ['💛','💙','💗','👨','👩','🧑','👩‍🦱','👯','🌸','🧊','😂','👔','📋','🐱','🐶','🐰','🦊','🐻','🐼','🦁','🐯','🦄','👻','🤖'];
    const overlay = document.createElement('div');
    overlay.className = 'profile-editor-overlay';
    overlay.innerHTML = `<div class="profile-editor" style="max-height:85vh;overflow-y:auto;">
        <h3>✏️ 自訂 AI 角色</h3>
        <div class="pe-section">
            <label>AI 名稱</label>
            <input type="text" class="pe-input" id="ai-pe-name" value="${currentName}" placeholder="輸入自訂名稱" maxlength="12">
        </div>
        <div class="pe-section">
            <label>副標題文字</label>
            <input type="text" class="pe-input" id="ai-pe-subtitle" value="${currentSub}" placeholder="例如：隨時在這裡陪伴你 ✨" maxlength="30">
        </div>
        <div class="pe-section">
            <label>選擇頭像</label>
            <div class="pe-avatars">${avatars.map(a=>`<button class="pe-av-btn${(state.customAiAvatar===a)?' active':''}" data-av="${a}">${a}</button>`).join('')}</div>
        </div>
        <div class="pe-section">
            <label>或上傳圖片</label>
            <input type="file" id="ai-pe-avatar-upload" accept="image/*" class="pe-input" style="padding:8px;">
            <div id="ai-pe-avatar-preview" style="display:${state.customAiAvatarUrl?'flex':'none'};justify-content:center;margin-top:8px;">
                <img id="ai-pe-avatar-img" src="${state.customAiAvatarUrl||''}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--border-medium);">
            </div>
        </div>
        <div class="pe-actions">
            <button id="ai-pe-cancel" class="pe-cancel">取消</button>
            <button id="ai-pe-save" class="pe-save">儲存</button>
        </div>
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
        reader.onload = (ev)=>{ $('ai-pe-avatar-img').src = ev.target.result; $('ai-pe-avatar-preview').style.display='flex'; overlay.querySelectorAll('.pe-av-btn').forEach(x=>x.classList.remove('active')); };
        reader.readAsDataURL(file);
    });
    $('ai-pe-cancel').addEventListener('click',()=>{overlay.classList.remove('visible');setTimeout(()=>overlay.remove(),300);});
    $('ai-pe-save').addEventListener('click',()=>{
        const name = $('ai-pe-name').value.trim();
        const subtitle = $('ai-pe-subtitle').value.trim();
        const av = overlay.querySelector('.pe-av-btn.active');
        const customImg = $('ai-pe-avatar-img') ? $('ai-pe-avatar-img').src : '';
        const hasCustom = $('ai-pe-avatar-preview').style.display !== 'none' && customImg;
        if (name) { state.customAiName = name; localStorage.setItem('warmchat-ai-name', name); }
        if (subtitle) { state.customAiSubtitle = subtitle; localStorage.setItem('warmchat-ai-subtitle', subtitle); }
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
            if (state.customAiAvatarUrl) avatarEl.innerHTML = `<img src="${state.customAiAvatarUrl}">`;
            else if (state.customAiAvatar) avatarEl.textContent = state.customAiAvatar;
            else { const pp = PERSONAS[state.persona]; avatarEl.textContent = (pp && state.persona !== 'default') ? pp.icon : '💛'; }
        }
        const nameEl = document.querySelector('.header-title');
        if (nameEl && state.customAiName) nameEl.textContent = state.customAiName;
        const subEl = document.querySelector('.header-subtitle');
        if (subEl && state.customAiSubtitle) {
            subEl.innerHTML = `<span class="online-indicator"></span>${state.customAiSubtitle}`;
        }
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
const REAL_ADS = [
    { name: '多功能工具箱', img: 'advertise/advertise1.jpeg', url: 'https://kentarry.github.io/100-tools-box/', desc: '超實用線上工具合集，一站搞定所有需求！' },
    { name: '昆蟲飼養推薦助手', img: 'advertise/advertise2.mp4', url: 'https://molly40920-design.github.io/insect-database-app/', desc: '想養昆蟲？讓 AI 幫你找到最適合的夥伴！' },
    { name: '溫柔地認識自己', img: 'advertise/advertise3.jpeg', url: 'https://kentarry.github.io/QuizBox/', desc: '透過心理小測驗，更了解真實的自己 ✨' },
];
let _adIndex = 0;
function getNextAd() { const ad = REAL_ADS[_adIndex % REAL_ADS.length]; _adIndex++; return ad; }

// 判斷是否為影片檔，並產生對應的 <img> 或 <video> HTML
function isVideoFile(src) {
    return /\.(mp4|webm|ogg|mov)$/i.test(src);
}
function mediaTag(src, alt, className) {
    if (isVideoFile(src)) {
        return `<video src="${src}" class="${className}" alt="${alt}" autoplay muted loop playsinline style="object-fit:cover;"></video>`;
    }
    return `<img src="${src}" alt="${alt}" class="${className}">`;
}

function shouldShowAd() {
    if (!state.adsEnabled) return false;
    if (state.tier==='intermediate') return true;
    if (state.tier==='advanced') { state.advancedUseCount++; localStorage.setItem('warmchat-adv-count',state.advancedUseCount); return state.advancedUseCount%3===0; }
    return false;
}
function showAd() {
    return new Promise(resolve => {
        const ad = getNextAd();
        DOM.adContent.innerHTML = `<a href="${ad.url}" target="_blank" rel="noopener" class="ad-real-link">${mediaTag(ad.img, ad.name, 'ad-real-img')}<div class="ad-real-info"><div class="ad-real-name">${ad.name}</div><div class="ad-real-desc">${ad.desc}</div><div class="ad-real-cta">👉 立即體驗</div></div></a>`;
        DOM.adOverlay.classList.add('visible');
        DOM.adSkipBtn.disabled = true;
        DOM.adSkipBtn.classList.remove('ready');
        let sec = 5;
        DOM.adCountdown.textContent = sec;
        DOM.adSkipCountdown.textContent = sec;
        DOM.adSkipBtn.innerHTML = `請等待 <span>${sec}</span> 秒...`;
        // Reset progress bar instantly (no reverse animation)
        DOM.adProgressBar.style.transition = 'none';
        DOM.adProgressBar.style.width = '0%';
        // Force reflow, then re-enable transition so it animates left→right
        DOM.adProgressBar.offsetWidth;
        DOM.adProgressBar.style.transition = 'width 1s linear';

        const iv = setInterval(() => {
            sec--;
            DOM.adCountdown.textContent = sec;
            DOM.adProgressBar.style.width = `${((5-sec)/5)*100}%`;
            DOM.adSkipBtn.innerHTML = `請等待 <span>${sec}</span> 秒...`;
            if (sec <= 0) {
                clearInterval(iv);
                DOM.adSkipBtn.disabled = false;
                DOM.adSkipBtn.classList.add('ready');
                DOM.adSkipBtn.textContent = '✅ 繼續聊天';
                DOM.adProgressBar.style.width = '100%';
            }
        }, 1000);

        const handler = () => {
            if (!DOM.adSkipBtn.disabled) {
                DOM.adOverlay.classList.remove('visible');
                // Pause video if any
                const vid = DOM.adContent.querySelector('video');
                if (vid) vid.pause();
                DOM.adSkipBtn.removeEventListener('click', handler);
                resolve();
            }
        };
        DOM.adSkipBtn.addEventListener('click', handler);
    });
}

// ===== BANNER AD (底部橫幅) =====
function initBannerAd() {
    const banner = document.getElementById('ad-banner');
    if (!banner) return;
    let bannerIdx = 0;
    function renderBanner() {
        const ad = REAL_ADS[bannerIdx % REAL_ADS.length];
        banner.innerHTML = `<a href="${ad.url}" target="_blank" rel="noopener" class="banner-ad-link">${mediaTag(ad.img, ad.name, 'banner-ad-img')}<div class="banner-ad-text"><span class="banner-ad-tag">推薦</span><span class="banner-ad-name">${ad.name}</span></div></a><button class="banner-ad-close" id="banner-close" title="關閉">✕</button>`;
        banner.classList.add('visible');
        document.getElementById('banner-close').addEventListener('click', (e) => { e.stopPropagation(); banner.classList.remove('visible'); setTimeout(() => { bannerIdx++; renderBanner(); }, 30000); });
    }
    setTimeout(renderBanner, 3000);
    setInterval(() => { if (banner.classList.contains('visible')) { bannerIdx++; renderBanner(); } }, 15000);
}

// ===== IN-CHAT AD CARD =====
function insertChatAd() {
    const ad = getNextAd();
    const div = document.createElement('div');
    div.className = 'message bot chat-ad-wrapper';
    div.innerHTML = `<div class="chat-ad-card"><div class="chat-ad-dismiss" title="關閉">✕</div><a href="${ad.url}" target="_blank" rel="noopener" class="chat-ad-inner">${mediaTag(ad.img, ad.name, 'chat-ad-img')}<div class="chat-ad-body"><div class="chat-ad-badge">🔹 好友推薦</div><div class="chat-ad-title">${ad.name}</div><div class="chat-ad-desc">${ad.desc}</div></div></a></div>`;
    DOM.msgs.appendChild(div);
    div.querySelector('.chat-ad-dismiss').addEventListener('click', () => { div.style.opacity='0'; div.style.transform='scale(0.95)'; setTimeout(()=>div.remove(), 300); });
    requestAnimationFrame(()=>{DOM.chatArea.scrollTop=DOM.chatArea.scrollHeight;});
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

    // 對話前後呼應 v2：智慧判斷是否延續上次話題
    // 只有短回覆或接續詞才延續，避免「文不對題」
    if (analysis.category === 'general' && state.lastTopic && state.lastTopic !== 'general' && state.lastTopic !== 'greeting') {
        const isLikelyContinuation = (
            text.length < 20 &&
            /^(嗯|對|是|沒|不|好|哦|喔|唉|那|可是|但是|而且|然後|所以|真的|就是|好煩|好累|好難|好氣|好想|還是|不想|不要|不知道|怎麼辦|怎辦|算了|隨便|都|一樣|對啊|是啊|沒有|沒啊|不是|不會|會|還好|還行|差不多|超|很|蛤|啊|吧|呢|耶|欸)/.test(text)
        );
        if (isLikelyContinuation) {
            analysis.category = state.lastTopic;
        }
    }
    // 記住當前話題（只記非 general 的），5 輪後重置
    if (analysis.category !== 'general') {
        state.lastTopic = analysis.category;
        state.lastTopicCount = (state.lastTopicCount || 0) + 1;
    }
    if (state.lastTopicCount > 5) {
        state.lastTopic = null;
        state.lastTopicCount = 0;
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
        // 每 10 條訊息插入一張對話內廣告卡片
        if(state.adsEnabled && state.messageCount>0 && state.messageCount%10===0) { setTimeout(()=>insertChatAd(), 800); }
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
        if (avatarEl) avatarEl.innerHTML = `<img src="${state.customAiAvatarUrl}">`;
    } else if (state.customAiAvatar) {
        const avatarEl = document.querySelector('.avatar-icon');
        if (avatarEl) avatarEl.textContent = state.customAiAvatar;
    }
    if (state.customAiSubtitle) {
        const subEl = document.querySelector('.header-subtitle');
        if (subEl) subEl.innerHTML = `<span class="online-indicator"></span>${state.customAiSubtitle}`;
    }
    setTimeout(()=>DOM.input.focus(), 500);
    setInterval(()=>{if(Math.random()>0.7)spawnHearts(1);},8000);
    // 初始化底部橫幅廣告
    initBannerAd();
}
document.addEventListener('DOMContentLoaded', init);
})();
