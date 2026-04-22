/******************************************************************
 *                                                                
 *   ╔════════════════════════════════════════════════════════╗
 *   ║                                                        ║
 *   ║   نظام الرعاية التكاملية التفاعلي لصحة الطفل - iIMCI  ║
 *   ║                                                        ║
 *   ║   حقوق النشر © 2025 [صلاح قاسم محمد الاهدل] - جميع الحقوق محفوظة       ║
 *   ║                                                        ║
 *   ╚════════════════════════════════════════════════════════╝
 *                                                                
 *   الخوارزميات والمنطق البرمجي المستخدم في هذا النظام هي من 
 *   تأليف وإبداع المطور (D / Salah Al-ahdel)، حيث تم تصميم 
 *   وتطوير كل من:
 *                                                                
 *   1. خوارزميات تصنيف السعال (3 مستويات)
 *   2. خوارزميات تصنيف الإسهال (3 مستويات)
 *   3. خوارزميات تصنيف الحمى (5 مستويات)
 *   4. خوارزميات تصنيف الحصبة والأذن والحلق
 *   5. خوارزميات حساب Z-Scores ودمجها مع MUAC
 *   6. خوارزميات الربط بين التصنيفات والإجراءات العلاجية
 *   7. منطق الإحالات الفورية والتنبيهات
 *   8. نظام حفظ واسترجاع البيانات (LocalStorage)
 *   9. واجهات المستخدم وتصميم التفاعل
 *                                                                
 *   هذه الخوارزميات تم تطويرها بناءً على فهم المطور لبروتوكولات 
 *   منظمة الصحة العالمية IMCI، ولكن الطريقة البرمجية والمنطق 
 *   التطبيقي هي إبداع فكري خاص بالمطور.
 *                                                                
 *   ⚠️  يحظر نسخ أو توزيع أو تعديل هذا البرنامج دون ترخيص رسمي
 *    
                                                            
 ******************************************************************/

const STORAGE_KEY = "imci_children";

// حماية الجلسة
if (localStorage.getItem("imci_logged_in") !== "true") {
    window.location.href = "login.html";
}

// إظهار اسم المرفق
document.addEventListener("DOMContentLoaded", () => {
    const facility = localStorage.getItem("imci_facility");
    const el = document.getElementById("facilityName");
    if (el && facility) el.textContent = facility;

    // ربط زر الحفظ
    document.querySelector(".save")?.addEventListener("click", saveChildData);
    
    // تشغيل جميع التصنيفات الأولية
    classifyDangerSigns();
    classifyCough();
    classifyDiarrhea();
    classifyThroat();
    classifyEar();
    classifyFever();
    classifyMeasles();
    classifyVaccination();
    classifyChildNutrition();
    classifyPlayCommunication();
    
    // تشغيل تصنيف سوء التغذية
    classifyMalnutritionComplete();
    updateActions();
});

// الانتقال بين الصفحات
function goTo(page) {
    window.location.href = page;
}

// تسجيل الخروج
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

/***********************************
 * التصنيف الآلي – السعال مع الإحالة الفورية
 ***********************************/
