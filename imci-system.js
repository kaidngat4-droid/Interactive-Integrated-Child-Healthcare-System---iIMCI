/**
 * ════════════════════════════════════════════════════════════════════════════
 * IMCI CORE MODULE - Estsharion Platform
 * Integrated Management of Childhood Illness
 * Yemen Ministry of Health - Primary Healthcare Sector
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * @module imci-core
 * @version 2.1.0
 * @author Estsharion Development Team
 * @license MIT
 * 
 * @description
 * نظام متكامل لإدارة صحة الطفل وفقاً لبرنامج الإدارة المتكاملة لصحة الطفل (IMCI)
 * يشمل النظام:
 * - اكتشاف ذكي لحقول النماذج المختلفة
 * - تخزين موحد للبيانات باستخدام localStorage
 * - تقارير شهرية فورية
 * - دعم كامل للغة العربية والإنجليزية
 * 
 * @features
 * - Smart field detection across all form types
 * - Unified localStorage data architecture
 * - Real-time report aggregation
 * - Offline-first design with sync-ready structure
 * - Full bilingual support (AR/EN)
 * - Professional debugging utilities
 * - Automatic page type detection
 * 
 * @supervisor Dr. Salah Al-Ahdal
 * @since 2025
 * 
 * ════════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 1. CONSTANTS & CONFIGURATION
// ============================================================================

const IMCI_CONFIG = {
    VERSION: '2.1.0',
    BUILD_DATE: '2025-01-15',
    
    STORAGE_KEYS: {
        CHILDREN: 'imci_children_records_v2',
        NEWBORNS: 'imci_newborn_records_v2',
        REPORT_SNAPSHOT: 'imci_monthly_report_snapshot_v2',
        SETTINGS: 'imci_settings_v2',
        SYNC_QUEUE: 'imci_sync_queue_v2',
        AUDIT_LOG: 'imci_audit_log_v2'
    },
    
    AGE_RANGES: {
        NEWBORN: { min: 0, max: 60, unit: 'days', label: 'أقل من شهرين', labelEn: 'Under 2 months' },
        INFANT: { min: 2, max: 12, unit: 'months', label: 'من شهرين إلى أقل من سنة', labelEn: '2 to 12 months' },
        TODDLER: { min: 12, max: 24, unit: 'months', label: 'من سنة إلى أقل من سنتين', labelEn: '1 to 2 years' },
        CHILD: { min: 24, max: 60, unit: 'months', label: 'من سنتين إلى أقل من خمس سنوات', labelEn: '2 to 5 years' }
    },
    
    CLASSIFICATIONS: {
        COUGH: {
            verySevere: { label: 'مرض شديد جداً', color: '#c62828', priority: 1 },
            severePneumonia: { label: 'التهاب رئوي شديد', color: '#c62828', priority: 1 },
            pneumonia: { label: 'التهاب رئوي', color: '#ef6c00', priority: 2 },
            noCough: { label: 'لا يوجد سعال', color: '#2e7d32', priority: 3 },
            coughCold: { label: 'سعال / زكام', color: '#ffa000', priority: 3 }
        },
        DIARRHEA: {
            severeDehydration: { label: 'جفاف شديد', color: '#c62828', priority: 1 },
            someDehydration: { label: 'بعض الجفاف', color: '#ef6c00', priority: 2 },
            noDehydration: { label: 'لا يوجد جفاف', color: '#2e7d32', priority: 3 },
            dysentery: { label: 'زحار', color: '#d32f2f', priority: 2 },
            persistentDiarrhea: { label: 'إسهال مستمر', color: '#e65100', priority: 2 }
        },
        THROAT: {
            strep: { label: 'التهاب الحلق السبحي', color: '#ef6c00', priority: 2 },
            nonStrep: { label: 'التهاب الحلق غير السبحي', color: '#2e7d32', priority: 3 },
            noProblem: { label: 'لا يوجد مشكلة', color: '#2e7d32', priority: 4 }
        },
        EAR: {
            acute: { label: 'التهاب حاد بالأذن', color: '#ef6c00', priority: 2 },
            chronic: { label: 'التهاب مزمن بالأذن', color: '#f9a825', priority: 3 },
            noProblem: { label: 'لا توجد مشكلة', color: '#2e7d32', priority: 4 },
            mastoiditis: { label: 'التهاب الخشاء', color: '#c62828', priority: 1 }
        },
        FEVER: {
            verySevere: { label: 'مرض حمى شديد جداً', color: '#c62828', priority: 1 },
            malaria: { label: 'ملاريا', color: '#c62828', priority: 1 },
            feverUnknown: { label: 'حمى بدون سبب واضح', color: '#ef6c00', priority: 2 },
            measles: { label: 'حصبة', color: '#d32f2f', priority: 1 },
            noFever: { label: 'لا توجد حمى', color: '#2e7d32', priority: 4 }
        },
        NUTRITION: {
            severeMalnutrition: { label: 'سوء تغذية شديد', color: '#c62828', priority: 1 },
            underweight: { label: 'نقص الوزن', color: '#ef6c00', priority: 2 },
            anemia: { label: 'فقر الدم', color: '#f9a825', priority: 2 },
            noProblem: { label: 'لا توجد مشكلة', color: '#2e7d32', priority: 4 }
        },
        MUAC: {
            red: { label: 'أقل من 11.5 سم', color: '#c62828', priority: 1 },
            orange: { label: '11.5 - 12.5 سم', color: '#ef6c00', priority: 2 },
            green: { label: 'أكبر من 12.5 سم', color: '#2e7d32', priority: 3 }
        },
        NEWBORN: {
            seriousBacterial: { label: 'التهاب بكتيري خطير', color: '#c62828', priority: 1 },
            localBacterial: { label: 'التهاب بكتيري موضعي', color: '#ef6c00', priority: 2 },
            jaundice: { label: 'صفار واضح (يرقان)', color: '#f9a825', priority: 2 },
            severeDehydration: { label: 'جفاف شديد', color: '#c62828', priority: 1 },
            someDehydration: { label: 'بعض الجفاف', color: '#ef6c00', priority: 2 },
            noDehydration: { label: 'لا يوجد جفاف', color: '#2e7d32', priority: 3 },
            persistentDiarrhea: { label: 'إسهال مستمر شديد', color: '#d32f2f', priority: 2 },
            bloodInStool: { label: 'دم في البراز', color: '#c62828', priority: 1 },
            feedingProblem: { label: 'مشكلة في التغذية', color: '#ef6c00', priority: 2 },
            underweight: { label: 'نقص وزن', color: '#ef6c00', priority: 2 },
            noFeedingIssue: { label: 'لا توجد مشكلة في التغذية', color: '#2e7d32', priority: 4 }
        }
    },
    
    MEDICATIONS: {
        ANTIBIOTICS: ['amoxicillin', 'cotrimoxazole', 'penicillin_v', 'other_antibiotic'],
        ANTIMALARIALS: ['artesunate_sulfadoxine', 'artemether_lumefantrine'],
        REHYDRATION: ['plan_a', 'plan_b', 'plan_c']
    },
    
    AUTO_REFRESH_INTERVAL: 10000, // 10 seconds
    MAX_SYNC_RETRIES: 3,
    SYNC_BACKOFF_DELAY: 5000 // 5 seconds
};

// ============================================================================
// 2. SMART FIELD DETECTION ENGINE
// ============================================================================

const FieldDetector = {
    /**
     * Detects gender from any form input type
     * @returns {string|null} 'male', 'female', or null
     */
    getGender() {
        const selectors = [
            'select[name*="gender" i], select[name*="sex" i], select[id*="gender" i], select[id*="sex" i]',
            'input[type="radio"][name*="gender" i]:checked',
            'input[type="radio"][name*="sex" i]:checked',
            'input[data-field="gender" i]:checked',
            'select[data-field="gender" i]',
            'input[type="text"][name*="gender" i]',
            'input[type="text"][placeholder*="الجنس" i], input[type="text"][placeholder*="النوع" i]'
        ];
        
        const validMap = {
            'ذكر': 'male', 'male': 'male', 'boy': 'male', 'm': 'male',
            'أنثى': 'female', 'female': 'female', 'girl': 'female', 'f': 'female'
        };
        
        // Try all selectors
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.value) {
                const val = el.value.toString().toLowerCase().trim();
                if (validMap[val]) return validMap[val];
                if (val === 'male' || val === 'female') return val;
            }
        }
        
        // Fallback: scan all inputs
        const allInputs = document.querySelectorAll('input, select');
        for (const input of allInputs) {
            const val = (input.value || '').toString().toLowerCase().trim();
            if (val === 'ذكر' || val === 'male') return 'male';
            if (val === 'أنثى' || val === 'female') return 'female';
        }
        
        return null;
    },
    
    /**
     * Normalizes gender value to standard format
     * @param {string} val - Raw gender value
     * @returns {string|null} 'male' or 'female'
     */
    normalizeGender(val) {
        const map = {
            'ذكر': 'male', 'male': 'male', 'boy': 'male', 'm': 'male',
            'أنثى': 'female', 'female': 'female', 'girl': 'female', 'f': 'female'
        };
        return map[val?.toLowerCase()] || null;
    },
    
    /**
     * Detects age with smart unit inference
     * @returns {Object|null} { value: number, unit: 'days'|'months', display: string }
     */
    getAge() {
        // Priority 1: Explicit month fields
        const monthPatterns = ['month', 'شهر', 'age_month', 'ageMonth'];
        for (const pattern of monthPatterns) {
            const selector = `input[name*="${pattern}" i], input[id*="${pattern}" i], input[placeholder*="${pattern}" i]`;
            const el = document.querySelector(selector);
            if (el && el.value) {
                const val = parseFloat(el.value);
                if (!isNaN(val) && val > 0 && val <= 60) {
                    return { value: val, unit: 'months', display: `${val} شهر` };
                }
            }
        }
        
        // Priority 2: Explicit day fields
        const dayPatterns = ['day', 'يوم', 'age_day', 'ageDay'];
        for (const pattern of dayPatterns) {
            const selector = `input[name*="${pattern}" i], input[id*="${pattern}" i], input[placeholder*="${pattern}" i]`;
            const el = document.querySelector(selector);
            if (el && el.value) {
                const val = parseFloat(el.value);
                if (!isNaN(val) && val > 0 && val <= 60) {
                    return { value: val, unit: 'days', display: `${val} يوم` };
                }
            }
        }
        
        // Priority 3: Generic age field
        const ageSelectors = [
            'input[name="age" i], input[id="age" i]',
            'input[name="عمر" i], input[id="عمر" i]',
            'input[placeholder*="العمر" i]',
            'input[type="number"][placeholder*="عمر" i]'
        ];
        
        for (const selector of ageSelectors) {
            const el = document.querySelector(selector);
            if (el && el.value) {
                const val = parseFloat(el.value);
                if (!isNaN(val) && val > 0) {
                    const unit = val < 60 ? 'days' : 'months';
                    const displayUnit = unit === 'days' ? 'يوم' : 'شهر';
                    return { value: val, unit: unit, display: `${val} ${displayUnit}` };
                }
            }
        }
        
        // Priority 4: Smart guess from any numeric field with context
        const numericInputs = document.querySelectorAll('input[type="number"]');
        for (const input of numericInputs) {
            const val = parseFloat(input.value);
            const placeholder = (input.placeholder || '').toLowerCase();
            const id = (input.id || '').toLowerCase();
            const name = (input.name || '').toLowerCase();
            
            if (!isNaN(val) && val > 0) {
                if (placeholder.includes('شهر') || id.includes('month') || name.includes('month') || 
                    placeholder.includes('month') || (val >= 2 && val <= 60)) {
                    return { value: val, unit: 'months', display: `${val} شهر` };
                }
                if (placeholder.includes('يوم') || id.includes('day') || name.includes('day') || 
                    placeholder.includes('day') || (val < 60 && val <= 60)) {
                    return { value: val, unit: 'days', display: `${val} يوم` };
                }
            }
        }
        
        return null;
    },
    
    /**
     * Detects visit type (first/follow-up)
     * @returns {string|null} 'first' or 'follow'
     */
    getVisitType() {
        const selectors = [
            'select[name*="visit" i], select[id*="visit" i]',
            'select[name*="type" i], select[id*="type" i]',
            'input[type="radio"][name*="visit" i]:checked',
            'input[type="radio"][name*="type" i]:checked',
            'input[data-field="visitType" i]:checked'
        ];
        
        const validMap = {
            'first': 'first', 'أولية': 'first', 'initial': 'first', 'new': 'first',
            'follow': 'follow', 'متابعة': 'follow', 'followup': 'follow', 'follow-up': 'follow'
        };
        
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.value) {
                const val = el.value.toString().toLowerCase().trim();
                if (validMap[val]) return validMap[val];
            }
        }
        
        return null;
    },
    
    /**
     * Detects classification from form
     * @param {string} category - Classification category (cough, diarrhea, etc.)
     * @returns {string|null} Classification value
     */
    getClassification(category) {
        const selectors = [
            `select[name*="${category}" i], select[id*="${category}" i]`,
            `input[type="radio"][name*="${category}" i]:checked`,
            `input[data-category="${category}" i]:checked`,
            `select[data-category="${category}" i]`
        ];
        
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.value && el.value !== '') {
                return el.value;
            }
        }
        
        return null;
    },
    
    /**
     * Gets numeric field value
     * @param {string} name - Field name pattern
     * @returns {number|null}
     */
    getNumericField(name) {
        const selectors = [
            `input[type="number"][name*="${name}" i]`,
            `input[name*="${name}" i][type="number"]`,
            `input[id*="${name}" i][type="number"]`,
            `input[name*="${name}" i]`,
            `input[id*="${name}" i]`
        ];
        
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.value) {
                const val = parseFloat(el.value);
                if (!isNaN(val)) return val;
            }
        }
        return null;
    },
    
    /**
     * Gets boolean field value (checkbox)
     * @param {string} name - Field name pattern
     * @returns {boolean}
     */
    getBooleanField(name) {
        const selectors = [
            `input[type="checkbox"][name*="${name}" i]`,
            `input[type="checkbox"][id*="${name}" i]`,
            `input[type="radio"][name*="${name}" i][value="true"]:checked`
        ];
        
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.type === 'checkbox') return el.checked;
            if (el && el.type === 'radio') return true;
        }
        return false;
    },
    
    /**
     * Gets all medications from form
     * @returns {Array}
     */
    getMedications() {
        const medications = [];
        const medInputs = document.querySelectorAll('input[name*="med" i], input[name*="drug" i], input[name*="antibiotic" i]');
        
        medInputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.checked) {
                    medications.push({
                        name: input.value || input.id || input.name,
                        type: 'checkbox',
                        value: true
                    });
                }
            } else if (input.value) {
                medications.push({
                    name: input.name,
                    type: input.type,
                    value: input.value
                });
            }
        });
        
        return medications;
    },
    
    /**
     * Gets symptoms from form
     * @returns {Array}
     */
    getSymptoms() {
        const symptoms = [];
        const symptomInputs = document.querySelectorAll('input[type="checkbox"][name*="symptom" i], input[type="checkbox"][data-type="symptom" i]');
        
        symptomInputs.forEach(input => {
            if (input.checked) {
                symptoms.push(input.value || input.name);
            }
        });
        
        return symptoms;
    },
    
    /**
     * Gets all form data as structured object
     * @returns {Object} Complete form data
     */
    getAllFormData() {
        const age = this.getAge();
        
        const data = {
            gender: this.getGender(),
            age: age,
            visitType: this.getVisitType(),
            classifications: {
                cough: this.getClassification('cough'),
                diarrhea: this.getClassification('diarrhea'),
                throat: this.getClassification('throat'),
                ear: this.getClassification('ear'),
                fever: this.getClassification('fever'),
                nutrition: this.getClassification('nutrition'),
                muac: this.getClassification('muac'),
                newborn: this.getClassification('classification')
            },
            weight: this.getNumericField('weight'),
            height: this.getNumericField('height'),
            temperature: this.getNumericField('temperature'),
            muacValue: this.getNumericField('muac'),
            hemoglobin: this.getNumericField('hemoglobin'),
            referral: this.getBooleanField('referral'),
            medications: this.getMedications(),
            symptoms: this.getSymptoms(),
            metadata: {
                timestamp: new Date().toISOString(),
                source: window.location.pathname,
                userAgent: navigator.userAgent,
                pageTitle: document.title
            }
        };
        
        // Auto-detect record type based on age
        if (age && age.unit === 'days' && age.value <= 60) {
            data.type = 'newborn';
        } else {
            data.type = 'child';
        }
        
        return data;
    },
    
    /**
     * Gets classification label and color
     * @param {string} category - Classification category
     * @param {string} value - Classification value
     * @returns {Object} { label, color, priority }
     */
    getClassificationInfo(category, value) {
        const categories = IMCI_CONFIG.CLASSIFICATIONS;
        
        if (categories[category.toUpperCase()] && categories[category.toUpperCase()][value]) {
            return categories[category.toUpperCase()][value];
        }
        
        if (categories.NEWBORN[value]) {
            return categories.NEWBORN[value];
        }
        
        return { label: value || 'غير محدد', color: '#757575', priority: 99 };
    }
};

