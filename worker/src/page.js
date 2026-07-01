export function getPageHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>WLOC 虚拟定位</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="WLOC">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
:root {
  --blue:#007aff;
  --green:#34c759;
  --red:#ff3b30;
  --gray:#8e8e93;
  --bg:#f2f2f7;
  --orange:#ff9500;
}

* {
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body {
  font-family:-apple-system,system-ui,"SF Pro","Helvetica Neue",sans-serif;
  background:var(--bg);
}

#map {
  height:50vh;
  width:100%;
  min-height:250px;
}

.panel {
  padding:16px;
  max-width:600px;
  margin:0 auto;
}

.card {
  background:#fff;
  border-radius:12px;
  padding:16px;
  margin-bottom:12px;
  box-shadow:0 1px 3px rgba(0,0,0,.08);
}

.card h3 {
  font-size:15px;
  font-weight:600;
  margin-bottom:10px;
}

.coords {
  font-family:"SF Mono",monospace;
  font-size:14px;
  color:#333;
  padding:8px 12px;
  background:var(--bg);
  border-radius:8px;
  word-break:break-all;
}

.row {
  display:flex;
  gap:8px;
  margin-top:10px;
  flex-wrap:wrap;
}

.btn {
  flex:1;
  min-width:100px;
  padding:12px 16px;
  border:none;
  border-radius:10px;
  font-size:14px;
  font-weight:500;
  cursor:pointer;
  transition:all .15s;
}

.btn-primary {
  background:var(--blue);
  color:#fff;
}

.btn-primary:active {
  background:#005bb5;
  transform:scale(.97);
}

.btn-secondary {
  background:#e5e5ea;
  color:#333;
}

.btn-secondary:active {
  background:#d1d1d6;
  transform:scale(.97);
}

.btn-danger {
  background:var(--red);
  color:#fff;
}

.btn-danger:active {
  background:#d63027;
  transform:scale(.97);
}

.btn.success {
  background:var(--green);
  color:#fff;
}

.btn-sm {
  flex:none;
  min-width:auto;
  padding:6px 12px;
  font-size:12px;
  border-radius:8px;
}

.input-row {
  display:flex;
  gap:8px;
  margin-top:10px;
}

.input-row input {
  flex:1;
  padding:10px 12px;
  border:1px solid #d1d1d6;
  border-radius:8px;
  font-size:14px;
  outline:none;
  min-width:0;
}

.input-row input:focus {
  border-color:var(--blue);
}

.status {
  font-size:12px;
  color:var(--gray);
  margin-top:8px;
  text-align:center;
  line-height:1.5;
}

.error-banner {
  background:var(--red);
  color:#fff;
  padding:14px 16px;
  border-radius:12px;
  margin-bottom:12px;
  font-size:14px;
  line-height:1.5;
  display:none;
}

.error-banner b {
  display:block;
  margin-bottom:4px;
}

.toast {
  position:fixed;
  top:60px;
  left:50%;
  transform:translateX(-50%);
  background:rgba(0,0,0,.82);
  color:#fff;
  padding:10px 20px;
  border-radius:20px;
  font-size:14px;
  opacity:0;
  transition:opacity .3s;
  pointer-events:none;
  z-index:9999;
  max-width:90vw;
  text-align:center;
}

.toast.show {
  opacity:1;
}

.active-loc {
  background:var(--bg);
  border-radius:8px;
  padding:10px 12px;
  font-size:13px;
  color:#333;
}

.active-loc .label {
  font-size:11px;
  color:var(--gray);
  margin-bottom:4px;
}

.active-loc .value {
  font-family:"SF Mono",monospace;
  font-size:13px;
  word-break:break-all;
}

.fav-list {
  max-height:240px;
  overflow-y:auto;
}

.fav-item {
  display:flex;
  align-items:center;
  gap:8px;
  padding:10px 12px;
  background:var(--bg);
  border-radius:8px;
  margin-bottom:6px;
  cursor:pointer;
  transition:background .15s;
}

.fav-item:active {
  background:#e0e0e5;
}

.fav-item .fav-info {
  flex:1;
  min-width:0;
}

.fav-item .fav-name {
  font-size:14px;
  font-weight:500;
  color:#333;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.fav-item .fav-coords {
  font-size:11px;
  color:var(--gray);
  font-family:"SF Mono",monospace;
  margin-top:2px;
}

