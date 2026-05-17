// ─── Helpers ──────────────────────────────────────────────────
function fmtDate(str) {
    if (!str) return '-';
    const d = new Date(str);
    return d.toLocaleDateString('en-PH');
}
function fmtMoney(n) {
    if (n == null) return '-';
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });
}
function val(id) { return document.getElementById(id)?.value?.trim() || null; }
function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v ?? ''; }
function show(id) { document.getElementById(id)?.classList.remove('hidden'); }
function hide(id) { document.getElementById(id)?.classList.add('hidden'); }

// ─── Tab Navigation ────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.tab).classList.remove('hidden');
    });
});

// ══════════════════════════════════════════════════════════════
//  REGISTRANTS
// ══════════════════════════════════════════════════════════════
let regEditing = false, regEditId = null;

async function fetchRegistrants(search = '') {
    const url = '/api/registrants' + (search ? `?search=${encodeURIComponent(search)}` : '');
    const data = await fetch(url).then(r => r.json());
    const tbody = document.getElementById('reg-tbody');
    const empty = document.getElementById('reg-empty');
    document.getElementById('reg-count').textContent = data.length;
    tbody.innerHTML = '';
    if (!data.length) { show('reg-empty'); return; } else { hide('reg-empty'); }
    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${r.SS_Number}</strong></td>
            <td>${r.Registrant_Name}</td>
            <td>${fmtDate(r.Date_of_Birth)}</td>
            <td>${r.Sex || '-'}</td>
            <td>${r.Employement_Type || '-'}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="regEdit('${r.SS_Number}')">Edit</button>
                <button class="btn btn-danger" onclick="regDelete('${r.SS_Number}')">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

document.getElementById('reg-search').addEventListener('input', e => {
    fetchRegistrants(e.target.value);
});

document.getElementById('reg-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = {
        SS_Number: val('reg-SS_Number'), Registrant_Name: val('reg-Registrant_Name'),
        Date_of_Birth: val('reg-Date_of_Birth'), Sex: val('reg-Sex'),
        Civil_Status: val('reg-Civil_Status'), TIN: val('reg-TIN'),
        Nationality: val('reg-Nationality'), Religion: val('reg-Religion'),
        POB: val('reg-POB'), Home_Address: val('reg-Home_Address'),
        Mobile_Number: val('reg-Mobile_Number'), Email_Address: val('reg-Email_Address'),
        Telephone_Number: val('reg-Telephone_Number'), Father_Name: val('reg-Father_Name'),
        Mother_Maiden_Name: val('reg-Mother_Maiden_Name'), Employement_Type: val('reg-Employement_Type')
    };
    if (regEditing) {
        await fetch(`/api/registrants/${regEditId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        regReset();
    } else {
        await fetch('/api/registrants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        document.getElementById('reg-form').reset();
    }
    fetchRegistrants();
});

window.regEdit = async (id) => {
    const r = await fetch(`/api/registrants/${id}`).then(res => res.json());
    ['SS_Number','Registrant_Name','Date_of_Birth','Sex','Civil_Status','TIN','Nationality','Religion',
     'POB','Home_Address','Mobile_Number','Email_Address','Telephone_Number','Father_Name','Mother_Maiden_Name','Employement_Type']
        .forEach(f => {
            const el = document.getElementById('reg-' + f);
            if (!el) return;
            el.value = f === 'Date_of_Birth' ? (r[f] ? r[f].slice(0, 10) : '') : (r[f] ?? '');
        });
    document.getElementById('reg-SS_Number').disabled = true;
    document.getElementById('reg-form-title').textContent = 'Edit Registrant';
    document.getElementById('reg-btn-submit').textContent = 'Update';
    show('reg-btn-cancel'); regEditing = true; regEditId = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.regDelete = async (id) => {
    if (!confirm(`Delete SS Number: ${id}?`)) return;
    await fetch(`/api/registrants/${id}`, { method: 'DELETE' });
    fetchRegistrants();
};

document.getElementById('reg-btn-cancel').addEventListener('click', regReset);
function regReset() {
    regEditing = false; regEditId = null;
    document.getElementById('reg-form').reset();
    document.getElementById('reg-SS_Number').disabled = false;
    document.getElementById('reg-form-title').textContent = 'Add Registrant';
    document.getElementById('reg-btn-submit').textContent = 'Save Registrant';
    hide('reg-btn-cancel');
}

// ══════════════════════════════════════════════════════════════
//  BENEFICIARIES
// ══════════════════════════════════════════════════════════════
let benEditing = false, benEditId = null;

async function fetchBeneficiaries() {
    const data = await fetch('/api/beneficiaries').then(r => r.json());
    document.getElementById('ben-count').textContent = data.length;
    const tbody = document.getElementById('ben-tbody');
    tbody.innerHTML = '';
    if (!data.length) { show('ben-empty'); return; } else { hide('ben-empty'); }
    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.Ben_ID}</td>
            <td>${r.Ben_Name}</td>
            <td>${fmtDate(r.Ben_DOB)}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="benEdit(${r.Ben_ID})">Edit</button>
                <button class="btn btn-danger" onclick="benDelete(${r.Ben_ID})">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

document.getElementById('ben-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = { Ben_Name: val('ben-Ben_Name'), Ben_DOB: val('ben-Ben_DOB') };
    if (benEditing) {
        await fetch(`/api/beneficiaries/${benEditId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        benReset();
    } else {
        await fetch('/api/beneficiaries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        document.getElementById('ben-form').reset();
    }
    fetchBeneficiaries();
});

window.benEdit = async (id) => {
    const r = await fetch(`/api/beneficiaries/${id}`).then(res => res.json());
    setVal('ben-Ben_Name', r.Ben_Name);
    setVal('ben-Ben_DOB', r.Ben_DOB ? r.Ben_DOB.slice(0, 10) : '');
    document.getElementById('ben-form-title').textContent = 'Edit Beneficiary';
    document.getElementById('ben-btn-submit').textContent = 'Update';
    show('ben-btn-cancel'); benEditing = true; benEditId = id;
};

window.benDelete = async (id) => {
    if (!confirm(`Delete Beneficiary ID: ${id}?`)) return;
    await fetch(`/api/beneficiaries/${id}`, { method: 'DELETE' });
    fetchBeneficiaries();
};

document.getElementById('ben-btn-cancel').addEventListener('click', benReset);
function benReset() {
    benEditing = false; benEditId = null;
    document.getElementById('ben-form').reset();
    document.getElementById('ben-form-title').textContent = 'Add Beneficiary';
    document.getElementById('ben-btn-submit').textContent = 'Save Beneficiary';
    hide('ben-btn-cancel');
}

// ══════════════════════════════════════════════════════════════
//  DESIGNATIONS
// ══════════════════════════════════════════════════════════════
let desEditing = false, desEditSS = null, desEditBen = null;

async function fetchDesignations() {
    const data = await fetch('/api/designations').then(r => r.json());
    document.getElementById('des-count').textContent = data.length;
    const tbody = document.getElementById('des-tbody');
    tbody.innerHTML = '';
    if (!data.length) { show('des-empty'); return; } else { hide('des-empty'); }
    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.SS_Number}</td>
            <td>${r.Ben_ID}</td>
            <td>${r.Ben_Relationship || '-'}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="desEdit('${r.SS_Number}',${r.Ben_ID},'${r.Ben_Relationship}')">Edit</button>
                <button class="btn btn-danger" onclick="desDelete('${r.SS_Number}',${r.Ben_ID})">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

document.getElementById('des-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = { SS_Number: val('des-SS_Number'), Ben_ID: val('des-Ben_ID'), Ben_Relationship: val('des-Ben_Relationship') };
    if (desEditing) {
        await fetch(`/api/designations/${desEditSS}/${desEditBen}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        desReset();
    } else {
        await fetch('/api/designations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        document.getElementById('des-form').reset();
    }
    fetchDesignations();
});

window.desEdit = (ss, ben, rel) => {
    setVal('des-SS_Number', ss); setVal('des-Ben_ID', ben); setVal('des-Ben_Relationship', rel);
    document.getElementById('des-SS_Number').disabled = true;
    document.getElementById('des-Ben_ID').disabled = true;
    document.getElementById('des-form-title').textContent = 'Edit Designation';
    document.getElementById('des-btn-submit').textContent = 'Update';
    show('des-btn-cancel'); desEditing = true; desEditSS = ss; desEditBen = ben;
};

window.desDelete = async (ss, ben) => {
    if (!confirm(`Delete designation for SS ${ss}, Ben ${ben}?`)) return;
    await fetch(`/api/designations/${ss}/${ben}`, { method: 'DELETE' });
    fetchDesignations();
};

document.getElementById('des-btn-cancel').addEventListener('click', desReset);
function desReset() {
    desEditing = false; desEditSS = null; desEditBen = null;
    document.getElementById('des-form').reset();
    document.getElementById('des-SS_Number').disabled = false;
    document.getElementById('des-Ben_ID').disabled = false;
    document.getElementById('des-form-title').textContent = 'Add Designation';
    document.getElementById('des-btn-submit').textContent = 'Save Designation';
    hide('des-btn-cancel');
}

// ══════════════════════════════════════════════════════════════
//  SPOUSES
// ══════════════════════════════════════════════════════════════
let spEditing = false, spEditId = null;

async function fetchSpouses() {
    const data = await fetch('/api/spouses').then(r => r.json());
    document.getElementById('sp-count').textContent = data.length;
    const tbody = document.getElementById('sp-tbody');
    tbody.innerHTML = '';
    if (!data.length) { show('sp-empty'); return; } else { hide('sp-empty'); }
    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.SS_Number}</td>
            <td>${r.Spouse_Name}</td>
            <td>${fmtDate(r.Spouse_DOB)}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="spEdit('${r.SS_Number}')">Edit</button>
                <button class="btn btn-danger" onclick="spDelete('${r.SS_Number}')">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

document.getElementById('sp-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = { SS_Number: val('sp-SS_Number'), Spouse_Name: val('sp-Spouse_Name'), Spouse_DOB: val('sp-Spouse_DOB') };
    if (spEditing) {
        await fetch(`/api/spouses/${spEditId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        spReset();
    } else {
        await fetch('/api/spouses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        document.getElementById('sp-form').reset();
    }
    fetchSpouses();
});

window.spEdit = async (id) => {
    const r = await fetch(`/api/spouses/${id}`).then(res => res.json());
    setVal('sp-SS_Number', r.SS_Number); setVal('sp-Spouse_Name', r.Spouse_Name);
    setVal('sp-Spouse_DOB', r.Spouse_DOB ? r.Spouse_DOB.slice(0, 10) : '');
    document.getElementById('sp-SS_Number').disabled = true;
    document.getElementById('sp-form-title').textContent = 'Edit Spouse';
    document.getElementById('sp-btn-submit').textContent = 'Update';
    show('sp-btn-cancel'); spEditing = true; spEditId = id;
};

window.spDelete = async (id) => {
    if (!confirm(`Delete spouse record for SS: ${id}?`)) return;
    await fetch(`/api/spouses/${id}`, { method: 'DELETE' });
    fetchSpouses();
};

document.getElementById('sp-btn-cancel').addEventListener('click', spReset);
function spReset() {
    spEditing = false; spEditId = null;
    document.getElementById('sp-form').reset();
    document.getElementById('sp-SS_Number').disabled = false;
    document.getElementById('sp-form-title').textContent = 'Add Spouse';
    document.getElementById('sp-btn-submit').textContent = 'Save Spouse';
    hide('sp-btn-cancel');
}

// ══════════════════════════════════════════════════════════════
//  SELF-EMPLOYED
// ══════════════════════════════════════════════════════════════
let seEditing = false, seEditId = null;

async function fetchSelfEmployed() {
    const data = await fetch('/api/self-employed').then(r => r.json());
    document.getElementById('se-count').textContent = data.length;
    const tbody = document.getElementById('se-tbody');
    tbody.innerHTML = '';
    if (!data.length) { show('se-empty'); return; } else { hide('se-empty'); }
    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.SS_Number}</td>
            <td>${r.SE_Profession || '-'}</td>
            <td>${r.SE_Year_Started || '-'}</td>
            <td>${fmtMoney(r.SE_Monthly_Earnings)}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="seEdit('${r.SS_Number}')">Edit</button>
                <button class="btn btn-danger" onclick="seDelete('${r.SS_Number}')">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

document.getElementById('se-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = { SS_Number: val('se-SS_Number'), SE_Profession: val('se-SE_Profession'), SE_Year_Started: val('se-SE_Year_Started'), SE_Monthly_Earnings: val('se-SE_Monthly_Earnings') };
    if (seEditing) {
        await fetch(`/api/self-employed/${seEditId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        seReset();
    } else {
        await fetch('/api/self-employed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        document.getElementById('se-form').reset();
    }
    fetchSelfEmployed();
});

window.seEdit = async (id) => {
    const r = await fetch(`/api/self-employed/${id}`).then(res => res.json());
    setVal('se-SS_Number', r.SS_Number); setVal('se-SE_Profession', r.SE_Profession);
    setVal('se-SE_Year_Started', r.SE_Year_Started); setVal('se-SE_Monthly_Earnings', r.SE_Monthly_Earnings);
    document.getElementById('se-SS_Number').disabled = true;
    document.getElementById('se-form-title').textContent = 'Edit Self-Employed';
    document.getElementById('se-btn-submit').textContent = 'Update';
    show('se-btn-cancel'); seEditing = true; seEditId = id;
};

window.seDelete = async (id) => {
    if (!confirm(`Delete self-employed record for SS: ${id}?`)) return;
    await fetch(`/api/self-employed/${id}`, { method: 'DELETE' });
    fetchSelfEmployed();
};

document.getElementById('se-btn-cancel').addEventListener('click', seReset);
function seReset() {
    seEditing = false; seEditId = null;
    document.getElementById('se-form').reset();
    document.getElementById('se-SS_Number').disabled = false;
    document.getElementById('se-form-title').textContent = 'Add Self-Employed';
    document.getElementById('se-btn-submit').textContent = 'Save Record';
    hide('se-btn-cancel');
}

// ══════════════════════════════════════════════════════════════
//  OFW
// ══════════════════════════════════════════════════════════════
let ofwEditing = false, ofwEditId = null;

async function fetchOfw() {
    const data = await fetch('/api/ofw').then(r => r.json());
    document.getElementById('ofw-count').textContent = data.length;
    const tbody = document.getElementById('ofw-tbody');
    tbody.innerHTML = '';
    if (!data.length) { show('ofw-empty'); return; } else { hide('ofw-empty'); }
    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.SS_Number}</td>
            <td>${r.OFW_Foreign_Address || '-'}</td>
            <td>${fmtMoney(r.OFW_Monthly_Earnings)}</td>
            <td>${r.OFW_FlexiFund_Flag ? '✅ Yes' : '—'}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="ofwEdit('${r.SS_Number}')">Edit</button>
                <button class="btn btn-danger" onclick="ofwDelete('${r.SS_Number}')">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

document.getElementById('ofw-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = {
        SS_Number: val('ofw-SS_Number'), OFW_Foreign_Address: val('ofw-OFW_Foreign_Address'),
        OFW_Monthly_Earnings: val('ofw-OFW_Monthly_Earnings'),
        OFW_FlexiFund_Flag: document.getElementById('ofw-OFW_FlexiFund_Flag').checked
    };
    if (ofwEditing) {
        await fetch(`/api/ofw/${ofwEditId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        ofwReset();
    } else {
        await fetch('/api/ofw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        document.getElementById('ofw-form').reset();
    }
    fetchOfw();
});

window.ofwEdit = async (id) => {
    const r = await fetch(`/api/ofw/${id}`).then(res => res.json());
    setVal('ofw-SS_Number', r.SS_Number); setVal('ofw-OFW_Foreign_Address', r.OFW_Foreign_Address);
    setVal('ofw-OFW_Monthly_Earnings', r.OFW_Monthly_Earnings);
    document.getElementById('ofw-OFW_FlexiFund_Flag').checked = !!r.OFW_FlexiFund_Flag;
    document.getElementById('ofw-SS_Number').disabled = true;
    document.getElementById('ofw-form-title').textContent = 'Edit OFW';
    document.getElementById('ofw-btn-submit').textContent = 'Update';
    show('ofw-btn-cancel'); ofwEditing = true; ofwEditId = id;
};

window.ofwDelete = async (id) => {
    if (!confirm(`Delete OFW record for SS: ${id}?`)) return;
    await fetch(`/api/ofw/${id}`, { method: 'DELETE' });
    fetchOfw();
};

document.getElementById('ofw-btn-cancel').addEventListener('click', ofwReset);
function ofwReset() {
    ofwEditing = false; ofwEditId = null;
    document.getElementById('ofw-form').reset();
    document.getElementById('ofw-SS_Number').disabled = false;
    document.getElementById('ofw-form-title').textContent = 'Add OFW';
    document.getElementById('ofw-btn-submit').textContent = 'Save OFW';
    hide('ofw-btn-cancel');
}

// ══════════════════════════════════════════════════════════════
//  NON-WORKING SPOUSE
// ══════════════════════════════════════════════════════════════
let nwsEditing = false, nwsEditId = null;

async function fetchNws() {
    const data = await fetch('/api/nws').then(r => r.json());
    document.getElementById('nws-count').textContent = data.length;
    const tbody = document.getElementById('nws-tbody');
    tbody.innerHTML = '';
    if (!data.length) { show('nws-empty'); return; } else { hide('nws-empty'); }
    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.SS_Number}</td>
            <td>${r.WS_SSN || '-'}</td>
            <td>${fmtMoney(r.WS_Income)}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="nwsEdit('${r.SS_Number}')">Edit</button>
                <button class="btn btn-danger" onclick="nwsDelete('${r.SS_Number}')">Delete</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

document.getElementById('nws-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = { SS_Number: val('nws-SS_Number'), WS_SSN: val('nws-WS_SSN'), WS_Income: val('nws-WS_Income') };
    if (nwsEditing) {
        await fetch(`/api/nws/${nwsEditId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        nwsReset();
    } else {
        await fetch('/api/nws', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        document.getElementById('nws-form').reset();
    }
    fetchNws();
});

window.nwsEdit = async (id) => {
    const r = await fetch(`/api/nws/${id}`).then(res => res.json());
    setVal('nws-SS_Number', r.SS_Number); setVal('nws-WS_SSN', r.WS_SSN); setVal('nws-WS_Income', r.WS_Income);
    document.getElementById('nws-SS_Number').disabled = true;
    document.getElementById('nws-form-title').textContent = 'Edit NW Spouse';
    document.getElementById('nws-btn-submit').textContent = 'Update';
    show('nws-btn-cancel'); nwsEditing = true; nwsEditId = id;
};

window.nwsDelete = async (id) => {
    if (!confirm(`Delete NW spouse record for SS: ${id}?`)) return;
    await fetch(`/api/nws/${id}`, { method: 'DELETE' });
    fetchNws();
};

document.getElementById('nws-btn-cancel').addEventListener('click', nwsReset);
function nwsReset() {
    nwsEditing = false; nwsEditId = null;
    document.getElementById('nws-form').reset();
    document.getElementById('nws-SS_Number').disabled = false;
    document.getElementById('nws-form-title').textContent = 'Add NW Spouse';
    document.getElementById('nws-btn-submit').textContent = 'Save Record';
    hide('nws-btn-cancel');
}

// ─── Initial Load ──────────────────────────────────────────────
fetchRegistrants();
fetchBeneficiaries();
fetchDesignations();
fetchSpouses();
fetchSelfEmployed();
fetchOfw();
fetchNws();
