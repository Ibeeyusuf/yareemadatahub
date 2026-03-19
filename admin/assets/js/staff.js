// ==================== STAFF & ROLES ====================
// GET    /api/v1/admin/staff
// GET    /api/v1/admin/staff/:id
// POST   /api/v1/admin/staff   { firstName, lastName, email, phoneNumber, role }
// PUT    /api/v1/admin/staff/:id
// DELETE /api/v1/admin/staff/:id

const ROLE_META = {
    superadmin: { label:'Super Admin', bg:'bg-purple-100', color:'text-purple-700', avBg:'bg-purple-100 text-purple-700', strip:'bg-purple-400' },
    admin:      { label:'Admin',       bg:'bg-blue-100',   color:'text-blue-700',   avBg:'bg-blue-100 text-blue-700',   strip:'bg-blue-400'   },
    support:    { label:'Support',     bg:'bg-green-100',  color:'text-green-700',  avBg:'bg-green-100 text-green-700', strip:'bg-green-400'  },
};
function roleMeta(r) {
    return ROLE_META[(r||'').toLowerCase().replace(/\s+/g,'')] ||
        { label: r||'Staff', bg:'bg-slate-100', color:'text-slate-600', avBg:'bg-slate-100 text-slate-600', strip:'bg-slate-300' };
}
function initials(n) {
    if (!n || !n.trim()) return '?';
    return n.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function timeAgo(d) {
    if (!d) return 'Never';
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60)    return 'Just now';
    if (s < 3600)  return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    return Math.floor(s/86400) + 'd ago';
}

let _allStaff = [];

// ── Boot ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadStaff();
        setupRolePicker();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 300);
});