function classifyCough() {
    const cough = document.querySelector('[name="cough"]:checked')?.value;
    const respRate = Number(document.querySelector('[name="resp_rate"]')?.value || 0);
    const chestIndrawing = document.querySelector('[name="chest_indrawing"]')?.checked;
    const stridor = document.querySelector('[name="stridor"]')?.checked;

    const resultBox = document.getElementById("coughResult");
    if (!resultBox) return;

    if (cough !== "yes") {
        resultBox.innerHTML = "✅ لا يوجد سعال";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    if (chestIndrawing || stridor) {
        resultBox.innerHTML = `
            🔴 <strong>التهاب رئوي شديد / مرض شديد جداً</strong><br>
            🚑 <strong>إحالة فورية للمستشفى</strong><br>
            💉 أعطِ الجرعة الأولى:<br>
            &nbsp;&nbsp;• أمبسلين 50 مجم/كجم عضل<br>
            &nbsp;&nbsp;• أو جنتاميسين 7.5 مجم/كجم عضل<br>
            🧪 إذا كان هناك هبوط سكر أو لا يستطيع الرضاعة:<br>
            &nbsp;&nbsp;• محلول سكري 40% (2 مل/كجم وريد ببطء)
        `;
        resultBox.style.background = "#fecaca";
        resultBox.style.color = "#7f1d1d";
    }
    else if (respRate >= 50) {
        resultBox.innerHTML = "🟡 التهاب رئوي – أعطِ أموكسيسيلين فموياً لمدة 5 أيام";
        resultBox.style.background = "#fde68a";
        resultBox.style.color = "#78350f";
    }
    else {
        resultBox.innerHTML = "🟢 سعال أو نزلة برد – علاج منزلي وسوائل دافئة";
        resultBox.style.background = "#bbf7d0";
        resultBox.style.color = "#065f46";
    }
    updateActions();
}

/***********************************
 * التصنيف الآلي – علامات الخطورة (مرض شديد جداً)
 ***********************************/
function classifyDangerSigns() {
    const cannotDrink = document.querySelector('[name="danger1"]')?.checked;
    const unconscious = document.querySelector('[name="danger2"]')?.checked;
    const vomiting = document.querySelector('[name="danger3"]')?.checked;
    const convulsions = document.querySelector('[name="danger4"]')?.checked;

    const resultBox = document.getElementById("dangerResult");
    if (!resultBox) return;

    if (cannotDrink || unconscious || vomiting || convulsions) {
        resultBox.innerHTML = `
            🔴 <strong>مرض شديد جداً</strong><br>
            🚑 <strong>إحالة فورية للمستشفى</strong><br>
            💉 <strong>الجرعة الأولى قبل الإحالة:</strong><br>
            &nbsp;&nbsp;• أمبسلين 50 مجم/كجم عضل (حقنة واحدة)<br>
            &nbsp;&nbsp;• أو جنتاميسين 7.5 مجم/كجم عضل (حقنة واحدة)<br>
            🧪 <strong>محلول سكري 40%:</strong><br>
            &nbsp;&nbsp;• 2 مل/كجم وريد ببطء (على 5-10 دقائق)<br>
            &nbsp;&nbsp;• يُعطى إذا كان الطفل لا يستطيع الرضاعة أو هبوط سكر
        `;
        resultBox.style.background = "#fecaca";
        resultBox.style.color = "#7f1d1d";
    } else {
        resultBox.innerHTML = "🟢 لا توجد علامات خطورة عامة";
        resultBox.style.background = "#bbf7d0";
        resultBox.style.color = "#065f46";
    }
    updateActions();
}

/**********************
 * تصنيف الإسهال - IMCI
 **********************/
function classifyDiarrhea() {
    const diarrhea = document.querySelector('input[name="diarrhea"]:checked')?.value;
    const generalState = document.querySelector('[name="general_state"]')?.value;
    const sunkenEyes = document.querySelector('[name="sunken_eyes"]')?.checked;
    const notDrinking = document.querySelector('[name="not_drinking"]')?.checked;
    const drinksEagerly = document.querySelector('[name="drinks_eagerly"]')?.checked;
    const skinPinch = document.querySelector('[name="skin_pinch"]')?.value;

    const resultBox = document.getElementById("diarrheaResult");
    if (!resultBox) return;

    if (diarrhea !== "yes") {
        resultBox.innerHTML = "🟢 لا يوجد إسهال";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    let severe = 0;
    let some = 0;

    if (generalState === "lethargic") severe++;
    if (sunkenEyes) severe++;
    if (notDrinking) severe++;
    if (skinPinch === "very_slow") severe++;

    if (generalState === "restless") some++;
    if (sunkenEyes) some++;
    if (drinksEagerly) some++;
    if (skinPinch === "slow") some++;

    if (severe >= 2) {
        resultBox.innerHTML = "🔴 جفاف شديد – خطة ج (إحالة فورية + سوائل وريدية)";
        resultBox.style.background = "#fecaca";
    }
    else if (some >= 2) {
        resultBox.innerHTML = "🟠 بعض الجفاف – خطة ب (محلول إرواء فموي 75 مل/كجم خلال 4 ساعات)";
        resultBox.style.background = "#fde68a";
    }
    else {
        resultBox.innerHTML = "🟢 لا يوجد جفاف – خطة أ (سوائل منزلية + زنك 10-14 يوم)";
        resultBox.style.background = "#bbf7d0";
    }
    updateActions();
}

/**********************
 * تصنيف مشكلة الحلق - IMCI
 **********************/
function classifyThroat() {
    const soreThroat = document.querySelector('input[name="sore_throat"]:checked')?.value;
    const fever = document.querySelector('[name="throat_fever"]')?.value;
    const tenderNodes = document.querySelector('[name="tender_nodes"]')?.checked;
    const tonsilExudate = document.querySelector('[name="tonsil_exudate"]')?.checked;

    const resultBox = document.getElementById("throatResult");
    if (!resultBox) return;

    if (soreThroat !== "yes") {
        resultBox.innerHTML = "🟢 لا توجد مشكلة في الحلق";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    if (fever === "yes" && tenderNodes && tonsilExudate) {
        resultBox.innerHTML = "🔴 التهاب الحلق السبحي – أعطِ أموكسيسيلين حسب الوزن لمدة 5 أيام";
        resultBox.style.background = "#fecaca";
        return;
    }

    resultBox.innerHTML = "🟡 التهاب الحلق غير السبحي – علاج عرضي (مسكنات + سوائل دافئة)";
    resultBox.style.background = "#fde68a";
    updateActions();
}

/**********************
 * تصنيف مشكلة الأذن - IMCI
 **********************/
function classifyEar() {
    const earPain = document.querySelector('input[name="ear_pain"]:checked')?.value;
    const earPainDays = Number(document.querySelector('[name="ear_pain_days"]')?.value || 0);
    const earDischarge = document.querySelector('input[name="ear_discharge"]:checked')?.value;
    const earDischargeDays = Number(document.querySelector('[name="ear_discharge_days"]')?.value || 0);
    const mastoid = document.querySelector('[name="mastoid_swelling"]')?.checked;

    const resultBox = document.getElementById("earResult");
    if (!resultBox) return;

    if (mastoid) {
        resultBox.innerHTML = "🔴 التهاب خشاء – إحالة فورية + جرعة أولى أموكسيسيلين";
        resultBox.style.background = "#fecaca";
        return;
    }

    if (earPain === "yes" || (earDischarge === "yes" && earDischargeDays < 14)) {
        resultBox.innerHTML = "🟡 التهاب أذن حاد – أموكسيسيلين لمدة 5 أيام + باراسيتامول";
        resultBox.style.background = "#fde68a";
        return;
    }

    if (earDischarge === "yes" && earDischargeDays >= 14) {
        resultBox.innerHTML = "🟢 التهاب أذن مزمن – تنظيف الأذن يومياً + قطرات موضعية لمدة 14 يوم";
        resultBox.style.background = "#bbf7d0";
        return;
    }

    resultBox.innerHTML = "⚪ لا توجد مشكلة في الأذن";
    resultBox.style.background = "#e5e7eb";
    updateActions();
}

/**********************
 * تصنيف الحمى والملاريا - IMCI
 **********************/
function classifyFever() {
    const fever = document.querySelector('input[name="fever"]:checked')?.value;
    const neckStiffness = document.querySelector('[name="neck_stiffness"]')?.value;
    const malariaTest = document.querySelector('[name="malaria_test"]')?.value;
    const bacterialSigns = document.querySelector('[name="bacterial_signs"]')?.value;
    const runnyNose = document.querySelector('[name="runny_nose"]')?.value;

    const resultBox = document.getElementById("feverResult");
    if (!resultBox) return;

    if (fever !== "yes") {
        resultBox.innerHTML = "⚪ لا توجد حمى";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    if (neckStiffness === "yes") {
        resultBox.innerHTML = "🔴 مرض حموي شديد جداً – إحالة فورية + جرعة أولى أرتسونات";
        resultBox.style.background = "#fecaca";
        return;
    }

    if (malariaTest === "positive") {
        resultBox.innerHTML = "🔴 ملاريا مؤكدة – أرتيمثر + لوميفانترين حسب الوزن";
        resultBox.style.background = "#fecaca";
        return;
    }

    if (bacterialSigns === "yes") {
        resultBox.innerHTML = "🟡 حمى بكتيرية محتملة – أموكسيسيلين 5 أيام";
        resultBox.style.background = "#fde68a";
        return;
    }

    if (runnyNose === "yes") {
        resultBox.innerHTML = "🟢 حمى فيروسية – باراسيتامول + سوائل دافئة وراحة";
        resultBox.style.background = "#bbf7d0";
        return;
    }

    resultBox.innerHTML = "🟡 حمى غير محددة السبب – متابعة بعد يومين";
    resultBox.style.background = "#fde68a";
    updateActions();
}

/**********************
 * تصنيف الحصبة - IMCI
 **********************/
function classifyMeasles() {
    const measlesNow = document.querySelector('input[name="measles_now"]:checked')?.value;
    const mouthUlcers = document.querySelector('[name="mouth_ulcers"]')?.value;
    const eyeDischarge = document.querySelector('[name="eye_discharge"]')?.value;
    const corneaClouding = document.querySelector('[name="cornea_clouding"]')?.value;

    const resultBox = document.getElementById("measlesResult");
    if (!resultBox) return;

    if (measlesNow !== "yes") {
        resultBox.innerHTML = "⚪ لا توجد حصبة";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    if (corneaClouding === "yes" || mouthUlcers === "yes") {
        resultBox.innerHTML = "🔴 حصبة شديدة مع مضاعفات – فيتامين A فوراً + إحالة عاجلة";
        resultBox.style.background = "#fecaca";
        return;
    }

    resultBox.innerHTML = "🟡 حصبة بدون مضاعفات – أعطِ فيتامين A يوم 1 ويوم 2 + علاج داعم";
    resultBox.style.background = "#fde68a";
    updateActions();
}

/**********************
 * تصنيف التطعيمات + فيتامين A - IMCI
 **********************/
function classifyVaccination() {
    const ageMonths = parseInt(document.querySelector('[name="age"]')?.value) || 0;
    const bcg = document.querySelector('[name="bcg"]')?.checked;
    const measles1 = document.querySelector('[name="measles1"]')?.checked;
    const measles2 = document.querySelector('[name="measles2"]')?.checked;
    const vitA9 = document.querySelector('[name="vitA_9m"]')?.checked;
    const vitA18 = document.querySelector('[name="vitA_18m"]')?.checked;

    const resultBox = document.getElementById("vaccinationResult");
    if (!resultBox) return;

    let messages = [];

    if (ageMonths < 2 && !bcg) messages.push("💉 إعطاء BCG اليوم");
    if (ageMonths >= 9 && ageMonths < 18 && !measles1) messages.push("💉 إعطاء جرعة الحصبة الأولى");
    if (ageMonths >= 18 && !measles2) messages.push("💉 إعطاء جرعة الحصبة الثانية");
    if (ageMonths >= 6 && ageMonths < 12 && !vitA9) messages.push("🟡 فيتامين A 100000 وحدة اليوم");
    if (ageMonths >= 12 && ageMonths <= 59 && !vitA18) messages.push("🟡 فيتامين A 200000 وحدة اليوم");

    if (messages.length === 0) {
        resultBox.innerHTML = "🟢 التطعيمات مكتملة حسب العمر";
        resultBox.style.background = "#bbf7d0";
    } else {
        resultBox.innerHTML = messages.join("<br>");
        resultBox.style.background = "#fde68a";
    }
}

/**********************
 * تقييم تغذية الطفل (< سنتين) - IMCI
 **********************/
function classifyChildNutrition() {
    const ageMonths = parseInt(document.querySelector('[name="age"]')?.value) || 0;
    const breastfeeding = document.querySelector('input[name="breastfeeding"]:checked')?.value;
    const breastfeedCount = parseInt(document.querySelector('[name="breastfeed_count"]')?.value) || 0;
    const breastfeedNight = document.querySelector('[name="breastfeed_night"]')?.value;
    const otherFoods = document.querySelector('[name="other_foods"]')?.value;
    const foodTimes = parseInt(document.querySelector('[name="food_times"]')?.value) || 0;
    const foodAmount = document.querySelector('[name="food_amount"]')?.value;
    const nutritionChange = document.querySelector('[name="nutrition_change"]')?.value;

    const resultBox = document.getElementById("nutritionStatusResult");
    if (!resultBox) return;

    if (ageMonths >= 24 || ageMonths === 0) {
        resultBox.innerHTML = "⚪ التقييم مخصص للأطفال أقل من سنتين";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    if ((ageMonths < 6 && breastfeeding !== "yes") ||
        (breastfeeding === "yes" && breastfeedCount < 8) ||
        breastfeedNight === "no" ||
        (ageMonths >= 6 && otherFoods !== "yes") ||
        nutritionChange === "yes") {
        resultBox.innerHTML = "🔴 مشكلة تغذية شديدة – قدم مشورة مكثفة + متابعة بعد 5 أيام";
        resultBox.style.background = "#fecaca";
        return;
    }

    if (foodTimes < 3 || foodAmount === "صغير") {
        resultBox.innerHTML = "🟡 مشكلة تغذية – قدم مشورة غذائية للأم";
        resultBox.style.background = "#fde68a";
        return;
    }

    resultBox.innerHTML = "🟢 تغذية جيدة – شجع الأم على الاستمرار";
    resultBox.style.background = "#bbf7d0";
}

/**********************
 * تقييم اللعب والتواصل - IMCI
 **********************/
function classifyPlayCommunication() {
    const plays = document.querySelector('input[name="plays_with_child"]:checked')?.value;
    const playDetails = document.querySelector('[name="play_details"]')?.value?.trim();
    const communicates = document.querySelector('input[name="communicates"]:checked')?.value;
    const communicatesHow = document.querySelector('[name="communicates_how"]')?.value?.trim();

    const resultBox = document.getElementById("playCommunicationResult");
    if (!resultBox) return;

    if (!plays && !communicates) {
        resultBox.innerHTML = "⚪ لم يتم التقييم بعد";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    if (plays === "no" && communicates === "no") {
        resultBox.innerHTML = "🔴 تأخر نمائي محتمل – قدم إرشاد مكثف + متابعة خلال شهر";
        resultBox.style.background = "#fecaca";
        return;
    }

    if ((plays === "yes" && !playDetails) || (communicates === "yes" && !communicatesHow)) {
        resultBox.innerHTML = "🟡 تفاعل ضعيف – قدم نصائح لتحفيز اللعب والتواصل يومياً";
        resultBox.style.background = "#fde68a";
        return;
    }

    if (plays === "yes" && communicates === "yes") {
        resultBox.innerHTML = "🟢 تفاعل جيد – شجع الأم على الاستمرار";
        resultBox.style.background = "#bbf7d0";
        return;
    }

    resultBox.innerHTML = "🟡 يحتاج تعزيز التفاعل واللعب";
    resultBox.style.background = "#fde68a";
}

/************************************
 * ====== دوال تصنيف MUAC وسوء التغذية وفقر الدم ======
 * وفق بروتوكولات منظمة الصحة العالمية (WHO)
 ************************************/

/**
 * دالة حساب وتصنيف MUAC
 */
function classifyMUAC(muac) {
    if (!muac || muac <= 0) {
        return { 
            status: "unknown", 
            text: "⚠️ لم يتم إدخال قيمة MUAC", 
            color: "#e5e7eb",
            borderColor: "#94a3b8",
            action: "يرجى قياس MUAC باستخدام شريط القياس"
        };
    }
    
    let result = {};
    
    if (muac < 11.5) {
        result = {
            status: "SAM",
            text: "🔴 سوء تغذية حاد شديد (SAM)",
            color: "#fecaca",
            borderColor: "#dc2626",
            action: "🚑 إحالة فورية للمستشفى + بدء تغذية علاجية"
        };
    } 
    else if (muac >= 11.5 && muac < 12.5) {
        result = {
            status: "MAM",
            text: "🟠 سوء تغذية حاد متوسط (MAM)",
            color: "#fde68a",
            borderColor: "#d97706",
            action: "📅 متابعة أسبوعية + دعم غذائي متقدم"
        };
    }
    else if (muac >= 12.5 && muac < 13.5) {
        result = {
            status: "at_risk",
            text: "🟡 خطر معتدل",
            color: "#fef3c7",
            borderColor: "#ca8a04",
            action: "📅 متابعة شهرية + تحسين التنوع الغذائي"
        };
    }
    else {
        result = {
            status: "normal",
            text: "🟢 طبيعي",
            color: "#bbf7d0",
            borderColor: "#16a34a",
            action: "✅ استمرار الرضاعة الطبيعية والأغذية المتوازنة"
        };
    }
    
    result.muac = muac;
    return result;
}

/**
 * دالة حساب Z-Scores
 */
function calculateZScores(age, weight, height, sex) {
    if (!age || age <= 0 || !weight || weight <= 0 || !height || height <= 0) {
        return { waz: null, haz: null, whz: null };
    }
    
    const isMale = sex === "male";
    let expectedWeight, expectedHeight;
    
    if (isMale) {
        if (age <= 12) {
            expectedWeight = 3.5 + (age * 0.5);
            expectedHeight = 50 + (age * 1.5);
        } else {
            expectedWeight = 8 + ((age - 12) * 0.25);
            expectedHeight = 70 + ((age - 12) * 0.8);
        }
    } else {
        if (age <= 12) {
            expectedWeight = 3.3 + (age * 0.45);
            expectedHeight = 49 + (age * 1.5);
        } else {
            expectedWeight = 7.5 + ((age - 12) * 0.23);
            expectedHeight = 69 + ((age - 12) * 0.8);
        }
    }
    
    const sdWeight = expectedWeight * 0.15;
    const sdHeight = expectedHeight * 0.08;
    
    const waz = (weight - expectedWeight) / sdWeight;
    const haz = (height - expectedHeight) / sdHeight;
    
    let idealWeightForHeight;
    if (height <= 65) {
        idealWeightForHeight = 3.0 + (height - 45) * 0.15;
    } else if (height <= 100) {
        idealWeightForHeight = 6.0 + (height - 65) * 0.12;
    } else {
        idealWeightForHeight = 10.2 + (height - 100) * 0.1;
    }
    if (!isMale) idealWeightForHeight *= 0.98;
    
    const sdWhz = idealWeightForHeight * 0.12;
    const whz = (weight - idealWeightForHeight) / sdWhz;
    
    return {
        waz: Math.min(Math.max(waz, -5), 5),
        haz: Math.min(Math.max(haz, -5), 5),
        whz: Math.min(Math.max(whz, -5), 5)
    };
}

/**
 * دالة الحصول على رسالة Z-Score
 */
function getZScoreMessage(zscore, type) {
    if (zscore === null) return "غير متوفر";
    
    const typeNames = {
        waz: "الوزن",
        haz: "الطول",
        whz: "الوزن/الطول"
    };
    
    const name = typeNames[type] || type;
    
    if (zscore < -3) return `⚠️ ${name} أقل من الطبيعي بشدة (نقص شديد)`;
    if (zscore < -2) return `⚠️ ${name} أقل من الطبيعي (نقص متوسط)`;
    if (zscore > 2) return `📈 ${name} أعلى من الطبيعي (زيادة)`;
    return `✅ ${name} طبيعي`;
}

/**
 * دالة تصنيف فقر الدم
 */
function classifyAnemia(pallor, hemoglobin) {
    if (pallor === "severe" || (hemoglobin > 0 && hemoglobin < 7)) {
        return {
            status: "severe",
            text: "🔴 فقر دم شديد",
            color: "#fecaca",
            actions: [
                "🚑 إحالة عاجلة للمستشفى",
                "🩸 نقل دم إذا لزم الأمر",
                "💊 بدء حديد + حمض فوليك فوراً"
            ]
        };
    } 
    else if (pallor === "mild" || (hemoglobin >= 7 && hemoglobin < 11)) {
        return {
            status: "moderate",
            text: "🟡 فقر دم متوسط/خفيف",
            color: "#fde68a",
            actions: [
                "💊 حديد (3-6 مجم/كجم/يوم) لمدة 3 أشهر",
                "🥬 أغذية غنية بالحديد",
                "🍊 فيتامين C مع الحديد",
                "🪄 مكافحة الديدان المعوية"
            ]
        };
    }
    
    return {
        status: "none",
        text: "🟢 لا يوجد فقر دم",
        color: "#bbf7d0",
        actions: []
    };
}

/**
 * الدالة الرئيسية لتصنيف سوء التغذية وفقر الدم
 */
function classifyMalnutritionComplete() {
    const age = parseFloat(document.querySelector('[name="age"]')?.value) || 0;
    const weight = parseFloat(document.querySelector('[name="weight"]')?.value) || 0;
    const height = parseFloat(document.querySelector('[name="height"]')?.value) || 0;
    const muac = parseFloat(document.querySelector('[name="muac"]')?.value) || 0;
    const sexElement = document.querySelector('[name="sex"]:checked, [name="gender"]');
    const sex = sexElement?.value === "أنثى" || sexElement?.value === "female" ? "female" : "male";
    const edema = document.querySelector('[name="bilateral_edema"]')?.value || "";
    const severeWasting = document.querySelector('[name="severe_wasting"]')?.value || "";
    const pallor = document.querySelector('[name="pallor_hand"]')?.value || "";
    const hemoglobin = parseFloat(document.querySelector('[name="hemoglobin"]')?.value) || 0;
    
    const resultBox = document.getElementById("nutritionResult");
    if (!resultBox) return null;
    
    // تصنيف MUAC
    const muacResult = classifyMUAC(muac);
    
    // حساب Z-Scores
    const scores = calculateZScores(age, weight, height, sex);
    
    // تصنيف فقر الدم
    const anemiaResult = classifyAnemia(pallor, hemoglobin);
    
    // التصنيف الشامل
    let malnutritionStatus = "";
    let malnutritionColor = muacResult.color;
    let allActions = [...(muacResult.action ? [muacResult.action] : [])];
    
    // تحديث حقول Z-Scores في الصفحة
    const whzField = document.getElementById("whzOutput");
    const wazField = document.getElementById("wazOutput");
    const hazField = document.getElementById("hazOutput");
    if (whzField) whzField.value = scores.whz !== null ? scores.whz.toFixed(2) : "";
    if (wazField) wazField.value = scores.waz !== null ? scores.waz.toFixed(2) : "";
    if (hazField) hazField.value = scores.haz !== null ? scores.haz.toFixed(2) : "";
    
    // تحليل Z-Scores
    if (scores.whz !== null) {
        if (scores.whz < -3) {
            malnutritionStatus = "🔴 هزال شديد (SAM)";
            malnutritionColor = "#fecaca";
            allActions.push("🍼 بدء تغذية علاجية (F-75 ثم F-100)");
            allActions.push("💊 مضاد حيوي وقائي");
            allActions.push("💉 فيتامين A فوراً");
        } 
        else if (scores.whz < -2) {
            malnutritionStatus = "🟠 هزال متوسط (MAM)";
            malnutritionColor = "#fde68a";
            allActions.push("🍼 دعم غذائي متقدم");
            allActions.push("📅 متابعة أسبوعية");
        }
        else if (scores.haz < -2) {
            malnutritionStatus = "🟡 تقزم (تأخر نمو مزمن)";
            malnutritionColor = "#fde68a";
            allActions.push("🥗 تحسين التنوع الغذائي");
            allActions.push("🧪 مكملات زنك وفيتامينات");
        }
        else if (scores.waz < -2) {
            malnutritionStatus = "🟡 نقص وزن بالنسبة للعمر";
            malnutritionColor = "#fde68a";
            allActions.push("🍽️ زيادة عدد الوجبات اليومية");
        }
    }
    
    // التحقق من الوذمة
    if (edema === "yes" || severeWasting === "yes") {
        malnutritionStatus = "🔴 سوء تغذية حاد شديد مع مضاعفات (SAM)";
        malnutritionColor = "#fecaca";
        allActions.push("🚑 إحالة فورية للمستشفى");
        allActions.push("💉 فيتامين A فوراً");
    }
    
    // بناء النتيجة النهائية
    let finalResult = "";
    
    finalResult += `<div style="margin-bottom: 12px; padding: 10px; background: ${muacResult.color}; border-radius: 8px;">`;
    finalResult += `<strong>📏 MUAC: ${muac > 0 ? muac.toFixed(1) : "---"} سم</strong><br>`;
    finalResult += `${muacResult.text}`;
    finalResult += `</div>`;
    
    finalResult += `<div style="margin-bottom: 12px; padding: 10px; background: #f1f5f9; border-radius: 8px;">`;
    finalResult += `<strong>📊 مؤشرات النمو (Z-Scores):</strong><br>`;
    finalResult += `• ${getZScoreMessage(scores.waz, "waz")}<br>`;
    finalResult += `• ${getZScoreMessage(scores.haz, "haz")}<br>`;
    finalResult += `• ${getZScoreMessage(scores.whz, "whz")}`;
    finalResult += `</div>`;
    
    finalResult += `<div style="margin-bottom: 12px; padding: 10px; background: ${anemiaResult.color}; border-radius: 8px;">`;
    finalResult += `${anemiaResult.text}`;
    if (hemoglobin > 0) finalResult += ` (Hb: ${hemoglobin} g/dL)`;
    finalResult += `</div>`;
    
    if (malnutritionStatus) {
        finalResult += `<div style="margin-bottom: 12px; padding: 10px; background: ${malnutritionColor}; border-radius: 8px; font-weight: bold;">`;
        finalResult += `${malnutritionStatus}`;
        finalResult += `</div>`;
    }
    
    if (allActions.length > 0 || anemiaResult.actions.length > 0) {
        finalResult += `<hr><strong>📋 الإجراءات المقترحة:</strong><br><ul style="margin: 10px 0 0 20px;">`;
        allActions.forEach(action => { finalResult += `<li>${action}</li>`; });
        anemiaResult.actions.forEach(action => { finalResult += `<li>${action}</li>`; });
        finalResult += `</ul>`;
    }
    
    // تحديث حقل الإجراءات المتخذة
    const actionsField = document.querySelector('[name="child_treatment_given"]');
    if (actionsField) {
        const allActionsText = [...allActions, ...anemiaResult.actions];
        if (allActionsText.length > 0) {
            actionsField.value = allActionsText.join("\n• ");
        }
    }
    
    resultBox.innerHTML = finalResult;
    resultBox.style.background = "#ffffff";
    resultBox.style.padding = "15px";
    resultBox.style.borderRadius = "12px";
    resultBox.style.borderRight = `4px solid ${muacResult.borderColor || "#0891b2"}`;
    
    // تحديث حقل ملخص Z-Scores
    const summaryField = document.getElementById("zscoreSummary");
    if (summaryField && scores.whz !== null) {
        summaryField.value = `WHZ: ${scores.whz.toFixed(1)} | WAZ: ${scores.waz.toFixed(1)} | HAZ: ${scores.haz.toFixed(1)}`;
    }
    
    return { muac: muacResult, scores: scores, anemia: anemiaResult, malnutrition: malnutritionStatus };
}

/************************************
 * ====== تحديث الإجراءات المتخذة ======
 ************************************/
function updateActions() {
    const actionsTextarea = document.querySelector('[name="child_treatment_given"]');
    if (!actionsTextarea) return;
    
    let allActions = [];
    
    const dangerBox = document.getElementById("dangerResult");
    const coughBox = document.getElementById("coughResult");
    const diarrheaBox = document.getElementById("diarrheaResult");
    const nutritionBox = document.getElementById("nutritionResult");
    const feverBox = document.getElementById("feverResult");
    const throatBox = document.getElementById("throatResult");
    const earBox = document.getElementById("earResult");
    
    const extractActions = (html) => {
        if (!html) return [];
        const match = html.match(/الإجراءات المقترحة:<br>• (.*?)(?=<hr>|$)/s);
        if (match) {
            return match[1].split("<br>• ").map(a => a.trim());
        }
        return [];
    };
    
    if (dangerBox && dangerBox.innerHTML.includes("مرض شديد")) {
        allActions.push("🚑 إحالة فورية للمستشفى");
        allActions.push("💉 أمبسلين/جنتاميسين عضل");
    }
    
    if (coughBox && coughBox.innerHTML.includes("التهاب رئوي شديد")) {
        allActions.push("🚑 إحالة فورية");
    } else if (coughBox && coughBox.innerHTML.includes("التهاب رئوي")) {
        allActions.push("💊 أموكسيسيلين فموي 5 أيام");
    }
    
    if (diarrheaBox && diarrheaBox.innerHTML.includes("جفاف شديد")) {
        allActions.push("🚑 إحالة فورية + سوائل وريدية");
    } else if (diarrheaBox && diarrheaBox.innerHTML.includes("بعض الجفاف")) {
        allActions.push("💧 محلول إرواء فموي + زنك");
    } else if (diarrheaBox && diarrheaBox.innerHTML.includes("لا يوجد جفاف")) {
        allActions.push("💧 سوائل منزلية + زنك");
    }
    
    if (nutritionBox) {
        const nutritionActions = extractActions(nutritionBox.innerHTML);
        allActions.push(...nutritionActions);
    }
    
    if (feverBox && feverBox.innerHTML.includes("ملاريا")) {
        allActions.push("💊 أرتيمثر + لوميفانترين");
    } else if (feverBox && feverBox.innerHTML.includes("حمى بكتيرية")) {
        allActions.push("💊 أموكسيسيلين 5 أيام");
    } else if (feverBox && feverBox.innerHTML.includes("حمى فيروسية")) {
        allActions.push("💊 باراسيتامول + سوائل");
    }
    
    if (throatBox && throatBox.innerHTML.includes("التهاب الحلق السبحي")) {
        allActions.push("💊 أموكسيسيلين 5 أيام");
    }
    
    if (earBox && earBox.innerHTML.includes("التهاب أذن حاد")) {
        allActions.push("💊 أموكسيسيلين 5 أيام");
    }
    
    allActions = [...new Set(allActions)];
    
    if (allActions.length > 0) {
        actionsTextarea.value = allActions.join("\n• ");
    }
}

/************************************
 * ====== حفظ البيانات ======
 ************************************/
function saveChildData() {
    const childName = document.querySelector('[name="child_name"]')?.value;
    if (!childName) {
        alert("⚠️ الرجاء إدخال اسم الطفل");
        return;
    }
    
    const dangerResult = document.getElementById("dangerResult")?.innerHTML || "";
    const coughResult = document.getElementById("coughResult")?.innerHTML || "";
    const diarrheaResult = document.getElementById("diarrheaResult")?.innerHTML || "";
    const feverResult = document.getElementById("feverResult")?.innerHTML || "";
    const nutritionResult = document.getElementById("nutritionResult")?.innerHTML || "";
    
    const needsReferral = dangerResult.includes("إحالة فورية") || coughResult.includes("إحالة فورية");
    
    let proposedTreatment = [];
    if (dangerResult.includes("أمبسلين") || coughResult.includes("أمبسلين")) {
        proposedTreatment.push("💉 أمبسلين 50 مجم/كجم عضل");
    }
    if (dangerResult.includes("جنتاميسين") || coughResult.includes("جنتاميسين")) {
        proposedTreatment.push("💉 جنتاميسين 7.5 مجم/كجم عضل");
    }
    if (dangerResult.includes("محلول سكري") || coughResult.includes("محلول سكري")) {
        proposedTreatment.push("🧪 محلول سكري 40% (2 مل/كجم وريد)");
    }
    
    const childData = {
        id: Date.now(),
        facility: localStorage.getItem("imci_facility") || "",
        child_name: childName,
        sex: document.querySelector('[name="sex"]:checked')?.value || "",
        age: Number(document.querySelector('[name="age"]')?.value || 0),
        weight: Number(document.querySelector('[name="weight"]')?.value || 0),
        height: Number(document.querySelector('[name="height"]')?.value || 0),
        temperature: Number(document.querySelector('[name="temperature"]')?.value || 0),
        visit_date: document.querySelector('[name="visit_date"]')?.value || new Date().toISOString().split('T')[0],
        visit_type: document.querySelector('[name="visit_type"]:checked')?.value || "first",
        problem: document.querySelector('[name="problem"]')?.value || "",
        
        dangerSigns: {
            cannotDrink: document.querySelector('[name="danger1"]')?.checked || false,
            vomiting: document.querySelector('[name="danger2"]')?.checked || false,
            convulsions: document.querySelector('[name="danger3"]')?.checked || false,
            unconscious: document.querySelector('[name="danger4"]')?.checked || false
        },
        
        classifications: {
            danger: dangerResult.replace(/<br>/g, " ").substring(0, 200),
            cough: coughResult.replace(/<br>/g, " ").substring(0, 200),
            diarrhea: diarrheaResult.replace(/<br>/g, " ").substring(0, 200),
            fever: feverResult.replace(/<br>/g, " ").substring(0, 200),
            nutrition: nutritionResult.replace(/<br>/g, " ").substring(0, 200)
        },
        
        zScores: {
            whz: document.getElementById('whzOutput')?.value || "",
            waz: document.getElementById('wazOutput')?.value || "",
            haz: document.getElementById('hazOutput')?.value || ""
        },
        
        needs_referral: needsReferral,
        proposed_treatment: proposedTreatment,
        saved_at: new Date().toISOString()
    };
    
    let children = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    children.push(childData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(children));
    
    let message = `✅ تم حفظ بيانات الطفل: ${childData.child_name}\n`;
    message += `📋 التصنيفات:\n- ${childData.classifications.danger.substring(0, 50)}\n- ${childData.classifications.cough.substring(0, 50)}`;
    
    if (needsReferral) {
        message += `\n\n🚨 تنبيه: الحالة تحتاج إحالة فورية!`;
    }
    if (proposedTreatment.length > 0) {
        message += `\n\n💊 العلاج المقترح:\n${proposedTreatment.join("\n")}`;
    }
    
    alert(message);
    
    if (confirm("هل تريد تفريغ الحقول لإدخال طفل جديد؟")) {
        document.querySelectorAll("input, textarea, select").forEach(el => el.value = "");
        document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(el => el.checked = false);
    }
}

/************************************
 * ====== ربط جميع الأحداث ======
 ************************************/
document.addEventListener("change", function(e) {
    const name = e.target.name;
    
    if (["cough","resp_rate","chest_indrawing","stridor"].includes(name)) classifyCough();
    if (["danger1","danger2","danger3","danger4"].includes(name)) classifyDangerSigns();
    if (["diarrhea","general_state","sunken_eyes","not_drinking","drinks_eagerly","skin_pinch"].includes(name)) classifyDiarrhea();
    if (["sore_throat","throat_fever","tender_nodes","tonsil_exudate"].includes(name)) classifyThroat();
    if (["ear_pain","ear_pain_days","ear_discharge","ear_discharge_days","mastoid_swelling"].includes(name)) classifyEar();
    if (["fever","neck_stiffness","malaria_test","bacterial_signs","runny_nose"].includes(name)) classifyFever();
    if (["measles_now","mouth_ulcers","eye_discharge","cornea_clouding"].includes(name)) classifyMeasles();
});

document.addEventListener("input", function(e) {
    const name = e.target.name;
    
    if (["age","bcg","measles1","measles2","vitA_9m","vitA_18m"].includes(name)) classifyVaccination();
    if (["age","breastfeeding","breastfeed_count","breastfeed_night","other_foods","food_times","food_amount","nutrition_change"].includes(name)) classifyChildNutrition();
    if (["plays_with_child","play_details","communicates","communicates_how"].includes(name)) classifyPlayCommunication();
    
    if (["age","weight","height","muac","hemoglobin","bilateral_edema","severe_wasting","pallor_hand","sex"].includes(name)) {
        classifyMalnutritionComplete();
        updateActions();
    }
});
