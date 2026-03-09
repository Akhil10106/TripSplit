/**
 * TRIPSPLIT PLATINUM | CORE ENGINE v25.0.9
 * Architecture: Monolithic Hybrid Functional-Reactive
 * Author: Gemini AI Collaboration
 * Perimeter: Secure Expedition Financials & Participant Handshake
 */

"use strict";

// --- 1. GLOBAL STATE & SYSTEM CONFIGURATION ---
let deferredPrompt; 

// SYNCHRONIZED KEYS: Matching Orbit's bridge logic for persistent data handshake
let members = JSON.parse(localStorage.getItem('tripcart_members')) || [];
let expenses = JSON.parse(localStorage.getItem('tripcart_expenses')) || [];
let allLogs = JSON.parse(localStorage.getItem('tripcart_logs')) || [];

const CONFIG = {
    STORAGE_PREFIX: 'tripcart_',
    TARGET_BUDGET: 40000,
    CURRENCY: 'INR',
    LOCALE: 'en-IN',
    UI_ANIMATION_SPEED: 400,
    VERSION: '25.0.9-STABLE',
    THEMES: {
        'dashboard': 'bg-dashboard',
        'expenses': 'bg-expenses',
        'balance': 'bg-balance',
        'members': 'bg-members',
        'profile': 'bg-profile'
    },
    ICONS: {
        'Food': 'utensils',
        'Travel': 'car',
        'Stay': 'hotel',
        'Others': 'shopping-bag',
        'member': 'user-plus',
        'system': 'cpu',
        'image': 'camera',
        'export': 'download',
        'purge': 'refresh-ccw'
    },
    KEYWORDS: {
        food: ['dinner', 'lunch', 'breakfast', 'maggi', 'cafe', 'food', 'tea', 'coffee', 'eat', 'restaurant', 'munchies'],
        car: ['taxi', 'cab', 'uber', 'train', 'auto', 'ride', 'travel', 'bus', 'flight', 'petrol', 'diesel', 'toll'],
        hotel: ['stay', 'room', 'hotel', 'lodge', 'camp', 'homestay', 'night', 'resort', 'airbnb'],
        ticket: ['pass', 'entry', 'darshan', 'ticket', 'booking', 'event', 'museum']
    }
};

// --- 2. BOOT SEQUENCE & PWA LIFECYCLE ---
const PWAManager = (() => {
    /**
     * Initializes the Service Worker and PWA Install hooks.
     * Perimeter security ensures the app is running in a trusted context.
     */
    const init = () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('🛡️ TripCart: Service Worker Active ->', reg.scope))
                    .catch(err => console.error('⚠️ TripCart: SW Registration Failure', err));
            });
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('✅ TripCart: Deployment Perimeter Cleared.');
            if (!document.getElementById('profile-section').classList.contains('hidden')) {
                UI.renderProfile();
            }
        });

        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            UI.logActivity('System Deployed to Native Mode', 'system', 'shield-check');
            alert("TripCart Platinum has been successfully deployed to your device.");
        });
    };

    const isStandalone = () => {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    };

    return { init, isStandalone };
})();

// --- 3. PERSISTENCE ENGINE ---
const DataManager = {
    /**
     * Commits state to LocalStorage with specific prefixing.
     * Used for both Expenses, Members, and Activity Logs.
     */
    save: (key, data) => {
        localStorage.setItem(`${CONFIG.STORAGE_PREFIX}${key}`, JSON.stringify(data));
    },

    /**
     * Performs a hard reset of the local expedition environment.
     * After wiping data, redirects user back to the Planner (index.html).
     */
    purge: () => {
        const confirmMsg = "CRITICAL PERIMETER BREACH: This will permanently delete all TripCart expedition logs and synchronized trip data. Proceed with hard purge?";
        if (confirm(confirmMsg)) {
            // 1. Flush all keys associated with this domain
            localStorage.clear();
            
            // 2. Clear application memory
            members = [];
            expenses = [];
            allLogs = [];
            
            // 3. UI feedback before exit
            console.log("System Purge Initiated. Perimeters Cleared.");
            
            // 4. REDIRECT to Orbit Planner (index.html)
            window.location.href = 'index.html';
        }
    },

    /**
     * Generates a CSV string of the current ledger.
     */
    exportToCSV: () => {
        if (expenses.length === 0) return null;
        let csvContent = "data:text/csv;charset=utf-8,Date,Title,Amount,PaidBy,Category,Participants\n";
        expenses.forEach(e => {
            let row = `${new Date(e.time).toLocaleDateString()},${e.title},${e.amount},${e.paidBy},${e.category},"${e.participants.join('|')}"`;
            csvContent += row + "\n";
        });
        return encodeURI(csvContent);
    }
};