// ============================================================================
// 3. DATA STORAGE & MANAGEMENT
// ============================================================================

const DataManager = {
    /**
     * Saves child record (2 months - 5 years)
     * @param {Object} formData - Form data from FieldDetector
     * @returns {Object} { success: boolean, record: Object, error: string }
     */
    saveChildRecord(formData) {
        try {
            // Validate required fields
            if (!formData.gender) throw new Error('الرجاء اختيار النوع (ذكر/أنثى)');
            if (!formData.age || !formData.age.value) throw new Error('الرجاء إدخال العمر');
            if (!formData.visitType) throw new Error('الرجاء اختيار نوع الزيارة (أولية/متابعة)');
            
            // Calculate age in months
            let ageInMonths = 0;
            if (formData.age.unit === 'months') {
                ageInMonths = formData.age.value;
            } else {
                ageInMonths = Math.floor(formData.age.value / 30);
            }
            
            // Validate age range for child (2-60 months)
            if (ageInMonths < 2) {
                console.warn(`Age ${ageInMonths} months is less than 2 months. This might be a newborn.`);
            }
            if (ageInMonths > 60) {
                console.warn(`Age ${ageInMonths} months exceeds 5 years (60 months).`);
            }
            
            const record = {
                id: this.generateId(),
                type: 'child',
                version: IMCI_CONFIG.VERSION,
                gender: formData.gender,
                ageInMonths: ageInMonths,
                ageInDays: formData.age.unit === 'days' ? formData.age.value : ageInMonths * 30,
                visitType: formData.visitType,
                classifications: formData.classifications || {},
                weight: formData.weight,
                height: formData.height,
                temperature: formData.temperature,
                muacValue: formData.muacValue,
                muac: formData.classifications?.muac,
                hemoglobin: formData.hemoglobin,
                referral: formData.referral || false,
                medications: formData.medications || [],
                symptoms: formData.symptoms || [],
                registrationDate: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                synced: false,
                source: formData.metadata?.source || 'web-form'
            };
            
            // Save to localStorage
            const records = this.getRecords(IMCI_CONFIG.STORAGE_KEYS.CHILDREN);
            records.push(record);
            localStorage.setItem(IMCI_CONFIG.STORAGE_KEYS.CHILDREN, JSON.stringify(records));
            
            // Add to sync queue
            this.addToSyncQueue(record);
            
            // Add to audit log
            this.addToAuditLog('CREATE', record);
            
            console.log(`✅ Child record saved: ${record.id}`, record);
            
            return { success: true, record: record };
            
        } catch (error) {
            console.error('Error saving child record:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Saves newborn record (0-2 months)
     * @param {Object} formData - Form data from FieldDetector
     * @returns {Object} { success: boolean, record: Object, error: string }
     */
    saveNewbornRecord(formData) {
        try {
            // Validate required fields
            if (!formData.gender) throw new Error('الرجاء اختيار النوع (ذكر/أنثى)');
            if (!formData.age || !formData.age.value) throw new Error('الرجاء إدخال العمر بالأيام');
            if (!formData.visitType) throw new Error('الرجاء اختيار نوع الزيارة (أولية/متابعة)');
            
            // Calculate age in days
            let ageInDays = 0;
            if (formData.age.unit === 'days') {
                ageInDays = formData.age.value;
            } else {
                ageInDays = formData.age.value * 30;
            }
            
            // Validate age range for newborn (0-60 days)
            if (ageInDays > 60) {
                console.warn(`Age ${ageInDays} days exceeds newborn range (0-60 days).`);
            }
            
            // Get newborn classification
            const classification = formData.classifications?.newborn || 
                                  formData.classifications?.classification || 
                                  'noFeedingIssue';
            
            const record = {
                id: this.generateId(),
                type: 'newborn',
                version: IMCI_CONFIG.VERSION,
                gender: formData.gender,
                ageInDays: ageInDays,
                ageInMonths: Math.floor(ageInDays / 30),
                visitType: formData.visitType,
                classification: classification,
                weight: formData.weight,
                temperature: formData.temperature,
                muacValue: formData.muacValue,
                referral: formData.referral || false,
                medications: formData.medications || [],
                symptoms: formData.symptoms || [],
                registrationDate: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                synced: false,
                source: formData.metadata?.source || 'web-form'
            };
            
            // Save to localStorage
            const records = this.getRecords(IMCI_CONFIG.STORAGE_KEYS.NEWBORNS);
            records.push(record);
            localStorage.setItem(IMCI_CONFIG.STORAGE_KEYS.NEWBORNS, JSON.stringify(records));
            
            // Add to sync queue
            this.addToSyncQueue(record);
            
            // Add to audit log
            this.addToAuditLog('CREATE', record);
            
            console.log(`✅ Newborn record saved: ${record.id}`, record);
            
            return { success: true, record: record };
            
        } catch (error) {
            console.error('Error saving newborn record:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Gets all records from a storage key
     * @param {string} key - Storage key
     * @returns {Array} Array of records
     */
    getRecords(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading from ${key}:`, error);
            return [];
        }
    },
    
    /**
     * Gets all child records
     * @returns {Array}
     */
    getChildrenRecords() {
        return this.getRecords(IMCI_CONFIG.STORAGE_KEYS.CHILDREN);
    },
    
    /**
     * Gets all newborn records
     * @returns {Array}
     */
    getNewbornRecords() {
        return this.getRecords(IMCI_CONFIG.STORAGE_KEYS.NEWBORNS);
    },
    
    /**
     * Gets all records (children + newborns)
     * @returns {Array}
     */
    getAllRecords() {
        const children = this.getChildrenRecords().map(r => ({ ...r, recordType: 'child' }));
        const newborns = this.getNewbornRecords().map(r => ({ ...r, recordType: 'newborn' }));
        return [...children, ...newborns].sort((a, b) => {
            return new Date(b.registrationDate) - new Date(a.registrationDate);
        });
    },
    
    /**
     * Gets record by ID
     * @param {string} id - Record ID
     * @returns {Object|null}
     */
    getRecordById(id) {
        const allRecords = this.getAllRecords();
        return allRecords.find(r => r.id === id) || null;
    },
    
    /**
     * Updates an existing record
     * @param {string} id - Record ID
     * @param {Object} updates - Updates to apply
     * @returns {Object} { success: boolean, record: Object }
     */
    updateRecord(id, updates) {
        const allRecords = this.getAllRecords();
        const index = allRecords.findIndex(r => r.id === id);
        
        if (index === -1) {
            return { success: false, error: 'Record not found' };
        }
        
        const updatedRecord = {
            ...allRecords[index],
            ...updates,
            lastModified: new Date().toISOString()
        };
        
        // Save back to appropriate storage
        const storageKey = updatedRecord.type === 'child' ? 
            IMCI_CONFIG.STORAGE_KEYS.CHILDREN : 
            IMCI_CONFIG.STORAGE_KEYS.NEWBORNS;
        
        const records = this.getRecords(storageKey);
        const recordIndex = records.findIndex(r => r.id === id);
        
        if (recordIndex !== -1) {
            records[recordIndex] = updatedRecord;
            localStorage.setItem(storageKey, JSON.stringify(records));
        }
        
        this.addToAuditLog('UPDATE', updatedRecord);
        
        return { success: true, record: updatedRecord };
    },
    
    /**
     * Deletes a record by ID
     * @param {string} id - Record ID
     * @returns {boolean}
     */
    deleteRecord(id) {
        const record = this.getRecordById(id);
        if (!record) return false;
        
        const storageKey = record.type === 'child' ? 
            IMCI_CONFIG.STORAGE_KEYS.CHILDREN : 
            IMCI_CONFIG.STORAGE_KEYS.NEWBORNS;
        
        const records = this.getRecords(storageKey).filter(r => r.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(records));
        
        this.addToAuditLog('DELETE', { id: id, type: record.type });
        
        return true;
    },
    
    /**
     * Deletes multiple records by IDs
     * @param {Array} ids - Array of record IDs
     * @returns {number} Number of deleted records
     */
    deleteRecords(ids) {
        let deletedCount = 0;
        
        for (const id of ids) {
            if (this.deleteRecord(id)) {
                deletedCount++;
            }
        }
        
        return deletedCount;
    },
    
    /**
     * Clears all records (use with caution)
     * @returns {boolean}
     */
    clearAllRecords() {
        if (confirm('⚠️ تحذير: هذا سيحذف جميع بيانات الأطفال نهائياً. هل أنت متأكد؟')) {
            localStorage.removeItem(IMCI_CONFIG.STORAGE_KEYS.CHILDREN);
            localStorage.removeItem(IMCI_CONFIG.STORAGE_KEYS.NEWBORNS);
            localStorage.removeItem(IMCI_CONFIG.STORAGE_KEYS.SYNC_QUEUE);
            console.log('🗑️ All records cleared');
            return true;
        }
        return false;
    },
    
    /**
     * Generates unique ID
     * @returns {string}
     */
    generateId() {
        return 'imci_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Adds record to sync queue for server synchronization
     * @param {Object} record - Record to sync
     */
    addToSyncQueue(record) {
        const queue = this.getRecords(IMCI_CONFIG.STORAGE_KEYS.SYNC_QUEUE);
        queue.push({
            recordId: record.id,
            recordType: record.type,
            timestamp: new Date().toISOString(),
            attempts: 0,
            status: 'pending'
        });
        localStorage.setItem(IMCI_CONFIG.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    },
    
    /**
     * Adds entry to audit log
     * @param {string} action - Action type (CREATE, UPDATE, DELETE)
     * @param {Object} data - Related data
     */
    addToAuditLog(action, data) {
        const logs = this.getRecords(IMCI_CONFIG.STORAGE_KEYS.AUDIT_LOG);
        logs.push({
            id: this.generateId(),
            action: action,
            data: data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        
        // Keep only last 1000 logs
        while (logs.length > 1000) logs.shift();
        
        localStorage.setItem(IMCI_CONFIG.STORAGE_KEYS.AUDIT_LOG, JSON.stringify(logs));
    },
    
    /**
     * Exports all data as JSON
     * @returns {Object}
     */
    exportData() {
        return {
            version: IMCI_CONFIG.VERSION,
            exportDate: new Date().toISOString(),
            children: this.getChildrenRecords(),
            newborns: this.getNewbornRecords(),
            settings: this.getRecords(IMCI_CONFIG.STORAGE_KEYS.SETTINGS),
            auditLog: this.getRecords(IMCI_CONFIG.STORAGE_KEYS.AUDIT_LOG)
        };
    },
    
    /**
     * Imports data from JSON
     * @param {Object} data - Data to import
     * @returns {boolean}
     */
    importData(data) {
        try {
            if (data.children) {
                localStorage.setItem(IMCI_CONFIG.STORAGE_KEYS.CHILDREN, JSON.stringify(data.children));
            }
            if (data.newborns) {
                localStorage.setItem(IMCI_CONFIG.STORAGE_KEYS.NEWBORNS, JSON.stringify(data.newborns));
            }
            if (data.settings) {
                localStorage.setItem(IMCI_CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            }
            console.log('✅ Data imported successfully');
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },
    
    /**
     * Gets statistics about stored data
     * @returns {Object}
     */
    getStats() {
        const children = this.getChildrenRecords();
        const newborns = this.getNewbornRecords();
        
        return {
            totalRecords: children.length + newborns.length,
            childrenCount: children.length,
            newbornsCount: newborns.length,
            lastRecordDate: this.getLastRecordDate(),
            storageUsed: this.getStorageUsed()
        };
    },
    
    getLastRecordDate() {
        const allRecords = this.getAllRecords();
        if (allRecords.length === 0) return null;
        return allRecords[0].registrationDate;
    },
    
    getStorageUsed() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return total;
    }
};

// ============================================================================
// 4. REPORT GENERATOR
// ============================================================================

const ReportGenerator = {
    /**
     * Generates complete monthly report
     * @returns {Object} Complete report object
     */
    generate() {
        const children = DataManager.getChildrenRecords();
        const newborns = DataManager.getNewbornRecords();
        const allRecords = [...children, ...newborns];
        
        return {
            summary: this.generateSummary(allRecords),
            demographics: this.generateDemographics(allRecords),
            ageDistribution: this.generateAgeDistribution(children, newborns),
            visitTypes: this.generateVisitTypes(allRecords),
            classifications: this.generateClassifications(children, newborns),
            nutritionalStatus: this.generateNutritionalStatus(children),
            muacStatus: this.generateMuacStatus(children),
            indicators: this.generateIndicators(children, newborns),
            medications: this.generateMedications(allRecords),
            referrals: this.generateReferrals(allRecords),
            trends: this.generateTrends(allRecords),
            metadata: {
                generatedAt: new Date().toISOString(),
                totalRecords: allRecords.length,
                childrenCount: children.length,
                newbornsCount: newborns.length,
                period: this.getReportPeriod(),
                version: IMCI_CONFIG.VERSION
            }
        };
    },
    
    generateSummary(records) {
        const male = records.filter(r => r.gender === 'male').length;
        const female = records.filter(r => r.gender === 'female').length;
        
        return {
            total: records.length,
            male: male,
            female: female,
            malePercentage: records.length ? ((male / records.length) * 100).toFixed(1) : 0,
            femalePercentage: records.length ? ((female / records.length) * 100).toFixed(1) : 0,
            firstVisits: records.filter(r => r.visitType === 'first').length,
            followVisits: records.filter(r => r.visitType === 'follow').length,
            referrals: records.filter(r => r.referral).length,
            referralRate: records.length ? ((records.filter(r => r.referral).length / records.length) * 100).toFixed(1) : 0
        };
    },
    
    generateDemographics(records) {
        return {
            byGender: {
                male: records.filter(r => r.gender === 'male').length,
                female: records.filter(r => r.gender === 'female').length
            },
            byVisitType: {
                first: records.filter(r => r.visitType === 'first').length,
                follow: records.filter(r => r.visitType === 'follow').length
            }
        };
    },
    
    generateAgeDistribution(children, newborns) {
        return {
            under2Months: newborns.length + children.filter(c => c.ageInMonths < 2).length,
            twoTo12Months: children.filter(c => c.ageInMonths >= 2 && c.ageInMonths < 12).length,
            twelveTo24Months: children.filter(c => c.ageInMonths >= 12 && c.ageInMonths < 24).length,
            twentyFourTo60Months: children.filter(c => c.ageInMonths >= 24 && c.ageInMonths <= 60).length,
            details: {
                newborns: newborns.length,
                infants: children.filter(c => c.ageInMonths >= 2 && c.ageInMonths < 12).length,
                toddlers: children.filter(c => c.ageInMonths >= 12 && c.ageInMonths < 24).length,
                preschoolers: children.filter(c => c.ageInMonths >= 24 && c.ageInMonths <= 60).length
            }
        };
    },
    
    generateVisitTypes(records) {
        return {
            first: records.filter(r => r.visitType === 'first').length,
            follow: records.filter(r => r.visitType === 'follow').length,
            firstPercentage: records.length ? ((records.filter(r => r.visitType === 'first').length / records.length) * 100).toFixed(1) : 0,
            followPercentage: records.length ? ((records.filter(r => r.visitType === 'follow').length / records.length) * 100).toFixed(1) : 0
        };
    },
    
    generateClassifications(children, newborns) {
        const result = {
            // Cough classifications
            verySevere: 0,
            severePneumonia: 0,
            pneumonia: 0,
            noCough: 0,
            coughCold: 0,
            
            // Diarrhea classifications
            severeDehydration: 0,
            someDehydration: 0,
            noDehydration: 0,
            dysentery: 0,
            persistentDiarrhea: 0,
            
            // Throat classifications
            strepThroat: 0,
            nonStrep: 0,
            noThroat: 0,
            
            // Ear classifications
            acuteEar: 0,
            chronicEar: 0,
            noEar: 0,
            mastoiditis: 0,
            
            // Fever classifications
            verySevereFever: 0,
            malaria: 0,
            feverUnknown: 0,
            measles: 0,
            noFever: 0,
            
            // Nutrition classifications
            severeMalnutrition: 0,
            underweight: 0,
            anemia: 0,
            noNutritionProblem: 0,
            
            // MUAC
            muacRed: 0,
            muacOrange: 0,
            muacGreen: 0,
            
            // Newborn classifications
            infantSerious: 0,
            infantLocal: 0,
            infantJaundice: 0,
            infantSevereDehyd: 0,
            infantSomeDehyd: 0,
            infantNoDehyd: 0,
            infantPersistent: 0,
            infantBloodStool: 0,
            infantFeedingIssue: 0,
            infantUnderweight: 0,
            infantNoIssue: 0
        };
        
        // Process children
        children.forEach(child => {
            const c = child.classifications || {};
            
            // Cough
            if (c.cough === 'verySevere') result.verySevere++;
            else if (c.cough === 'severePneumonia') result.severePneumonia++;
            else if (c.cough === 'pneumonia') result.pneumonia++;
            else if (c.cough === 'noCough') result.noCough++;
            else if (c.cough === 'coughCold') result.coughCold++;
            
            // Diarrhea
            if (c.diarrhea === 'severeDehydration') result.severeDehydration++;
            else if (c.diarrhea === 'someDehydration') result.someDehydration++;
            else if (c.diarrhea === 'noDehydration') result.noDehydration++;
            else if (c.diarrhea === 'dysentery') result.dysentery++;
            else if (c.diarrhea === 'persistentDiarrhea') result.persistentDiarrhea++;
            
            // Throat
            if (c.throat === 'strep') result.strepThroat++;
            else if (c.throat === 'nonStrep') result.nonStrep++;
            else if (c.throat === 'noProblem') result.noThroat++;
            
            // Ear
            if (c.ear === 'acute') result.acuteEar++;
            else if (c.ear === 'chronic') result.chronicEar++;
            else if (c.ear === 'noProblem') result.noEar++;
            else if (c.ear === 'mastoiditis') result.mastoiditis++;
            
            // Fever
            if (c.fever === 'verySevere') result.verySevereFever++;
            else if (c.fever === 'malaria') result.malaria++;
            else if (c.fever === 'feverUnknown') result.feverUnknown++;
            else if (c.fever === 'measles') result.measles++;
            else if (c.fever === 'noFever') result.noFever++;
            
            // Nutrition
            if (c.nutrition === 'severeMalnutrition') result.severeMalnutrition++;
            else if (c.nutrition === 'underweight') result.underweight++;
            else if (c.nutrition === 'anemia') result.anemia++;
            else if (c.nutrition === 'noProblem') result.noNutritionProblem++;
            
            // MUAC
            if (c.muac === 'red') result.muacRed++;
            else if (c.muac === 'orange') result.muacOrange++;
            else if (c.muac === 'green') result.muacGreen++;
        });
        
        // Process newborns
        newborns.forEach(infant => {
            const cls = infant.classification;
            if (cls === 'seriousBacterial') result.infantSerious++;
            else if (cls === 'localBacterial') result.infantLocal++;
            else if (cls === 'jaundice') result.infantJaundice++;
            else if (cls === 'severeDehydration') result.infantSevereDehyd++;
            else if (cls === 'someDehydration') result.infantSomeDehyd++;
            else if (cls === 'noDehydration') result.infantNoDehyd++;
            else if (cls === 'persistentDiarrhea') result.infantPersistent++;
            else if (cls === 'bloodInStool') result.infantBloodStool++;
            else if (cls === 'feedingProblem') result.infantFeedingIssue++;
            else if (cls === 'underweight') result.infantUnderweight++;
            else if (cls === 'noFeedingIssue') result.infantNoIssue++;
        });
        
        return result;
    },
    
    generateNutritionalStatus(children) {
        let severeUnderweight = 0;
        let moderateUnderweight = 0;
        let normalWeight = 0;
        
        children.forEach(child => {
            if (child.weightStatus === 'severeUnderweight') severeUnderweight++;
            else if (child.weightStatus === 'moderateUnderweight') moderateUnderweight++;
            else normalWeight++;
        });
        
        return { severeUnderweight, moderateUnderweight, normalWeight };
    },
    
    generateMuacStatus(children) {
        let red = 0, orange = 0, green = 0;
        
        children.forEach(child => {
            if (child.muac === 'red') red++;
            else if (child.muac === 'orange') orange++;
            else if (child.muac === 'green') green++;
        });
        
        return { red, orange, green };
    },
    
    generateIndicators(children, newborns) {
        const allRecords = [...children, ...newborns];
        
        const pneumoniaCount = children.filter(c => 
            ['pneumonia', 'severePneumonia'].includes(c.classifications?.cough)
        ).length;
        
        const severeDehydrationCount = 
            children.filter(c => c.classifications?.diarrhea === 'severeDehydration').length +
            newborns.filter(n => n.classification === 'severeDehydration').length;
        
        const referralCount = allRecords.filter(r => r.referral).length;
        
        const severeCases = children.filter(c => {
            const cls = c.classifications || {};
            return ['verySevere', 'severePneumonia'].includes(cls.cough) ||
                   cls.diarrhea === 'severeDehydration' ||
                   cls.nutrition === 'severeMalnutrition';
        }).length + newborns.filter(n => n.classification === 'seriousBacterial').length;
        
        const followUpRate = children.length ? 
            ((children.filter(c => c.visitType === 'follow').length / children.length) * 100).toFixed(1) : 0;
        
        return {
            pneumoniaCount,
            severeDehydrationCount,
            referralCount,
            severeCasesCount: severeCases,
            followUpRate: parseFloat(followUpRate),
            pneumoniaRate: children.length ? ((pneumoniaCount / children.length) * 100).toFixed(1) : 0,
            referralRate: allRecords.length ? ((referralCount / allRecords.length) * 100).toFixed(1) : 0
        };
    },
    
    generateMedications(records) {
        const meds = {};
        
        records.forEach(record => {
            (record.medications || []).forEach(med => {
                const name = med.name || med.value;
                if (name) {
                    meds[name] = (meds[name] || 0) + 1;
                }
            });
        });
        
        return {
            totalPrescriptions: Object.values(meds).reduce((a, b) => a + b, 0),
            byMedication: meds
        };
    },
    
    generateReferrals(records) {
        const referrals = records.filter(r => r.referral);
        
        return {
            total: referrals.length,
            rate: records.length ? ((referrals.length / records.length) * 100).toFixed(1) : 0,
            byType: {
                children: referrals.filter(r => r.type === 'child').length,
                newborns: referrals.filter(r => r.type === 'newborn').length
            }
        };
    },
    
    generateTrends(records) {
        // Group by month
        const monthlyData = {};
        
        records.forEach(record => {
            const date = new Date(record.registrationDate);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    total: 0,
                    children: 0,
                    newborns: 0,
                    referrals: 0
                };
            }
            
            monthlyData[monthKey].total++;
            if (record.type === 'child') monthlyData[monthKey].children++;
            else monthlyData[monthKey].newborns++;
            if (record.referral) monthlyData[monthKey].referrals++;
        });
        
        return {
            monthlyTrends: monthlyData,
            averageDaily: records.length / 30 // Approximate
        };
    },
    
    getReportPeriod() {
        const now = new Date();
        return {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            monthName: now.toLocaleDateString('ar-EG', { month: 'long' }),
            monthNameEn: now.toLocaleDateString('en-US', { month: 'long' }),
            startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
            endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
        };
    }
};

// ============================================================================
// 5. UI UPDATER
// ============================================================================

const UIUpdater = {
    /**
     * Updates all report elements on the page
     * @param {Object} report - Report object (optional, generated if not provided)
     */
    updateReport(report) {
        if (!report) report = ReportGenerator.generate();
        
        console.log('📊 Updating report UI...');
        
        // Summary
        this.setText('maleCount', report.summary.male);
        this.setText('femaleCount', report.summary.female);
        this.setText('totalCount', report.summary.total);
        this.setText('firstVisit', report.summary.firstVisits);
        this.setText('followVisit', report.summary.followVisits);
        
        // Age distribution
        this.setText('age1', report.ageDistribution.under2Months);
        this.setText('age2', report.ageDistribution.twoTo12Months);
        this.setText('age3', report.ageDistribution.twelveTo24Months);
        this.setText('age4', report.ageDistribution.twentyFourTo60Months);
        
        // Classifications
        const c = report.classifications;
        this.setText('verySevere', c.verySevere);
        this.setText('severePneumonia', c.severePneumonia);
        this.setText('pneumoniaClass', c.pneumonia);
        this.setText('noCough', c.noCough);
        this.setText('severeDehyd', c.severeDehydration);
        this.setText('someDehyd', c.someDehydration);
        this.setText('noDehyd', c.noDehydration);
        this.setText('strepThroat', c.strepThroat);
        this.setText('nonStrep', c.nonStrep);
        this.setText('noThroat', c.noThroat);
        this.setText('acuteEar', c.acuteEar);
        this.setText('chronicEar', c.chronicEar);
        this.setText('noEar', c.noEar);
        this.setText('verySevereFever', c.verySevereFever);
        this.setText('malariaCases', c.malaria);
        this.setText('feverUnknown', c.feverUnknown);
        this.setText('severeMalnutrition', c.severeMalnutrition);
        this.setText('underweight', c.underweight);
        this.setText('anemiaClass', c.anemia);
        
        // MUAC
        this.setText('muacRed', c.muacRed);
        this.setText('muacOrange', c.muacOrange);
        this.setText('muacGreen', c.muacGreen);
        
        // Additional fields
        this.setText('severeUnderweight', report.nutritionalStatus?.severeUnderweight || 0);
        this.setText('moderateAnemia', c.moderateAnemia || 0);
        this.setText('feedingProblems', c.feedingProblems || 0);
        
        // Newborn classifications
        this.setText('infantSerious', c.infantSerious);
        this.setText('infantLocal', c.infantLocal);
        this.setText('infantJaundice', c.infantJaundice);
        this.setText('infantSevereDehyd', c.infantSevereDehyd);
        this.setText('infantSomeDehyd', c.infantSomeDehyd);
        this.setText('infantNoDehyd', c.infantNoDehyd);
        this.setText('infantPersistent', c.infantPersistent);
        this.setText('infantBloodStool', c.infantBloodStool);
        this.setText('infantFeedingIssue', c.infantFeedingIssue);
        this.setText('infantUnderweight', c.infantUnderweight);
        this.setText('infantNoIssue', c.infantNoIssue);
        
        // Key indicators
        const ind = report.indicators;
        this.setText('pneumoniaCount', ind.pneumoniaCount);
        this.setText('severeDehydrationCount', ind.severeDehydrationCount);
        this.setText('referralCount', ind.referralCount);
        this.setText('severeCasesCount', ind.severeCasesCount);
        
        // Metadata
        this.setText('reportDate', new Date().toLocaleDateString('ar-EG'));
        
        // Try to update facility info from settings
        const settings = DataManager.getRecords(IMCI_CONFIG.STORAGE_KEYS.SETTINGS);
        if (settings.length > 0) {
            const lastSettings = settings[settings.length - 1];
            if (lastSettings.facilityName) this.setText('facilityName', lastSettings.facilityName);
            if (lastSettings.healthWorker) this.setText('healthWorker', lastSettings.healthWorker);
            if (lastSettings.governorate) this.setText('gov', lastSettings.governorate);
            if (lastSettings.district) this.setText('district', lastSettings.district);
        }
        
        console.log(`✅ Report updated: ${report.metadata.totalRecords} total records`);
    },
    
    /**
     * Sets text content of an element by ID
     * @param {string} id - Element ID
     * @param {*} value - Value to set
     */
    setText(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = (value !== undefined && value !== null) ? value : 0;
        }
    },
    
    /**
     * Shows loading indicator
     */
    showLoading() {
        const loader = document.getElementById('loadingIndicator');
        if (loader) loader.style.display = 'flex';
        document.body.classList.add('loading');
    },
    
    /**
     * Hides loading indicator
     */
    hideLoading() {
        const loader = document.getElementById('loadingIndicator');
        if (loader) loader.style.display = 'none';
        document.body.classList.remove('loading');
    },
    
    /**
     * Shows notification message
     * @param {string} message - Message to show
     * @param {string} type - 'success', 'error', 'info', 'warning'
     */
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('imci-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'imci-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 50px;
                font-family: 'Cairo', sans-serif;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                animation: slideDown 0.3s ease;
                text-align: center;
                min-width: 250px;
                max-width: 90%;
            `;
            document.body.appendChild(notification);
            
            // Add animation
            if (!document.querySelector('#imci-notification-style')) {
                const style = document.createElement('style');
                style.id = 'imci-notification-style';
                style.textContent = `
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateX(-50%) translateY(-50px); }
                        to { opacity: 1; transform: translateX(-50%) translateY(0); }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; visibility: hidden; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Set colors based on type
        const colors = {
            success: { bg: '#4caf50', icon: '✅' },
            error: { bg: '#f44336', icon: '❌' },
            warning: { bg: '#ff9800', icon: '⚠️' },
            info: { bg: '#2196f3', icon: 'ℹ️' }
        };
        
        const color = colors[type] || colors.info;
        notification.style.backgroundColor = color.bg;
        notification.style.color = 'white';
        notification.innerHTML = `${color.icon} ${message}`;
        notification.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                notification.style.display = 'none';
                notification.style.animation = '';
            }, 300);
        }, 3000);
    }
};

// ============================================================================
// 6. FORM HANDLERS
// ============================================================================

const FormHandler = {
    /**
     * Handles child form submission
     * @param {Event} event - Submit event
     * @returns {Object|null} Saved record or null
     */
    handleChildSubmit(event) {
        if (event) event.preventDefault();
        
        const formData = FieldDetector.getAllFormData();
        const result = DataManager.saveChildRecord(formData);
        
        if (result.success) {
            UIUpdater.showNotification('✅ تم حفظ بيانات الطفل بنجاح!', 'success');
            console.log('Child record saved:', result.record);
            return result.record;
        } else {
            UIUpdater.showNotification('⚠️ ' + result.error, 'error');
            console.error('Error saving child:', result.error);
            return null;
        }
    },
    
    /**
     * Handles newborn form submission
     * @param {Event} event - Submit event
     * @returns {Object|null} Saved record or null
     */
    handleNewbornSubmit(event) {
        if (event) event.preventDefault();
        
        const formData = FieldDetector.getAllFormData();
        const result = DataManager.saveNewbornRecord(formData);
        
        if (result.success) {
            UIUpdater.showNotification('✅ تم حفظ بيانات الرضيع بنجاح!', 'success');
            console.log('Newborn record saved:', result.record);
            return result.record;
        } else {
            UIUpdater.showNotification('⚠️ ' + result.error, 'error');
            console.error('Error saving newborn:', result.error);
            return null;
        }
    },
    
    /**
     * Saves and navigates to report
     * @param {Event} event - Submit event
     */
    saveAndGoToReport(event) {
        // Detect which form we're on
        const isNewbornForm = document.querySelector('select[id*="classification"], select[name*="classification"]') !== null;
        
        let record = null;
        if (isNewbornForm) {
            record = this.handleNewbornSubmit(event);
        } else {
            record = this.handleChildSubmit(event);
        }
        
        if (record) {
            setTimeout(() => {
                window.location.href = 'monthly-report.html';
            }, 500);
        }
    },
    
    /**
     * Saves and navigates to list
     * @param {Event} event - Submit event
     */
    saveAndGoToList(event) {
        const isNewbornForm = document.querySelector('select[id*="classification"], select[name*="classification"]') !== null;
        
        let record = null;
        if (isNewbornForm) {
            record = this.handleNewbornSubmit(event);
        } else {
            record = this.handleChildSubmit(event);
        }
        
        if (record) {
            setTimeout(() => {
                window.location.href = 'children-list.html';
            }, 500);
        }
    }
};

// ============================================================================
// 7. NAVIGATION
// ============================================================================

const Navigation = {
    goToChildForm() { window.location.href = 'child-form.html'; },
    goToNewbornForm() { window.location.href = 'newborn-form.html'; },
    goToChildrenList() { window.location.href = 'children-list.html'; },
    goToMonthlyReport() { window.location.href = 'monthly-report.html'; },
    goBack() { window.history.back(); },
    printReport() { window.print(); }
};

// ============================================================================
// 8. DEBUGGING UTILITIES
// ============================================================================

const IMCI_Debug = {
    /**
     * Shows all stored data in console
     */
    showData() {
        console.group('📊 IMCI Storage Data');
        console.log('Children Records:', DataManager.getChildrenRecords());
        console.log('Newborn Records:', DataManager.getNewbornRecords());
        console.log('All Records:', DataManager.getAllRecords());
        console.log('Stats:', DataManager.getStats());
        console.groupEnd();
        return DataManager.getAllRecords();
    },
    
    /**
     * Tests field detection on current page
     */
    testFieldDetection() {
        console.group('🔍 Field Detection Test');
        console.log('Gender:', FieldDetector.getGender());
        console.log('Age:', FieldDetector.getAge());
        console.log('Visit Type:', FieldDetector.getVisitType());
        console.log('Classifications:', {
            cough: FieldDetector.getClassification('cough'),
            diarrhea: FieldDetector.getClassification('diarrhea'),
            fever: FieldDetector.getClassification('fever')
        });
        console.log('All Form Data:', FieldDetector.getAllFormData());
        console.groupEnd();
        return FieldDetector.getAllFormData();
    },
    
    /**
     * Generates and shows report in console
     */
    showReport() {
        const report = ReportGenerator.generate();
        console.group('📋 IMCI Monthly Report');
        console.log('Summary:', report.summary);
        console.log('Age Distribution:', report.ageDistribution);
        console.log('Indicators:', report.indicators);
        console.log('Metadata:', report.metadata);
        console.groupEnd();
        return report;
    },
    
    /**
     * Clears all data (with confirmation)
     */
    clearAllData() {
        if (confirm('⚠️ تحذير: هذا سيحذف جميع بيانات الأطفال نهائياً. هل أنت متأكد؟')) {
            DataManager.clearAllRecords();
            console.log('🗑️ All data cleared');
            UIUpdater.showNotification('تم حذف جميع البيانات', 'warning');
            return true;
        }
        return false;
    },
    
    /**
     * Exports data as JSON file
     */
    exportData() {
        const data = DataManager.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `imci_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        UIUpdater.showNotification('تم تصدير البيانات بنجاح', 'success');
        console.log('💾 Data exported');
    },
    
    /**
     * Imports data from JSON file
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    DataManager.importData(data);
                    UIUpdater.showNotification('تم استيراد البيانات بنجاح', 'success');
                    console.log('📥 Data imported');
                } catch (error) {
                    UIUpdater.showNotification('خطأ في استيراد البيانات', 'error');
                    console.error('Import error:', error);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },
    
    /**
     * Shows system information
     */
    systemInfo() {
        console.group('🖥️ IMCI System Info');
        console.log('Version:', IMCI_CONFIG.VERSION);
        console.log('Build Date:', IMCI_CONFIG.BUILD_DATE);
        console.log('Storage Used:', DataManager.getStorageUsed(), 'bytes');
        console.log('Total Records:', DataManager.getAllRecords().length);
        console.log('Local Storage Keys:', Object.keys(localStorage));
        console.groupEnd();
    }
};

// ============================================================================
// 9. AUTO-INITIALIZATION
// ============================================================================

/**
 * Initializes the IMCI system based on current page
 */
function initializeIMCI() {
    console.log(`✅ IMCI Core Module v${IMCI_CONFIG.VERSION} initialized`);
    console.log(`📍 Current page: ${window.location.pathname}`);
    
    const path = window.location.pathname;
    let refreshInterval = null;
    
    // Monthly Report Page
    if (path.includes('monthly-report') || path.includes('report')) {
        UIUpdater.updateReport();
        
        // Auto-refresh every 10 seconds
        refreshInterval = setInterval(() => {
            UIUpdater.updateReport();
        }, IMCI_CONFIG.AUTO_REFRESH_INTERVAL);
        
        // Refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                UIUpdater.updateReport();
            }
        });
        
        // Bind report buttons
        const printBtn = document.getElementById('printReportBtn');
        if (printBtn) printBtn.addEventListener('click', Navigation.printReport);
        
        const backBtn = document.getElementById('backBtn');
        if (backBtn) backBtn.addEventListener('click', Navigation.goToChildForm);
        
        UIUpdater.showNotification('تم تحديث التقرير', 'info');
    }
    
    // Child Form Page
    else if (path.includes('child-form')) {
        const saveReportBtn = document.getElementById('saveAndGoToReport');
        if (saveReportBtn) saveReportBtn.addEventListener('click', (e) => FormHandler.saveAndGoToReport(e));
        
        const saveListBtn = document.getElementById('saveAndGoToList');
        if (saveListBtn) saveListBtn.addEventListener('click', (e) => FormHandler.saveAndGoToList(e));
    }
    
    // Newborn Form Page
    else if (path.includes('newborn-form')) {
        const saveReportBtn = document.getElementById('saveAndGoToReport');
        if (saveReportBtn) saveReportBtn.addEventListener('click', (e) => FormHandler.saveAndGoToReport(e));
        
        const saveListBtn = document.getElementById('saveAndGoToList');
        if (saveListBtn) saveListBtn.addEventListener('click', (e) => FormHandler.saveAndGoToList(e));
    }
    
    // Children List Page
    else if (path.includes('children-list')) {
        console.log('📋 Children List Page - Display functionality should be implemented separately');
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (refreshInterval) clearInterval(refreshInterval);
    });
}

// ============================================================================
// 10. EXPOSE GLOBALS
// ============================================================================

// Expose main modules for debugging and external use
window.IMCI = {
    config: IMCI_CONFIG,
    version: IMCI_CONFIG.VERSION,
    
    // Core modules
    FieldDetector: FieldDetector,
    DataManager: DataManager,
    ReportGenerator: ReportGenerator,
    UIUpdater: UIUpdater,
    FormHandler: FormHandler,
    Navigation: Navigation,
    
    // Debug utilities
    debug: IMCI_Debug,
    
    // Convenience methods
    showData: () => IMCI_Debug.showData(),
    testFields: () => IMCI_Debug.testFieldDetection(),
    showReport: () => IMCI_Debug.showReport(),
    exportData: () => IMCI_Debug.exportData(),
    importData: () => IMCI_Debug.importData(),
    clearData: () => IMCI_Debug.clearAllData(),
    systemInfo: () => IMCI_Debug.systemInfo()
};

// Expose individual functions for inline onclick handlers
window.goToChildForm = Navigation.goToChildForm;
window.goToNewbornForm = Navigation.goToNewbornForm;
window.goToChildrenList = Navigation.goToChildrenList;
window.goToMonthlyReport = Navigation.goToMonthlyReport;
window.printReport = Navigation.printReport;
window.goBack = Navigation.goBack;
window.saveAndGoToReport = FormHandler.saveAndGoToReport.bind(FormHandler);
window.saveAndGoToList = FormHandler.saveAndGoToList.bind(FormHandler);

// ============================================================================
// 11. START INITIALIZATION
// ============================================================================

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIMCI);
} else {
    initializeIMCI();
}

// ============================================================================
// END OF IMCI CORE MODULE
// ============================================================================