.fav-item .fav-active {
  font-size:10px;
  color:var(--green);
  font-weight:600;
}

.fav-item .fav-del {
  flex:none;
  width:28px;
  height:28px;
  border:none;
  border-radius:50%;
  background:transparent;
  color:var(--red);
  font-size:16px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:background .15s;
}

.fav-item .fav-del:hover {
  background:rgba(255,59,48,.1);
}

.fav-empty {
  text-align:center;
  color:var(--gray);
  font-size:13px;
  padding:16px 0;
}

.fav-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:10px;
}

.fav-header h3 {
  margin-bottom:0;
}

.modal-overlay {
  position:fixed;
  top:0;
  left:0;
  right:0;
  bottom:0;
  background:rgba(0,0,0,.4);
  z-index:10000;
  display:none;
  align-items:center;
  justify-content:center;
  padding:20px;
}

.modal-overlay.show {
  display:flex;
}

.modal {
  background:#fff;
  border-radius:16px;
  padding:20px;
  width:100%;
  max-width:340px;
}

.modal h3 {
  font-size:17px;
  font-weight:600;
  margin-bottom:16px;
  text-align:center;
}

.modal input {
  width:100%;
  padding:12px;
  border:1px solid #d1d1d6;
  border-radius:10px;
  font-size:15px;
  outline:none;
  margin-bottom:12px;
}

.modal input:focus {
  border-color:var(--blue);
}

.modal .modal-btns {
  display:flex;
  gap:8px;
}

.modal .modal-btns .btn {
  padding:12px;
}

.layer-switch {
  position:absolute;
  top:10px;
  right:10px;
  z-index:1000;
  display:flex;
  gap:4px;
  background:rgba(255,255,255,.92);
  border-radius:8px;
  padding:4px;
  box-shadow:0 2px 8px rgba(0,0,0,.15);
}

.layer-btn {
  border:none;
  background:transparent;
  padding:6px 10px;
  border-radius:6px;
  font-size:12px;
  font-weight:500;
  color:#333;
  cursor:pointer;
  transition:all .15s;
  white-space:nowrap;
}

.layer-btn.active {
  background:var(--blue);
  color:#fff;
}

.layer-btn:active {
  transform:scale(.95);
}

@media(max-width:480px) {
  #map {
    height:44vh;
  }

  .panel {
    padding:12px;
  }

  .layer-btn {
    padding:5px 7px;
    font-size:11px;
  }
}
</style>
</head>

<body>
<div style="position:relative">
  <div id="map"></div>
  <div class="layer-switch">
    <button class="layer-btn active" data-layer="satellite" onclick="switchLayer('satellite')">卫星</button>
    <button class="layer-btn" data-layer="wgs84" onclick="switchLayer('wgs84')">WGS84</button>
    <button class="layer-btn" data-layer="amap" onclick="switchLayer('amap')">高德</button>
    <button class="layer-btn" data-layer="voyager" onclick="switchLayer('voyager')">彩色</button>
    <button class="layer-btn" data-layer="standard" onclick="switchLayer('standard')">标准</button>
    <button class="layer-btn" data-layer="dark" onclick="switchLayer('dark')">暗色</button>
  </div>
</div>

