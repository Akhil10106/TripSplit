/**
 * ORBIT PLATINUM | CORE ENGINE v25.0.9
 * Architecture: Monolithic Hybrid Functional-Reactive
 * Author: Gemini AI Collaboration
 * Purpose: Secure Data Handshake for TripSplit Vercel Ecosystem
 * Updated: 2026 Katra Expedition Edition
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
        REDIRECT_TARGET: 'tracker.html', 
        CURRENCY: 'INR',
        LOCALE: 'en-IN',
        LOG_LIMIT: 50,
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
        },
        ICONS: {
            flight: '✈️',
            train: '🚂',
            bus: '🚌',
            car: '🚗',
            hotel: '🏨',
            budget: '💰',
            squad: '👥'
        }
    };

    // ================================================================
    // 2. STATE RECEPTACLE (THE BRAIN)
    // ================================================================
    let state = {
        currentStep: 1,
        isTransitioning: false,
        isSynced: false,
        trip: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.INTERNAL)) || {
            basics: {
                name: '',
                start: '',
                end: '',
                duration: 0,
                status: 'planning'
            },
            transport: {
                type: '',
                val1: '', // Ref/Name
                val2: '', // PNR/Flight#
                val3: '', // Origin
                val4: '', // Destination
                icon: 'map-pin'
            },
            members: [],
            hotel: {
                exists: false,
                name: '',
                address: '',
                in: '',
                out: ''
            },
            budget: {
                total: 0,
                allocations: {
                    transport: 0,
                    accommodation: 0,
                    food: 0,
                    misc: 0
                },
                health: 100, // Percentage of budget assigned
                verified: false
            },
            meta: {
                initializedAt: Date.now(),
                lastSync: null,
                clientHash: null
            }
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
            memberGrid: document.getElementById('dash-members-content'),
            transportContent: document.getElementById('dash-transport-content'),
            hotelContent: document.getElementById('dash-hotel-content')
        }
    };

    // ================================================================
    // 4. UTILITY HELPER ENGINE
    // ================================================================
    const Utils = {
        /**
         * Persists local state to internal key.
         */
        persist: () => {
            localStorage.setItem(CONFIG.STORAGE_KEYS.INTERNAL, JSON.stringify(state.trip));
        },
        
        /**
         * Formats numeric values to INR Currency format.
         */
        formatCurrency: (num) => {
            return new Intl.NumberFormat(CONFIG.LOCALE, {
                style: 'currency',
                currency: CONFIG.CURRENCY,
                maximumFractionDigits: 0
            }).format(num);
        },

        /**
         * Calculates date differences in days.
         */
        getDateDifference: (d1, d2) => {
            if (!d1 || !d2) return 0;
            const start = new Date(d1);
            const end = new Date(d2);
            const diff = end - start;
            return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        },

        /**
         * Generates high-entropy IDs for participant handshake.
         */
        generateID: () => Date.now() + Math.floor(Math.random() * 10000),

        /**
         * Validates if a string is a valid date.
         */
        isValidDate: (d) => {
            const date = new Date(d);
            return date instanceof Date && !isNaN(date);
        }
    };

    // ================================================================
    // 5. THE PLATINUM BRIDGE (HANDSHAKE LOGIC)
    // ================================================================
    const Bridge = {
        /**
         * Transforms internal Planner state into Tracker-ready schema.
         * Redirects browser to Tracker Perimeter upon completion.
         */
        executeHandshake: () => {
            console.log("🚀 Initializing Platinum Handshake Protocol...");

            // 1. Transform Members to TripSplit Participant Objects
            const participants = state.trip.members.map(name => ({
                name: name,
                id: Utils.generateID(),
                enrolledAt: Date.now()
            }));

            // 2. Synthesize Initial Financial Ledger
            const initialLedger = [];
            const primaryPayer = state.trip.members[0] || 'Admin';
            const alloc = state.trip.budget.allocations;

            // Map Transport Allocation to Ledger
            if (alloc.transport > 0) {
                initialLedger.push({
                    id: Utils.generateID(),
                    title: "Expedition Transport Allocation",
                    amount: alloc.transport,
                    paidBy: primaryPayer,
                    category: "Travel",
                    participants: state.trip.members,
                    time: Date.now()
                });
            }

            // Map Hotel Allocation to Ledger
            if (alloc.accommodation > 0) {
                initialLedger.push({
                    id: Utils.generateID() + 5,
                    title: "Expedition Stay Allocation",
                    amount: alloc.accommodation,
                    paidBy: primaryPayer,
                    category: "Stay",
                    participants: state.trip.members,
                    time: Date.now()
                });
            }

            // 3. Inject into Shared Storage Perimeter
            localStorage.setItem(CONFIG.STORAGE_KEYS.BRIDGE_NAME, state.trip.basics.name);
            localStorage.setItem(CONFIG.STORAGE_KEYS.BRIDGE_MEMBERS, JSON.stringify(participants));
            localStorage.setItem(CONFIG.STORAGE_KEYS.BRIDGE_EXPENSES, JSON.stringify(initialLedger));
            
            // Generate Initial Handshake Logs
            const initLog = [{
                text: `Expedition "${state.trip.basics.name}" Synchronized`,
                cat: "system",
                icon: "shield-check",
                amount: `₹${state.trip.budget.total}`,
                time: Date.now()
            }];
            localStorage.setItem(CONFIG.STORAGE_KEYS.BRIDGE_LOGS, JSON.stringify(initLog));

            // 4. Trigger Cross-Domain/File Redirection
            console.log("✈️ Redirecting to Tracker Perimeter...");
            window.location.href = CONFIG.REDIRECT_TARGET;
        }
    };

    // ================================================================
    // 6. UI RENDERER & COMPONENT ENGINE
    // ================================================================
    const UIRenderer = {
        /**
         * Refreshes the Wizard view based on current step index.
         */
        refreshWizard: () => {
            // Hide all steps
            DOM.steps.forEach(s => {
                s.classList.add('hidden');
                s.classList.remove(CONFIG.ANIMATION.FADE_IN);
            });

            // Show active step
            const activeStep = document.querySelector(`.step[data-step="${state.currentStep}"]`);
            if (activeStep) {
                activeStep.classList.remove('hidden');
                setTimeout(() => activeStep.classList.add(CONFIG.ANIMATION.FADE_IN), 50);
            }

            // Update Progress UI
            const percentage = (state.currentStep / CONFIG.TOTAL_STEPS) * 100;
            DOM.progressFill.style.width = `${percentage}%`;

            // Update Step Dots
            DOM.dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx < state.currentStep);
            });

            // Toggle Navigation Buttons
            DOM.prevBtn.classList.toggle('hidden', state.currentStep === 1);
            DOM.nextBtn.innerHTML = state.currentStep === CONFIG.TOTAL_STEPS ? 
                '<span>Launch Expedition</span>' : '<span>Continue</span>';

            // Run Step-Specific Dynamic Logic
            if (state.currentStep === 2) UIRenderer.renderTransportContext();
            if (state.currentStep === 3) UIRenderer.renderSquadModule();
        },

        /**
         * Renders dynamic transport input fields based on selected mode.
         */
        renderTransportContext: () => {
            const type = DOM.inputs.transportType.value;
            const target = document.getElementById('dynamic-transport-form');
            if (!target) return;
            target.innerHTML = '';
            if (!type) return;

            const t = state.trip.transport;
            let html = '';

            switch(type) {
                case 'Flight':
                    html = `<div class="grid-2 fade-in">
                        <div class="input-group"><label>Airlines</label><input type="text" id="t-1" value="${t.val1}" placeholder="e.g. Indigo"></div>
                        <div class="input-group"><label>Flight #</label><input type="text" id="t-2" value="${t.val2}" placeholder="e.g. 6E-2024"></div>
                        <div class="input-group"><label>From</label><input type="text" id="t-3" value="${t.val3}" placeholder="City"></div>
                        <div class="input-group"><label>To</label><input type="text" id="t-4" value="${t.val4}" placeholder="City"></div>
                    </div>`;
                    break;
                case 'Train':
                    html = `<div class="grid-2 fade-in">
                        <div class="input-group"><label>Train Name</label><input type="text" id="t-1" value="${t.val1}" placeholder="e.g. Sampark Kranti"></div>
                        <div class="input-group"><label>PNR / Coach</label><input type="text" id="t-2" value="${t.val2}" placeholder="e.g. 10-Digit PNR"></div>
                    </div>`;
                    break;
                case 'Bus':
                    html = `<div class="grid-2 fade-in">
                        <div class="input-group"><label>Operator</label><input type="text" id="t-1" value="${t.val1}" placeholder="e.g. Volvo AC"></div>
                        <div class="input-group"><label>Seat Number</label><input type="text" id="t-2" value="${t.val2}" placeholder="e.g. 14A"></div>
                    </div>`;
                    break;
                case 'Car':
                    html = `<div class="grid-2 fade-in">
                        <div class="input-group"><label>Driver/Rental</label><input type="text" id="t-1" value="${t.val1}"></div>
                        <div class="input-group"><label>Vehicle #</label><input type="text" id="t-2" value="${t.val2}"></div>
                    </div>`;
                    break;
                default:
                    html = `<div class="input-group fade-in"><label>Expedition Notes</label><input type="text" id="t-1" value="${t.val1}" placeholder="Mode of travel details..."></div>`;
            }
            target.innerHTML = html;
        },

        /**
         * Dynamically generates participant input fields.
         */
        renderSquadModule: () => {
            const count = Math.min(Math.max(parseInt(DOM.inputs.memberCount.value) || 1, 1), 20);
            DOM.inputs.memberList.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const existing = state.trip.members[i] || '';
                DOM.inputs.memberList.innerHTML += `
                    <div class="member-entry fade-in" style="margin-bottom:12px; display:flex; align-items:center; gap:10px;">
                        <span style="font-weight:900; opacity:0.3; width:20px;">${i+1}</span>
                        <input type="text" class="m-name" placeholder="Enter Full Name" value="${existing}" style="flex:1;">
                    </div>`;
            }
        },

        /**
         * Renders the Final Dashboard (Local Preview).
         */
        renderDashboard: () => {
            DOM.wizard.classList.add('hidden');
            DOM.dashboard.classList.remove('hidden');

            const t = state.trip;
            const d = DOM.displays;

            // Basic Header Info
            d.dashName.textContent = t.basics.name || "Untitled Expedition";
            d.dashDates.textContent = t.basics.start ? `${t.basics.start} → ${t.basics.end}` : "Timeline TBD";
            
            // Countdown Logic
            if (t.basics.start) {
                const start = new Date(t.basics.start);
                const diff = Math.ceil((start - new Date()) / (1000 * 60 * 60 * 24));
                d.dashDaysLeft.textContent = diff > 0 ? diff.toString().padStart(2, '0') : '00';
            }

            // Budget Health Component
            const spent = Object.values(t.budget.allocations).reduce((a, b) => a + b, 0);
            const total = t.budget.total || 1;
            const perc = Math.min(Math.round((spent / total) * 100), 100);
            
            if (d.budgetStroke) d.budgetStroke.setAttribute('stroke-dasharray', `${perc}, 100`);
            d.budgetPercent.textContent = `${perc}%`;
            d.budgetUsed.textContent = Utils.formatCurrency(spent);
            d.budgetRem.textContent = Utils.formatCurrency(Math.max(0, total - spent));

            // Squad Pill Generator
            d.memberGrid.innerHTML = t.members.length > 0 
                ? t.members.map(m => `<div class="pill animate-in">${m}</div>`).join('')
                : '<p style="opacity:0.4; font-size: 0.8rem;">Solo Expedition Base</p>';

            // Dynamic Transport Card
            d.transportContent.innerHTML = t.transport.type ? `
                <p><b>Mode:</b> ${t.transport.type}</p>
                <p><b>Ref:</b> ${t.transport.val1 || 'N/A'}</p>
                <p><b>ID:</b> ${t.transport.val2 || 'N/A'}</p>
            ` : '<p>No transport defined</p>';

            // Dynamic Hotel Card
            d.hotelContent.innerHTML = t.hotel.exists ? `
                <p><b>Stay:</b> ${t.hotel.name}</p>
                <p><b>Timeline:</b> ${t.hotel.in} to ${t.hotel.out}</p>
            ` : '<p>Accommodation not required</p>';
        }
    };

    // ================================================================
    // 7. DATA CAPTURE & VALIDATION ENGINE
    // ================================================================
    const DataProcessor = {
        /**
         * Scrapes DOM inputs and commits to state based on current step.
         */
        saveCurrentStep: (step) => {
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

        /**
         * Step-wise validation logic to prevent incomplete handshakes.
         */
        validate: (step) => {
            const i = DOM.inputs;
            if (step === 1) {
                if (!i.tripName.value.trim()) { 
                    alert("Expedition Perimeter Warning: Identification required."); 
                    return false; 
                }
                if (!i.startDate.value || !i.endDate.value) { 
                    alert("Timeline Error: Temporal bounds required."); 
                    return false; 
                }
            }
            if (step === 3) {
                const filled = Array.from(document.querySelectorAll('.m-name')).filter(inp => inp.value.trim());
                if (filled.length === 0) { 
                    alert("Squad Protocol Error: Minimum one participant required."); 
                    return false; 
                }
            }
            return true;
        }
    };

    // ================================================================
    // 8. SYSTEM RESET & MAINTENANCE
    // ================================================================
    const Maintenance = {
        /**
         * Hard reset of Planner and linked Tracker keys.
         */
        purgeAllData: () => {
            const warning = "CRITICAL PERIMETER BREACH: This will wipe all planning logs and tracker data. Proceed?";
            if (confirm(warning)) {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.INTERNAL);
                localStorage.removeItem(CONFIG.STORAGE_KEYS.BRIDGE_NAME);
                localStorage.removeItem(CONFIG.STORAGE_KEYS.BRIDGE_MEMBERS);
                localStorage.removeItem(CONFIG.STORAGE_KEYS.BRIDGE_EXPENSES);
                localStorage.removeItem(CONFIG.STORAGE_KEYS.BRIDGE_LOGS);
                window.location.reload();
            }
        }
    };

    // ================================================================
    // 9. EVENT SUITE & LISTENERS
    // ================================================================
    const CoreListeners = () => {
        // Wizard Navigation
        DOM.nextBtn.addEventListener('click', () => {
            if (DataProcessor.validate(state.currentStep)) {
                DataProcessor.saveCurrentStep(state.currentStep);
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

        // Dynamic State Listeners
        DOM.inputs.transportType.addEventListener('change', UIRenderer.renderTransportContext);
        DOM.inputs.memberCount.addEventListener('input', UIRenderer.renderSquadModule);
        
        DOM.inputs.hotelToggle.addEventListener('change', (e) => {
            DOM.inputs.hotelForm.classList.toggle('hidden', !e.target.checked);
        });

        // Global Date Validation
        [DOM.inputs.startDate, DOM.inputs.endDate].forEach(inp => {
            inp.addEventListener('change', () => {
                const days = Utils.getDateDifference(DOM.inputs.startDate.value, DOM.inputs.endDate.value);
                DOM.displays.calcDays.textContent = days;
                DOM.displays.durationBadge.classList.toggle('hidden', days <= 0);
                
                // Constraints
                if (inp === DOM.inputs.startDate) {
                    DOM.inputs.endDate.min = DOM.inputs.startDate.value;
                }
            });
        });

        // System Maintenance UI
        const resetBtn = document.getElementById('reset-trip');
        if (resetBtn) resetBtn.addEventListener('click', Maintenance.purgeAllData);

        // Edit Mode Logic
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
    // 10. BOOTSTRAP INITIALIZATION
    // ================================================================
    const boot = () => {
        console.log(`🚀 ${CONFIG.APP_NAME} V${CONFIG.VERSION} Initialized.`);
        
        /**
         * Persistence Check:
         * If a handshake was already secured, bypass Wizard to Dashboard.
         */
        if (localStorage.getItem(CONFIG.STORAGE_KEYS.BRIDGE_NAME)) {
            UIRenderer.renderDashboard();
        } else {
            DOM.wizard.classList.remove('hidden');
            UIRenderer.refreshWizard();
        }
        
        // Finalize event attachment
        CoreListeners();
    };

    // Execute Boot Sequence
    boot();

})();

// ================================================================
// DOCUMENTATION & SCHEMA REFERENCE
// ================================================================
/**
 * Participant Schema: { name: String, id: Integer, enrolledAt: Timestamp }
 * Expense Schema: { id: Integer, title: String, amount: Float, paidBy: String, category: String, participants: Array, time: Timestamp }
 * Handshake Method: LocalStorage Shared Perimeter (Cross-File)
 */
