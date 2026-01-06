async function loadBookings(me) {
  const r = await api('GET', '/api/bookings/mine');
  const box = $('#bookings').empty();
  if (!r.bookings.length) {
    box.append('<div class="text-muted">Nessuna prenotazione.</div>');
    return;
  }

  const table = $(`
    <table class="table">
      <thead><tr>
        <th>Quando</th><th>Mentor</th><th>Mentee</th><th>Stato</th><th>Meeting link</th><th></th>
      </tr></thead>
      <tbody></tbody>
    </table>
  `);

  for (const b of r.bookings) {
    const when = `${fmt(b.start_time)} → ${fmt(b.end_time)}`;
    const status = b.derived_status || b.status;

    let actions = '';
    let linkCell = b.meeting_link ? `<a target="_blank" href="${b.meeting_link}">Apri</a>` : '<span class="text-muted">—</span>';

    if (status === 'BOOKED') {
      actions += `<button class="btn btn-outline-danger btn-sm me-2" data-cancel="${b.id}">Annulla</button>`;
    }

    // Mentor può aggiungere link
    if (me.user.role === 'MENTOR' && status === 'BOOKED') {
      actions += `<button class="btn btn-outline-primary btn-sm" data-link="${b.id}">Imposta link</button>`;
    }

    // Mentee può recensire quando DONE
    if (me.user.role === 'MENTEE' && status === 'DONE') {
      actions += `<button class="btn btn-success btn-sm" data-review="${b.id}">Recensisci</button>`;
    }

    const tr = $(`
      <tr>
        <td>${when}</td>
        <td>${b.mentor_name}</td>
        <td>${b.mentee_name}</td>
        <td><span class="badge text-bg-${status === 'BOOKED' ? 'primary' : (status === 'DONE' ? 'success' : 'secondary')}">${status}</span></td>
        <td>${linkCell}</td>
        <td>${actions}</td>
      </tr>
    `);
    table.find('tbody').append(tr);
  }

  box.append(table);

  box.find('button[data-cancel]').on('click', async function () {
    try {
      await api('POST', `/api/bookings/${$(this).data('cancel')}/cancel`);
      await loadBookings(me);
    } catch (e) {
      alert(e?.responseJSON?.error || 'Errore annullamento');
    }
  });

  box.find('button[data-link]').on('click', async function () {
    const id = $(this).data('link');
    const link = prompt('Inserisci link Zoom/Meet:');
    if (!link) return;
    try {
      await api('POST', `/api/bookings/${id}/meeting-link`, { meeting_link: link });
      await loadBookings(me);
    } catch (e) {
      alert(e?.responseJSON?.error || 'Errore aggiornamento link');
    }
  });

  box.find('button[data-review]').on('click', async function () {
    const bookingId = $(this).data('review');
    const rating = prompt('Rating 1-5:');
    if (!rating) return;
    const comment = prompt('Commento (opzionale):') || '';
    try {
      await api('POST', '/api/reviews', { booking_id: bookingId, rating: Number(rating), comment });
      alert('Recensione salvata!');
      await loadBookings(me);
    } catch (e) {
      alert(e?.responseJSON?.error || 'Errore recensione');
    }
  });
}

$(async function () {
  const me = await getMe();
  if (!me.user) {
    $('#who').html('<div class="alert alert-warning">Devi fare login.</div>');
    return;
  }

  $('#who').html(`<div class="alert alert-info mb-0">Ciao <strong>${me.user.name}</strong> (${me.user.role})</div>`);

  if (me.user.role === 'MENTOR') {
    $('#mentorTools').removeClass('d-none');
    $('#btnAddSlot').on('click', async () => {
      try {
        const start = $('#start_time').val();
        const end = $('#end_time').val();
        if (!start || !end) { alert('Inserisci inizio/fine'); return; }

        // datetime-local -> ISO string
        const startIso = new Date(start).toISOString();
        const endIso = new Date(end).toISOString();
        await api('POST', '/api/slots', { start_time: startIso, end_time: endIso });
        alert('Slot creato!');
        await loadBookings(me);
      } catch (e) {
        alert(e?.responseJSON?.error || 'Errore creazione slot');
      }
    });
  }

  await loadBookings(me);
});
