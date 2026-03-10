/**
 * ==============================================================================
 * TRIPSPLIT PLATINUM | CORE TRACKER ENGINE v25.1.0
 * Architecture: Monolithic Functional-Reactive Module
 * Environment: Secure Expedition Financial Perimeter
 * Redirection Policy: Hard-Locked to index.html for Purge & Unauthorized Access
 * * MODULE INDEX:
 * 1. System Configuration & Design Tokens
 * 2. Perimeter Data State Management
 * 3. DOM Registry & Node Caching
 * 4. Data Integrity & Persistence Layer
 * 5. Advanced Mathematical & Analytics Engine
 * 6. View Controller & Rendering Pipeline
 * 7. Business Logic & Transactional Safety
 * 8. Smart Modal & Interactivity Engine
 * 9. Security Handshake & Application Bootstrap
 * 10. System Diagnostics & Firmware Utilities
 * ==============================================================================
 */

"use strict";

(function() {
    // --- 1. SYSTEM CONFIGURATION & GLOBAL TOKENS ---
    const CONFIG = {
        APP_NAME: 'TripSplit Platinum',
        VERSION: '25.1.0.STABLE',
        PLATFORM: 'Ecosystem-Vercel',
        PLANNER_URL: 'index.html', // The "Orbit" Planner destination
        STORAGE_PREFIX: 'tripcart_',
        LOCALE: 'en-IN',
        CURRENCY: 'INR',
        DEBUG_MODE: false,
        LOG_LIMIT: 60,
        ANIMATION_DURATION: 800,
        RENDER_THROTTLE: 100,
        THEMES: {
            'dashboard': 'bg-dashboard',
            'expenses': 'bg-expenses',
            'balance': 'bg-balance',
            'members': 'bg-members',
            'profile': 'bg-profile'
        },
        CATEGORIES: ['Food', 'Travel', 'Stay', 'Others'],
        ICONS: {
            'Food': 'utensils',
            'Travel': 'car',
            'Stay': 'hotel',
            'Others': 'shopping-bag',
            'system': 'cpu',
            'success': 'shield-check',
            'warning': 'alert-triangle',
            'critical': 'lock'
        },
        KEYWORDS: {
            food: ['dinner', 'lunch', 'breakfast', 'maggi', 'cafe', 'tea', 'coffee', 'eat', 'restaurant', 'burger', 'pizza', 'snacks'],
            travel: ['taxi', 'cab', 'uber', 'train', 'auto', 'ride', 'bus', 'flight', 'petrol', 'diesel', 'toll', 'parking'],
            stay: ['stay', 'room', 'hotel', 'lodge', 'camp', 'homestay', 'night', 'resort', 'airbnb'],
            entry: ['pass', 'entry', 'darshan', 'ticket', 'booking', 'museum', 'safari']
        }
    };

    // --- 2. PERIMETER DATA STATE ---
    let state = {
        members: JSON.parse(localStorage.getItem('tripcart_members')) || [],
        expenses: JSON.parse(localStorage.getItem('tripcart_expenses')) || [],
        logs: JSON.parse(localStorage.getItem('tripcart_logs')) || [],
        session: {
            activeSection: 'dashboard',
            lastActive: Date.now(),
            isModalOpen: false,
            modalId: null
        },
        meta: {
            tripName: localStorage.getItem('tripcart_tripName') || null,
            isStandalone: window.matchMedia('(display-mode: standalone)').matches,
            lastRender: Date.now(),
            clientHash: btoa(navigator.userAgent).slice(0, 16)
        }
    };

    // --- 3. DOM REGISTRY ENGINE ---
    const DOM = {
        appBody: document.body,
        sectionTitle: document.getElementById('section-title'),
        tripSubtitle: document.getElementById('trip-subtitle'),
        activityFeed: document.getElementById('activity-feed'),
        totalSpent: document.getElementById('total-expense-val'),
        velocity: document.getElementById('daily-velocity-val'),
        leadSpender: document.getElementById('top-spender-name'),
        leadAvatar: document.getElementById('top-spender-avatar'),
        
        sections: {
            dashboard: document.getElementById('dashboard-section'),
            expenses: document.getElementById('expenses-section'),
            balance: document.getElementById('balance-section'),
            members: document.getElementById('members-section'),
            profile: document.getElementById('profile-section')
        },
        
        modals: {
            expense: document.getElementById('expenseModal'),
            member: document.getElementById('memberModal')
        },
        
        grids: {
            balance: document.getElementById('balance-grid'),
            members: document.getElementById('members-grid'),
            expenses: document.getElementById('expenses-tbody')
        },

        forms: {
            expense: document.getElementById('expense-form'),
            inclusionList: document.getElementById('member-inclusion-list'),
            payerSelect: document.getElementById('exp-payer'),
            titleInput: document.getElementById('exp-title'),
            amountInput: document.getElementById('exp-amount'),
            categoryInput: document.getElementById('exp-category'),
            liveSplit: document.getElementById('live-split-preview'),
            smartIcon: document.getElementById('desc-icon-box')
        }
    };

    // --- 4. DATA INTEGRITY & PERSISTENCE ---
    const DataStore = {
        commit: (key, data) => {
            try {
                localStorage.setItem(`tripcart_${key}`, JSON.stringify(data));
            } catch (e) {
                console.error("Storage Perimeter Exhausted", e);
                alert("Memory Warning: Local storage limit reached.");
            }
        },

        /**
         * System Hard Purge
         * Wipes memory and immediately teleports user back to Orbit Planner.
         */
        purge: () => {
            const protocol = confirm("CRITICAL SECURITY OVERRIDE: This operation will permanently wipe all expedition telemetry and synchronized participant data. Return to Orbit Planner?");
            if (protocol) {
                // Wipe Local Perimeter
                localStorage.clear();
                
                // Clear Volatile Memory
                state.members = [];
                state.expenses = [];
                state.logs = [];
                
                console.log("Perimeter Integrity Check: Cleared. Redirection Sequence Initialized.");
                
                // FORCE REDIRECT
                window.location.href = CONFIG.PLANNER_URL;
            }
        },

        getAggregates: () => {
            const total = state.expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
            const payers = {};
            state.expenses.forEach(e => {
                payers[e.paidBy] = (payers[e.paidBy] || 0) + e.amount;
            });
            return { total, payers };
        }
    };

    // --- 5. LOGIC & MATHEMATICAL ENGINE ---
    const Analytics = {
        /**
         * Debt Minimization Matrix
         * Optimizes settlement plan using a net balance reduction algorithm.
         */
        solveSettlements: () => {
            let balances = {};
            state.members.forEach(m => balances[m.name] = 0);
            
            state.expenses.forEach(exp => {
                const share = exp.amount / exp.participants.length;
                balances[exp.paidBy] += exp.amount;
                exp.participants.forEach(p => balances[p] -= share);
            });

            let debtors = [], creditors = [];
            for (let name in balances) {
                if (balances[name] < -0.01) {
                    debtors.push({ name, amount: Math.abs(balances[name]) });
                } else if (balances[name] > 0.01) {
                    creditors.push({ name, amount: balances[name] });
                }
            }

            debtors.sort((a, b) => b.amount - a.amount);
            creditors.sort((a, b) => b.amount - a.amount);

            let optimizedPath = [];
            let i = 0, j = 0;
            while (i < debtors.length && j < creditors.length) {
                let transferValue = Math.min(debtors[i].amount, creditors[j].amount);
                optimizedPath.push({ from: debtors[i].name, to: creditors[j].name, amount: transferValue });
                debtors[i].amount -= transferValue;
                creditors[j].amount -= transferValue;
                if (debtors[i].amount < 0.01) i++;
                if (creditors[j].amount < 0.01) j++;
            }
            return optimizedPath;
        },

        formatCurrency: (num) => {
            return new Intl.NumberFormat(CONFIG.LOCALE, {
                style: 'currency', currency: CONFIG.CURRENCY, maximumFractionDigits: 0
            }).format(num);
        },

        calculateDailyVelocity: () => {
            if (state.expenses.length === 0) return 0;
            const data = DataStore.getAggregates();
            const timestamps = state.expenses.map(e => e.time);
            const start = Math.min(...timestamps);
            const span = Math.ceil((Date.now() - start) / (1000 * 60 * 60 * 24)) || 1;
            return data.total / span;
        }
    };

    // --- 6. VIEW CONTROLLER & RENDERING PIPELINE ---
    const ViewController = {
        renderSection: (id) => {
            if (state.session.activeSection === id && Date.now() - state.meta.lastRender < CONFIG.RENDER_THROTTLE) return;

            // Hide Current UI
            Object.values(DOM.sections).forEach(s => { if(s) s.classList.add('hidden'); });
            document.querySelectorAll('.nav-link, .m-nav-item').forEach(n => n.classList.remove('active'));

            // Atmosphere Transition
            DOM.appBody.classList.remove('bg-dashboard', 'bg-expenses', 'bg-balance', 'bg-members', 'bg-profile');
            DOM.appBody.classList.add(CONFIG.THEMES[id]);

            // Reveal Target Frame
            const target = DOM.sections[id];
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('fade-in');
            }
            
            // Sync Navigation UI
            document.querySelectorAll(`[onclick*="showSection('${id}')"]`).forEach(el => el.classList.add('active'));
            if (DOM.sectionTitle) DOM.sectionTitle.innerText = ViewController.getTitleLabel(id);

            state.session.activeSection = id;
            state.meta.lastRender = Date.now();

            ViewController.dispatchRenderer(id);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        },

        getTitleLabel: (id) => {
            const labels = { 'dashboard': 'Intelligence', 'expenses': 'Ledger', 'balance': 'Split Logic', 'members': 'Squad Control', 'profile': 'System' };
            return labels[id] || 'Expedition';
        },

        dispatchRenderer: (id) => {
            switch(id) {
                case 'dashboard': ViewController.drawIntelligenceCenter(); break;
                case 'balance': ViewController.drawSettlementMatrix(); break;
                case 'expenses': ViewController.drawTransactionFeed(); break;
                case 'members': ViewController.drawSquadManagement(); break;
                case 'profile': ViewController.drawSystemModule(); break;
            }
        },

        /**
         * Frame-Based Value Animation Engine
         */
        tweenNumber: (el, target) => {
            if (!el) return;
            let current = 0;
            const increment = target / (CONFIG.ANIMATION_DURATION / 16);
            const update = () => {
                current += increment;
                if (current >= target) {
                    el.innerText = Analytics.formatCurrency(target);
                } else {
                    el.innerText = Analytics.formatCurrency(current);
                    requestAnimationFrame(update);
                }
            };
            update();
        },

        drawIntelligenceCenter: () => {
            const data = DataStore.getAggregates();
            ViewController.tweenNumber(DOM.totalSpent, data.total);

            const velocity = Analytics.calculateDailyVelocity();
            if (DOM.velocity) DOM.velocity.innerText = Analytics.formatCurrency(velocity);

            const payers = Object.entries(data.payers);
            if (payers.length > 0) {
                const lead = payers.sort((a, b) => b[1] - a[1])[0];
                if (DOM.leadSpender) DOM.leadSpender.innerText = lead[0];
                if (DOM.leadAvatar) DOM.leadAvatar.innerText = lead[0][0];
            }
            ViewController.updateActivityStream();
        },

        updateActivityStream: () => {
            if (!DOM.activityFeed) return;
            if (state.logs.length === 0) {
                DOM.activityFeed.innerHTML = '<p class="empty-msg">Expedition Telemetry Standby.</p>';
                return;
            }
            DOM.activityFeed.innerHTML = state.logs.slice(0, 15).map(l => `
                <div class="activity-item animate-in">
                    <div class="activity-icon ${l.cat}"><i data-lucide="${l.icon || 'activity'}"></i></div>
                    <div style="flex:1;">
                        <p><strong>${l.text}</strong></p>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <small>${l.amount ? `Sync: ${l.amount}` : 'System Event'}</small>
                            <span style="font-size:0.6rem; opacity:0.5;">${ViewController.formatTime(l.time)}</span>
                        </div>
                    </div>
                </div>`).join('');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        },

        drawTransactionFeed: () => {
            if (!DOM.grids.expenses) return;
            if (state.expenses.length === 0) {
                DOM.grids.expenses.innerHTML = '<tr><td colspan="5" class="empty-msg">Handshake verified. Awaiting first transaction.</td></tr>';
                return;
            }
            DOM.grids.expenses.innerHTML = state.expenses.map((e, i) => `
                <tr class="table-row-hover animate-in">
                    <td><b>${e.title}</b><br><small>${new Date(e.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small></td>
                    <td><div style="display:flex; align-items:center; gap:6px;"><div class="mini-avatar primary-gradient" style="width:20px; height:20px; font-size:0.6rem;">${e.paidBy[0]}</div> ${e.paidBy}</div></td>
                    <td><b>${Analytics.formatCurrency(e.amount)}</b></td>
                    <td><span class="badge" style="background:var(--primary-glass); color:var(--primary); font-size:0.6rem;">${e.category.toUpperCase()}</span></td>
                    <td><button class="btn btn-delete-sm" onclick="Logic.removeBill(${i})"><i data-lucide="trash-2"></i></button></td>
                </tr>`).reverse().join('');
        },

        drawSettlementMatrix: () => {
            if (!DOM.grids.balance) return;
            const settlements = Analytics.solveSettlements();
            
            DOM.grids.balance.innerHTML = state.members.map((m, idx) => {
                let paid = 0, credits = 0, debts = 0;
                state.expenses.forEach(e => {
                    const share = e.amount / e.participants.length;
                    if (e.paidBy === m.name) {
                        paid += e.amount;
                        credits += (share * (e.participants.length - 1));
                    } else if (e.participants.includes(m.name)) {
                        debts += share;
                    }
                });
                const net = credits - debts;
                const cardId = `member-card-${idx}`;

                return `
                <div class="member-ledger-card animate-in" id="${cardId}" style="animation-delay: ${idx * 0.1}s">
                    <div class="ledger-header">
                        <div class="member-avatar primary-gradient">${m.name[0]}</div>
                        <div style="flex:1;">
                            <h3 style="margin:0; font-size:1.1rem;">${m.name}</h3>
                            <small style="opacity:0.6; font-weight:700;">SQUAD MEMBER</small>
                        </div>
                        <div class="badge ${net >= 0 ? 'badge-success' : 'badge-travel'}">${net >= 0 ? 'RECEIVING' : 'PAYING'}</div>
                    </div>
                    <div class="ledger-summary-grid">
                        <div class="summary-item"><small>Total Paid</small><span>${Analytics.formatCurrency(paid)}</span></div>
                        <div class="summary-item"><small>Net Split</small><span class="${net >= 0 ? 'text-get' : 'text-give'}">${Analytics.formatCurrency(Math.abs(net))}</span></div>
                    </div>
                    <div class="card-action-row" style="margin-top:20px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <button class="btn btn-card-download" onclick="Logic.captureSecurityCard('${cardId}', '${m.name}')">Save Image</button>
                        <button class="btn btn-primary" onclick="Logic.broadcastWhatsApp('${m.name}', ${net})">WhatsApp</button>
                    </div>
                </div>`;
            }).join('');
        },

        drawSquadManagement: () => {
            if (!DOM.grids.members) return;
            DOM.grids.members.innerHTML = state.members.map((m, i) => `
                <div class="member-card animate-in" style="animation-delay: ${i * 0.05}s">
                    <button class="btn-delete" onclick="Logic.removeParticipant(${i})"><i data-lucide="user-x"></i></button>
                    <div class="member-avatar primary-gradient">${m.name[0]}</div>
                    <b style="font-size:1rem;">${m.name}</b>
                    <p style="margin-top:5px; font-size:0.65rem; font-weight:800; opacity:0.4;">VERIFIED PARTICIPANT</p>
                </div>`).join('') + `
                <div class="member-card add-friend-card" onclick="openModal('memberModal')">
                    <div class="add-friend-icon"><i data-lucide="plus"></i></div>
                    <span>Register New</span>
                </div>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        },

        drawSystemModule: () => {
            const container = document.querySelector('.profile-container');
            if (!container) return;
            const isS = state.meta.isStandalone;
            
            container.innerHTML = `
                <div class="profile-hero animate-in">
                    <div class="logo-box primary-gradient" style="margin: 0 auto 1.5rem;"><i data-lucide="shield-check"></i></div>
                    <h2>${state.meta.tripName || 'Handshake Protocol Active'}</h2>
                    <p style="font-weight:800; opacity:0.6;">Firmware: v${CONFIG.VERSION}</p>
                </div>

                <div class="panel luxury-shadow animate-in" style="background:#fff !important; border-radius:24px; margin-top:20px;">
                    <div class="panel-title"><i data-lucide="file-text"></i> Expedition Archiving</div>
                    <p style="font-size:0.85rem; margin-bottom:15px;">Compile and download the complete financial dossier for the trekking group.</p>
                    <button class="btn btn-primary" style="width:100%; height:55px;" onclick="Logic.generateExpeditionDossier()">
                        <i data-lucide="download"></i> Download Platinum PDF
                    </button>
                </div>

                <div class="panel luxury-shadow animate-in" style="background:#fff !important; border-radius:24px; margin-top:20px;">
                    <div class="panel-title"><i data-lucide="hard-drive"></i> Hardware Diagnostics</div>
                    <p style="font-size:0.85rem;"><strong>Status:</strong> <span style="color:var(--success);">CONNECTED</span></p>
                    <p style="font-size:0.85rem;"><strong>Mode:</strong> ${isS ? 'Native (Standalone)' : 'Browser Interface'}</p>
                    <p style="font-size:0.85rem;"><strong>Handshake Hash:</strong> ${state.meta.clientHash}</p>
                </div>

                <div class="panel luxury-shadow animate-in" style="background:var(--danger-soft) !important; border: 1px solid var(--danger); border-radius: 24px; margin-top:20px;">
                    <div class="panel-title" style="color:var(--danger-text);"><i data-lucide="alert-triangle"></i> System Hard Reset</div>
                    <p style="color:var(--danger-text); margin-bottom:15px; font-size:0.8rem;">Warning: This operation wipes all synchronized trip data and forces a return to the Orbit Planner.</p>
                    <button class="btn btn-reset-danger" style="width:100%; border:none; background:var(--danger); color:white;" onclick="DataManager.purge()">
                        <i data-lucide="refresh-ccw"></i> Purge & Fresh Start
                    </button>
                </div>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        },

        formatTime: (ts) => {
            const diff = Math.floor((Date.now() - ts) / 1000);
            if (diff < 60) return 'Seconds ago';
            if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
            if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
            return new Date(ts).toLocaleDateString();
        }
    };

    // --- 7. BUSINESS LOGIC & TRANSACTIONAL SAFETY ---
    const Logic = {
        registerBill: (e) => {
            e.preventDefault();
            const title = DOM.forms.titleInput.value.trim();
            const amount = parseFloat(DOM.forms.amountInput.value) || 0;
            const category = DOM.forms.categoryInput.value;
            const payer = DOM.forms.payerSelect.value;
            const participants = Array.from(document.querySelectorAll('input[name="participants"]:checked')).map(cb => cb.value);

            if (amount <= 0 || participants.length === 0) {
                alert("Security Protocol: Bill value and Participant set must be defined.");
                return;
            }

            const bill = { id: Date.now(), title: title || `${category} Expenditure`, amount, paidBy: payer, category, participants, time: Date.now() };

            state.expenses.push(bill);
            DataStore.commit('expenses', state.expenses);
            
            Logic.logInternal(`Sync Successful: ${bill.title}`, category.toLowerCase(), CONFIG.ICONS[category], Analytics.formatCurrency(amount));
            closeModal('expenseModal');
            e.target.reset();
            ViewController.renderSection('dashboard');
        },

        logInternal: (text, cat, icon, amount = '') => {
            state.logs.unshift({ text, cat, icon, amount, time: Date.now() });
            if (state.logs.length > CONFIG.LOG_LIMIT) state.logs.pop();
            DataStore.commit('logs', state.logs);
        },

        removeBill: (idx) => {
            if (confirm("Confirm Purge: Discard this transactional packet?")) {
                const actualIdx = state.expenses.length - 1 - idx;
                const removed = state.expenses.splice(actualIdx, 1)[0];
                DataStore.commit('expenses', state.expenses);
                Logic.logInternal(`Packet Discarded: ${removed.title}`, 'system', 'trash-2');
                ViewController.runPageRenderer('expenses');
                ViewController.drawDashboard();
            }
        },

        removeParticipant: (idx) => {
            if (confirm("DANGER: Subject removal destabilizes settlement matrix. Continue?")) {
                const removed = state.members.splice(idx, 1)[0];
                DataStore.commit('members', state.members);
                Logic.logInternal(`Subject Detached: ${removed.name}`, 'system', 'user-x');
                ViewController.runPageRenderer('members');
                ViewController.drawDashboard();
            }
        },

        captureSecurityCard: (id, name) => {
            const node = document.getElementById(id);
            if (!node || typeof htmlToImage === 'undefined') return;
            htmlToImage.toPng(node, { backgroundColor: '#f8fafc', pixelRatio: 3, style: { transform: 'scale(1)', borderRadius: '24px' } })
                .then(url => {
                    const a = document.createElement('a');
                    a.download = `Verification_${name}.png`;
                    a.href = url;
                    a.click();
                    Logic.logInternal(`Retina Capture: ${name}`, 'success', 'camera');
                });
        },

        broadcastWhatsApp: (name, net) => {
            const status = net >= 0 ? "Collect" : "Pay";
            const absVal = Math.round(Math.abs(net));
            const msg = `*TripSplit Platinum Intelligence*%0A*Member:* ${name}%0A*Perimeter:* ${status} ₹${absVal}%0A*Expedition:* ${state.meta.tripName || 'Katra 2026'}%0A_Report generated via TripSplit Monolith_`;
            window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
        },

        generateExpeditionDossier: () => {
            if (!window.jspdf) { alert("PDF Module missing."); return; }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const tripName = state.meta.tripName || "Platinum Expedition";
            
            doc.setFontSize(26);
            doc.setTextColor(37, 99, 235);
            doc.text("EXPEDITION DOSSIER", 14, 25);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`TRIPSPLIT PLATINUM v${CONFIG.VERSION}`, 14, 32);
            doc.text(`GENERATED: ${new Date().toLocaleString()}`, 14, 38);

            // Member Table
            const mData = state.members.map(m => [m.name, Analytics.formatCurrency(state.expenses.filter(e => e.paidBy === m.name).reduce((s, e) => s + e.amount, 0))]);
            doc.autoTable({ startY: 50, head: [['Expedition Member', 'Total Paid Out']], body: mData, headStyles: { fillColor: [37, 99, 235] } });

            // Settlement Logic Table
            const plan = Analytics.solveSettlements();
            const pRows = plan.map(p => [p.from, p.to, Analytics.formatCurrency(p.amount)]);
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59);
            doc.text("SETTLEMENT PROTOCOLS", 14, doc.lastAutoTable.finalY + 15);
            doc.autoTable({ startY: doc.lastAutoTable.finalY + 22, head: [['Debtor (Sender)', 'Creditor (Receiver)', 'Settlement Value']], body: pRows.length ? pRows : [['-', '-', 'No Debt Found']], headStyles: { fillColor: [15, 23, 42] } });

            doc.save(`Dossier_${tripName.replace(/\s+/g, '_')}.pdf`);
            Logic.logInternal("PDF Dossier Compiled", "success", "file-text");
        }
    };

    // --- 8. SMART MODAL & INTERACTION HANDLERS ---
    const UIInteractions = {
        setupExpensePerimeter: () => {
            if (!DOM.forms.inclusionList) return;
            DOM.forms.inclusionList.innerHTML = state.members.map(m => `
                <label class="squad-chip selected" onclick="window.Logic.toggleChip(this)">
                    <input type="checkbox" name="participants" value="${m.name}" checked style="display:none">
                    <span>${m.name}</span>
                </label>`).join('');

            if (DOM.forms.payerSelect) {
                DOM.forms.payerSelect.innerHTML = state.members.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
            }
            UIInteractions.refreshLivePreview();
        },

        refreshLivePreview: () => {
            const val = parseFloat(DOM.forms.amountInput.value) || 0;
            const selected = document.querySelectorAll('input[name="participants"]:checked').length;
            if (DOM.forms.liveSplit) {
                DOM.forms.liveSplit.innerText = selected > 0 ? `₹${(val / selected).toFixed(2)} / Person` : "₹0.00 / Person";
            }
        },

        analyzeContextualIcon: () => {
            const text = DOM.forms.titleInput.value.toLowerCase();
            let finalIcon = 'tag';
            for (let category in CONFIG.KEYWORDS) {
                if (CONFIG.KEYWORDS[category].some(word => text.includes(word))) {
                    if (category === 'food') finalIcon = 'utensils';
                    else if (category === 'travel') finalIcon = 'car';
                    else if (category === 'stay') finalIcon = 'hotel';
                    else if (category === 'entry') finalIcon = 'ticket';
                    break;
                }
            }
            if (DOM.forms.smartIcon) DOM.forms.smartIcon.innerHTML = `<i data-lucide="${finalIcon}"></i>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    // --- 9. SECURITY HANDSHAKE & APPLICATION BOOTSTRAP ---
    const CoreBootstrap = () => {
        console.log("🚀 Platinum Engine: Finalizing Perimeters...");
        
        // Check for Handshake data from Orbit
        const tripName = localStorage.getItem('tripcart_tripName');
        
        /**
         * REDIRECTION PROTOCOL
         * If the tracker is accessed directly without planning data, 
         * redirect to the index.html page immediately.
         */
        if (!tripName && state.members.length === 0) {
            console.warn("Unauthorized Handshake State. Redirecting to Planner...");
            window.location.href = CONFIG.PLANNER_URL;
            return;
        }

        // Apply Trip Metadata
        if (DOM.tripSubtitle) DOM.tripSubtitle.innerText = tripName || "Expedition v25";
        
        // Initialize Default View
        ViewController.renderSection('dashboard');

        // Global Event Attachments
        if (DOM.forms.expense) DOM.forms.expense.onsubmit = Logic.registerBill;
        if (DOM.forms.amountInput) DOM.forms.amountInput.oninput = UIInteractions.refreshLivePreview;
        if (DOM.forms.titleInput) DOM.forms.titleInput.oninput = UIInteractions.analyzeContextualIcon;

        Logic.logInternal("Handshake Secure: Expedition Ready", "system", "lock");
    };

    // --- 10. SYSTEM DIAGNOSTICS & GLOBAL EXPOSURE ---
    window.showSection = ViewController.renderSection;
    window.openModal = (id) => { 
        const m = DOM.modals[id === 'expenseModal' ? 'expense' : 'member'];
        if(m) {
            m.style.display = 'flex';
            if(id === 'expenseModal') UIInteractions.setupExpensePerimeter();
        }
    };
    window.closeModal = (id) => {
        const m = DOM.modals[id === 'expenseModal' ? 'expense' : 'member'];
        if(m) m.style.display = 'none';
    };

    // Global Namespace logic mapping
    window.Logic = {
        ...Logic,
        toggleChip: (el) => {
            const cb = el.querySelector('input');
            setTimeout(() => {
                el.classList.toggle('selected', cb.checked);
                UIInteractions.refreshLivePreview();
            }, 10);
        },
        selectAllSquad: () => {
            document.querySelectorAll('.squad-chip').forEach(c => {
                c.querySelector('input').checked = true;
                c.classList.add('selected');
            });
            UIInteractions.refreshLivePreview();
        },
        submitMember: () => {
            const name = document.getElementById('new-member-name').value.trim();
            if (!name || state.members.find(m => m.name === name)) return;
            state.members.push({ name, id: Date.now() });
            DataStore.commit('members', state.members);
            Logic.logInternal(`Registered Participant: ${name}`, 'success', 'user-plus');
            closeModal('memberModal');
            ViewController.runPageRenderer('members');
        }
    };

    window.selectCategory = (cat, btn) => {
        document.querySelectorAll('.cat-tab').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        if (DOM.forms.categoryInput) DOM.forms.categoryInput.value = cat;
    };

    // Execute Application Initializer
    document.addEventListener('DOMContentLoaded', CoreBootstrap);

})();
/**
 * ==============================================================================
 * END OF MONOLITHIC TRACKER CORE | TOTAL LOC: 800+
 * DATA SYNC SECURED | PERIMETER STABLE
 * ==============================================================================
 */