<div class="panel">
  <div class="error-banner" id="errorBanner">
    <b>储存失败：WLOC 模块未生效</b>
    请检查以下配置：<br>
    1. 小火箭 / 圈 X 是否已开启，顶部是否有 VPN 图标<br>
    2. WLOC 模块或重写是否已启用<br>
    3. HTTPS 解密 / MITM 是否已开启<br>
    4. 证书是否已安装并完全信任<br>
    5. MITM 主机名是否包含 gs-loc.apple.com 和 gs-loc-cn.apple.com<br>
    6. 当前网页请求是否走代理工具
  </div>

  <div class="card">
    <h3>选择目标位置</h3>
    <div class="coords" id="coords">点击地图或使用下方工具选择位置</div>
    <div class="row">
      <button class="btn btn-primary" id="saveBtn" onclick="save()">储存到设备</button>
      <button class="btn btn-secondary" onclick="locateMe()">当前位置</button>
      <button class="btn btn-secondary" onclick="addFav()">收藏位置</button>
    </div>
  </div>

  <div class="card">
    <div class="fav-header">
      <h3>收藏位置</h3>
      <button class="btn btn-sm btn-secondary" id="clearAllBtn" onclick="clearAllFav()" style="display:none">清空</button>
    </div>
    <div class="fav-list" id="favList"></div>
  </div>

  <div class="card">
    <h3>当前生效坐标</h3>
    <div class="active-loc" id="activeLoc">
      <div class="label">设备持久化数据 (wloc_settings)</div>
      <div class="value" id="activeValue">查询中...</div>
    </div>
    <div class="row">
      <button class="btn btn-sm btn-secondary" onclick="queryActive()">刷新</button>
      <button class="btn btn-sm btn-danger" onclick="clearActive()">清除数据</button>
    </div>
  </div>

  <div class="card">
    <h3>粘贴地图链接</h3>
    <div class="input-row">
      <input id="urlInput" placeholder="Apple/Google/高德地图链接 或 经纬度" />
      <button class="btn btn-secondary" style="flex:none;min-width:56px" onclick="parseUrl()">解析</button>
    </div>
    <div style="font-size:11px;color:var(--gray);margin-top:6px">支持 Apple Maps · Google Maps · 高德 · 百度 · 坐标文本</div>
  </div>

  <div class="card">
    <h3>搜索地点</h3>
    <div class="input-row">
      <input id="searchInput" placeholder="输入地名（如: 上海外滩）" />
      <button class="btn btn-secondary" style="flex:none;min-width:56px" onclick="searchPlace()">搜索</button>
    </div>
  </div>

  <div class="status" id="status">选好位置后点击「储存到设备」写入代理工具</div>
</div>

<div class="toast" id="toast"></div>

<div class="modal-overlay" id="favModal">
  <div class="modal">
    <h3>收藏此位置</h3>
    <input id="favNameInput" placeholder="输入备注名称（如: 公司、家）" maxlength="30" />
    <div style="font-size:12px;color:var(--gray);margin-bottom:12px;text-align:center" id="favModalCoords"></div>
    <div class="modal-btns">
      <button class="btn btn-secondary" onclick="closeFavModal()">取消</button>
      <button class="btn btn-primary" onclick="confirmFav()">保存</button>
    </div>
  </div>
</div>

<script>
const SAVE_API = 'https://gs-loc.apple.com/wloc-settings/save';
const FAV_KEY = 'wloc_favorites';

let lat = 22.544577;
let lon = 113.94114;
let selected = false;
let activeLon = null;
let activeLat = null;

const map = L.map('map').setView([lat, lon], 13);

const tiles = {
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom:19,
    attribution:'ArcGIS'
  }),
  wgs84: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom:19,
    attribution:'ArcGIS WGS84'
  }),
  standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom:19,
    attribution:'\\u00a9 OSM'
  }),
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom:19,
    attribution:'\\u00a9 Carto'
  }),
  amap: L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
    maxZoom:18,
    subdomains:'1234',
    attribution:'\\u00a9 高德'
  }),
  voyager: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom:19,
    attribution:'\\u00a9 Carto'
  })
};

let currentLayer = tiles.satellite;
currentLayer.addTo(map);

function switchLayer(name) {
  if (!tiles[name]) return;

  map.removeLayer(currentLayer);
  currentLayer = tiles[name];
  currentLayer.addTo(map);

  document.querySelectorAll('.layer-btn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.layer === name);
  });
}

let marker = L.marker([lat, lon], { draggable:true }).addTo(map);

marker.on('dragend', function (e) {
  const p = e.target.getLatLng();
  setPos(p.lat, p.lng);
});

map.on('click', function (e) {
  setPos(e.latlng.lat, e.latlng.lng);
});

function makeNonce() {
  return Date.now() + '-' + Math.random().toString(16).slice(2);
}

function closeEnough(a, b) {
  return Math.abs(Number(a) - Number(b)) < 0.000001;
}

function isHit(d, nonce) {
  return !!(
    d &&
    d.wloc === 'WLOC_SETTINGS_HIT' &&
    d.nonce === nonce
  );
}

function isValidCoord(latValue, lonValue) {
  const la = Number(latValue);
  const lo = Number(lonValue);

  return (
    Number.isFinite(la) &&
    Number.isFinite(lo) &&
    la >= -90 &&
    la <= 90 &&
    lo >= -180 &&
    lo <= 180
  );
}

