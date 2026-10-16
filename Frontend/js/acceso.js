'use strict';

const $ = (selector) => document.querySelector(selector);
const params = new URLSearchParams(window.location.search);

function setMode(mode) {
  const register = mode === 'register';
  const card = $('.auth-card');
  card.classList.toggle('register-active', register);
  $('#loginPanel').hidden = register;
  $('#registerPanel').hidden = !register;
  $('#loginTab').setAttribute('aria-selected', String(!register));
  $('#registerTab').setAttribute('aria-selected', String(register));
  $('#loginTab').tabIndex = register ? -1 : 0;
  $('#registerTab').tabIndex = register ? 0 : -1;
  if (register) $('#firstName').focus({ preventScroll: true });
  else $('#loginEmail').focus({ preventScroll: true });
}

$('#loginTab').addEventListener('click', () => setMode('login'));
$('#registerTab').addEventListener('click', () => setMode('register'));
document.querySelectorAll('[data-switch]').forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.switch));
});

document.querySelectorAll('[data-toggle-password]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.togglePassword);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.textContent = show ? 'Ocultar' : 'Ver';
    button.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
});

function messageFor(selector, message, type = '') {
  const element = $(selector);
  element.textContent = message;
  element.className = `auth-message ${type}`.trim();
}

const API_BASE =
  window.location.protocol === 'file:' || window.location.port !== '3000'
    ? 'http://localhost:3000'
    : '';

function normalizeRole(role) {
  if (role === 'productor' || role === 'vendedor') return 'vendedor';
  if (role === 'transportista' || role === 'comerciante' || role === 'comprador') return 'comprador';
  return role;
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  if (!email || !$('#loginEmail').validity.valid) {
    messageFor('#loginMessage', 'Ingresá un correo electrónico válido.', 'error');
    $('#loginEmail').focus();
    return;
  }
  if (password.length < 8) {
    messageFor('#loginMessage', 'La contraseña debe tener al menos 8 caracteres.', 'error');
    $('#loginPassword').focus();
    return;
  }
  if ($('#rememberEmail').checked) {
    try { sessionStorage.setItem('vakaRapeDemoEmail', email); } catch { /* almacenamiento opcional */ }
  }

  const submitBtn = $('#loginForm button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  messageFor('#loginMessage', 'Iniciando sesión…', '');

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      messageFor('#loginMessage', data.message || 'No se pudo iniciar sesión.', 'error');
      return;
    }

    try {
      localStorage.setItem('vakaRapeToken', data.token);
      localStorage.setItem('vakaRapeUser', JSON.stringify(data.user));
    } catch { /* almacenamiento opcional */ }

    messageFor('#loginMessage', `¡Bienvenido/a, ${data.user.nombre}! Sesión iniciada correctamente.`, 'success');

    // TODO: Descomentar y colocar acá el link de redirección cuando el index esté terminado:
    // window.location.href = 'index.html';
  } catch {
    messageFor('#loginMessage', 'No se pudo conectar con el servidor (http://localhost:3000). Verificá que el backend esté corriendo.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

$('#registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = $('#registerForm');
  const firstName = $('#firstName').value.trim();
  const lastName = $('#lastName').value.trim();
  const email = $('#registerEmail').value.trim();
  const password = $('#registerPassword').value;
  const confirmPassword = $('#confirmPassword').value;
  const role = normalizeRole($('#userRole').value);

  if (!form.checkValidity()) {
    form.reportValidity();
    messageFor('#registerMessage', 'Revisá los campos obligatorios y completá los datos correctamente.', 'error');
    return;
  }
  if (!email || !$('#registerEmail').validity.valid) {
    messageFor('#registerMessage', 'Ingresá un correo electrónico válido.', 'error');
    return;
  }
  if (password.length < 8) {
    messageFor('#registerMessage', 'La contraseña debe tener al menos 8 caracteres.', 'error');
    return;
  }
  if (password !== confirmPassword) {
    messageFor('#registerMessage', 'Las contraseñas no coinciden. Volvé a escribirlas.', 'error');
    $('#confirmPassword').focus();
    return;
  }
  if (!role) {
    messageFor('#registerMessage', 'Seleccioná el tipo de perfil.', 'error');
    $('#userRole').focus();
    return;
  }

  const submitBtn = $('#registerForm button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  messageFor('#registerMessage', 'Creando tu cuenta…', '');

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: firstName,
        apellido: lastName,
        email,
        password,
        rol: role,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      messageFor('#registerMessage', data.message || 'No se pudo completar el registro.', 'error');
      return;
    }

    try {
      localStorage.setItem('vakaRapeToken', data.token);
      localStorage.setItem('vakaRapeUser', JSON.stringify(data.user));
    } catch { /* almacenamiento opcional */ }

    form.reset();
    messageFor('#registerMessage', `¡Cuenta creada con éxito, ${data.user.nombre}! Tus datos fueron guardados en Supabase.`, 'success');
  } catch {
    messageFor('#registerMessage', 'No se pudo conectar con el servidor (http://localhost:3000). Verificá que el backend esté corriendo.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

$('#forgotPassword').addEventListener('click', () => {
  const email = $('#loginEmail').value.trim();
  if (email && $('#loginEmail').validity.valid) {
    messageFor('#loginMessage', 'En una versión real se enviaría un enlace de recuperación a ese correo. La recuperación todavía no está conectada.', '');
  } else {
    messageFor('#loginMessage', 'Primero ingresá tu correo electrónico; en una versión real se enviaría allí el enlace de recuperación.', '');
    $('#loginEmail').focus();
  }
});

try {
  const remembered = sessionStorage.getItem('vakaRapeDemoEmail');
  if (remembered) {
    $('#loginEmail').value = remembered;
    $('#rememberEmail').checked = true;
  }
} catch { /* almacenamiento opcional */ }

setMode(params.get('modo') === 'registro' ? 'register' : 'login');
