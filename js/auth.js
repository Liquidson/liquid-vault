/**
 * auth.js — Liquid Vault
 * مدیریت Master Password: ساخت، بررسی، session
 * از Web Crypto API بومی مرورگر استفاده می‌کند (بدون کتابخانه)
 */

const Auth = (() => {

  // session فقط در حافظه RAM — با بستن تب پاک می‌شود
  let _sessionActive = false;

  // ─── هش‌سازی با SHA-256 ────────────────────────────────────────────────────

  /**
   * هش SHA-256 از یک رشته
   * آماده برای جایگزینی با PBKDF2 در نسخه ۱.۰
   * @param {string} text
   * @returns {Promise<string>} hex string
   */
  async function _hash(text) {
    const encoder = new TextEncoder();
    const data     = encoder.encode(text);
    const hashBuf  = await crypto.subtle.digest('SHA-256', data);
    const hashArr  = Array.from(new Uint8Array(hashBuf));
    return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ─── ساخت Master Password ─────────────────────────────────────────────────

  /**
   * اولین اجرا: ساخت و ذخیره Master Password
   * @param {string} password
   * @param {string} confirm
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async function setup(password, confirm) {
    if (!password || password.length < 6) {
      return { ok: false, error: 'رمز باید حداقل ۶ کاراکتر باشد.' };
    }
    if (password !== confirm) {
      return { ok: false, error: 'رمزها با هم مطابقت ندارند.' };
    }

    const hash = await _hash(password);
    const saved = Storage.saveMaster(hash);

    if (!saved) {
      return { ok: false, error: 'خطا در ذخیره‌سازی. فضای مرورگر پر است؟' };
    }

    _sessionActive = true;
    return { ok: true };
  }

  // ─── ورود ─────────────────────────────────────────────────────────────────

  /**
   * بررسی Master Password هنگام ورود
   * @param {string} password
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async function login(password) {
    if (!password) {
      return { ok: false, error: 'رمز عبور را وارد کنید.' };
    }

    const master = Storage.getMaster();
    if (!master) {
      return { ok: false, error: 'vault یافت نشد. لطفاً صفحه را رفرش کنید.' };
    }

    const hash = await _hash(password);

    if (hash !== master.hash) {
      return { ok: false, error: 'رمز عبور اشتباه است.' };
    }

    _sessionActive = true;
    return { ok: true };
  }

  // ─── خروج ─────────────────────────────────────────────────────────────────

  function logout() {
    _sessionActive = false;
  }

  // ─── بررسی session ────────────────────────────────────────────────────────

  function isAuthenticated() {
    return _sessionActive;
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  return {
    setup,
    login,
    logout,
    isAuthenticated,
  };

})();