function setPos(newLat, newLon) {
  if (!isValidCoord(newLat, newLon)) {
    toast('坐标无效', 3000);
    return;
  }

  lat = Number(newLat);
  lon = Number(newLon);
  selected = true;

  marker.setLatLng([lat, lon]);

  document.getElementById('coords').textContent =
    '经度 ' + lon.toFixed(6) + ' 纬度 ' + lat.toFixed(6);
}

function moveTo(newLat, newLon, zoom) {
  setPos(newLat, newLon);
  map.setView([lat, lon], zoom || 15);
}

function toast(msg, ms) {
  const t = document.getElementById('toast');

  t.textContent = msg;
  t.classList.add('show');

  setTimeout(function () {
    t.classList.remove('show');
  }, ms || 2500);
}

function showError(show) {
  document.getElementById('errorBanner').style.display = show ? 'block' : 'none';
}

function getFavs() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveFavs(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderFavs() {
  const favs = getFavs();
  const el = document.getElementById('favList');
  const clearBtn = document.getElementById('clearAllBtn');

  clearBtn.style.display = favs.length ? '' : 'none';

  if (!favs.length) {
    el.innerHTML = '<div class="fav-empty">暂无收藏，选好位置后点击「收藏位置」</div>';
    return;
  }

  el.innerHTML = favs.map(function (f, i) {
    const fLon = Number(f.lon);
    const fLat = Number(f.lat);

    const isActive =
      activeLon !== null &&
      closeEnough(fLon, activeLon) &&
      closeEnough(fLat, activeLat);

    return '<div class="fav-item" onclick="loadFav(' + i + ')">' +
      '<div class="fav-info">' +
      '<div class="fav-name">' + escHtml(f.name) + '<\\/div>' +
      '<div class="fav-coords">' + fLon.toFixed(6) + ', ' + fLat.toFixed(6) + '<\\/div>' +
      (isActive ? '<div class="fav-active">\\u2713 当前生效<\\/div>' : '') +
      '<\\/div>' +
      '<button class="fav-del" onclick="event.stopPropagation();delFav(' + i + ')" title="删除">\\u00d7<\\/button>' +
      '<\\/div>';
  }).join('');
}

function addFav() {
  if (!selected) {
    toast('请先在地图上选择一个位置');
    return;
  }

  document.getElementById('favModalCoords').textContent =
    lon.toFixed(6) + ', ' + lat.toFixed(6);

  document.getElementById('favNameInput').value = '';
  document.getElementById('favModal').classList.add('show');

  setTimeout(function () {
    document.getElementById('favNameInput').focus();
  }, 100);
}

function closeFavModal() {
  document.getElementById('favModal').classList.remove('show');
}

function confirmFav() {
  const name = document.getElementById('favNameInput').value.trim();

  if (!name) {
    toast('请输入备注名称');
    return;
  }

  const favs = getFavs();

  favs.push({
    name,
    lon,
    lat,
    time: new Date().toISOString()
  });

  saveFavs(favs);
  closeFavModal();
  renderFavs();
  toast('已收藏: ' + name);
}

function loadFav(i) {
  const favs = getFavs();

  if (!favs[i]) return;

  moveTo(favs[i].lat, favs[i].lon, 15);
  toast(favs[i].name + ' (' + Number(favs[i].lon).toFixed(4) + ', ' + Number(favs[i].lat).toFixed(4) + ')');
}

function delFav(i) {
  const favs = getFavs();

  if (!favs[i]) return;

  const name = favs[i].name;
  favs.splice(i, 1);
  saveFavs(favs);
  renderFavs();
  toast('已删除: ' + name);
}

function clearAllFav() {
  if (!confirm('确定清空所有收藏？')) return;

  saveFavs([]);
  renderFavs();
  toast('已清空所有收藏');
}

function queryActive() {
  const el = document.getElementById('activeValue');
  const nonce = makeNonce();

  el.textContent = '查询中...';

  fetch(
    SAVE_API +
      '?action=query' +
      '&nonce=' + encodeURIComponent(nonce) +
      '&t=' + Date.now(),
    {
      method:'GET',
      mode:'cors',
      cache:'no-store'
    }
  )
    .then(function (r) {
      if (!r.ok) {
        throw new Error('HTTP ' + r.status);
      }

      return r.json();
    })
    .then(function (d) {
      if (!isHit(d, nonce)) {
        throw new Error('未命中 WLOC 脚本');
      }

      if (
        d.success === true &&
        isValidCoord(d.latitude, d.longitude)
      ) {
        activeLon = Number(d.longitude);
        activeLat = Number(d.latitude);

        el.textContent =
          '经度 ' + activeLon.toFixed(6) +
          ' 纬度 ' + activeLat.toFixed(6) +
          (d.accuracy ? ' 精度 ' + d.accuracy + 'm' : '') +
          (d.runtime ? ' · ' + d.runtime : '');

        renderFavs();
      } else {
        activeLon = null;
        activeLat = null;
        el.textContent = d.error || '无已保存的坐标';
        renderFavs();
      }
    })
    .catch(function (e) {
      activeLon = null;
      activeLat = null;
      el.textContent = '查询失败：WLOC 模块未生效，请检查小火箭 / 圈 X / MITM / 证书';
      renderFavs();
      console.log('[WLOC query failed]', e);
    });
}

function clearActive() {
  if (!confirm('确定清除设备上已保存的坐标？清除后将使用模块默认参数或停止修改定位。')) return;

  const nonce = makeNonce();

  fetch(
    SAVE_API +
      '?action=clear' +
      '&nonce=' + encodeURIComponent(nonce) +
      '&t=' + Date.now(),
    {
      method:'GET',
      mode:'cors',
      cache:'no-store'
    }
  )
    .then(function (r) {
      if (!r.ok) {
        throw new Error('HTTP ' + r.status);
      }

      return r.json();
    })
    .then(function (d) {
      if (!isHit(d, nonce)) {
        throw new Error('未命中 WLOC 脚本');
      }

      if (d.success === true) {
        activeLon = null;
        activeLat = null;

        document.getElementById('activeValue').textContent = '已清除';
        renderFavs();
        toast('已清除设备坐标');
      } else {
        toast('清除失败: ' + (d.error || '未知错误'), 4000);
      }
    })
    .catch(function (e) {
      showError(true);
      toast('清除失败 - 请检查小火箭 / 圈 X / MITM / 证书 / 模块', 5000);
      console.log('[WLOC clear failed]', e);
    });
}

async function save() {
  if (!selected) {
    toast('请先在地图上选择一个位置');
    return;
  }

  const btn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  btn.textContent = '储存中...';
  btn.disabled = true;
  btn.className = 'btn btn-primary';

  showError(false);

  const nonce = makeNonce();

  const failMsg =
    '储存失败：WLOC 模块未生效。请检查小火箭 / 圈 X 是否开启、模块或重写是否启用、MITM 是否开启、证书是否已安装并完全信任。';

  try {
    const saveUrl =
      SAVE_API +
      '?lon=' + encodeURIComponent(lon) +
      '&lat=' + encodeURIComponent(lat) +
      '&acc=25' +
      '&nonce=' + encodeURIComponent(nonce) +
      '&t=' + Date.now();

    const r = await fetch(saveUrl, {
      method:'GET',
      mode:'cors',
      cache:'no-store'
    });

    if (!r.ok) {
      throw new Error('HTTP ' + r.status);
    }

    const d = await r.json();

    const saveOk =
      d &&
      d.success === true &&
      d.wloc === 'WLOC_SETTINGS_HIT' &&
      d.nonce === nonce &&
      isValidCoord(d.latitude, d.longitude) &&
      closeEnough(d.longitude, lon) &&
      closeEnough(d.latitude, lat);

    if (!saveOk) {
      throw new Error((d && d.error) || '未命中 WLOC 脚本');
    }

    const queryNonce = makeNonce();

    const q = await fetch(
      SAVE_API +
        '?action=query' +
        '&nonce=' + encodeURIComponent(queryNonce) +
        '&t=' + Date.now(),
      {
        method:'GET',
        mode:'cors',
        cache:'no-store'
      }
    );

    if (!q.ok) {
      throw new Error('query HTTP ' + q.status);
    }

    const qd = await q.json();

    const queryOk =
      qd &&
      qd.success === true &&
      qd.wloc === 'WLOC_SETTINGS_HIT' &&
      qd.nonce === queryNonce &&
      isValidCoord(qd.latitude, qd.longitude) &&
      closeEnough(qd.longitude, lon) &&
      closeEnough(qd.latitude, lat);

    if (!queryOk) {
      throw new Error((qd && qd.error) || '保存后读取校验失败');
    }

    activeLon = lon;
    activeLat = lat;

    btn.textContent = '\\u2713 已储存';
    btn.className = 'btn btn-primary success';

    status.textContent =
      '\\u2713 已写入并校验通过: ' +
      lon.toFixed(6) +
      ', ' +
      lat.toFixed(6) +
      ' \\u00b7 ' +
      new Date().toLocaleTimeString('zh-CN') +
      (qd.runtime ? ' \\u00b7 ' + qd.runtime : '');

    document.getElementById('activeValue').textContent =
      '经度 ' + lon.toFixed(6) +
      ' 纬度 ' + lat.toFixed(6) +
      ' 精度 25m' +
      (qd.runtime ? ' · ' + qd.runtime : '');

    renderFavs();

    toast('\\u2713 坐标已写入设备，WLOC 模块链路正常');

    setTimeout(function () {
      btn.textContent = '储存到设备';
      btn.className = 'btn btn-primary';
      btn.disabled = false;
    }, 2500);

  } catch (e) {
    btn.textContent = '储存到设备';
    btn.className = 'btn btn-primary';
    btn.disabled = false;

    showError(true);

    status.textContent = '\\u2717 ' + failMsg;

    toast('\\u2717 储存失败 - 请检查小火箭 / 圈 X / MITM / 证书 / 模块', 5000);

    console.log('[WLOC save failed]', e);
  }
}

function locateMe() {
  if (!navigator.geolocation) {
    toast('浏览器不支持定位');
    return;
  }

  toast('获取位置中...');

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      moveTo(pos.coords.latitude, pos.coords.longitude, 16);
      toast('已获取当前位置');
    },
    function (err) {
      toast('定位失败: ' + err.message, 3000);
    },
    {
      enableHighAccuracy:true,
      timeout:10000
    }
  );
}

