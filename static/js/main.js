// Settings Management
const settings = {
  darkMode: localStorage.getItem('theme') !== 'light',
  cookieSupport: localStorage.getItem('cookieSupport') === 'true'
};

// DOM refs
const f = {
  form: document.getElementById('downloadForm'),
  url: document.getElementById('url'),
  format: document.getElementById('format'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  analyzeText: document.getElementById('analyzeText'),
  downloadBtn: document.getElementById('downloadBtn'),
  downloadText: document.getElementById('downloadText'),
  cancelBtn: document.getElementById('cancelBtn'),
  videoInfo: document.getElementById('videoInfo'),
  videoDetails: document.getElementById('videoDetails'),
  qualityWrap: document.getElementById('quality'),
  qualityGrid: document.getElementById('qualityGrid'),
  thumb: document.getElementById('thumb'),
  platformInfo: document.getElementById('platformInfo'),
  progress: document.getElementById('progress'),
  fill: document.getElementById('fill'),
  s: {
    status: document.getElementById('s-status'),
    prog: document.getElementById('s-prog'),
    speed: document.getElementById('s-speed'),
    eta: document.getElementById('s-eta'),
    size: document.getElementById('s-size'),
    down: document.getElementById('s-down')
  },
  messages: document.getElementById('messages'),
  cookieSection: document.getElementById('cookieSection'),
  cookieFile: document.getElementById('cookieFile'),
  uploadCookieBtn: document.getElementById('uploadCookieBtn'),
  cookieList: document.getElementById('cookieList'),
  cookieSelect: document.getElementById('cookieSelect'),
  fileDropZone: document.getElementById('fileDropZone'),
  fileInputLabel: document.getElementById('fileInputLabel'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsDropdown: document.getElementById('settingsDropdown'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  themeToggle: document.getElementById('themeToggle'),
  cookieToggle: document.getElementById('cookieToggle')
};

// Settings functionality
function initSettings() {
  // Theme
  updateTheme();
  f.themeToggle.classList.toggle('active', !settings.darkMode);

  // Cookie support
  updateCookieVisibility();
  f.cookieToggle.classList.toggle('active', settings.cookieSupport);

  if (settings.cookieSupport) {
    loadAvailableCookies();
  }
}

function updateTheme() {
  document.body.classList.toggle('light-mode', !settings.darkMode);
}

function updateCookieVisibility() {
  f.cookieSection.classList.toggle('show', settings.cookieSupport);
}

// Settings dropdown
f.settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = f.settingsDropdown.classList.contains('show');
  closeSettings();
  if (!isOpen) openSettings();
});

f.settingsOverlay.addEventListener('click', closeSettings);

function openSettings() {
  f.settingsDropdown.classList.add('show');
  f.settingsOverlay.classList.add('show');
}

function closeSettings() {
  f.settingsDropdown.classList.remove('show');
  f.settingsOverlay.classList.remove('show');
}

// Toggle handlers
f.themeToggle.addEventListener('click', () => {
  settings.darkMode = !settings.darkMode;
  localStorage.setItem('theme', settings.darkMode ? 'dark' : 'light');
  f.themeToggle.classList.toggle('active', !settings.darkMode);
  updateTheme();
});

f.cookieToggle.addEventListener('click', () => {
  settings.cookieSupport = !settings.cookieSupport;
  localStorage.setItem('cookieSupport', settings.cookieSupport);
  f.cookieToggle.classList.toggle('active', settings.cookieSupport);
  updateCookieVisibility();

  if (settings.cookieSupport) {
    loadAvailableCookies();
  }
});

// Close settings when clicking outside
document.addEventListener('click', (e) => {
  if (!f.settingsDropdown.contains(e.target) && !f.settingsBtn.contains(e.target)) {
    closeSettings();
  }
});

// Cookie functionality
let selectedFile = null;

// File input click handler
f.fileDropZone.addEventListener('click', () => {
  f.cookieFile.click();
});

// File selection handler
f.cookieFile.addEventListener('change', function() {
  handleFileSelection(this.files[0]);
});

// Drag and drop handlers
f.fileDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  f.fileDropZone.classList.add('drag-over');
});

f.fileDropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  if (!f.fileDropZone.contains(e.relatedTarget)) {
    f.fileDropZone.classList.remove('drag-over');
  }
});