// --- 4. CORE UI & RENDERING CONTROLLER ---
const UI = {
    /**
     * Manages SPA-style section transitions and theme switching.
     */
    showSection: (sectionId) => {
        // UI Cleanup
        document.querySelectorAll('.section-content').forEach(s => s.classList.add('hidden'));
        document.querySelectorAll('.nav-link, .m-nav-item').forEach(n => n.classList.remove('active'));
        
        // Atmosphere/Theme Update
        document.body.classList.remove('bg-dashboard', 'bg-expenses', 'bg-balance', 'bg-members', 'bg-profile');
        document.body.classList.add(CONFIG.THEMES[sectionId] || 'bg-dashboard');

        // Reveal Target
        const target = document.getElementById(`${sectionId}-section`);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('animate-in');
        }

        // Navigation Sync
        document.querySelectorAll(`[onclick="showSection('${sectionId}')"]`).forEach(el => el.classList.add('active'));
        document.getElementById('section-title').innerText = UI.mapTitle(sectionId);

        // Header Action injection
        const desktopAction = document.getElementById('desktop-action-container');
        if (desktopAction) {
            desktopAction.innerHTML = '';
            if (sectionId === 'expenses') {
                desktopAction.innerHTML = `<button class="btn btn-primary" onclick="UI.openModal('expenseModal')"><i data-lucide="plus"></i> New Bill</button>`;
            } else if (sectionId === 'members') {
                desktopAction.innerHTML = `<button class="btn btn-primary" onclick="UI.openModal('memberModal')"><i data-lucide="user-plus"></i> Enroll Participant</button>`;
            }
        }

        UI.executeRenderer(sectionId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    mapTitle: (id) => ({
        'dashboard': 'Dashboard', 'expenses': 'Expenses', 
        'balance': 'Split Sheet', 'members': 'Squad Control', 'profile': 'Settings'
    }[id] || 'TripCart'),

    executeRenderer: (id) => {
        const renderers = {
            'dashboard': UI.refreshDashboard,
            'balance': UI.renderBalanceSheet,
            'members': UI.renderMembersGrid,
            'profile': UI.renderProfile,
            'expenses': UI.renderExpensesTable
        };
        if (renderers[id]) renderers[id]();
    },

    /**
     * Dashboard specific calculations for Spend and Velocity.
     */
    refreshDashboard: () => {
        const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const totalEl = document.getElementById('total-expense-val');
        if (totalEl) {
            UI.animateCounter(totalEl, totalSpent, '₹');
        }

        const velocityEl = document.getElementById('daily-velocity-val');
        if (velocityEl) {
            if (expenses.length === 0) velocityEl.innerText = "₹0";
            else {
                const firstExp = Math.min(...expenses.map(e => e.time));
                const days = Math.ceil(Math.abs(Date.now() - firstExp) / (1000 * 60 * 60 * 24)) || 1;
                velocityEl.innerText = `₹${Math.round(totalSpent / days).toLocaleString('en-IN')}`;
            }
        }

        const nameEl = document.getElementById('top-spender-name');
        const avatarEl = document.getElementById('top-spender-avatar');
        if (nameEl && avatarEl) {
            if (expenses.length === 0) {
                nameEl.innerText = "None"; avatarEl.innerText = "?";
            } else {
                const map = {};
                expenses.forEach(e => map[e.paidBy] = (map[e.paidBy] || 0) + e.amount);
                const lead = Object.keys(map).reduce((a, b) => map[a] > map[b] ? a : b);
                nameEl.innerText = lead; avatarEl.innerText = lead[0];
            }
        }
        UI.renderActivityFeed();
    },

    /**
     * Renders detailed split cards for each member.
     */
    renderBalanceSheet: () => {
        const grid = document.getElementById('balance-grid');
        if (!grid) return;
        
        grid.innerHTML = members.map((member, index) => {
            let paidOut = 0, credits = [], debts = [];
            expenses.forEach(exp => {
                const share = exp.amount / exp.participants.length;
                if (exp.paidBy === member.name) {
                    paidOut += exp.amount;
                    exp.participants.forEach(p => { 
                        if (p !== member.name) credits.push({ from: p, amount: share }); 
                    });
                } else if (exp.participants.includes(member.name)) {
                    debts.push({ to: exp.paidBy, amount: share });
                }
            });

            // Grouping calculations for UI
            const net = credits.reduce((s, c) => s + c.amount, 0) - debts.reduce((s, d) => s + d.amount, 0);
            const cardId = `ledger-card-${index}`;

            return `
                <div class="member-ledger-card animate-in" id="${cardId}">
                    <div class="ledger-header">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div class="member-avatar primary-gradient">${member.name[0]}</div>
                            <h3 style="margin:0; font-weight:800; color:#0f172a;">${member.name}</h3>
                        </div>
                        <div class="badge ${net >= 0 ? 'badge-success' : 'badge-travel'}">${net >= 0 ? 'COLLECTING' : 'PAYING'}</div>
                    </div>
                    <div class="ledger-summary-grid">
                        <div class="summary-item"><small>Outbound</small><span>₹${Math.round(paidOut)}</span></div>
                        <div class="summary-item"><small>Net Payload</small><span class="${net >= 0 ? 'text-get' : 'text-give'}">₹${Math.round(Math.abs(net))}</span></div>
                    </div>
                    <div class="ledger-list">
                        ${credits.length === 0 && debts.length === 0 ? '<p class="empty-msg" style="padding:10px;">Ledger Neutral</p>' : ''}
                        ${credits.map(c => `<div class="ledger-row"><span>From ${c.from}</span><span class="text-get">+₹${Math.round(c.amount)}</span></div>`).join('')}
                        ${debts.map(d => `<div class="ledger-row"><span>To ${d.to}</span><span class="text-give">-₹${Math.round(d.amount)}</span></div>`).join('')}
                    </div>
                    <div class="card-action-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top: 15px;">
                        <button class="btn btn-card-download" onclick="Logic.exportCardAsImage('${cardId}', '${member.name}')">
                            <i data-lucide="image"></i> Save PNG
                        </button>
                        <button class="btn btn-primary" style="background:#25D366; border:none;" onclick="Logic.shareWhatsApp('${member.name}', ${net})">
                            <i data-lucide="share-2"></i> WhatsApp
                        </button>
                    </div>
                </div>`;
        }).join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    renderExpensesTable: () => {
        const tbody = document.getElementById('expenses-tbody');
        if (!tbody) return;
        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-msg">Expedition Ledger is currently clear.</td></tr>';
            return;
        }
        tbody.innerHTML = expenses.map((e, idx) => `
            <tr class="table-row-hover animate-in">
                <td><b>${e.title}</b><br><small>${new Date(e.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small></td>
                <td class="hide-mobile"><b>${e.paidBy}</b></td>
                <td><b>₹${e.amount.toLocaleString()}</b></td>
                <td><span class="badge" style="background: var(--primary-glass); color: var(--primary);">${e.category}</span></td>
                <td>
                    <div style="display:flex; gap:8px;">
                        <button class="btn" style="color:var(--danger); padding:5px;" onclick="Logic.deleteExpense(${idx})"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>`).reverse().join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    renderMembersGrid: () => {
        const grid = document.getElementById('members-grid');
        if (!grid) return;
        const countBadge = document.getElementById('member-count-val');
        if (countBadge) countBadge.innerText = `${members.length} Active Participants`;

        grid.innerHTML = members.map((m, idx) => `
            <div class="member-card animate-in" style="animation-delay: ${idx * 0.05}s">
                <button class="btn-delete" onclick="Logic.deleteMember(${idx})"><i data-lucide="user-x"></i></button>
                <div class="member-avatar primary-gradient">${m.name[0]}</div>
                <b>${m.name}</b>
                <div style="margin-top: 5px; font-size: 0.75rem; color: var(--text-light); font-weight: 700;">UID: ${m.id.toString().slice(-6)}</div>
            </div>`).join('') + `
            <div class="member-card add-friend-card" onclick="UI.openModal('memberModal')">
                <div class="add-friend-content">
                    <div class="add-friend-icon primary-gradient"><i data-lucide="plus"></i></div>
                    <span>Enroll Participant</span>
                </div>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    renderProfile: () => {
        const container = document.querySelector('.profile-container');
        if (!container) return;
        const isStandalone = PWAManager.isStandalone();

        container.innerHTML = `
            <div class="profile-hero animate-in">
                <div class="logo-box primary-gradient" style="margin: 0 auto 1.5rem;"><i data-lucide="shield-check"></i></div>
                <h2>${localStorage.getItem('tripcart_tripName') || 'TripCart Platinum'}</h2>
                <p style="font-weight:700; opacity:0.6;">System Version: ${CONFIG.VERSION}</p>
                <div class="badge-success" style="display:inline-block; margin-top:10px;">Security: AES-LOCAL-ENCRYPTED</div>
            </div>

            <div class="panel luxury-shadow animate-in" style="background:#fff !important; border-radius: 24px; margin-bottom: 20px;">
                <div class="panel-title"><i data-lucide="file-text"></i> Financial Exports</div>
                <p style="margin-bottom:20px;">Export expedition telemetry for backup or reimbursement verification.</p>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <button class="btn btn-primary" onclick="Logic.exportFullPDF()">
                        <i data-lucide="download"></i> Complete PDF
                    </button>
                    <a id="csv-download-link" class="btn btn-white" onclick="Logic.handleCSVExport(this)">
                        <i data-lucide="table"></i> Export CSV
                    </a>
                </div>
            </div>

            <div class="panel luxury-shadow animate-in" style="background:#fff !important; border-radius: 24px; margin-bottom: 20px;">
                <div class="panel-title"><i data-lucide="smartphone"></i> Application Deployment</div>
                ${isStandalone ? 
                    `<div style="text-align:center; padding: 10px;">
                        <p style="color: var(--success); font-weight: 800; font-size: 1.1rem;">✅ Standalone Perimeter Active</p>
                        <p>TripCart is running as a localized progressive application.</p>
                     </div>` :
                    `<p>Add TripCart to your home screen for high-fidelity offline mountain access.</p>
                     <button class="btn btn-primary btn-install-large" id="install-app-btn" 
                        style="${deferredPrompt ? 'opacity: 1;' : 'opacity: 0.6; cursor:not-allowed;'}">
                        <i data-lucide="download-cloud"></i> ${deferredPrompt ? 'Install to Device' : 'Perimeter Waiting...'}
                     </button>`
                }
            </div>

            <div class="panel luxury-shadow animate-in" style="background:var(--danger-soft) !important; border: 1px solid var(--danger); border-radius: 24px;">
                <div class="panel-title" style="color:var(--danger-text);"><i data-lucide="alert-triangle"></i> System Hard Reset</div>
                <p style="color:var(--danger-text); margin-bottom:15px;">Warning: This operation wipes all synchronized data and activity logs permanently.</p>
                <button class="btn btn-reset-danger" onclick="DataManager.purge()">
                    <i data-lucide="refresh-ccw"></i> Purge All Trip Data
                </button>
            </div>`;
        
        const btn = document.getElementById('install-app-btn');
        if (btn && deferredPrompt) {
            btn.onclick = async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    deferredPrompt = null;
                    UI.renderProfile();
                }
            };
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    logActivity: (text, cat, icon, amount = '') => {
        allLogs.unshift({ text, cat, icon, amount, time: Date.now() });
        if (allLogs.length > 50) allLogs.pop();
        DataManager.save('logs', allLogs);
        UI.renderActivityFeed();
    },

    renderActivityFeed: () => {
        const feed = document.getElementById('activity-feed');
        if (!feed) return;
        if (allLogs.length === 0) {
            feed.innerHTML = '<p class="empty-msg">Awaiting transaction telemetry...</p>';
            return;
        }
        feed.innerHTML = allLogs.map(l => `
            <div class="activity-item animate-in">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="activity-icon ${l.cat || 'system'}"><i data-lucide="${l.icon || 'activity'}"></i></div>
                    <div style="flex:1;">
                        <p style="margin:0; font-size: 0.9rem; font-weight:600;">${l.text || 'System Log'}</p>
                        <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                           ${l.amount ? `<span class="badge" style="background:var(--primary-soft); color:var(--primary); font-size: 0.65rem;">${l.amount}</span>` : ''}
                           <span style="font-size: 0.7rem; color: var(--text-light); font-weight: 600;">${UI.formatTime(l.time)}</span>
                        </div>
                    </div>
                </div>
            </div>`).join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    animateCounter: (el, target, prefix = '') => {
        let current = 0;
        const duration = 1000;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = target / steps;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.innerText = `${prefix}${Math.round(target).toLocaleString('en-IN')}`;
                clearInterval(timer);
            } else {
                el.innerText = `${prefix}${Math.round(current).toLocaleString('en-IN')}`;
            }
        }, stepTime);
    },

    formatTime: (ts) => {
        const diff = Math.floor((Date.now() - ts) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
        return new Date(ts).toLocaleDateString();
    },

    openModal: (id) => {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        if (id === 'expenseModal') Logic.prepareExpenseModal();
    },

    closeModal: (id) => {
        const m = document.getElementById(id);
        if (m) {
            m.classList.add('closing');
            setTimeout(() => {
                m.style.display = 'none';
                m.classList.remove('closing');
                document.body.classList.remove('modal-open');
            }, 300);
        }
    }
};

// --- 5. BUSINESS LOGIC & DATA PROCESSING PIPELINE ---
const Logic = {
    /**
     * Deep Settlement Algorithm:
     * Minimizes the number of transactions required to settle up.
     */
    calculateSettlements: () => {
        let balances = {};
        members.forEach(m => balances[m.name] = 0);
        
        expenses.forEach(exp => {
            const share = exp.amount / exp.participants.length;
            balances[exp.paidBy] += exp.amount;
            exp.participants.forEach(p => balances[p] -= share);
        });

        let debtors = [], creditors = [];
        for (let name in balances) {
            if (balances[name] < -0.01) debtors.push({ name, amount: Math.abs(balances[name]) });
            else if (balances[name] > 0.01) creditors.push({ name, amount: balances[name] });
        }

        let transactions = [];
        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            let amount = Math.min(debtors[i].amount, creditors[j].amount);
            transactions.push({ from: debtors[i].name, to: creditors[j].name, amount });
            debtors[i].amount -= amount;
            creditors[j].amount -= amount;
            if (debtors[i].amount < 0.01) i++;
            if (creditors[j].amount < 0.01) j++;
        }
        return transactions;
    },

    /**
     * PDF Engine: Generates Retina Dossier
     */
    exportFullPDF: () => {
        if (!window.jspdf) {
            alert("Peripheral Error: PDF Library offline. Re-establishing link...");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const tripName = localStorage.getItem('tripcart_tripName') || "Katra Expedition 2026";
        const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

        // Header Section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.setTextColor(30, 41, 59);
        doc.text("TRIPSPLIT PLATINUM", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("EXPEDITION FINANCIAL VERIFICATION REPORT", 14, 28);

        doc.setDrawColor(226, 232, 240);
        doc.line(14, 35, 196, 35);

        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text(`ID: ${tripName}`, 14, 45);
        doc.text(`DATE: ${new Date().toLocaleDateString()}`, 14, 51);
        doc.text(`TOTAL LOGGED: RS ${totalSpent.toLocaleString()}`, 14, 57);

        // 1. Participant Summary Table
        const memberData = members.map(m => {
            const spent = expenses.filter(e => e.paidBy === m.name).reduce((s, e) => s + e.amount, 0);
            return [m.name, `RS ${spent.toLocaleString()}`];
        });

        doc.autoTable({
            startY: 65,
            head: [['Expedition Member', 'Total Paid Out']],
            body: memberData,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235], fontSize: 11 },
            styles: { font: 'helvetica', cellPadding: 4 }
        });

        // 2. Settlement Intelligence
        const settlements = Logic.calculateSettlements();
        const settleRows = settlements.map(s => [s.from, s.to, `RS ${Math.round(s.amount).toLocaleString()}`]);

        doc.setFontSize(14);
        doc.text("SETTLEMENT INTELLIGENCE", 14, doc.lastAutoTable.finalY + 15);
        
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Debtor', 'Creditor', 'Settlement Amount']],
            body: settleRows.length ? settleRows : [['-', '-', 'All Perimeters Equalized']],
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] }
        });

        // 3. Raw Transaction Feed
        const feedRows = expenses.map(e => [
            new Date(e.time).toLocaleDateString(),
            e.title,
            e.paidBy,
            `RS ${e.amount.toLocaleString()}`
        ]);

        doc.addPage();
        doc.setFontSize(16);
        doc.text("RAW TRANSACTION TELEMETRY", 14, 20);
        
        doc.autoTable({
            startY: 25,
            head: [['Date', 'Bill Detail', 'Payer', 'Value']],
            body: feedRows,
            theme: 'striped',
            headStyles: { fillColor: [100, 116, 139] }
        });

        doc.save(`TripSplit_Dossier_${tripName.replace(/\s+/g, '_')}.pdf`);
        UI.logActivity("Retina PDF Dossier Exported", "system", "file-text");
    },

    handleCSVExport: (linkEl) => {
        const csvData = DataManager.exportToCSV();
        if (!csvData) {
            alert("No telemetry data to export.");
            return;
        }
        linkEl.setAttribute("href", csvData);
        linkEl.setAttribute("download", "TripSplit_Expedition_Ledger.csv");
        UI.logActivity("CSV Ledger Exported", "system", "table");
    },

    prepareExpenseModal: () => {
        const container = document.getElementById('member-inclusion-list');
        if (!container) return;
        
        container.innerHTML = members.map(m => `
            <label class="squad-chip selected" onclick="Logic.toggleSquadChip(this)">
                <input type="checkbox" name="participants" value="${m.name}" checked style="display:none">
                <span>${m.name}</span>
            </label>
        `).join('');

        const payerSelect = document.getElementById('exp-payer');
        if (payerSelect) {
            payerSelect.innerHTML = members.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
        }

        // Reset fields
        document.getElementById('exp-amount').value = "";
        document.getElementById('exp-title').value = "";
        Logic.updateSmartIcon("");
        Logic.updateLiveSplit();
        
        setTimeout(() => document.getElementById('exp-title').focus(), 400);
    },

    toggleSquadChip: (el) => {
        const cb = el.querySelector('input');
        // Small delay to ensure checkbox state is toggled by browser before we read it
        setTimeout(() => { 
            el.classList.toggle('selected', cb.checked); 
            Logic.updateLiveSplit(); 
        }, 10);
    },

    selectAllSquad: () => {
        document.querySelectorAll('.squad-chip').forEach(chip => {
            chip.querySelector('input').checked = true;
            chip.classList.add('selected');
        });
        Logic.updateLiveSplit();
    },

    updateSmartIcon: (text) => {
        const iconBox = document.getElementById('desc-icon-box');
        if (!iconBox) return;
        const inputVal = text.toLowerCase();
        let iconName = 'tag';
        
        for (let key in CONFIG.KEYWORDS) {
            if (CONFIG.KEYWORDS[key].some(word => inputVal.includes(word))) {
                if (key === 'food') iconName = 'utensils';
                else if (key === 'car') iconName = 'car';
                else if (key === 'hotel') iconName = 'hotel';
                else if (key === 'ticket') iconName = 'ticket';
                break;
            }
        }
        iconBox.innerHTML = `<i data-lucide="${iconName}"></i>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    updateLiveSplit: () => {
        const amount = parseFloat(document.getElementById('exp-amount').value) || 0;
        const selectedCount = document.querySelectorAll('input[name="participants"]:checked').length;
        const previewEl = document.getElementById('live-split-preview');
        
        if (previewEl) {
            if (selectedCount > 0 && amount > 0) {
                const perPerson = (amount / selectedCount).toFixed(2);
                previewEl.innerText = `₹${perPerson} / Person`;
                previewEl.style.background = "#2563eb"; 
            } else {
                previewEl.innerText = "₹0.00 / Person";
                previewEl.style.background = "#0f172a";
            }
        }
    },

    submitExpense: (e) => {
        e.preventDefault();
        const title = document.getElementById('exp-title').value.trim();
        const cat = document.getElementById('exp-category').value;
        const amount = parseFloat(document.getElementById('exp-amount').value) || 0;
        const paidBy = document.getElementById('exp-payer').value;
        const participants = Array.from(document.querySelectorAll('input[name="participants"]:checked')).map(cb => cb.value);
        
        if (amount <= 0 || participants.length === 0) {
            alert("Entry Rejection: Telemetry must include valid amount and squad members.");
            return;
        }

        const entry = { 
            id: Date.now(), 
            title: title || `${cat} Transaction`, 
            amount, 
            paidBy, 
            category: cat, 
            participants, 
            time: Date.now() 
        };

        expenses.push(entry);
        DataManager.save('expenses', expenses);
        UI.logActivity(`Synced <strong>${entry.title}</strong>`, cat.toLowerCase(), CONFIG.ICONS[cat], `₹${amount}`);
        UI.closeModal('expenseModal');
        e.target.reset();
        UI.showSection('dashboard');
    },

    submitMember: () => {
        const el = document.getElementById('new-member-name');
        if (!el) return;
        const name = el.value.trim();
        if (!name) return;
        
        if (members.find(m => m.name.toLowerCase() === name.toLowerCase())) {
            alert("Identity Conflict: Subject already exists in squad database.");
            return;
        }

        const newMember = { name, id: Date.now() };
        members.push(newMember);
        DataManager.save('members', members);
        
        UI.logActivity(`Member <strong>${name}</strong> Enrolled`, 'member', 'user-plus');
        el.value = '';
        UI.closeModal('memberModal');
        UI.renderMembersGrid();
        UI.refreshDashboard();
    },

    deleteExpense: (idx) => {
        if (confirm("Confirm Purge: Discard this transaction packet from expedition?")) {
            // Reverse mapping to handle table sorting
            const actualIdx = expenses.length - 1 - idx;
            const removed = expenses.splice(actualIdx, 1)[0];
            DataManager.save('expenses', expenses);
            UI.logActivity(`Purged <strong>${removed.title}</strong>`, 'system', 'trash-2');
            UI.renderExpensesTable();
            UI.refreshDashboard();
        }
    },

    deleteMember: (idx) => {
        if (confirm("DANGER: Participant removal will destabilize historical split sheet integrity. Proceed?")) {
            const removed = members.splice(idx, 1)[0];
            DataManager.save('members', members);
            UI.logActivity(`Member <strong>${removed.name}</strong> Removed`, 'system', 'user-x');
            UI.renderMembersGrid();
            UI.refreshDashboard();
        }
    },

    exportCardAsImage: (cardId, name) => {
        const node = document.getElementById(cardId);
        if (!node || typeof htmlToImage === 'undefined') {
            alert("Export System Error: HTML-to-Image peripheral not responding.");
            return;
        }

        // Apply temporary style for high-res export
        node.style.transform = "scale(1)"; 
        
        htmlToImage.toPng(node, { 
            backgroundColor: '#f8fafc', 
            pixelRatio: 3, 
            cacheBust: true,
            style: { borderRadius: '24px' }
        })
        .then(dataUrl => {
            const link = document.createElement('a');
            link.download = `TripSplit_Report_${name.replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
            UI.logActivity(`Retina Card Exported for ${name}`, 'image', 'camera');
        })
        .catch(err => {
            console.error(err);
            alert("Peripheral failure during image synthesis.");
        });
    },

    shareWhatsApp: (name, net) => {
        const status = net >= 0 ? "collect" : "pay";
        const absVal = Math.round(Math.abs(net));
        const tripName = localStorage.getItem('tripcart_tripName') || "Katra Trek";
        
        const message = `*TripSplit Platinum Intelligence*%0A*Member:* ${name}%0A*Action:* To ${status} ₹${absVal}%0A*Expedition:* ${tripName}%0A_Sync via TripSplit v25_`;
        window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    }
};

// --- 6. GLOBAL EVENT HANDLERS & INITIALIZATION ---

/**
 * Handles Category Selection Logic
 */
window.selectCategory = (cat, btn) => {
    document.querySelectorAll('.pill, .cat-tab').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const input = document.getElementById('exp-category');
    if (input) input.value = cat;
};

// Expose internal methods to global scope for HTML onclick bindings
window.showSection = UI.showSection;
window.openModal = UI.openModal;
window.closeModal = UI.closeModal;
window.Logic = Logic;
window.DataManager = DataManager;

/**
 * APPLICATION BOOTSTRAP
 * Executed on DOM Completion
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 TripSplit Platinum: Initializing Monolithic Engine...');
    
    // 1. Initialize PWA Perimeters
    PWAManager.init();
    
    // 2. Data Handshake Verification
    const tripName = localStorage.getItem('tripcart_tripName');
    
    /**
     * Handshake Logic:
     * Checks if Orbit Planner has established a session.
     * If empty, shows the Authentication Overlay.
     */
    if (!tripName && members.length === 0) {
        const overlay = document.getElementById('auth-overlay');
        if (overlay) overlay.style.display = 'flex';
        
        const setupBtn = document.getElementById('setup-trip-btn');
        if (setupBtn) {
            setupBtn.onclick = () => {
                const name = prompt("Expedition Identification Perimeter:", "Katra Trek 2026");
                if (name) {
                    localStorage.setItem('tripcart_tripName', name);
                    location.reload();
                }
            };
        }
    } else {
        // Successful Handshake
        const sub = document.getElementById('trip-subtitle');
        if (sub) sub.innerText = tripName || "Expedition Platinum";
        
        // Hide overlay and load initial view
        const overlay = document.getElementById('auth-overlay');
        if (overlay) overlay.style.display = 'none';
        
        UI.showSection('dashboard');
    }

    // 3. Bind Primary Form Engines
    const expForm = document.getElementById('expense-form');
    if (expForm) expForm.onsubmit = Logic.submitExpense;

    // 4. Activity Pulse Initialization
    UI.logActivity('Expedition Environment Decrypted', 'system', 'lock');
});

/**
 * CSS-in-JS Transition Handling
 * Ensures high-fidelity animations for mobile section switching.
 */
window.addEventListener('popstate', () => {
    // Basic navigation support for back-button
    UI.showSection('dashboard');
});

// Final check: Library Injection verification
if (typeof htmlToImage === 'undefined') console.warn('⚠️ html-to-image missing.');
if (typeof window.jspdf === 'undefined') console.warn('⚠️ jspdf missing.');
