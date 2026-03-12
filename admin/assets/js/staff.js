// ==================== STAFF & ROLES ====================
// LIVE:    GET  /api/v1/admin/users?role=admin|superadmin
//          PUT  /api/v1/admin/users/:id/assign-role
//          PUT  /api/v1/admin/users/:id/suspend|activate|lock|unlock

const ROLE_META = {
    superadmin: { label:'Super Admin', bg:'bg-purple-100', color:'text-purple-700', avBg:'bg-purple-100 text-purple-700' },
    admin:      { label:'Admin',       bg:'bg-blue-100',   color:'text-blue-700',   avBg:'bg-blue-100 text-blue-700' },
    support:    { label:'Support',     bg:'bg-green-100',  color:'text-green-700',  avBg:'bg-green-100 text-green-700' },
};
function roleMeta(r) {
    return ROLE_META[(r||'').toLowerCase().replace(/\s+/g,'')] || { label: r||'Staff', bg:'bg-slate-100', color:'text-slate-600', avBg:'bg-slate-100 text-slate-600' };
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

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadStaff();
        setupRolePicker();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 300);
});

// ── Load staff from API ──
async function loadStaff() {
    const grid = document.getElementById('staffGrid');
    grid.innerHTML = '<div class="skeleton h-44 rounded-xl"></div>'.repeat(3);

    try {
        const [admRes, supRes] = await Promise.allSettled([
            api.getUsers({ role: 'admin',      page: 1, limit: 100 }),
            api.getUsers({ role: 'superadmin', page: 1, limit: 100 }),
        ]);
        console.log('[Staff] admin:', admRes, 'super:', supRes);

        const extract = r => {
            if (r.status !== 'fulfilled') return [];
            const d = r.value?.data || r.value || {};
            return d.users || d.data || (Array.isArray(d) ? d : []);
        };

        const seen = new Set();
        _allStaff = [...extract(supRes), ...extract(admRes)].filter(u => {
            const id = u._id || u.id;
            if (seen.has(id)) return false;
            seen.add(id); return true;
        });

        renderStaffGrid(_allStaff);
        updateRoleCounts(_allStaff);
        document.getElementById('staffTotalBadge').textContent = _allStaff.length;
    } catch (err) {
        console.error('[Staff] error:', err);
        grid.innerHTML = `<div class="col-span-3 bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 text-sm">Failed to load staff: ${err.message}</div>`;
    }
}

