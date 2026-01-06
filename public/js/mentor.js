function getId() {
  const u = new URLSearchParams(window.location.search);
  return u.get('id');
}

async function loadMentor(id) {
  const r = await api('GET', '/api/mentors/' + id);
  const m = r.mentor;

  $('#profile').html(`
    <div class="card-body p-4">
      <h1 class="h4 mb-1">${m.name}</h1>
      <div class="text-muted">${m.headline || ''}</div>
      <div class="mt-2">
        <span class="badge text-bg-secondary">${m.sector || '—'}</span>
        <span class="badge text-bg-light">Lingue: ${m.languages || '—'}</span>
        <span class="badge text-bg-warning">Rating: ${Number(m.avg_rating).toFixed(1)} ⭐</span>
      </div>
      <p class="mt-3 mb-0">${m.bio || ''}</p>
    </div>
  `);
}

async function loadSlots(id) {
  const me = await getMe();
  const isMentee = me.user?.role === 'MENTEE';

  const r = await api('GET', `/api/mentors/${id}/slots`);
  const box = $('#slots').empty();
  if (!r.slots.length) {
    box.append('<div class="text-muted">Nessuno slot disponibile.</div>');
    return;
  }

  const table = $(`
    <table class="table">
      <thead><tr><th>Inizio</th><th>Fine</th><th></th></tr></thead>
      <tbody></tbody>
    </table>
  `);
  for (const s of r.slots) {
    const tr = $('<tr></tr>');
    tr.append(`<td>${fmt(s.start_time)}</td>`);
    tr.append(`<td>${fmt(s.end_time)}</td>`);
    const btn = isMentee ? `<button class="btn btn-primary btn-sm" data-slot="${s.id}">Prenota</button>` : `<span class="text-muted small">Login come mentee per prenotare</span>`;
    tr.append(`<td>${btn}</td>`);
    table.find('tbody').append(tr);
  }
  box.append(table);

  box.find('button[data-slot]').on('click', async function () {
    try {
      const slotId = $(this).data('slot');
      await api('POST', '/api/bookings', { slot_id: slotId });
      alert('Prenotazione effettuata!');
      await loadSlots(id);
    } catch (e) {
      alert(e?.responseJSON?.error || 'Errore prenotazione');
    }
  });
}

async function loadReviews(id) {
  const r = await api('GET', `/api/mentors/${id}/reviews`);
  const box = $('#reviews').empty();
  if (!r.reviews.length) {
    box.append('<div class="text-muted">Nessuna recensione.</div>');
    return;
  }
  for (const x of r.reviews) {
    box.append(`
      <div class="border rounded-3 p-3 mb-2 bg-white">
        <div><strong>${x.rating} ⭐</strong> <span class="text-muted small">${fmt(x.created_at)}</span></div>
        <div class="mt-1">${x.comment || ''}</div>
      </div>
    `);
  }
}

$(async function () {
  const id = getId();
  if (!id) { alert('ID mentor mancante'); return; }
  await loadMentor(id);
  await loadSlots(id);
  await loadReviews(id);
});
