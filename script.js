/* script.js */
const firebaseConfig = {
    apiKey: "AIzaSyCpLtdJ4lACW9pNn8fAUmooooqzh_5TIO4",
    authDomain: "trip-ddc48.firebaseapp.com",
    databaseURL: "https://trip-ddc48-default-rtdb.firebaseio.com",
    projectId: "trip-ddc48",
    storageBucket: "trip-ddc48.firebasestorage.app"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// App State
let currentGroupId = null;
let groupMembers = [];
let isAdmin = false;
let currentGroupExpenses = {};
let currentBalances = {};
let selectedTier = '';

const OWNER_EMAIL = "akhilgoel@example.com";

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.debug("Offline mode disabled", err));
    });
}

// Utility: Toast
function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'silk-toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Auth Observer
auth.onAuthStateChanged(async (user) => {
    const authScreen = document.getElementById('auth-screen');
    const appContent = document.getElementById('app-content');
    
    if (user) {
        document.getElementById('user-photo').src = user.photoURL || '';
        document.getElementById('profile-img-large').src = user.photoURL || '';
        document.getElementById('profile-name-large').innerText = user.displayName || 'User';
        document.getElementById('profile-email-large').innerText = user.email || '';
        
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('group-discovery').classList.remove('hidden');
        
        checkSubscriptionStatus(user.uid);
        
        if (user.email && user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
            document.getElementById('admin-vault-wrapper').classList.remove('hidden');
            listenForSubscriptionRequests();
        }
        
        discoverGroups(user.email.toLowerCase());
    } else {
        authScreen.style.display = 'flex';
        appContent.classList.add('hidden');
        document.getElementById('login-container').classList.remove('hidden');
        document.getElementById('group-discovery').classList.add('hidden');
    }
});

// UI: View Management
window.showView = (viewId) => {
    document.querySelectorAll('.view-pane').forEach(p => p.classList.remove('active-view'));
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active-view');
    
    // Update Nav UI
    if (viewId === 'main-dashboard') document.getElementById('nav-home')?.classList.add('active');
    if (viewId === 'plans-page') document.getElementById('nav-plans')?.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Subscription Logic
function checkSubscriptionStatus(uid) {
    db.ref(`active_subscriptions/${uid}`).once('value', snapshot => {
        if (!snapshot.exists()) {
            setTimeout(() => {
                document.getElementById('subscription-nag-modal').style.display = 'flex';
            }, 2000);
        }
    });
}

window.redirectToPlans = () => {
    hideModals();
    showView('plans-page');
};

window.openPayment = (tier, price) => {
    const MY_UPI_ID = "akhilgoel985-2@okaxis";
    const MY_NAME = "Akhil Goel";
    
    selectedTier = tier;
    document.getElementById('paying-tier-name').innerText = tier;
    document.getElementById('qr-price-display').innerText = price;
    
    const upiLink = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(MY_NAME)}&am=${price}&cu=INR&tn=TripSplit_${tier.replace(/\s/g, '')}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}&bgcolor=ffffff&color=0f172a`;
    
    document.getElementById('payment-qr').src = qrImageUrl;
    document.getElementById('manual-payment-gateway').classList.remove('hidden');
    
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
};

window.submitPaymentRequest = async () => {
    const txId = document.getElementById('tx-id-input').value.trim();
    if (!txId) { showToast("Missing Transaction ID"); return; }
    
    const user = auth.currentUser;
    if (!user) return;

    try {
        await db.ref('subscription_requests').push({
            userEmail: user.email.toLowerCase(),
            userName: user.displayName,
            tier: selectedTier,
            transactionId: txId,
            status: 'pending',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        showToast("Ticket Raised. Verification Pending.");
        document.getElementById('tx-id-input').value = '';
        document.getElementById('manual-payment-gateway').classList.add('hidden');
    } catch (e) {
        showToast("Network Error. Try again.");
    }
};

// Admin Vault
function listenForSubscriptionRequests() {
    db.ref('subscription_requests').on('value', snap => {
        const list = document.getElementById('admin-subscription-list');
        if (!list) return;
        list.innerHTML = '';
        
        if (!snap.exists()) {
            list.innerHTML = '<p class="text-center py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No pending audits</p>';
            return;
        }
        
        snap.forEach(req => {
            const data = req.val();
            const card = document.createElement('div');
            card.className = 'p-5 bg-white rounded-2xl border border-slate-100 shadow-sm';
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="font-bold text-slate-900">${data.userName}</p>
                        <p class="text-[10px] text-slate-400 font-medium">${data.userEmail}</p>
                    </div>
                    <span class="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase">${data.tier}</span>
                </div>
                <div class="bg-slate-50 p-4 rounded-xl mb-4 text-center">
                    <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">UTR Reference</p>
                    <p class="text-xs font-black tracking-widest text-indigo-600 select-all">${data.transactionId}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="resolveSubscription('${req.key}', true, '${data.userEmail}')" class="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase">Approve</button>
                    <button onclick="resolveSubscription('${req.key}', false)" class="flex-1 bg-rose-50 text-rose-500 py-3 rounded-xl font-bold text-[10px] uppercase">Decline</button>
                </div>
            `;
            list.appendChild(card);
        });
    });
}

