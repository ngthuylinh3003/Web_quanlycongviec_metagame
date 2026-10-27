/* Mã hoá / giải mã dữ liệu trong trình duyệt.
 * - Khoá sinh từ "tên đăng nhập + mật khẩu" bằng PBKDF2-SHA256 (250.000 vòng).
 * - Dữ liệu mã hoá bằng AES-256-GCM, sai mật khẩu thì không giải mã được.
 */
(function () {
  'use strict';
  var enc = new TextEncoder();
  var dec = new TextDecoder();
  var ITER = 250000;

  function toB64(buf) {
    var a = new Uint8Array(buf), s = '';
    for (var i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function fromB64(str) {
    var s = atob(str), a = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return a;
  }
  function norm(user) { return String(user || '').trim().toLowerCase(); }

  async function deriveKey(user, pass, salt, iter, extractable) {
    var base = await crypto.subtle.importKey('raw', enc.encode(norm(user) + '\n' + pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, !!extractable, ['encrypt', 'decrypt']);
  }
  async function encryptJSON(key, obj) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(JSON.stringify(obj)));
    return { iv: toB64(iv), ct: toB64(ct) };
  }
  async function decryptJSON(key, pack) {
    var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(pack.iv) }, key, fromB64(pack.ct));
    return JSON.parse(dec.decode(pt));
  }
  async function exportKey(key) { return toB64(await crypto.subtle.exportKey('raw', key)); }
  async function importKey(raw) { return crypto.subtle.importKey('raw', fromB64(raw), 'AES-GCM', true, ['encrypt', 'decrypt']); }

  /* Tạo file data.enc.json mới từ dữ liệu + tài khoản */
  async function makeFile(user, pass, obj) {
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var key = await deriveKey(user, pass, salt, ITER, false);
    var p = await encryptJSON(key, obj);
    return { v: 1, iter: ITER, salt: toB64(salt), iv: p.iv, ct: p.ct };
  }
  /* Mở file data.enc.json bằng tài khoản, trả về { key, data } */
  async function openFile(file, user, pass, extractable) {
    var key = await deriveKey(user, pass, fromB64(file.salt), file.iter || ITER, extractable);
    var data = await decryptJSON(key, file);
    return { key: key, data: data };
  }

  window.WH_CRYPTO = {
    ITER: ITER, toB64: toB64, fromB64: fromB64, deriveKey: deriveKey,
    encryptJSON: encryptJSON, decryptJSON: decryptJSON,
    exportKey: exportKey, importKey: importKey, makeFile: makeFile, openFile: openFile
  };
})();
