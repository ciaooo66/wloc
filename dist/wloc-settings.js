/* wloc-settings.js - Shadowrocket hit-check version */

const STORE_KEY = 'wloc_settings';
const HIT_FLAG = 'WLOC_SETTINGS_HIT';

function parseQuery(url) {
  const query = (url.split('?')[1] || '').split('#')[0];
  const params = {};

  for (const item of query.split('&')) {
    if (!item) continue;

    const idx = item.indexOf('=');
    const key = idx >= 0 ? item.slice(0, idx) : item;
    const val = idx >= 0 ? item.slice(idx + 1) : '';

    let k = key;
    let v = val;

    try {
      k = decodeURIComponent(key.replace(/\+/g, ' '));
    } catch (_) {}

    try {
      v = decodeURIComponent(val.replace(/\+/g, ' '));
    } catch (_) {}

    if (!(k in params)) params[k] = v;
  }

  return params;
}

function readStore() {
  const raw = $persistentStore.read(STORE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function writeStore(value) {
  return $persistentStore.write(JSON.stringify(value), STORE_KEY);
}

function response(obj) {
  const body = {
    wloc: HIT_FLAG,
    ...obj
  };

  $done({
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'no-store',
        'X-WLOC-HIT': '1'
      },
      body: JSON.stringify(body)
    }
  });
}

try {
  const url = $request.url || '';
  const params = parseQuery(url);

  const action = params.action || 'save';
  const nonce = params.nonce || '';

  if (action === 'query') {
    const data = readStore();

    if (
      data &&
      Number.isFinite(Number(data.longitude)) &&
      Number.isFinite(Number(data.latitude))
    ) {
      response({
        success: true,
        action,
        nonce,
        longitude: Number(data.longitude),
        latitude: Number(data.latitude),
        accuracy: Number(data.accuracy || 25),
        updatedAt: data.updatedAt || null
      });
    } else {
      response({
        success: false,
        action,
        nonce,
        error: '无已保存坐标'
      });
    }

  } else if (action === 'clear') {
    const ok = writeStore(null);

    response({
      success: !!ok,
      action,
      nonce,
      error: ok ? undefined : '清除失败：persistentStore.write 返回 false'
    });

  } else {
    const longitude = Number(params.lon || params.longitude);
    const latitude = Number(params.lat || params.latitude);
    const accuracy = Number(params.acc || params.accuracy || 25);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      response({
        success: false,
        action,
        nonce,
        error: '缺少或非法 lon/lat 参数'
      });
    } else {
      const data = {
        longitude,
        latitude,
        accuracy,
        updatedAt: new Date().toISOString()
      };

      const ok = writeStore(data);

      response({
        success: !!ok,
        action,
        nonce,
        longitude,
        latitude,
        accuracy,
        error: ok ? undefined : '写入失败：persistentStore.write 返回 false'
      });
    }
  }

} catch (e) {
  response({
    success: false,
    error: String(e && e.message ? e.message : e)
  });
}
