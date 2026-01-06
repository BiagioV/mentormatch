async function loadMentors() {
  const qs = new URLSearchParams();
  const sector = $('#sector').val().trim();
  const language = $('#language').val().trim();
  const minRating = $('#minRating').val().trim();
  const hasAvailability = $('#hasAvailability').is(':checked');

  if (sector) qs.set('sector', sector);
  if (language) qs.set('language', language);
  if (minRating) qs.set('minRating', minRating);
  if (hasAvailability) qs.set('hasAvailability', '1');

  const r = await api('GET', '/api/mentors?' + qs.toString());
  const list = $('#list').empty();

  if (!r.mentors.length) {
    list.append('<div class="text-muted">Nessun mentor trovato.</div>');
    return;
  }

  for (const m of r.mentors) {
    const card = $(`
      <div class="col-md-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h3 class="h6 mb-1">${m.name}</h3>
            <div class="text-muted small">${m.headline || ''}</div>
            <div class="mt-2"><span class="badge text-bg-secondary">${m.sector || '—'}</span></div>
            <div class="mt-2 small">Lingue: ${m.languages || '—'}</div>
            <div class="mt-2 small">Rating: ${Number(m.avg_rating).toFixed(1)} ⭐</div>
            <div class="mt-1 small">Slot disponibili: ${m.open_slots}</div>
          </div>
          <div class="card-footer bg-white border-0">
            <a class="btn btn-outline-primary btn-sm" href="/mentor.html?id=${m.id}">Apri profilo</a>
          </div>
        </div>
      </div>
    `);
    list.append(card);
  }
}

$(function () {
  $('#btnSearch').on('click', loadMentors);
  loadMentors();
});
