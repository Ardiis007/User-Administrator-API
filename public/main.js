document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES GLOBALES Y ELEMENTOS ---
    const tokenKey = 'token';
    const globalMessage = document.getElementById('globalMessage');
    
    // Selectores para combos
    const userRoleSelect = document.getElementById('userRole');
    const rolePermissionsSelect = document.getElementById('rolePermissions');

    checkAuth();

    // --- SISTEMA DE AUTENTICACIÓN ---
    function checkAuth() {
        if (localStorage.getItem(tokenKey)) {
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('dashboardSection').classList.remove('hidden');
            loadAllData();
        } else {
            document.getElementById('dashboardSection').classList.add('hidden');
            document.getElementById('loginSection').classList.remove('hidden');
        }
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem(tokenKey, data.token);
                checkAuth();
            } else {
                errorDiv.textContent = data.message || 'Error al iniciar sesión';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            errorDiv.textContent = 'Error de conexión';
            errorDiv.classList.remove('hidden');
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem(tokenKey);
        checkAuth();
    });

    // --- FUNCIÓN BASE PARA LLAMADAS A LA API ---
    async function apiFetch(endpoint, method = 'GET', body = null) {
        const token = localStorage.getItem(tokenKey);
        const headers = { 'Authorization': `Bearer ${token}` };
        const options = { method, headers };
        
        if (body) {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`/api${endpoint}`, options);
        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            showMessage(data.message, 'error');
            if (data.message.includes('token')) {
                localStorage.removeItem(tokenKey);
                checkAuth();
            }
            throw new Error(data.message);
        }

        if (!response.ok) {
            showMessage(data.message || data.errors?.[0] || 'Error en la operación', 'error');
            throw new Error(data.message);
        }

        return data;
    }

    function showMessage(msg, type = 'success') {
        globalMessage.textContent = msg;
        globalMessage.className = type === 'error' ? 'error' : 'success';
        globalMessage.classList.remove('hidden');
        setTimeout(() => globalMessage.classList.add('hidden'), 5000);
    }

    window.switchTab = (tabName) => {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.nav-tabs button').forEach(el => el.classList.remove('active'));
        
        document.getElementById(`view-${tabName}`).classList.remove('hidden');
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        if(tabName === 'users') loadUsers();
        if(tabName === 'roles') loadRoles();
        if(tabName === 'permissions') loadPermissions();
    };

    window.toggleForm = (containerId) => {
        const formContainer = document.getElementById(containerId);
        formContainer.classList.toggle('hidden');
        if(!formContainer.classList.contains('hidden')) {
            formContainer.querySelector('form').reset();
            // Limpiar IDs ocultos
            formContainer.querySelectorAll('input[type="hidden"]').forEach(el => el.value = ''); 
        }
    };

    // --- CARGAR DATOS INICIALES NECESARIOS PARA FORMULARIOS ---
    async function loadAllData() {
        loadUsers();
        // Cargamos roles y permisos para llenar los selects (comboboxes)
        try {
            const rolesRes = await apiFetch('/roles');
            populateSelect(userRoleSelect, rolesRes.data, 'id', 'name');
            
            const permRes = await apiFetch('/permissions');
            populateSelect(rolePermissionsSelect, permRes.data, 'code', 'code');
        } catch (e) { /* Error manejado en apiFetch */ }
    }

    function populateSelect(selectElement, items, valueKey, textKey) {
        selectElement.innerHTML = '';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = item[textKey];
            selectElement.appendChild(option);
        });
    }

    // ==========================================
    // ============ LÓGICA USUARIOS =============
    // ==========================================
    async function loadUsers() {
        try {
            const res = await apiFetch('/users');
            const tbody = document.getElementById('usersTableBody');
            tbody.innerHTML = '';
            res.data.forEach(u => {
                tbody.innerHTML += `
                    <tr>
                        <td>${u.id}</td><td>${u.name}</td><td>${u.email}</td>
                        <td>${u.role?.name}</td>
                        <td style="color:${u.status?'green':'red'}">${u.status?'Activo':'Inactivo'}</td>
                        <td>
                            <button class="btn-warning" onclick='editUser(${JSON.stringify(u)})'>Editar</button>
                            <button class="btn-danger" onclick="deleteUser(${u.id})">Borrar</button>
                        </td>
                    </tr>`;
            });
        } catch(e) {}
    }

    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('userId').value;
        const payload = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            roleId: parseInt(document.getElementById('userRole').value),
            status: document.getElementById('userStatus').value === 'true'
        };
        
        const pwd = document.getElementById('userPassword').value;
        if (pwd) payload.password = pwd; // Solo enviar si se digitó algo

        try {
            if (id) await apiFetch(`/users/${id}`, 'PUT', payload);
            else {
                if(!pwd) return showMessage('La contraseña es obligatoria para nuevos usuarios', 'error');
                await apiFetch('/users', 'POST', payload);
            }
            showMessage(`Usuario ${id ? 'actualizado' : 'creado'} con éxito`);
            toggleForm('userFormContainer');
            loadUsers();
        } catch(e) {}
    });

    window.editUser = (user) => {
        toggleForm('userFormContainer');
        document.getElementById('userFormTitle').textContent = 'Editar Usuario';
        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.role.id;
        document.getElementById('userStatus').value = user.status;
        document.getElementById('userPassword').value = ''; 
    };

    window.deleteUser = async (id) => {
        if(confirm('¿Seguro que quieres eliminar este usuario?')) {
            try {
                await apiFetch(`/users/${id}`, 'DELETE');
                showMessage('Usuario eliminado');
                loadUsers();
            } catch(e) {}
        }
    };

    // ==========================================
    // ============= LÓGICA ROLES ===============
    // ==========================================
    async function loadRoles() {
        try {
            const res = await apiFetch('/roles');
            const tbody = document.getElementById('rolesTableBody');
            tbody.innerHTML = '';
            res.data.forEach(r => {
                const perms = r.permissions.map(p => p.code).join(', ');
                tbody.innerHTML += `
                    <tr>
                        <td>${r.id}</td><td>${r.name}</td><td>${r.hierarchyLevel}</td>
                        <td style="font-size: 11px;">${perms}</td>
                        <td>
                            <button class="btn-warning" onclick='editRole(${JSON.stringify(r)})'>Editar</button>
                            <button class="btn-danger" onclick="deleteRole(${r.id})">Borrar</button>
                        </td>
                    </tr>`;
            });
        } catch(e) {}
    }

    document.getElementById('roleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('roleId').value;
        
        // Obtener permisos seleccionados en el select multiple
        const selectedPerms = Array.from(document.getElementById('rolePermissions').selectedOptions).map(opt => opt.value);

        const payload = {
            name: document.getElementById('roleName').value,
            hierarchyLevel: parseInt(document.getElementById('roleHierarchy').value),
            permissions: selectedPerms
        };

        try {
            if (id) await apiFetch(`/roles/${id}`, 'PUT', payload);
            else await apiFetch('/roles', 'POST', payload);
            showMessage(`Rol ${id ? 'actualizado' : 'creado'} con éxito`);
            toggleForm('roleFormContainer');
            loadRoles();
            loadAllData(); // Recargar data global por si se editó un rol usado en usuarios
        } catch(e) {}
    });

    window.editRole = (role) => {
        toggleForm('roleFormContainer');
        document.getElementById('roleFormTitle').textContent = 'Editar Rol';
        document.getElementById('roleId').value = role.id;
        document.getElementById('roleName').value = role.name;
        document.getElementById('roleHierarchy').value = role.hierarchyLevel;
        
        // Marcar permisos seleccionados
        const permCodes = role.permissions.map(p => p.code);
        Array.from(document.getElementById('rolePermissions').options).forEach(opt => {
            opt.selected = permCodes.includes(opt.value);
        });
    };

    window.deleteRole = async (id) => {
        if(confirm('¿Seguro que quieres eliminar este rol? Los usuarios pasarán a ser USER.')) {
            try {
                await apiFetch(`/roles/${id}`, 'DELETE');
                showMessage('Rol eliminado');
                loadRoles();
            } catch(e) {}
        }
    };

    // ==========================================
    // =========== LÓGICA PERMISOS ==============
    // ==========================================
    async function loadPermissions() {
        try {
            const res = await apiFetch('/permissions');
            const tbody = document.getElementById('permissionsTableBody');
            tbody.innerHTML = '';
            res.data.forEach(p => {
                tbody.innerHTML += `
                    <tr>
                        <td>${p.id}</td><td>${p.code}</td><td>${p.description || ''}</td>
                        <td>
                            <button class="btn-warning" onclick='editPermission(${JSON.stringify(p)})'>Editar</button>
                            <button class="btn-danger" onclick="deletePermission(${p.id})">Borrar</button>
                        </td>
                    </tr>`;
            });
        } catch(e) {}
    }

    document.getElementById('permissionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('permissionId').value;
        const payload = {
            code: document.getElementById('permissionCode').value,
            description: document.getElementById('permissionDesc').value
        };

        try {
            if (id) await apiFetch(`/permissions/${id}`, 'PUT', payload);
            showMessage('Permiso actualizado con éxito');
            toggleForm('permissionFormContainer');
            loadPermissions();
            loadAllData(); // Recargar por si cambió un código de permiso
        } catch(e) {}
    });

    window.editPermission = (perm) => {
        toggleForm('permissionFormContainer');
        document.getElementById('permissionId').value = perm.id;
        document.getElementById('permissionCode').value = perm.code;
        document.getElementById('permissionDesc').value = perm.description;
    };

    window.deletePermission = async (id) => {
        if(confirm('Cuidado: Borrar un permiso puede romper el sistema de roles si está en uso. ¿Continuar?')) {
            try {
                await apiFetch(`/permissions/${id}`, 'DELETE');
                showMessage('Permiso eliminado');
                loadPermissions();
            } catch(e) {}
        }
    };
});