(() => {
  const cfg = window.QUEST_CONFIG;
  const d = document;
  let offset = 0;

  const ruWeek = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
  const pad = n => String(n).padStart(2, '0');
  const iso = date => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  const ruDate = date => `${pad(date.getDate())}.${pad(date.getMonth()+1)}`;

  function priceForSlot(time) {
    const p = cfg.prices.find(row => time >= row.from && time <= row.to) || cfg.prices[0];
    return p.price;
  }

  function renderStatic() {
    d.title = `${cfg.businessName} — ${cfg.questName} | ${cfg.city}`;
    d.querySelector('h1').textContent = `«${cfg.questName}»`;
    d.querySelector('.lead').textContent = cfg.subtitle;
    d.getElementById('year').textContent = new Date().getFullYear();
    d.getElementById('addressText').textContent = cfg.address;
    d.getElementById('phoneLink').href = `tel:${cfg.phoneHref}`;
    d.getElementById('emailLink').href = `mailto:${cfg.email}`;

    d.getElementById('features').innerHTML = cfg.features.map((text, i) => `
      <article class="feature-card"><span>${i+1}</span><strong>${text}</strong></article>
    `).join('');

    d.getElementById('priceList').innerHTML = cfg.prices.map(row => `
      <article class="price-card">
        <div><h3>${row.label}</h3><p class="muted">${row.from} – ${row.to}</p></div>
        <strong>${row.price.toLocaleString('ru-RU')} ₽</strong>
      </article>
    `).join('');

    d.getElementById('rules').innerHTML = `<h3>Правила бронирования</h3><ul>${cfg.rules.map(r => `<li>${r}</li>`).join('')}</ul>`;
  }

  function renderCalendar() {
    const start = new Date();
    start.setDate(start.getDate() + offset);
    const days = [];
    for (let i = 0; i < Math.min(cfg.daysAhead, 6); i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }

    d.getElementById('bookingGrid').innerHTML = days.map(date => {
      const id = iso(date);
      const closedDate = cfg.closedDates.includes(id);
      const slots = cfg.slots.map(time => {
        const closed = closedDate || cfg.closedSlots.includes(`${id}|${time}`);
        const price = priceForSlot(time);
        return `<button class="slot ${closed ? 'closed' : ''}" ${closed ? 'disabled' : ''} data-date="${id}" data-date-ru="${ruDate(date)}" data-time="${time}" data-price="${price}">
          ${time}<small>${price.toLocaleString('ru-RU')} ₽</small>
        </button>`;
      }).join('');
      return `<article class="day-card">
        <div class="day-head"><strong>${ruDate(date)}</strong><span>${ruWeek[date.getDay()]}</span></div>
        <div class="slot-list">${slots}</div>
      </article>`;
    }).join('');
  }

  function openModal(btn) {
    const modal = d.getElementById('bookingModal');
    const date = btn.dataset.date;
    const time = btn.dataset.time;
    const price = btn.dataset.price;
    d.getElementById('formDate').value = date;
    d.getElementById('formTime').value = time;
    d.getElementById('formPrice').value = price;
    d.getElementById('modalTitle').textContent = `${btn.dataset.dateRu}, ${time} — ${Number(price).toLocaleString('ru-RU')} ₽`;
    modal.showModal();
  }

  async function submitBooking(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const note = d.getElementById('formNote');
    const data = Object.fromEntries(new FormData(form).entries());
    data.quest = cfg.questName;
    data.source = location.hostname || 'local-demo';
    data.createdAt = new Date().toISOString();

    if (!cfg.webhookUrl) {
      note.textContent = 'Демо-режим: заявка не отправлена. Укажите webhookUrl в config.js.';
      note.style.color = '#ffdf87';
      console.table(data);
      return;
    }

    try {
      note.textContent = 'Отправляем заявку...';
      const body = new URLSearchParams(data).toString();
      const res = await fetch(cfg.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      note.textContent = 'Заявка отправлена. Администратор свяжется для подтверждения.';
      note.style.color = '#b8ffd8';
      setTimeout(() => d.getElementById('bookingModal').close(), 1200);
      form.reset();
    } catch (err) {
      note.textContent = 'Ошибка отправки. Позвоните нам по телефону или попробуйте позже.';
      note.style.color = '#ffb3b3';
      console.error(err);
    }
  }

  d.addEventListener('click', e => {
    const slot = e.target.closest('.slot:not(.closed)');
    if (slot) openModal(slot);
  });
  d.getElementById('bookingForm').addEventListener('submit', submitBooking);
  d.getElementById('prevDays').addEventListener('click', () => { offset = Math.max(0, offset - 6); renderCalendar(); });
  d.getElementById('todayDays').addEventListener('click', () => { offset = 0; renderCalendar(); });
  d.getElementById('nextDays').addEventListener('click', () => { offset += 6; renderCalendar(); });

  renderStatic();
  renderCalendar();
})();
