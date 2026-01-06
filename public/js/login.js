$(function () {
  $('#btnLogin').on('click', async () => {
    try {
      const payload = {
        email: $('#email').val().trim(),
        password: $('#password').val()
      };
      await api('POST', '/api/auth/login', payload);
      window.location.href = '/dashboard.html';
    } catch (e) {
      alert(e?.responseJSON?.error || 'Errore login');
    }
  });
});