window.resolveSubscription = async (key, approved, email) => {
    try {
        if (approved) showToast("Granting Access...");
        await db.ref(`subscription_requests/${key}`).remove();
    } catch (e) {
        showToast("Action Failed");
    }
};

// Core Group Logic
function discoverGroups(email) {
    db.ref('groups').on('value', (snap) => {
        const list = document.getElementById('my-groups-list');
        if (!list) return;
        list.innerHTML = '';
        
        if (!snap.exists()) {
            list.innerHTML = '<p class="text-center py-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No Active Circles</p>';
            return;
        }

        let found = false;
        snap.forEach(child => {
            const group = child.val();
            const members = group.members || [];
            if (members.some(m => m.email && m.email.toLowerCase() === email)) {
                found = true;
                const id = child.key;
                const isAdminOfGroup = group.admin && group.admin.toLowerCase() === email;
                
                const item = document.createElement('div');
                item.className = 'silk-card p-5 bg-white flex justify-between items-center hover:border-indigo-200 transition-all group-item cursor-pointer';
                item.onclick = () => startApp(id, group.name);
                item.innerHTML = `
                    <div class="flex-1">
                        <h4 class="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">${group.name}</h4>
                        <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest">${id}</p>
                    </div>
                    <button onclick="event.stopPropagation(); openDeleteWarning('${id}', '${group.name}', ${isAdminOfGroup})" class="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors">
                        <i class="fa-solid fa-trash-can text-sm"></i>
                    </button>
                `;
                list.appendChild(item);
            }
        });
        
        if (!found) {
            list.innerHTML = '<p class="text-center py-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Join or Create a Circle</p>';
        }
    });
}

window.startApp = (id, name) => {
    currentGroupId = id;
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-content').classList.remove('hidden');
    document.getElementById('display-group-name').innerText = name;
    document.getElementById('group-id-short').innerText = id;
    document.getElementById('settings-id-display').innerText = id;
    document.getElementById('profile-id-display').innerText = id;

    // Reset UI
    showView('main-dashboard');

    db.ref(`groups/${id}`).on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        groupMembers = data.members || [];
        currentGroupExpenses = data.expenses || {};
        isAdmin = (data.admin && data.admin.toLowerCase() === auth.currentUser.email.toLowerCase());

        document.getElementById('profile-account-type').innerText = isAdmin ? "Administrator" : "Circle Member";
        document.getElementById('admin-tools-wrapper').classList.toggle('hidden', !isAdmin);
        document.getElementById('admin-tickets-wrapper').classList.toggle('hidden', !isAdmin);
        
        renderUI(currentGroupExpenses);
        renderSettingsMembers(data.admin);
        if (isAdmin) listenForTickets(id);
    });
};

