/**
 * app.js — Liquid Vault
 * Bootstrap و orchestrator مرکزی
 * هیچ ماژولی مستقیماً با ماژول دیگر صحبت نمی‌کند — همه از اینجا رد می‌شوند
 */

const App = (() => {

  // ─── Bootstrap ────────────────────────────────────────────────────────────

  function init() {
    if (Storage.vaultExists()) {
      UI.showScreen('login');
    } else {
      UI.showScreen('setup');
    }
  }

  // ─── Auth Actions ─────────────────────────────────────────────────────────

  async function handleSetup(password, confirm) {
    UI.setLoading(true);
    const result = await Auth.setup(password, confirm);
    UI.setLoading(false);

    if (!result.ok) {
      UI.showToast(result.error, 'error');
      return;
    }

    UI.showToast('Vault ساخته شد. خوش آمدید!', 'success');
    UI.showScreen('dashboard');
    _renderDashboard();
  }

  async function handleLogin(password) {
    UI.setLoading(true);
    const result = await Auth.login(password);
    UI.setLoading(false);

    if (!result.ok) {
      UI.showToast(result.error, 'error');
      return;
    }

    UI.showScreen('dashboard');
    _renderDashboard();
  }

  function handleLogout() {
    Auth.logout();
    UI.showScreen('login');
    UI.showToast('از vault خارج شدید.', 'info');
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  function _renderDashboard(query = '', type = 'all') {
    const stats = Storage.getStats();
    const items = Storage.searchItems(query, type);
    UI.renderDashboard(stats, items);
  }

  function handleSearch(query, type) {
    _renderDashboard(query, type);
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  function handleAddItem(itemData) {
    Storage.addItem(itemData);
    UI.closeModal();
    UI.showToast('آیتم اضافه شد.', 'success');
    _renderDashboard();
  }

  function handleEditItem(id, updates) {
    Storage.updateItem(id, updates);
    UI.closeModal();
    UI.showToast('تغییرات ذخیره شد.', 'success');
    _renderDashboard();
  }

  function handleDeleteItem(id) {
    UI.showConfirm('آیا مطمئن هستید؟', () => {
      Storage.deleteItem(id);
      UI.closeModal();
      UI.showToast('آیتم حذف شد.', 'success');
      _renderDashboard();
    });
  }

  function handleOpenAddForm(type) {
    UI.showItemForm({ type }, 'add');
  }

  function handleOpenEditForm(id) {
    const item = Storage.getItemById(id);
    if (!item) return;
    UI.showItemForm(item, 'edit');
  }

  function handleCopy(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      UI.showToast(`${label} کپی شد.`, 'success');
    }).catch(() => {
      UI.showToast('کپی ناموفق بود.', 'error');
    });
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  return {
    init,
    handleSetup,
    handleLogin,
    handleLogout,
    handleSearch,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleOpenAddForm,
    handleOpenEditForm,
    handleCopy,
  };

})();

// ─── شروع برنامه ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
