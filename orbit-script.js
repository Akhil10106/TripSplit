/**
 * ORBIT | PREMIUM TRIP PLANNER & ONBOARDING ENGINE
 * Version: 25.0.0 Platinum Edition
 * Architecture: Hybrid Functional-Reactive
 * Purpose: Secure Data Handshake for TripCart Platinum Ecosystem
 */

"use strict";

(function() {
    // ================================================================
    // 1. SYSTEM CONFIGURATION & DESIGN TOKENS
    // ================================================================
    const CONFIG = {
        APP_NAME: 'Orbit Platinum',
        VERSION: '2.5.0.9',
        TOTAL_STEPS: 5,
        // CRITICAL FIX: Direct full URL to your Vercel deployment
        REDIRECT_TARGET: 'https://trippsplit.vercel.app', 
        STORAGE_KEYS: {
            INTERNAL: 'orbit_trip_persistence',
            BRIDGE_NAME: 'tripcart_tripName',
            BRIDGE_MEMBERS: 'tripcart_members',
            BRIDGE_EXPENSES: 'tripcart_expenses',
            BRIDGE_LOGS: 'tripcart_logs'
        },
        ANIMATION: {
            FADE_IN: 'fade-in',
            SLIDE_UP: 'slide-up',
            DURATION: 400
        }
    };

    // ================================================================
    // 2. STATE RECEPTACLE (THE BRAIN)
    // ================================================================
    let state = {
        currentStep: 1,
        isTransitioning: false,
        trip: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.INTERNAL)) || {
            basics: { name: '', start: '', end: '', duration: 0 },
            transport: { type: '', val1: '', val2: '', val3: '', val4: '', icon: 'map-pin' },
            members: [],
            hotel: { exists: false, name: '', address: '', in: '', out: '' },
            budget: {
                total: 0,
                allocations: { transport: 0, accommodation: 0, food: 0, misc: 0 },
                verified: false
            },
            meta: { initializedAt: Date.now(), lastSync: null }
        }
    };

    // ================================================================
    // 3. DOM ELEMENT REGISTRY (CACHE)
    // ================================================================
    const DOM = {
        wizard: document.getElementById('wizard-container'),
        dashboard: document.getElementById('dashboard'),
        steps: document.querySelectorAll('.step'),
        nextBtn: document.getElementById('next-btn'),
        prevBtn: document.getElementById('prev-btn'),
        progressFill: document.getElementById('progress-fill'),
        dots: document.querySelectorAll('.step-dot'),
        
        inputs: {
            tripName: document.getElementById('trip-name'),
            startDate: document.getElementById('start-date'),
            endDate: document.getElementById('end-date'),
            transportType: document.getElementById('transport-type'),
            memberCount: document.getElementById('member-count'),
            memberList: document.getElementById('members-list'),
            hotelToggle: document.getElementById('has-hotel'),
            hotelForm: document.getElementById('hotel-form'),
            hotelName: document.getElementById('hotel-name'),
            hotelAddr: document.getElementById('hotel-address'),
            hotelIn: document.getElementById('hotel-in'),
            hotelOut: document.getElementById('hotel-out'),
            budgetTotal: document.getElementById('budget-total'),
            budgetTrans: document.getElementById('budget-transport'),
            budgetHotel: document.getElementById('budget-hotel'),
            budgetFood: document.getElementById('budget-food'),
            budgetMisc: document.getElementById('budget-other')
        },
        
        displays: {
            calcDays: document.getElementById('calc-days'),
            durationBadge: document.getElementById('duration-badge'),
            dashName: document.getElementById('dash-trip-name'),
            dashDates: document.getElementById('dash-dates'),
            dashDaysLeft: document.getElementById('days-left'),
            budgetStroke: document.getElementById('budget-stroke'),
            budgetPercent: document.getElementById('budget-percent'),
            budgetUsed: document.getElementById('dash-used-budget'),
            budgetRem: document.getElementById('dash-rem-budget'),
            memberGrid: document.getElementById('dash-members-content')
        }
    };

    // ================================================================
    // 4. UTILITY HELPER ENGINE
    // ================================================================
    const Utils = {
        persist: () => {
            localStorage.setItem(CONFIG.STORAGE_KEYS.INTERNAL, JSON.stringify(state.trip));
        },
        
        formatCurrency: (num) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(num);
        },

        getDateDifference: (d1, d2) => {
            if (!d1 || !d2) return 0;
            const start = new Date(d1);
            const end = new Date(d2);
            const diff = end - start;
            return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        },

        generateID: () => Date.now() + Math.floor(Math.random() * 10000)
    };

    // ================================================================
    // 5. THE PLATINUM BRIDGE (HANDSHAKE LOGIC)
    // ================================================================
    const Bridge = {
        executeHandshake: () => {
            console.log("🚀 Initializing Platinum Handshake Protocol...");

            // 1. Transform Members to TripCart Participant Objects
            const participants = state.trip.members.map(name => ({
                name: name,
                id: Utils.generateID(),
                enrolledAt: Date.now()
            }));

            // 2. Synthesize Initial Financial Package
            const initialLedger = [];
            const primaryPayer = state.trip.members[0] || 'Admin';
            const alloc = state.trip.budget.allocations;

            if (alloc.transport > 0) {
                initialLedger.push({
                    id: Utils.generateID(),
                    title: "Orbit: Transport Pre-Allocation",
                    amount: alloc.transport,
                    paidBy: primaryPayer,
                    category: "Travel",
                    participants: state.trip.members,
                    time: Date.now()
                });
            }

            if (alloc.accommodation > 0) {
                initialLedger.push({
                    id: Utils.generateID() + 5,
                    title: "Orbit: Hotel Pre-Allocation",
                    amount: alloc.accommodation,
                    paidBy: primaryPayer,
                    category: "Stay",
                    participants: state.trip.members,
                    time: Date.now()
                });
            }

            // 3. Inject into Local Storage (The Bridge)
            localStorage.setItem(CONFIG.STORAGE_KEYS.BRIDGE_NAME, state.trip.basics.name);
            localStorage.setItem(CONFIG.STORAGE_KEYS.BRIDGE_MEMBERS, JSON.stringify(participants));
            localStorage.setItem(CONFIG.STORAGE_KEYS.BRIDGE_EXPENSES, JSON.stringify(initialLedger));
            
            const initLog = [{
                text: `Expedition "${state.trip.basics.name}" Synchronized`,
                cat: "system",
                icon: "shield-check",
                amount: `₹${state.trip.budget.total}`,
                time: Date.now()
            }];
            localStorage.setItem(CONFIG.STORAGE_KEYS.BRIDGE_LOGS, JSON.stringify(initLog));

            // 4. AUTOMATIC REDIRECTION
            console.log("✈️ Redirecting to TripSplit Platinum...");
            window.location.href = CONFIG.REDIRECT_TARGET;
        }
    };

    // ================================================================
    // 6. UI COMPONENT GENERATORS
    // ================================================================
    const UIRenderer = {
        refreshWizard: () => {
            DOM.steps.forEach(s => {
                s.classList.add('hidden');
                s.classList.remove(CONFIG.ANIMATION.FADE_IN);
            });

            const activeStep = document.querySelector(`.step[data-step="${state.currentStep}"]`);
            if (activeStep) {
                activeStep.classList.remove('hidden');
                setTimeout(() => activeStep.classList.add(CONFIG.ANIMATION.FADE_IN), 50);
            }

            const percentage = (state.currentStep / CONFIG.TOTAL_STEPS) * 100;
            DOM.progressFill.style.width = `${percentage}%`;

            DOM.dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx < state.currentStep);
            });

            DOM.prevBtn.classList.toggle('hidden', state.currentStep === 1);
            DOM.nextBtn.innerHTML = state.currentStep === CONFIG.TOTAL_STEPS ? 
                '<span>Launch Expedition</span>' : '<span>Continue</span>';

            if (state.currentStep === 2) UIRenderer.transportContext();
            if (state.currentStep === 3) UIRenderer.squadGenerator();
        },

        transportContext: () => {
            const type = DOM.inputs.transportType.value;
            const target = document.getElementById('dynamic-transport-form');
            if (!target) return;
            target.innerHTML = '';
            if (!type) return;

            const t = state.trip.transport;
            const forms = {
                Flight: `<div class="grid-2 fade-in">
                    <div class="input-group"><label>Airlines</label><input type="text" id="t-1" value="${t.val1}" placeholder="e.g. Indigo"></div>
                    <div class="input-group"><label>Flight #</label><input type="text" id="t-2" value="${t.val2}" placeholder="e.g. 6E-2024"></div>
                    <div class="input-group"><label>From</label><input type="text" id="t-3" value="${t.val3}" placeholder="City"></div>
                    <div class="input-group"><label>To</label><input type="text" id="t-4" value="${t.val4}" placeholder="City"></div>
                </div>`,
                Train: `<div class="grid-2 fade-in">
                    <div class="input-group"><label>Train Name</label><input type="text" id="t-1" value="${t.val1}"></div>
                    <div class="input-group"><label>PNR #</label><input type="text" id="t-2" value="${t.val2}"></div>
                </div>`,
                Car: `<div class="grid-2 fade-in">
                    <div class="input-group"><label>Driver Name</label><input type="text" id="t-1" value="${t.val1}"></div>
                    <div class="input-group"><label>Vehicle #</label><input type="text" id="t-2" value="${t.val2}"></div>
                </div>`,
                Other: `<div class="input-group fade-in"><label>Description</label><input type="text" id="t-1" value="${t.val1}" placeholder="Travel notes..."></div>`
            };
            target.innerHTML = forms[type] || forms.Other;
        },

        squadGenerator: () => {
            const count = Math.min(Math.max(parseInt(DOM.inputs.memberCount.value) || 1, 1), 20);
            DOM.inputs.memberList.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const existing = state.trip.members[i] || '';
                DOM.inputs.memberList.innerHTML += `
                    <div class="member-entry fade-in" style="margin-bottom:12px; display:flex; align-items:center; gap:10px;">
                        <span style="font-weight:900; opacity:0.3; width:20px;">${i+1}</span>
                        <input type="text" class="m-name" placeholder="Member Name" value="${existing}" style="flex:1;">
                    </div>`;
            }
        }
    };

    // ================================================================
    // 7. DATA CAPTURE ENGINE
    // ================================================================
    const DataProcessor = {
        saveStep: (step) => {
            const t = state.trip;
            const i = DOM.inputs;

            switch(step) {
                case 1:
                    t.basics.name = i.tripName.value;
                    t.basics.start = i.startDate.value;
                    t.basics.end = i.endDate.value;
                    t.basics.duration = Utils.getDateDifference(t.basics.start, t.basics.end);
                    break;
                case 2:
                    t.transport.type = i.transportType.value;
                    t.transport.val1 = document.getElementById('t-1')?.value || '';
                    t.transport.val2 = document.getElementById('t-2')?.value || '';
                    t.transport.val3 = document.getElementById('t-3')?.value || '';
                    t.transport.val4 = document.getElementById('t-4')?.value || '';
                    break;
                case 3:
                    const names = document.querySelectorAll('.m-name');
                    t.members = Array.from(names).map(input => input.value.trim()).filter(val => val !== "");
                    break;
                case 4:
                    t.hotel.exists = i.hotelToggle.checked;
                    if (t.hotel.exists) {
                        t.hotel.name = i.hotelName.value;
                        t.hotel.address = i.hotelAddr.value;
                        t.hotel.in = i.hotelIn.value;
                        t.hotel.out = i.hotelOut.value;
                    }
                    break;
                case 5:
                    t.budget.total = parseFloat(i.budgetTotal.value) || 0;
                    const a = t.budget.allocations;
                    a.transport = parseFloat(i.budgetTrans.value) || 0;
                    a.accommodation = parseFloat(i.budgetHotel.value) || 0;
                    a.food = parseFloat(i.budgetFood.value) || 0;
                    a.misc = parseFloat(i.budgetMisc.value) || 0;
                    break;
            }
            Utils.persist();
        },

        validate: (step) => {
            const i = DOM.inputs;
            if (step === 1) {
                if (!i.tripName.value.trim()) { alert("Please identify your destination!"); return false; }
                if (!i.startDate.value || !i.endDate.value) { alert("Timeline must be defined."); return false; }
            }
            if (step === 3) {
                const filled = Array.from(document.querySelectorAll('.m-name')).filter(inp => inp.value.trim());
                if (filled.length === 0) { alert("Expedition requires at least one traveler."); return false; }
            }
            return true;
        }
    };

    // ================================================================
    // 8. DASHBOARD RENDERING
    // ================================================================
    const OrbitDashboard = {
        render: () => {
            DOM.wizard.classList.add('hidden');
            DOM.dashboard.classList.remove('hidden');

            const t = state.trip;
            const d = DOM.displays;

            d.dashName.textContent = t.basics.name;
            d.dashDates.textContent = t.basics.start ? `${t.basics.start} → ${t.basics.end}` : "TBD";
            
            const start = new Date(t.basics.start);
            const diff = Math.ceil((start - new Date()) / (1000 * 60 * 60 * 24));
            d.dashDaysLeft.textContent = diff > 0 ? diff.toString().padStart(2, '0') : '00';

            const spent = Object.values(t.budget.allocations).reduce((a, b) => a + b, 0);
            const total = t.budget.total || 1;
            const perc = Math.min(Math.round((spent / total) * 100), 100);
            
            if (d.budgetStroke) d.budgetStroke.setAttribute('stroke-dasharray', `${perc}, 100`);
            d.budgetPercent.textContent = `${perc}%`;
            d.budgetUsed.textContent = `₹${spent.toLocaleString()}`;
            d.budgetRem.textContent = `₹${Math.max(0, total - spent).toLocaleString()}`;

            d.memberGrid.innerHTML = t.members.length > 0 
                ? t.members.map(m => `<div class="pill animate-in">${m}</div>`).join('')
                : '<p style="opacity:0.4; font-size: 0.8rem;">Solo Expedition</p>';
        }
    };

    // ================================================================
    // 9. EVENT SUITE & LISTENERS
    // ================================================================
    const CoreListeners = () => {
        DOM.nextBtn.addEventListener('click', () => {
            if (DataProcessor.validate(state.currentStep)) {
                DataProcessor.saveStep(state.currentStep);
                if (state.currentStep < CONFIG.TOTAL_STEPS) {
                    state.currentStep++;
                    UIRenderer.refreshWizard();
                } else {
                    Bridge.executeHandshake();
                }
            }
        });

        DOM.prevBtn.addEventListener('click', () => {
            if (state.currentStep > 1) {
                state.currentStep--;
                UIRenderer.refreshWizard();
            }
        });

        DOM.inputs.transportType.addEventListener('change', UIRenderer.transportContext);
        DOM.inputs.memberCount.addEventListener('input', UIRenderer.squadGenerator);
        
        DOM.inputs.hotelToggle.addEventListener('change', (e) => {
            DOM.inputs.hotelForm.classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('reset-trip').addEventListener('click', () => {
            if (confirm("CRITICAL: This will wipe all Planning logs. Continue?")) {
                localStorage.clear();
                location.reload();
            }
        });

        document.querySelectorAll('.edit-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                state.currentStep = parseInt(e.target.dataset.step);
                DOM.dashboard.classList.add('hidden');
                DOM.wizard.classList.remove('hidden');
                UIRenderer.refreshWizard();
            });
        });
    };

    // ================================================================
    // 10. SYSTEM BOOTSTRAP
    // ================================================================
    const boot = () => {
        console.log(`🚀 ${CONFIG.APP_NAME} V${CONFIG.VERSION} Initialized.`);
        
        if (localStorage.getItem(CONFIG.STORAGE_KEYS.BRIDGE_NAME)) {
            OrbitDashboard.render();
        } else {
            DOM.wizard.classList.remove('hidden');
            UIRenderer.refreshWizard();
        }
        
        CoreListeners();
    };

    boot();

})();