f.fileDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  f.fileDropZone.classList.remove('drag-over');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.name.toLowerCase().endsWith('.txt')) {
      handleFileSelection(file);
      // Update the file input
      const dt = new DataTransfer();
      dt.items.add(file);
      f.cookieFile.files = dt.files;
    } else {
      showAlert('Please select a .txt file', 'error');
    }
  }
});

function handleFileSelection(file) {
  if (file) {
    selectedFile = file;
    f.fileInputLabel.textContent = `Selected: ${file.name}`;
    f.uploadCookieBtn.disabled = false;
  } else {
    selectedFile = null;
    f.fileInputLabel.textContent = 'Choose or Drop Cookie File';
    f.uploadCookieBtn.disabled = true;
  }
}

f.uploadCookieBtn.addEventListener('click', uploadCookies);

async function loadAvailableCookies() {
  try {
    const response = await fetch('/get_available_cookies');
    const data = await response.json();
    updateCookieList(data.cookies || []);
    updateCookieSelect(data.cookies || []);
  } catch (e) {
    console.warn('Failed to load cookies:', e);
  }
}

function updateCookieList(cookies) {
  f.cookieList.innerHTML = '';
  cookies.forEach(cookie => {
    const item = document.createElement('div');
    item.className = 'cookie-item';
    item.innerHTML = `
      <div class="cookie-info">
        <div class="cookie-name">${cookie.name}${!cookie.uploaded ? ' (Default)' : ''}</div>
        ${cookie.uploaded ? `<div class="cookie-meta">Uploaded: ${cookie.upload_time}</div>` : ''}
      </div>
      ${cookie.uploaded ? `<button class="delete-cookie" onclick="deleteCookie('${cookie.name}')">Delete</button>` : ''}
    `;
    f.cookieList.appendChild(item);
  });
}

function updateCookieSelect(cookies) {
  f.cookieSelect.innerHTML = '<option value="">No cookies</option>';
  cookies.forEach(cookie => {
    const option = document.createElement('option');
    option.value = cookie.name;
    option.textContent = `${cookie.name}${!cookie.uploaded ? ' (Default)' : ''}`;
    f.cookieSelect.appendChild(option);
  });
}