// ── GET /api/v1/admin/staff ───────────────────────────────────────
async function loadStaff() {
    const grid = document.getElementById('staffGrid');
    grid.innerHTML = '<div class="skeleton h-44 rounded-xl"></div>'.repeat(3);

    try {
        const res = await api.getStaff({ page: 1, limit: 100 });

        // Response: { data: { staff: [], pagination: {}, roleCounts: {} } }
        const data       = res?.data || {};
        _allStaff        = data.staff || [];
        const roleCounts = data.roleCounts || {};
        const total      = data.pagination?.total ?? _allStaff.length;

        renderStaffGrid(_allStaff);
        updateRoleCountsFromAPI(roleCounts, _allStaff);
        document.getElementById('staffTotalBadge').textContent = total;

    } catch (err) {
        console.error('[Staff] load error:', err);
        grid.innerHTML = `
            <div class="col-span-3 bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <i data-lucide="wifi-off" class="w-8 h-8 text-red-400 mx-auto mb-2"></i>
                <p class="text-red-600 text-sm font-medium">${err.message}</p>
                <button onclick="loadStaff()" class="mt-3 text-xs text-red-500 underline">Retry</button>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ── Render staff cards ────────────────────────────────────────────
function renderStaffGrid(staff) {
    const grid = document.getElementById('staffGrid');

    if (!staff.length) {
        grid.innerHTML = `
            <div class="col-span-3 bg-white border border-slate-200 rounded-xl py-16 text-center">
                <div class="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i data-lucide="users" class="w-6 h-6 text-slate-400"></i>
                </div>
                <p class="text-slate-600 font-medium text-sm">No staff members yet</p>
                <p class="text-slate-400 text-xs mt-1">Click "Add Staff" to invite your first team member</p>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    grid.innerHTML = staff.map(u => {
        const id       = u._id || u.id;
        const name     = u.fullName || `${u.firstName||''} ${u.lastName||''}`.trim() || u.email || '—';
        const role     = (u.role || 'admin').toLowerCase();
        const meta     = roleMeta(role);
        const isActive = u.isActive !== false && u.status !== 'suspended' && u.status !== 'inactive';
        const isLocked = !!u.isLocked;
        const safeName = name.replace(/'/g, "\\'");

        return `
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div class="h-1.5 ${meta.strip}"></div>
            <div class="p-5">
                <div class="flex items-start gap-3">
                    <div class="w-12 h-12 rounded-full ${meta.avBg} flex items-center justify-center font-bold text-base border-2 border-white shadow flex-shrink-0">
                        ${initials(name)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-slate-900 truncate text-sm">${name}</h3>
                        <p class="text-xs text-slate-400 truncate">${u.email || ''}</p>
                        ${u.phoneNumber ? `<p class="text-xs text-slate-400">${u.phoneNumber}</p>` : ''}
                        <div class="flex flex-wrap gap-1.5 mt-2">
                            <span class="px-2 py-0.5 text-xs font-semibold ${meta.bg} ${meta.color} rounded-full">${meta.label}</span>
                            <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${
                                isLocked
                                    ? 'bg-orange-50 text-orange-600'
                                    : isActive
                                    ? 'bg-green-50 text-green-600'
                                    : 'bg-red-50 text-red-600'}">
                                ${isLocked ? 'Locked' : isActive ? 'Active' : 'Suspended'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span class="text-xs text-slate-400">${timeAgo(u.lastLoginAt || u.updatedAt)}</span>
                    <div class="flex items-center gap-1">
                        <!-- Edit -->
                        <button onclick="openEditModal('${id}')"
                            title="Edit"
                            class="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition">
                            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                        </button>
                        <!-- Change Role -->
                        <button onclick="openAssignRole('${id}','${safeName}','${role}')"
                            class="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50">
                            Role
                        </button>
                        <!-- Delete -->
                        <button onclick="deleteStaff('${id}','${safeName}')"
                            title="Delete"
                            class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ── Role counts ───────────────────────────────────────────────────
function updateRoleCountsFromAPI(roleCounts, staff) {
    // Prefer API roleCounts, fall back to counting from staff array
    const counts = Object.keys(roleCounts).length
        ? roleCounts
        : staff.reduce((acc, u) => {
            const k = (u.role || 'admin').toLowerCase().replace(/\s+/g, '');
            acc[k] = (acc[k] || 0) + 1;
            return acc;
        }, {});

    ['superadmin','admin','support'].forEach(role => {
        const el = document.getElementById('roleCount_' + role);
        if (!el) return;
        const n = counts[role] || 0;
        el.textContent = n + (n === 1 ? ' member' : ' members');
    });
}

// ── POST /api/v1/admin/staff ──────────────────────────────────────
async function handleStaffSubmit() {
    const firstName   = document.getElementById('staffFirstName').value.trim();
    const lastName    = document.getElementById('staffLastName').value.trim();
    const email       = document.getElementById('staffEmail').value.trim();
    const phoneNumber = document.getElementById('staffPhone').value.trim();
    const role        = document.querySelector('#rolePicker input[name=staffRole]:checked')?.value || 'admin';

    if (!firstName) { showToast('First name is required', 'error'); return; }
    if (!email || !email.includes('@')) { showToast('Valid email is required', 'error'); return; }

    const payload = { firstName, lastName, email, phoneNumber, role };

    try {
        showLoading();
        await api.createStaff(payload);
        showToast(`${firstName} ${lastName} added as ${roleMeta(role).label}`, 'success');
        closeStaffModal();
        await loadStaff();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ── GET /api/v1/admin/staff/:id → open edit modal ─────────────────
async function openEditModal(id) {
    try {
        showLoading();
        const res  = await api.getStaffById(id);
        const u    = res?.data?.staff || res?.data || res;

        // Populate edit modal fields
        document.getElementById('editStaffId').value           = id;
        document.getElementById('editStaffFirstName').value    = u.firstName || '';
        document.getElementById('editStaffLastName').value     = u.lastName  || '';
        document.getElementById('editStaffEmail').value        = u.email     || '';
        document.getElementById('editStaffPhone').value        = u.phoneNumber || '';

        // Pre-select current role
        const roleVal = (u.role || 'admin').toLowerCase();
        const radio   = document.querySelector(`#editRolePicker input[value="${roleVal}"]`);
        if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change')); }

        document.getElementById('editStaffModal').classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
        showToast('Failed to load staff details: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ── PUT /api/v1/admin/staff/:id ───────────────────────────────────
async function handleEditSubmit() {
    const id          = document.getElementById('editStaffId').value;
    const firstName   = document.getElementById('editStaffFirstName').value.trim();
    const lastName    = document.getElementById('editStaffLastName').value.trim();
    const email       = document.getElementById('editStaffEmail').value.trim();
    const phoneNumber = document.getElementById('editStaffPhone').value.trim();
    const role        = document.querySelector('#editRolePicker input[name=editStaffRole]:checked')?.value || 'admin';

    if (!firstName) { showToast('First name is required', 'error'); return; }
    if (!email || !email.includes('@')) { showToast('Valid email is required', 'error'); return; }

    try {
        showLoading();
        await api.updateStaff(id, { firstName, lastName, email, phoneNumber, role });
        showToast('Staff member updated', 'success');
        closeEditModal();
        await loadStaff();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ── DELETE /api/v1/admin/staff/:id ────────────────────────────────
async function deleteStaff(id, name) {
    const result = await Swal.fire({
        title: `Remove ${name}?`,
        text: 'This will permanently remove this staff member. This cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        reverseButtons: true
    });
    if (!result.isConfirmed) return;

    try {
        showLoading();
        await api.deleteStaff(id);
        showToast(`${name} has been removed`, 'success');
        await loadStaff();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        hideLoading();
    }
}

// ── Assign Role ───────────────────────────────────────────────────
function openAssignRole(id, name, currentRole) {
    document.getElementById('assignRoleName').textContent         = name;
    document.getElementById('assignRoleCurrentLabel').textContent = roleMeta(currentRole).label;
    document.getElementById('assignRoleUserId').value             = id;
    document.getElementById('arAvatarPreview').textContent        = initials(name);

    const meta = roleMeta(currentRole);
    document.getElementById('arAvatarPreview').className =
        `w-9 h-9 rounded-full ${meta.avBg} flex items-center justify-center font-bold flex-shrink-0`;

    const radio = document.querySelector(`#assignRoleModal input[value="${currentRole}"]`);
    if (radio) radio.checked = true;

    document.getElementById('assignRoleModal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Uses PUT /api/v1/admin/staff/:id to update role
async function submitAssignRole() {
    const id   = document.getElementById('assignRoleUserId').value;
    const role = document.querySelector('#assignRoleModal input[name=arRole]:checked')?.value;
    const name = document.getElementById('assignRoleName').textContent;
    if (!role) { showToast('Select a role', 'error'); return; }

    try {
        showLoading();
        await api.updateStaff(id, { role });
        showToast(`${name} → ${roleMeta(role).label}`, 'success');
        document.getElementById('assignRoleModal').classList.add('hidden');
        await loadStaff();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        hideLoading();
    }
}

// ── Role picker interactivity ─────────────────────────────────────
function setupRolePicker() {
    ['#rolePicker', '#editRolePicker'].forEach(selector => {
        document.querySelectorAll(`${selector} input[type=radio]`).forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll(`${selector} .role-card`).forEach(card => {
                    card.style.borderColor = '';
                    card.style.background  = '';
                });
                document.querySelectorAll(`${selector} .role-dot-fill`).forEach(dot => dot.classList.add('hidden'));
                document.querySelectorAll(`${selector} .role-radio-dot`).forEach(dot => dot.style.borderColor = '');

                const card = radio.closest('.role-option').querySelector('.role-card');
                const dot  = radio.closest('.role-option').querySelector('.role-radio-dot');
                const fill = radio.closest('.role-option').querySelector('.role-dot-fill');
                if (card) { card.style.borderColor = '#2563eb'; card.style.background = '#eff6ff'; }
                if (dot)  dot.style.borderColor = '#2563eb';
                if (fill) fill.classList.remove('hidden');

                if (selector === '#rolePicker') updateAvatarPreview();
            });
        });
    });
}

function updateAvatarPreview() {
    const fn   = document.getElementById('staffFirstName')?.value || '';
    const ln   = document.getElementById('staffLastName')?.value  || '';
    const name = `${fn} ${ln}`.trim();
    const role = document.querySelector('#rolePicker input[name=staffRole]:checked')?.value || 'admin';
    const meta = roleMeta(role);

    const av = document.getElementById('staffAvatarPreview');
    if (av) {
        av.textContent = initials(name) || '?';
        av.className   = `w-11 h-11 rounded-full ${meta.avBg} flex items-center justify-center font-bold text-base flex-shrink-0`;
    }
    const nameEl = document.getElementById('staffNamePreview');
    const roleEl = document.getElementById('staffRolePreview');
    if (nameEl) nameEl.textContent = name || 'New staff member';
    if (roleEl) roleEl.textContent = meta.label;
}

// ── Modal open/close ──────────────────────────────────────────────
function openAddStaffModal() {
    ['staffFirstName','staffLastName','staffEmail','staffPhone'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const adminRadio = document.querySelector('#rolePicker input[value=admin]');
    if (adminRadio) { adminRadio.checked = true; adminRadio.dispatchEvent(new Event('change')); }
    updateAvatarPreview();
    document.getElementById('staffModal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    document.getElementById('staffFirstName').focus();
}
function closeStaffModal() {
    document.getElementById('staffModal').classList.add('hidden');
}
function closeEditModal() {
    document.getElementById('editStaffModal').classList.add('hidden');
}

// ── Search / Filter ───────────────────────────────────────────────
function filterStaff() {
    const q    = (document.getElementById('staffSearch')?.value || '').toLowerCase();
    const role = document.getElementById('staffRoleFilter')?.value || '';
    const filtered = _allStaff.filter(u => {
        const name  = (u.fullName || `${u.firstName||''} ${u.lastName||''}`.trim() || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return (!q || name.includes(q) || email.includes(q))
            && (!role || (u.role || '').toLowerCase() === role);
    });
    renderStaffGrid(filtered);
}