function renderUI(expenses) {
    // Render Multi-select logic
    const selectors = document.getElementById('split-selectors');
    selectors.innerHTML = groupMembers.map((m, i) => `
        <button onclick="this.classList.toggle('active-chip')" data-name="${m.name}" class="member-chip active-chip theme-${i % 4}">
            <i class="fa-solid fa-check text-[8px]"></i> ${m.name}
        </button>
    `).join('');

    let total = 0;
    let balances = {};
    groupMembers.forEach(m => balances[m.name] = 0);

    const feed = document.getElementById('activity-feed');
    feed.innerHTML = '';

    const sortedEntries = Object.entries(expenses).reverse();

    if (sortedEntries.length === 0) {
        feed.innerHTML = `
            <div class="text-center py-20 opacity-30">
                <i class="fa-solid fa-receipt text-5xl mb-4"></i>
                <p class="text-xs font-bold uppercase tracking-widest">No entries found</p>
            </div>`;
    }

    sortedEntries.forEach(([key, exp]) => {
        let badgeHTML = '';
        if (exp.type === 'settlement') {
            balances[exp.payer] = (balances[exp.payer] || 0) - exp.amount;
            badgeHTML = `<span class="mini-badge bg-emerald-100 text-emerald-700">Payment from ${exp.payer}</span>`;
        } else {
            total += exp.amount;
            const split = Math.round((exp.amount / (exp.involved?.length || 1)) * 100) / 100;
            exp.involved?.forEach(name => {
                if (balances.hasOwnProperty(name)) balances[name] += split;
            });
            badgeHTML = exp.involved ? exp.involved.map(n => `
                <span class="mini-badge bg-white shadow-sm border border-slate-100 text-slate-500">
                    ${n}: <span class="text-indigo-600">₹${Math.round(split)}</span>
                </span>
            `).join('') : '';
        }

        const item = document.createElement('div');
        item.className = `p-6 ${exp.type === 'settlement' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'} border rounded-3xl flex flex-col transition-all hover:shadow-md`;
        item.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="font-bold text-slate-800">${exp.title}</h4>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">${exp.date || 'Today'} &bull; by ${exp.by || 'Admin'}</p>
                </div>
                <p class="text-xl font-black ${exp.type === 'settlement' ? 'text-emerald-600' : 'text-slate-900'}">₹${exp.amount.toLocaleString()}</p>
            </div>
            <div class="flex flex-wrap gap-1.5">${badgeHTML}</div>
        `;
        feed.appendChild(item);
    });

    document.getElementById('grand-total').innerText = "₹" + Math.round(total).toLocaleString();
    
    // Stats Grid
    const statsGrid = document.getElementById('stats-grid');
    let statsHTML = '';
    
    if (groupMembers.length <= 4) {
        statsHTML = groupMembers.map((m, i) => `
            <div class="silk-card p-6 theme-${i % 4} member-stat-card cursor-pointer" onclick="openMemberProfile('${m.name}', '${m.email}', ${i % 4})">
                <p class="text-[10px] font-bold uppercase opacity-60 tracking-widest mb-1 truncate">${m.name}</p>
                <p class="text-2xl font-black">₹${Math.round(balances[m.name] || 0)}</p>
            </div>
        `).join('');
    } else {
        statsHTML = groupMembers.slice(0, 3).map((m, i) => `
            <div class="silk-card p-6 theme-${i % 4} member-stat-card cursor-pointer" onclick="openMemberProfile('${m.name}', '${m.email}', ${i % 4})">
                <p class="text-[10px] font-bold uppercase opacity-60 tracking-widest mb-1 truncate">${m.name}</p>
                <p class="text-2xl font-black">₹${Math.round(balances[m.name] || 0)}</p>
            </div>
        `).join('');
        statsHTML += `
            <div class="silk-card p-6 more-tile-creative text-white member-stat-card flex flex-col justify-center items-center text-center cursor-pointer shadow-xl border-none" onclick="openAllMembersDirectory()">
                <div class="relative z-10">
                    <p class="text-[9px] font-black uppercase tracking-widest opacity-60">Directory</p>
                    <p class="text-2xl font-black">+${groupMembers.length - 3} More</p>
                </div>
            </div>
        `;
    }
    statsGrid.innerHTML = statsHTML;
    currentBalances = balances;
    renderSettlementList(balances);
}

// Logic: Log Expense
window.logExpense = () => {
    const titleEl = document.getElementById('bill-title');
    const amountEl = document.getElementById('bill-amount');
    const title = titleEl.value.trim();
    const amount = parseFloat(amountEl.value);
    
    const involved = Array.from(document.querySelectorAll('#split-selectors .active-chip'))
        .map(btn => btn.dataset.name);

    if (!title) { showToast("Missing Description"); return; }
    if (isNaN(amount) || amount <= 0) { showToast("Invalid Amount"); return; }
    if (involved.length === 0) { showToast("Select at least 1 member"); return; }

    db.ref(`groups/${currentGroupId}/expenses`).push({
        title,
        amount,
        involved,
        by: auth.currentUser.displayName ? auth.currentUser.displayName.split(' ')[0] : 'Member',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    }).then(() => {
        titleEl.value = '';
        amountEl.value = '';
        showToast("Expense Recorded");
    }).catch(() => showToast("Sync Error"));
};

// Logic: Settlement
function renderSettlementList(balances) {
    const list = document.getElementById('settlement-list');
    if (!list) return;
    
    const relevant = groupMembers.filter(m => balances[m.name] > 0);
    
    if (relevant.length === 0) {
        list.innerHTML = '<p class="text-center py-6 text-xs font-bold text-slate-400">Everyone is squared up!</p>';
        return;
    }

    list.innerHTML = relevant.map(m => `
        <div class="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-center">
            <div>
                <p class="font-bold text-slate-900">${m.name}</p>
                <p class="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Outstanding: ₹${Math.round(balances[m.name])}</p>
            </div>
            <button onclick="openSettleModal('${m.name}', ${balances[m.name]})" class="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-50">Settle</button>
        </div>
    `).join('');
}

window.openSettleModal = (name, bal) => {
    document.getElementById('settle-user-name').innerText = name;
    document.getElementById('settle-amount-input').value = Math.round(bal);
    document.getElementById('settle-modal-overlay').style.display = 'flex';
    
    document.getElementById('confirm-settle-btn').onclick = () => {
        const amt = parseFloat(document.getElementById('settle-amount-input').value);
        if (amt > 0) {
            db.ref(`groups/${currentGroupId}/expenses`).push({
                title: `Settlement: ${name}`,
                amount: amt,
                type: 'settlement',
                payer: name,
                by: auth.currentUser.displayName.split(' ')[0],
                date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            });
            hideModals();
            showToast("Settlement Synced");
        }
    };
};

// Admin: Tickets
function listenForTickets(id) {
    db.ref(`groups/${id}/tickets`).on('value', snap => {
        const list = document.getElementById('ticket-list');
        const dot = document.getElementById('admin-notif-dot');
        if (!list) return;
        list.innerHTML = '';
        
        if (!snap.exists()) {
            dot.classList.add('hidden');
            list.innerHTML = '<p class="text-center py-4 text-xs font-bold text-slate-400">No join requests</p>';
            return;
        }

        dot.classList.remove('hidden');
        snap.forEach(ticket => {
            const t = ticket.val();
            const item = document.createElement('div');
            item.className = 'p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex justify-between items-center';
            item.innerHTML = `
                <div>
                    <p class="font-bold text-slate-900 text-sm">${t.name}</p>
                    <p class="text-[9px] font-medium text-slate-400">${t.email}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="resolveTicket('${ticket.key}', true, '${t.name}', '${t.email}')" class="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-transform active:scale-90"><i class="fa-solid fa-check text-xs"></i></button>
                    <button onclick="resolveTicket('${ticket.key}', false)" class="bg-rose-100 text-rose-500 w-8 h-8 rounded-lg flex items-center justify-center transition-transform active:scale-90"><i class="fa-solid fa-xmark text-xs"></i></button>
                </div>
            `;
            list.appendChild(item);
        });
    });
}

window.resolveTicket = async (key, approved, name, email) => {
    if (approved) {
        const isAlreadyMember = groupMembers.some(m => m.email.toLowerCase() === email.toLowerCase());
        if (!isAlreadyMember) {
            const newMembers = [...groupMembers, { name: name.split(' ')[0], email: email.toLowerCase() }];
            await db.ref(`groups/${currentGroupId}/members`).set(newMembers);
            showToast(`Welcome, ${name}`);
        }
    }
    await db.ref(`groups/${currentGroupId}/tickets/${key}`).remove();
};

// Admin: Manual Member Add
window.adminAddMember = async () => {
    const nameInput = document.getElementById('new-mem-name');
    const emailInput = document.getElementById('new-mem-email');
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();

    if (!name || !email) { showToast("Required: Name & Email"); return; }
    
    const isAlreadyMember = groupMembers.some(m => m.email.toLowerCase() === email);
    if (isAlreadyMember) { showToast("User already in circle"); return; }

    const updated = [...groupMembers, { name: name.split(' ')[0], email: email }];
    await db.ref(`groups/${currentGroupId}/members`).set(updated);
    
    nameInput.value = '';
    emailInput.value = '';
    showToast("Member Provisioned");
    toggleCollapse('admin-tools-collapse');
};

// Settings: Member List
function renderSettingsMembers(adminEmail) {
    const list = document.getElementById('member-settings-list');
    if (!list) return;
    
    list.innerHTML = groupMembers.map((m, i) => {
        const isUserAdmin = m.email.toLowerCase() === adminEmail.toLowerCase();
        return `
            <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg theme-${i % 4} flex items-center justify-center font-bold text-[10px]">${m.name[0]}</div>
                    <div>
                        <div class="flex items-center gap-2">
                            <p class="font-bold text-slate-800 text-sm">${m.name}</p>
                            ${isUserAdmin ? `<span class="bg-slate-900 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Owner</span>` : ''}
                        </div>
                        <p class="text-[9px] font-medium text-slate-400 truncate max-w-[120px]">${m.email}</p>
                    </div>
                </div>
                <div class="flex gap-1">
                    ${isAdmin && !isUserAdmin ? `
                        <button onclick="transferAdmin('${m.email}')" class="w-8 h-8 flex items-center justify-center text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"><i class="fa-solid fa-crown text-xs"></i></button>
                        <button onclick="adminRemoveMember(${i})" class="w-8 h-8 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"><i class="fa-solid fa-user-minus text-xs"></i></button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Directory Logic
window.openAllMembersDirectory = () => {
    const list = document.getElementById('full-directory-list');
    list.innerHTML = groupMembers.map((m, i) => `
        <div class="p-4 silk-card bg-white border border-slate-100 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.98]" onclick="openMemberProfile('${m.name}', '${m.email}', ${i % 4})">
            <div class="w-12 h-12 rounded-2xl theme-${i % 4} flex items-center justify-center font-black text-lg shadow-inner">${m.name[0]}</div>
            <div class="flex-1 overflow-hidden">
                <p class="font-bold text-slate-900 truncate">${m.name}</p>
                <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest truncate">${m.email}</p>
            </div>
            <div class="text-right">
                <p class="text-[9px] font-bold text-slate-300 uppercase mb-0.5">Balance</p>
                <p class="font-black text-indigo-600">₹${Math.round(currentBalances[m.name] || 0)}</p>
            </div>
        </div>
    `).join('');
    document.getElementById('all-members-modal-overlay').style.display = 'flex';
};

window.filterDirectory = () => {
    const query = document.getElementById('member-search-input').value.toLowerCase();
    const items = document.querySelectorAll('#full-directory-list > div');
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
};

// Profile Logic
window.openMemberProfile = (name, email, themeIdx) => {
    hideModals();
    const overlay = document.getElementById('member-modal-overlay');
    document.getElementById('modal-member-name').innerText = name;
    document.getElementById('modal-member-email').innerText = email;
    document.getElementById('modal-member-balance').innerText = "₹" + Math.round(currentBalances[name] || 0);
    
    const iconWrapper = document.getElementById('modal-member-icon').parentElement;
    iconWrapper.className = `w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-4xl overflow-hidden border-4 border-white shadow-xl theme-${themeIdx}`;
    
    const hist = document.getElementById('member-contribution-list');
    hist.innerHTML = '';
    hist.style.display = 'none';
    document.getElementById('contribution-toggle-text').innerText = 'View History';

    Object.values(currentGroupExpenses).reverse().forEach(exp => {
        if (exp.involved && exp.involved.includes(name)) {
            const split = Math.round(exp.amount / exp.involved.length);
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100';
            div.innerHTML = `
                <div class="text-left">
                    <p class="text-xs font-bold text-slate-800">${exp.title}</p>
                    <p class="text-[8px] font-bold text-slate-400 uppercase">${exp.date || 'Record'}</p>
                </div>
                <span class="text-xs font-black text-indigo-600">₹${split}</span>
            `;
            hist.appendChild(div);
        }
    });

    overlay.style.display = 'flex';
};

window.toggleMemberContribution = () => {
    const el = document.getElementById('member-contribution-list');
    const btnText = document.getElementById('contribution-toggle-text');
    if (el.style.display === 'none') {
        el.style.display = 'block';
        btnText.innerText = 'Hide History';
    } else {
        el.style.display = 'none';
        btnText.innerText = 'View History';
    }
};

// Global Helpers
window.hideModals = () => {
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
};

window.copyGroupId = () => {
    if (!currentGroupId) return;
    navigator.clipboard.writeText(currentGroupId).then(() => showToast("Circle ID Copied"));
};

window.toggleCollapse = (id) => {
    const el = document.getElementById(id);
    const isHidden = (el.style.display === 'none' || el.style.display === '');
    el.style.display = isHidden ? 'block' : 'none';
};

window.showJoinManual = () => {
    document.getElementById('join-modal-overlay').style.display = 'flex';
};

window.showCreationPopup = () => {
    document.getElementById('creation-modal-overlay').style.display = 'flex';
};

window.finalizeCreation = async () => {
    const name = document.getElementById('pop-group-name').value.trim();
    if (!name) { showToast("Circle name required"); return; }
    
    const user = auth.currentUser;
    const id = "SPLIT-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    try {
        await db.ref(`groups/${id}`).set({
            name: name,
            members: [{ name: user.displayName.split(' ')[0], email: user.email.toLowerCase() }],
            admin: user.email.toLowerCase(),
            created: firebase.database.ServerValue.TIMESTAMP
        });
        hideModals();
        showToast("Circle Initialized");
        startApp(id, name);
    } catch (e) {
        showToast("Error creating circle");
    }
};

window.requestJoinGroup = async () => {
    const id = document.getElementById('manual-id').value.trim().toUpperCase();
    if (!id) return;
    
    const snap = await db.ref(`groups/${id}`).get();
    if (snap.exists()) {
        const u = auth.currentUser;
        await db.ref(`groups/${id}/tickets`).push({
            name: u.displayName,
            email: u.email.toLowerCase(),
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        showToast("Request Broadcasted");
        hideModals();
    } else {
        showToast("Circle ID not found");
    }
};

window.selectAllInvolved = () => {
    const chips = document.querySelectorAll('#split-selectors .member-chip');
    const allActive = Array.from(chips).every(c => c.classList.contains('active-chip'));
    chips.forEach(c => {
        if (allActive) c.classList.remove('active-chip');
        else c.classList.add('active-chip');
    });
};

window.signOutNow = () => {
    auth.signOut().then(() => location.reload());
};

document.getElementById('google-login-btn').onclick = () => auth.signInWithPopup(provider);

// Prevent accidental navigation
window.onpopstate = (e) => {
    if (currentGroupId) {
        e.preventDefault();
        showView('main-dashboard');
    }
};