function renderStaffGrid(staff) {
    const grid = document.getElementById('staffGrid');
    if (!staff.length) {
        grid.innerHTML = `<div class="col-span-3 text-center py-16 text-slate-400 text-sm">No staff members found.</div>`;
        return;
    }
    grid.innerHTML = staff.map(u => {
        const id       = u._id || u.id;
        const name     = u.fullName || `${u.firstName||''} ${u.lastName||''}`.trim() || u.email || '—';
        const role     = u.role || 'admin';
        const meta     = roleMeta(role);
        const isActive = u.isActive !== false && u.status !== 'suspended';
        const isLocked = !!u.isLocked;

        return `
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <!-- Colour strip -->
            <div class="h-1.5 ${role.includes('super') ? 'bg-purple-400' : role === 'admin' ? 'bg-blue-400' : 'bg-green-400'}"></div>
            <div class="p-5">
                <div class="flex items-start gap-3">
                    <div class="w-12 h-12 rounded-full ${meta.avBg} flex items-center justify-center font-bold text-base border-2 border-white shadow flex-shrink-0">
                        ${initials(name)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-slate-900 truncate text-sm">${name}</h3>
                        <p class="text-xs text-slate-400 truncate">${u.email || ''}</p>
                        <div class="flex flex-wrap gap-1.5 mt-2">
                            <span class="px-2 py-0.5 text-xs font-semibold ${meta.bg} ${meta.color} rounded-full">${meta.label}</span>
                            <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${isLocked ? 'bg-orange-50 text-orange-600' : isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}">
                                ${isLocked ? 'Locked' : isActive ? 'Active' : 'Suspended'}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span class="text-xs text-slate-400">${timeAgo(u.lastLoginAt || u.updatedAt)}</span>
                    <div class="flex items-center gap-2">
                        <button onclick="openAssignRole('${id}','${name.replace(/'/g,"\\'")}','${role}')"
                            class="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50">
                            Change Role
                        </button>
                        ${isActive && !isLocked
                            ? `<button onclick="staffAction('suspend','${id}','${name.replace(/'/g,"\\'")}') " class="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50">Suspend</button>`
                            : !isActive
                            ? `<button onclick="staffAction('activate','${id}','${name.replace(/'/g,"\\'")}') " class="text-xs font-semibold text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50">Activate</button>`
                            : ''
                        }
                        ${isLocked
                            ? `<button onclick="staffAction('unlock','${id}','${name.replace(/'/g,"\\'")}') " class="text-xs font-semibold text-slate-600 px-2 py-1 rounded hover:bg-slate-100">Unlock</button>`
                            : `<button onclick="staffAction('lock','${id}','${name.replace(/'/g,"\\'")}') " class="text-xs font-semibold text-orange-500 px-2 py-1 rounded hover:bg-orange-50">Lock</button>`
                        }
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateRoleCounts(staff) {
    const counts = {};
    staff.forEach(u => {
        const k = (u.role || 'admin').toLowerCase().replace(/\s+/g, '');
        counts[k] = (counts[k] || 0) + 1;
    });
    ['superadmin','admin','support'].forEach(role => {
        const el = document.getElementById('roleCount_' + role);
        const n  = counts[role] || 0;
        if (el) el.textContent = n + (n === 1 ? ' member' : ' members');
    });
}

// ── Suspend / Activate / Lock / Unlock ──
async function staffAction(action, id, name) {
    const labels = { suspend:`Suspend ${name}?`, activate:`Activate ${name}?`, lock:`Lock ${name}'s account?`, unlock:`Unlock ${name}'s account?` };
    if (!confirm(labels[action])) return;
    let reason = '';
    if (action === 'suspend' || action === 'lock') reason = prompt('Reason (optional):') || 'Admin action';
    try {
        showLoading();
        if (action === 'suspend')  await api.suspendUser(id, reason);
        if (action === 'activate') await api.activateUser(id);
        if (action === 'lock')     await api.lockAccount(id, reason);
        if (action === 'unlock')   await api.unlockAccount(id);
        showToast(`${name}: ${action} successful`, 'success');
        await loadStaff();
    } catch (e) { showToast('Error: ' + e.message, 'error'); }
    finally { hideLoading(); }
}

// ── Role picker interactivity in Add Staff modal ──
function setupRolePicker() {
    document.querySelectorAll('#rolePicker input[type=radio]').forEach(radio => {
        radio.addEventListener('change', () => {
            // Reset all cards
            document.querySelectorAll('#rolePicker .role-card').forEach(card => {
                card.style.borderColor = '';
                card.style.background  = '';
            });
            document.querySelectorAll('#rolePicker .role-dot-fill').forEach(dot => dot.classList.add('hidden'));
            document.querySelectorAll('#rolePicker .role-radio-dot').forEach(dot => {
                dot.style.borderColor = '';
            });

            // Highlight selected
            const selectedCard = radio.closest('.role-option').querySelector('.role-card');
            const dot          = radio.closest('.role-option').querySelector('.role-radio-dot');
            const fill         = radio.closest('.role-option').querySelector('.role-dot-fill');
            selectedCard.style.borderColor = '#2563eb';
            selectedCard.style.background  = '#eff6ff';
            if (dot)  dot.style.borderColor = '#2563eb';
            if (fill) fill.classList.remove('hidden');

            // Update preview
            updateAvatarPreview();
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
        av.textContent  = initials(name) || '?';
        av.className    = `w-11 h-11 rounded-full ${meta.avBg} flex items-center justify-center font-bold text-base flex-shrink-0`;
    }
    const nameEl = document.getElementById('staffNamePreview');
    const roleEl = document.getElementById('staffRolePreview');
    if (nameEl) nameEl.textContent = name || 'New staff member';
    if (roleEl) roleEl.textContent = meta.label;
}

// ── Open / Close Add Staff modal ──
function openAddStaffModal() {
    document.getElementById('staffFirstName').value = '';
    document.getElementById('staffLastName').value  = '';
    document.getElementById('staffEmail').value     = '';

    // Default to admin
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

// ── Submit Add Staff ──
// Endpoint pending — logs payload and shows what backend needs to implement
async function handleStaffSubmit() {
    const firstName = document.getElementById('staffFirstName').value.trim();
    const lastName  = document.getElementById('staffLastName').value.trim();
    const email     = document.getElementById('staffEmail').value.trim();
    const role      = document.querySelector('#rolePicker input[name=staffRole]:checked')?.value || 'admin';

    if (!firstName) { showToast('First name is required', 'error'); return; }
    if (!email || !email.includes('@')) { showToast('Valid email is required', 'error'); return; }

    const payload = { firstName, lastName, email, role, roles: [role] };
    console.log('[Staff] Add staff payload (pending endpoint):', payload);

    try {
        showLoading();
        const res = await api.request('/api/v1/admin/staff', { method: 'POST', body: payload });
        console.log('[Staff] create res:', res);
        showToast(`${firstName} ${lastName} added as ${roleMeta(role).label}`, 'success');
        closeStaffModal();
        await loadStaff();
    } catch (err) {
        if (err.message?.includes('404') || err.message?.includes('not found')) {
            showToast('Staff creation is not yet available. Please try again later.', 'warning');
        } else {
            showToast('Error: ' + err.message, 'error');
        }
    } finally {
        hideLoading();
    }
}

// ── Assign Role modal ──
function openAssignRole(id, name, currentRole) {
    document.getElementById('assignRoleName').textContent        = name;
    document.getElementById('assignRoleCurrentLabel').textContent = roleMeta(currentRole).label;
    document.getElementById('assignRoleUserId').value            = id;
    document.getElementById('arAvatarPreview').textContent       = initials(name);

    const meta = roleMeta(currentRole);
    document.getElementById('arAvatarPreview').className =
        `w-9 h-9 rounded-full ${meta.avBg} flex items-center justify-center font-bold flex-shrink-0`;

    // Pre-select current role
    const radio = document.querySelector(`#assignRoleModal input[value="${currentRole}"]`);
    if (radio) radio.checked = true;

    document.getElementById('assignRoleModal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function submitAssignRole() {
    const id   = document.getElementById('assignRoleUserId').value;
    const role = document.querySelector('#assignRoleModal input[name=arRole]:checked')?.value;
    const name = document.getElementById('assignRoleName').textContent;
    if (!role) { showToast('Select a role', 'error'); return; }
    try {
        showLoading();
        await api.assignRole(id, [role]);
        showToast(`${name} → ${roleMeta(role).label}`, 'success');
        document.getElementById('assignRoleModal').classList.add('hidden');
        await loadStaff();
    } catch (e) { showToast('Error: ' + e.message, 'error'); }
    finally { hideLoading(); }
}

// ── Search / Filter ──
function filterStaff() {
    const q    = (document.getElementById('staffSearch')?.value || '').toLowerCase();
    const role = document.getElementById('staffRoleFilter')?.value || '';
    const filtered = _allStaff.filter(u => {
        const name  = (u.fullName || `${u.firstName||''} ${u.lastName||''}`.trim() || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return (!q    || name.includes(q) || email.includes(q))
            && (!role || (u.role || '').toLowerCase().includes(role));
    });
    renderStaffGrid(filtered);
}