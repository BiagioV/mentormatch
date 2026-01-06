$(function () {
  $('#btnRegister').on('click', async () => {
    try {
      const payload = {
        name: $('#name').val().trim(),
        email: $('#email').val().trim(),
        password: $('#password').val(),
        role: $('#role').val()
      };
      const r = await api('POST', '/api/auth/register', payload);
      alert('Registrazione ok!');
      window.location.href = '/dashboard.html';
    } catch (e) {
      alert(e?.responseJSON?.error || 'Errore registrazione');
    }
  });
});
