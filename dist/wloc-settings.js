/*
 * wloc-settings.js
 * Save / query / clear WLOC target location.
 * Hit-check version: returns WLOC_SETTINGS_HIT + nonce.
 *
 * Supports:
 * - Shadowrocket / Surge / Loon / Stash: $persistentStore
 * - Quantumult X: $prefs
 */

const STORE_KEY = 'wloc_settings';
const HIT_FLAG = 'WLOC_SETTINGS_HIT';

function runtimeName() {
  if (typeof $prefs !== 'undefined') return 'Quantumult X';
  if (typeof $persistentStore !== 'undefined') return 'PersistentStore';
  return 'Unknown';
}

function parseQuery(url) {
  const query = String(url || '').split('?')[1] || '';
  const clean = query.split('#')[0];
  const params = {};

  for (const item of clean.split('&')) {
    if (!item) continue;

    const idx = item.indexOf('=');
    const rawKey = idx >= 0 ? item.slice(0, idx) : item;
    const rawVal = idx >= 0 ? item.slice(idx + 1) : '';

    let key = rawKey;
    let val = rawVal;

    try {
      key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
    } catch (_) {}

    try {
      val = decodeURIComponent(rawVal.replace(/\+/g, ' '));
    } catch (_) {}

    if (!(key in params)) params[key] = val;
  }

  return params;
}

function storeRead(key) {
  if (typeof $prefs !== 'undefined' && typeof $prefs.valueForKey === 'function') {
    return $prefs.valueForKey(key);
  }

  if (typeof $persistentStore !== 'undefined' && typeof $persistentStore.read === 'function') {
    return $persistentStore.read(key);
  }

  throw new Error('当前运行环境不支持持久化存储');
}

function storeWrite(key, value) {
  if (typeof $prefs !== 'undefined') {
    if (value === null) {
      if (typeof $prefs.removeValueForKey === 'function') {
        const ret = $prefs.removeValueForKey(key);
        return ret !== false;
      }

      if (typeof $prefs.setValueForKey === 'function') {
        const ret = $prefs.setValueForKey('', key);
        return ret !== false;
      }

      return false;
    }

    if (typeof $prefs.setValueForKey === 'function') {
      const ret = $prefs.setValueForKey(JSON.stringify(value), key);
      return ret !== false;
    }

    return false;
  }

  if (typeof $persistentStore !== 'undefined' && typeof $persistentStore.write === 'function') {
    if (value === null) {
      const ret = $persistentStore.write(null, key);
      return ret !== false;
    }

    const ret = $persistentStore.write(JSON.stringify(value), key);
    return ret !== false;
  }

  throw new Error('当前运行环境不支持持久化存储');
}

function readLocation() {
  const raw = storeRead(STORE_KEY);

  if (!raw || raw === 'null' || raw === 'undefined') {
    return null;
  }

  try {
    const data = JSON.parse(raw);

    if (
      data &&
      Number.isFinite(Number(data.longitude)) &&
      Number.isFinite(Number(data.latitude))
    ) {
      return {
        longitude: Number(data.longitude),
        latitude: Number(data.latitude),
        accuracy: Number(data.accuracy || 25),
        updatedAt: data.updatedAt || null
      };
    }

    return null;
  } catch (_) {
    return null;
  }
}

function responseJson(obj) {
  const payload = {
    wloc: HIT_FLAG,
    runtime: runtimeName(),
    ...obj
  };

  const body = JSON.stringify(payload);

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Cache-Control': 'no-store',
    'X-WLOC-HIT': '1'
  };

  /*
   * Quantumult X script-echo-response:
   *   $done({ status, headers, body })
   *
   * Shadowrocket / Surge / Loon / Stash:
   *   $done({ response: { status, headers, body } })
   */
  if (typeof $prefs !== 'undefined' && typeof $persistentStore === 'undefined') {
    $done({
      status: 'HTTP/1.1 200 OK',
      headers,
      body
    });
  } else {
    $done({
      response: {
        status: 200,
        statusCode: 200,
        headers,
        body
      }
    });
  }
}

try {
  const url = $request && $request.url ? $request.url : '';
  const params = parseQuery(url);

  const action = params.action || 'save';
  const nonce = params.nonce || '';

  if (action === 'query') {
    const data = readLocation();

    if (data) {
      responseJson({
        success: true,
        action,
        nonce,
        longitude: data.longitude,
        latitude: data.latitude,
        accuracy: data.accuracy,
        updatedAt: data.updatedAt
      });
    } else {
      responseJson({
        success: false,
        action,
        nonce,
        error: '无已保存坐标'
      });
    }

  } else if (action === 'clear') {
    const ok = storeWrite(STORE_KEY, null);

    responseJson({
      success: !!ok,
      action,
      nonce,
      error: ok ? undefined : '清除失败：持久化存储返回 false'
    });

  } else {
    const longitude = Number(params.lon || params.longitude);
    const latitude = Number(params.lat || params.latitude);
    const accuracy = Number(params.acc || params.accuracy || 25);

    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      responseJson({
        success: false,
        action,
        nonce,
        error: '缺少或非法 lon/lat 参数'
      });
    } else {
      const data = {
        longitude,
        latitude,
        accuracy: Number.isFinite(accuracy) ? accuracy : 25,
        updatedAt: new Date().toISOString()
      };

      const ok = storeWrite(STORE_KEY, data);

      responseJson({
        success: !!ok,
        action,
        nonce,
        longitude: data.longitude,
        latitude: data.latitude,
        accuracy: data.accuracy,
        updatedAt: data.updatedAt,
        error: ok ? undefined : '写入失败：持久化存储返回 false'
      });
    }
  }

} catch (e) {
  responseJson({
    success: false,
    error: String(e && e.message ? e.message : e)
  });
}