async function uploadCookies() {
  if (!selectedFile) {
    showAlert('Please select a cookie file', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('cookie_file', selectedFile);

  // Show loading state
  const originalText = f.uploadCookieBtn.textContent;
  f.uploadCookieBtn.textContent = 'Uploading...';
  f.uploadCookieBtn.disabled = true;

  try {
    const response = await fetch('/upload_cookies', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    if (data.success) {
      showAlert(data.message, 'success');
      // Reset the UI
      selectedFile = null;
      f.cookieFile.value = '';
      f.fileInputLabel.textContent = 'Choose or Drop Cookie File';
      f.uploadCookieBtn.disabled = true;
      loadAvailableCookies();
    } else {
      showAlert(data.error, 'error');
    }
  } catch (error) {
    showAlert('Upload failed: ' + error.message, 'error');
  } finally {
    f.uploadCookieBtn.textContent = originalText;
    f.uploadCookieBtn.disabled = !selectedFile;
  }
}

async function deleteCookie(cookieName) {
  if (!confirm(`Delete cookie file "${cookieName}"?`)) return;

  try {
    const response = await fetch(`/delete_cookies/${cookieName}`, {
      method: 'POST'
    });
    const data = await response.json();

    if (data.success) {
      showAlert(data.message, 'success');
      loadAvailableCookies();
    } else {
      showAlert(data.error, 'error');
    }
  } catch (error) {
    showAlert('Delete failed: ' + error.message, 'error');
  }
}

// Socket init (best effort)
let socket = null;
try {
  if (typeof io !== 'undefined') socket = io();
} catch (e) {
  console.warn('Socket init error', e);
}

let currentId = null;
let selectedQuality = 'best';
let infoData = null;

// Events
f.analyzeBtn.addEventListener('click', analyze);
f.downloadBtn.addEventListener('click', start);
f.cancelBtn.addEventListener('click', cancel);
f.format.addEventListener('change', onFormatChange);
f.url.addEventListener('paste', () => setTimeout(() => f.url.value.trim() && analyze(), 120));

if (socket){
  socket.on('progress_update', onProgress);
  socket.on('download_complete', onComplete);
  socket.on('download_error', d => showAlert(`Download failed: ${d.error}`, 'error'));
  socket.on('download_cancelled', () => showAlert('Download cancelled', 'success'));
}

// UI helpers
function setLoading(btn, span, state, loadLabel, normal){
  if (state){
    btn.disabled = true;
    span.textContent = loadLabel;
  } else {
    btn.disabled = false;
    span.textContent = normal;
  }
}

function showAlert(msg, kind='error', persistMs){
  const div = document.createElement('div');
  div.className = `alert ${kind==='error'?'alert-error':'alert-success'}`;
  div.innerHTML = msg;
  f.messages.innerHTML = '';
  f.messages.appendChild(div);
  setTimeout(() => {
    if (div.parentNode) div.remove();
  }, persistMs || (kind==='error'?9000:6000));
}

function qbtn(value, label, selected){
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `q-btn ${selected?'selected':''}`;
  b.textContent = label;
  b.onclick = () => {
    document.querySelectorAll('.q-btn').forEach(x=>x.classList.remove('selected'));
    b.classList.add('selected');
    selectedQuality = value;
  };
  return b;
}

function formatDur(s){
  if(!s && s!==0) return 'Unknown';
  const h= Math.floor(s/3600), m=Math.floor((s%3600)/60), ss=s%60;
  return h?`${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`:`${m}:${String(ss).padStart(2,'0')}`
}

function cap(s){
  return String(s||'').replace(/^./, c=>c.toUpperCase());
}

// Analyze
async function analyze(){
  const url = f.url.value.trim();
  if(!url){
    showAlert('Please paste a valid URL.');
    return;
  }
  setLoading(f.analyzeBtn, f.analyzeText, true, 'Analyzing…', 'Analyze');
  f.videoInfo.style.display = 'none';
  f.messages.innerHTML = '';

  const requestData = { url };
  if (settings.cookieSupport && f.cookieSelect.value) {
    requestData.cookie_file = f.cookieSelect.value;
  }

  try{
    const res = await fetch('/get_video_info', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(requestData)
    });
    const data = await res.json();
    if (data.success){
      infoData = data.info;
      renderInfo(infoData);
      f.videoInfo.style.display = 'block';
    } else {
      showPlatformHelp(data.error || 'Could not analyze this URL.', url);
    }
  }catch(e){
    showAlert('Network error. Please try again.');
  } finally{
    setLoading(f.analyzeBtn, f.analyzeText, false, '', 'Analyze');
  }
}

function renderInfo(info){
  // Display platform information
  if (info.platform_info) {
    const platformInfo = info.platform_info;
    f.platformInfo.className = `platform-info ${platformInfo.level}`;

    let message = platformInfo.message;
    if (platformInfo.requires_cookies && platformInfo.level === 'warning') {
      message += ' <strong>Recommendation:</strong> Upload cookies from your logged-in browser session for full access.';
    }

    f.platformInfo.innerHTML = `
      <strong>Platform Info:</strong> ${message}
    `;

    // Auto-recommend cookie selection for platforms that need it
    if (platformInfo.requires_cookies && f.cookieSelect.options.length > 1) {
      // Select first available cookie if none selected
      if (!f.cookieSelect.value && settings.cookieSupport) {
        f.cookieSelect.selectedIndex = 1; // Select first cookie (skip "No cookies" option)
        showAlert('Auto-selected available cookies for this platform. You can change this in the dropdown above.', 'success');
      }
    }
  }

  f.thumb.src = info.thumbnail || '';
  f.thumb.style.display = info.thumbnail ? 'block':'none';
  f.videoDetails.innerHTML = `
    <div><span class="k">Title:</span> ${info.title || '—'}</div>
    <div><span class="k">Uploader:</span> ${info.uploader || '—'}</div>
    <div><span class="k">Duration:</span> ${formatDur(info.duration)}</div>
    ${info.description?`<div><span class="k">Description:</span> ${info.description}</div>`:''}
  `;
  if (f.format.value === 'video' && Array.isArray(info.formats) && info.formats.length){
    f.qualityGrid.innerHTML = '';
    f.qualityGrid.appendChild(qbtn('best', 'Best Quality', true));
    info.formats.forEach(fr => f.qualityGrid.appendChild(qbtn(fr.quality, `${fr.quality} (${fr.ext})`, false)));
    f.qualityWrap.style.display = 'block';
  } else {
    f.qualityWrap.style.display = 'none';
  }
}

function onFormatChange(){
  if(infoData) renderInfo(infoData);
}

// Start download
async function start(){
  const url = f.url.value.trim();
  if(!url){
    showAlert('Please paste a valid URL.');
    return;
  }
  setLoading(f.downloadBtn, f.downloadText, true, 'Starting…', 'Start Download');
  f.messages.innerHTML = '';

  const requestData = {
    url,
    format: f.format.value,
    quality: selectedQuality
  };
  if (settings.cookieSupport && f.cookieSelect.value) {
    requestData.cookie_file = f.cookieSelect.value;
  }

  try{
    const res = await fetch('/start_download', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(requestData)
    });
    const data = await res.json();
    if (data.success){
      currentId = data.session_id;
      f.progress.style.display='block';
      f.downloadBtn.style.display='none';
      resetProgress();
    } else {
      showAlert(data.error || 'Failed to start download.');
    }
  } catch(e) {
    showAlert('Network error. Please try again.');
  } finally {
    setLoading(f.downloadBtn, f.downloadText, false, '', 'Start Download');
  }
}

async function cancel(){
  if(!currentId) return;
  try{
    await fetch(`/cancel_download/${currentId}`, {method:'POST'});
  }catch(e){
    console.warn('Cancel error', e);
  }
}

function resetProgress(){
  f.fill.style.width='0%';
  f.s.status.textContent='Initializing…';
  f.s.prog.textContent='0%';
  f.s.speed.textContent='—';
  f.s.eta.textContent='—';
  f.s.size.textContent='—';
  f.s.down.textContent='—';
}

function onProgress(d){
  if(d.session_id!==currentId) return;
  f.fill.style.width=`${d.progress}%`;
  f.s.status.textContent = cap(d.status || '…');
  f.s.prog.textContent = `${d.progress}%`;
  f.s.speed.textContent = d.speed || '—';
  f.s.eta.textContent = d.eta || '—';
  f.s.size.textContent = d.file_size || '—';
  f.s.down.textContent = d.downloaded || '—';
  if(d.error){
    showAlert(`Download failed: ${d.error}`);
    resetState();
  }
}

function onComplete(d){
  if(d.session_id!==currentId) return;
  f.s.status.textContent='Completed';
  f.fill.style.width='100%';
  f.s.prog.textContent='100%';
  const url = `/download_file/${currentId}`;
  showAlert(`Download ready: <a href="${url}" download="${d.filename}">Click to save</a>`, 'success', 12000);
  const a = document.createElement('a');
  a.href=url;
  a.download=d.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(resetState, 2800);
}

function resetState(){
  currentId=null;
  f.progress.style.display='none';
  f.downloadBtn.style.display='inline-flex';
  setLoading(f.downloadBtn, f.downloadText, false, '', 'Start Download');
}

function loadTest(){
  const tests=['https://www.instagram.com/reel/C123abc/','https://vimeo.com/148751763','https://www.youtube.com/watch?v=jfKfPfyJRdk'];
  f.url.value = tests[0];
  showAlert('Loaded a test video (Instagram). Try Analyze to preview.', 'success');
}

function showPlatformHelp(message, url){
  let hint = `<strong>Heads‑up</strong><br>${message || 'This platform may require additional steps.'}<br><br><div style="font-size:.95rem;">`;

  // Check if this is agasobanuyefilms.com or similar platform
  if (url && url.includes('agasobanuyefilms.com')) {
    hint += `
      <div>• This platform requires login for full video access</div>
      <div>• Without cookies, you may only get trailers or previews</div>
      <div>• To get full videos: ${settings.cookieSupport ? 'Upload cookies from your logged-in browser session' : 'Enable cookie support in settings and upload cookies'}</div>
      <div>• Make sure you're logged in to the website in your browser first</div>
    `;
  } else {
    hint += `
      <div>• Some platforms use bot detection. Try a different link or come back later.</div>
      <div>• Only download where you have permission.</div>
      <div>• For private content, sign‑in/cookies may be required${settings.cookieSupport ? ' (upload via cookie management)' : ' (enable in settings)'}.</div>
    `;
  }

  hint += `</div>`;
  showAlert(hint, 'error', 15000);
}

// Initialize
initSettings();

// Global function for inline handlers
window.deleteCookie = deleteCookie;