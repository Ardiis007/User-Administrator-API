document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const dashboardError = document.getElementById('dashboardError');
    const logoutBtn = document.getElementById('logoutBtn');
    const loadUsersBtn = document.getElementById('loadUsersBtn');
    const usersTableBody = document.getElementById('usersTableBody');

    // Comprobar si ya hay una sesión activa al cargar la página
    checkAuth();

    function checkAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            showDashboard();
        } else {
            showLogin();
        }
    }

    // Manejar el formulario de login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Hacemos la petición a nuestra propia API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar el token de acceso
                localStorage.setItem('token', data.token);
                showDashboard();
            } else {
                loginError.textContent = data.message || 'Error en las credenciales';
                loginError.classList.remove('hidden');
            }
        } catch (error) {
            loginError.textContent = 'Error de conexión con el servidor.';
            loginError.classList.remove('hidden');
        }
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        showLogin();
    });

    // Cargar usuarios
    loadUsersBtn.addEventListener('click', loadUsers);

    async function loadUsers() {
        dashboardError.classList.add('hidden');
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('/api/users', {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            const data = await response.json();

            if (response.ok) {
                renderUsers(data.data);
            } else {
                dashboardError.textContent = data.message || 'No tienes permisos para ver usuarios.';
                dashboardError.classList.remove('hidden');
                
                // Si el token expiró (401/403), cerramos sesión
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    setTimeout(showLogin, 2000);
                }
            }
        } catch (error) {
            dashboardError.textContent = 'Error al cargar los usuarios.';
            dashboardError.classList.remove('hidden');
        }
    }

    function renderUsers(users) {
        usersTableBody.innerHTML = '';
        if (users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay usuarios para mostrar</td></tr>';
            return;
        }

        users.forEach(user => {
            const statusClass = user.status ? 'status-active' : 'status-inactive';
            const statusText = user.status ? 'Activo' : 'Inactivo';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role ? user.role.name : 'N/A'}</td>
                <td class="${statusClass}">${statusText}</td>
            `;
            usersTableBody.appendChild(tr);
        });
    }

    function showDashboard() {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        loadUsers(); // Cargar la tabla automáticamente al entrar
    }

    function showLogin() {
        dashboardSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        loginForm.reset();
        usersTableBody.innerHTML = '';
    }
});