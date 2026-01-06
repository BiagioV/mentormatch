async function api(method, url, data) {
  return $.ajax({
    method,
    url,
    data: data ? JSON.stringify(data) : undefined,
    contentType: 'application/json',
    dataType: 'json'
  });
}

async function getMe() {
  return api('GET', '/api/auth/me');
}

function fmt(dt) {
  const d = new Date(dt);
  return d.toLocaleString();
}

$(async function () {
  // logout button works everywhere
  $('#btnLogout').on('click', async () => {
    try {
      await api('POST', '/api/auth/logout');
      window.location.href = '/';
    } catch (e) {
      alert('Errore logout');
    }
  });
});
