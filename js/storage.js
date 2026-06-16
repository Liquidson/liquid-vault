/**
 * storage.js — Liquid Vault
 * تنها نقطه دسترسی به LocalStorage
 * هیچ ماژول دیگری مستقیماً با localStorage کار نمی‌کند
 */

const Storage = (() => {

  const KEYS = {
    MASTER: 'lv_master',
    ITEMS:  'lv_items',
  };

  const SCHEMA_VERSION = '0.1';

  // ─── خواندن خام از localStorage ───────────────────────────────────────────
  function _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ─── نوشتن خام در localStorage ────────────────────────────────────────────
  function _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  // ─── Master Password ───────────────────────────────────────────────────────

  /** بررسی اینکه vault از قبل ساخته شده یا نه */
  function vaultExists() {
    return _get(KEYS.MASTER) !== null;
  }

  /** ذخیره هش Master Password و metadata اولیه */
  function saveMaster(hash) {
    return _set(KEYS.MASTER, {
      hash,
      created_at:     Date.now(),
      schema_version: SCHEMA_VERSION,
    });
  }

  /** دریافت اطلاعات master (برای مقایسه هش) */
  function getMaster() {
    return _get(KEYS.MASTER);
  }

  // ─── آیتم‌ها ───────────────────────────────────────────────────────────────

  /** دریافت همه آیتم‌ها */
  function getAllItems() {
    return _get(KEYS.ITEMS) || [];
  }

  /** ذخیره کل آرایه آیتم‌ها */
  function _saveAllItems(items) {
    return _set(KEYS.ITEMS, items);
  }

  /** افزودن آیتم جدید */
  function addItem(item) {
    const items = getAllItems();
    const newItem = {
      ...item,
      id:         _generateId(),
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    items.push(newItem);
    _saveAllItems(items);
    return newItem;
  }

  /** ویرایش آیتم موجود */
  function updateItem(id, updates) {
    const items = getAllItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return false;

    items[index] = {
      ...items[index],
      ...updates,
      id,
      updated_at: Date.now(),
    };
    return _saveAllItems(items);
  }

  /** حذف آیتم */
  function deleteItem(id) {
    const items = getAllItems();
    const filtered = items.filter(i => i.id !== id);
    if (filtered.length === items.length) return false;
    return _saveAllItems(filtered);
  }

  /** دریافت یک آیتم بر اساس id */
  function getItemById(id) {
    return getAllItems().find(i => i.id === id) || null;
  }

  // ─── جستجو و فیلتر ────────────────────────────────────────────────────────

  /**
   * جستجو و فیلتر آیتم‌ها
   * @param {string} query - متن جستجو
   * @param {string} type  - 'all' | 'password' | 'note' | 'card'
   */
  function searchItems(query = '', type = 'all') {
    let items = getAllItems();

    if (type !== 'all') {
      items = items.filter(i => i.type === type);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.data.username && i.data.username.toLowerCase().includes(q)) ||
        (i.data.url      && i.data.url.toLowerCase().includes(q)) ||
        (i.data.bank_name && i.data.bank_name.toLowerCase().includes(q))
      );
    }

    return items;
  }

  // ─── آمار ────────────────────────────────────────────────────────────────

  /** تعداد آیتم‌ها به تفکیک دسته */
  function getStats() {
    const items = getAllItems();
    return {
      total:    items.length,
      password: items.filter(i => i.type === 'password').length,
      note:     items.filter(i => i.type === 'note').length,
      card:     items.filter(i => i.type === 'card').length,
    };
  }

  // ─── پاک کردن کامل (خروج / reset) ────────────────────────────────────────

  function clearAll() {
    localStorage.removeItem(KEYS.MASTER);
    localStorage.removeItem(KEYS.ITEMS);
  }

  // ─── ابزار ────────────────────────────────────────────────────────────────

  function _generateId() {
    return 'lv_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  return {
    vaultExists,
    saveMaster,
    getMaster,
    getAllItems,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
    searchItems,
    getStats,
    clearAll,
  };

})();