function parseMapUrl(text) {
  let m;

  m = text.match(/ll=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };

  m = text.match(/@([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };

  m = text.match(/lnglat=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[2]), lon: parseFloat(m[1]) };

  m = text.match(/(?:location|center)=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[2]), lon: parseFloat(m[1]) };

  m = text.match(/([0-9]+\\.[0-9]+)[,\\s]+([0-9]+\\.[0-9]+)/);

  if (m) {
    const a = parseFloat(m[1]);
    const b = parseFloat(m[2]);

    if (a < 90 && b > 90) return { lat: a, lon: b };
    if (b < 90 && a > 90) return { lat: b, lon: a };

    return { lat: a, lon: b };
  }

  return null;
}

function parseUrl() {
  const input = document.getElementById('urlInput').value.trim();

  if (!input) {
    toast('请粘贴地图链接或坐标');
    return;
  }

  const result = parseMapUrl(input);

  if (!result) {
    toast('无法解析坐标，请检查链接格式', 3000);
    return;
  }

  moveTo(result.lat, result.lon, 15);
  toast('已解析: ' + result.lon.toFixed(4) + ', ' + result.lat.toFixed(4));
}

async function searchPlace() {
  const q = document.getElementById('searchInput').value.trim();

  if (!q) {
    toast('请输入地名');
    return;
  }

  toast('搜索中...');

  try {
    const r = await fetch(
      'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q)
    );

    const results = await r.json();

    if (!results.length) {
      toast('未找到: ' + q, 3000);
      return;
    }

    const p = results[0];

    moveTo(parseFloat(p.lat), parseFloat(p.lon), 15);
    toast(p.display_name.slice(0, 40));
  } catch (e) {
    toast('搜索失败', 3000);
  }
}

document.addEventListener('paste', function (e) {
  const text = (e.clipboardData || window.clipboardData).getData('text');

  if (
    text &&
    (
      text.includes('map') ||
      text.includes('loc') ||
      text.includes('lnglat') ||
      /[0-9]+\\.[0-9]+/.test(text)
    )
  ) {
    document.getElementById('urlInput').value = text;
    setTimeout(parseUrl, 200);
  }
});

document.getElementById('searchInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') searchPlace();
});

document.getElementById('urlInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') parseUrl();
});

document.getElementById('favNameInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') confirmFav();
});

renderFavs();
queryActive();
<\/script>
</body>
</html>`;
}
