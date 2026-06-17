/**
 * ui.js — Liquid Vault
 * تمام عملیات DOM: رندر، فرم‌ها، modal، toast، جستجو
 */

const UI = (() => {

  // ─── صفحه‌ها ──────────────────────────────────────────────────────────────

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) screen.classList.add('active');
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  function setLoading(state) {
    document.body.classList.toggle('is-loading', state);
  }

  // ─── Toast ────────────────────────────────────────────────────────────────

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ─── Confirm Dialog ───────────────────────────────────────────────────────

  function showConfirm(message, onConfirm) {
    const overlay = document.getElementById('modal-overlay');
    const modal   = document.getElementById('modal');

    modal.innerHTML = `
      <div class="modal__header">
        <h3 class="modal__title">تأیید عملیات</h3>
      </div>
      <div class="modal__body">
        <p class="confirm-message">${message}</p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--ghost" id="btn-cancel">انصراف</button>
        <button class="btn btn--danger" id="btn-confirm">حذف</button>
      </div>
    `;

    overlay.classList.add('active');

    document.getElementById('btn-cancel').onclick  = () => closeModal();
    document.getElementById('btn-confirm').onclick = () => { onConfirm(); closeModal(); };
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('modal').innerHTML = '';
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  function renderDashboard(stats, items) {
    _renderStats(stats);
    _renderItems(items);
  }

  function _renderStats(stats) {
    document.getElementById('stat-total').textContent    = stats.total;
    document.getElementById('stat-password').textContent = stats.password;
    document.getElementById('stat-note').textContent     = stats.note;
    document.getElementById('stat-card').textContent     = stats.card;
  }

  function _renderItems(items) {
    const list = document.getElementById('items-list');

    if (items.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔒</div>
          <p class="empty-state__text">آیتمی یافت نشد</p>
          <p class="empty-state__sub">برای افزودن، دکمه + را بزنید</p>
        </div>
      `;
      return;
    }

    list.innerHTML = items.map(item => _itemCard(item)).join('');

    list.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', () => {
        App.handleOpenEditForm(card.dataset.id);
      });
    });
  }

  function _itemCard(item) {
    const icons = { password: '🔑', note: '📝', card: '💳' };
    const labels = { password: 'رمز عبور', note: 'یادداشت', card: 'کارت' };

    let subtitle = '';
    if (item.type === 'password' && item.data.username) subtitle = item.data.username;
    if (item.type === 'password' && item.data.url)      subtitle = item.data.url;
    if (item.type === 'card'     && item.data.bank_name) subtitle = item.data.bank_name;
    if (item.type === 'card'     && item.data.card_number) {
      const n = item.data.card_number.replace(/\s/g, '');
      subtitle = (item.data.bank_name ? item.data.bank_name + ' · ' : '') + '•••• ' + n.slice(-4);
    }

    return `
      <div class="item-card" data-id="${item.id}" role="button" tabindex="0">
        <div class="item-card__icon">${icons[item.type] || '📄'}</div>
        <div class="item-card__content">
          <p class="item-card__title">${_esc(item.title)}</p>
          ${subtitle ? `<p class="item-card__sub">${_esc(subtitle)}</p>` : ''}
        </div>
        <div class="item-card__badge">${labels[item.type]}</div>
      </div>
    `;
  }

  // ─── فرم آیتم (افزودن / ویرایش) ──────────────────────────────────────────

  function showItemForm(item, mode) {
    const isEdit  = mode === 'edit';
    const overlay = document.getElementById('modal-overlay');
    const modal   = document.getElementById('modal');
    const type    = item.type || 'password';

    modal.innerHTML = `
      <div class="modal__header">
        <h3 class="modal__title">${isEdit ? 'ویرایش آیتم' : 'افزودن آیتم'}</h3>
        <button class="modal__close" id="btn-modal-close" aria-label="بستن">✕</button>
      </div>

      ${!isEdit ? `
      <div class="type-tabs">
        <button class="type-tab ${type==='password'?'active':''}" data-type="password">🔑 رمز عبور</button>
        <button class="type-tab ${type==='note'?'active':''}"     data-type="note">📝 یادداشت</button>
        <button class="type-tab ${type==='card'?'active':''}"     data-type="card">💳 کارت</button>
      </div>
      ` : ''}

      <div class="modal__body" id="form-body">
        ${_buildForm(type, item.data || {})}
      </div>

      <div class="modal__footer">
        ${isEdit ? `<button class="btn btn--danger" id="btn-delete">حذف</button>` : ''}
        <button class="btn btn--ghost"    id="btn-cancel-form">انصراف</button>
        <button class="btn btn--primary"  id="btn-save">${isEdit ? 'ذخیره' : 'افزودن'}</button>
      </div>
    `;

    overlay.classList.add('active');
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    document.getElementById('btn-modal-close').onclick  = closeModal;
    document.getElementById('btn-cancel-form').onclick  = closeModal;

    // سوییچ نوع (فقط در حالت افزودن)
    if (!isEdit) {
      let currentType = type;
      modal.querySelectorAll('.type-tab').forEach(tab => {
        tab.onclick = () => {
          modal.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          currentType = tab.dataset.type;
          document.getElementById('form-body').innerHTML = _buildForm(currentType, {});
          _bindSecretToggles();
        };
      });
    }

    // ذخیره
    document.getElementById('btn-save').onclick = () => {
      const activeType = isEdit ? type : (modal.querySelector('.type-tab.active')?.dataset.type || 'password');
      const data = _collectForm(activeType);
      if (!data) return;

      const title = document.getElementById('field-title').value.trim();
      if (!title) { showToast('عنوان الزامی است.', 'error'); return; }

      if (isEdit) {
        App.handleEditItem(item.id, { title, type: activeType, data });
      } else {
        App.handleAddItem({ title, type: activeType, data });
      }
    };

    // حذف (فقط ویرایش)
    if (isEdit) {
      document.getElementById('btn-delete').onclick = () => App.handleDeleteItem(item.id);
    }

    _bindSecretToggles();
  }

  // ─── سازنده فرم‌ها ────────────────────────────────────────────────────────

  function _buildForm(type, data) {
    const titleField = `
      <div class="form-group">
        <label class="form-label">عنوان</label>
        <input class="form-input" id="field-title" type="text"
               placeholder="مثال: Gmail، کارت ملت..."
               value="${_esc(data.title || '')}" autocomplete="off">
      </div>
    `;

    if (type === 'password') return titleField + _formPassword(data);
    if (type === 'note')     return titleField + _formNote(data);
    if (type === 'card')     return titleField + _formCard(data);
    return titleField;
  }

  function _formPassword(data) {
    return `
      <div class="form-group">
        <label class="form-label">نام کاربری / ایمیل</label>
        <input class="form-input" id="field-username" type="text"
               value="${_esc(data.username || '')}" autocomplete="off">
      </div>
      <div class="form-group">
        <label class="form-label">رمز عبور</label>
        <div class="secret-field">
          <input class="form-input" id="field-password" type="password"
                 value="${_esc(data.password || '')}" autocomplete="new-password">
          <button type="button" class="secret-toggle" data-target="field-password" aria-label="نمایش رمز">
            <svg class="eye-icon eye-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <svg class="eye-icon eye-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:none">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">آدرس سایت <span class="optional">اختیاری</span></label>
        <input class="form-input" id="field-url" type="text"
               placeholder="https://..."
               value="${_esc(data.url || '')}" autocomplete="off">
      </div>
      <div class="form-group">
        <label class="form-label">یادداشت <span class="optional">اختیاری</span></label>
        <textarea class="form-input form-textarea" id="field-notes" rows="3">${_esc(data.notes || '')}</textarea>
      </div>
    `;
  }

  function _formNote(data) {
    return `
      <div class="form-group">
        <label class="form-label">متن یادداشت</label>
        <textarea class="form-input form-textarea" id="field-content" rows="6"
                  placeholder="یادداشت محرمانه خود را اینجا بنویسید...">${_esc(data.content || '')}</textarea>
      </div>
    `;
  }

  function _formCard(data) {
    return `
      <div class="form-group">
        <label class="form-label">نام بانک <span class="optional">اختیاری</span></label>
        <input class="form-input" id="field-bank-name" type="text"
               placeholder="مثال: بانک ملت"
               value="${_esc(data.bank_name || '')}" autocomplete="off">
      </div>
      <div class="form-group">
        <label class="form-label">شماره کارت</label>
        <input class="form-input ltr" id="field-card-number" type="text"
               placeholder="0000 0000 0000 0000" maxlength="19"
               value="${_esc(data.card_number || '')}" autocomplete="off">
      </div>
      <div class="form-group">
        <label class="form-label">نام صاحب کارت</label>
        <input class="form-input ltr" id="field-holder-name" type="text"
               placeholder="FIRSTNAME LASTNAME"
               value="${_esc(data.holder_name || '')}" autocomplete="off">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاریخ انقضا</label>
          <input class="form-input ltr" id="field-expiry" type="text"
                 placeholder="MM/YY" maxlength="5"
                 value="${_esc(data.expiry || '')}" autocomplete="off">
        </div>
        <div class="form-group">
          <label class="form-label">CVV2</label>
          <div class="secret-field">
            <input class="form-input ltr" id="field-cvv" type="password"
                   placeholder="•••" maxlength="4"
                   value="${_esc(data.cvv || '')}" autocomplete="off">
            <button type="button" class="secret-toggle" data-target="field-cvv" aria-label="نمایش CVV">
              ${_eyeIconHTML()}
            </button>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">رمز کارت (PIN)</label>
        <div class="secret-field">
          <input class="form-input ltr" id="field-pin" type="password"
                 placeholder="••••" maxlength="6"
                 value="${_esc(data.pin || '')}" autocomplete="new-password">
          <button type="button" class="secret-toggle" data-target="field-pin" aria-label="نمایش رمز کارت">
            ${_eyeIconHTML()}
          </button>
        </div>
      </div>
    `;
  }

  // ─── آیکون چشم (مشترک) ────────────────────────────────────────────────────

  function _eyeIconHTML() {
    return `
      <svg class="eye-icon eye-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
      <svg class="eye-icon eye-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:none">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    `;
  }

  // ─── bind آیکون چشم ───────────────────────────────────────────────────────

  function _bindSecretToggles() {
    document.querySelectorAll('.secret-toggle').forEach(btn => {
      btn.onclick = () => {
        const input   = document.getElementById(btn.dataset.target);
        const eyeShow = btn.querySelector('.eye-show');
        const eyeHide = btn.querySelector('.eye-hide');
        if (!input) return;

        if (input.type === 'password') {
          input.type        = 'text';
          eyeShow.style.display = 'none';
          eyeHide.style.display = 'block';
        } else {
          input.type        = 'password';
          eyeShow.style.display = 'block';
          eyeHide.style.display = 'none';
        }
      };
    });
  }

  // ─── جمع‌آوری داده فرم ────────────────────────────────────────────────────

  function _collectForm(type) {
    const g = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    if (type === 'password') {
      return {
        username: g('field-username'),
        password: g('field-password'),
        url:      g('field-url'),
        notes:    g('field-notes'),
      };
    }

    if (type === 'note') {
      return { content: g('field-content') };
    }

    if (type === 'card') {
      return {
        bank_name:   g('field-bank-name'),
        card_number: g('field-card-number'),
        holder_name: g('field-holder-name'),
        expiry:      g('field-expiry'),
        cvv:         g('field-cvv'),
        pin:         g('field-pin'),
      };
    }

    return null;
  }

  // ─── فرمت شماره کارت ─────────────────────────────────────────────────────

  function _initCardNumberFormat() {
    document.addEventListener('input', (e) => {
      if (e.target.id !== 'field-card-number') return;
      let v = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });

    document.addEventListener('input', (e) => {
      if (e.target.id !== 'field-expiry') return;
      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
      e.target.value = v;
    });
  }

  // ─── Escape HTML ──────────────────────────────────────────────────────────

  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  return {
    showScreen,
    setLoading,
    showToast,
    showConfirm,
    closeModal,
    renderDashboard,
    showItemForm,
  };

})();
