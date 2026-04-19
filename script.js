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
    calculateZScores();
    classifyMalnutrition();
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
        resultBox.innerHTML = "🟡 التهاب رئوي – أعطِ أموكسيسيلين وسالبتامول فموياً لمدة 5 أيام";
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
 * تصنيف مشكلة الحلق - IMCI (معدل)
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

    // 🔴 التهاب حلق سبحي (بكتيري)
    if (fever === "yes" && tenderNodes && tonsilExudate) {
        resultBox.innerHTML = `
            🔴 <strong>التهاب الحلق السبحي</strong><br>
            💊 <strong>العلاج:</strong><br>
            &nbsp;&nbsp;• باراسيتامول (15 مجم/كجم) لتسكين الألم وخفض الحرارة<br>
            &nbsp;&nbsp;• إما: بنسلين فموي لمدة 10 أيام<br>
            &nbsp;&nbsp;• أو: جرعة واحدة بنزاثين بنسلين عضل (600,000 - 1,200,000 وحدة حسب الوزن)<br>
            📌 يفضل إعطاء الجرعة العضلية لضمان الالتزام بالعلاج
        `;
        resultBox.style.background = "#fecaca";
        resultBox.style.color = "#7f1d1d";
        updateActions();
        return;
    }

    // 🟡 التهاب حلق غير سبحي (فيروسي)
    resultBox.innerHTML = "🟡 التهاب الحلق غير السبحي – علاج عرضي (باراسيتامول + سوائل دافئة)";
    resultBox.style.background = "#fde68a";
    resultBox.style.color = "#78350f";
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
        resultBox.innerHTML = "🔴 التهاب خشاء – إحالة فورية +محلول السكر٤٠% + جرعة أولى أموكسيسيلين";
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
 * ====== تصنيف Z-Scores وعرضها ======
 ************************************/
function calculateZScores() {
    const age = parseFloat(document.querySelector('[name="age"]')?.value) || 0;
    const weight = parseFloat(document.querySelector('[name="weight"]')?.value) || 0;
    const height = parseFloat(document.querySelector('[name="height"]')?.value) || 0;
    const sex = document.querySelector('[name="sex"]:checked')?.value || "male";
    
    if (!age || !weight || !height) return null;
    
    let expectedWeight, expectedHeight, sdWeight, sdHeight;
    
    if (sex === "male") {
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
    
    sdWeight = expectedWeight * 0.15;
    sdHeight = expectedHeight * 0.08;
    
    const waz = (weight - expectedWeight) / sdWeight;
    const haz = (height - expectedHeight) / sdHeight;
    
    const idealWeightForHeight = (height <= 100) ? (height * 0.15) : (15 + ((height - 100) * 0.25));
    const sdWhz = idealWeightForHeight * 0.12;
    const whz = (weight - idealWeightForHeight) / sdWhz;
    
    const whzField = document.getElementById("whzOutput");
    const wazField = document.getElementById("wazOutput");
    const hazField = document.getElementById("hazOutput");
    const summaryField = document.getElementById("zscoreSummary");
    
    if (whzField) whzField.value = whz.toFixed(2);
    if (wazField) wazField.value = waz.toFixed(2);
    if (hazField) hazField.value = haz.toFixed(2);
    
    if (summaryField) {
        let summary = `WHZ: ${whz.toFixed(1)} | WAZ: ${waz.toFixed(1)} | HAZ: ${haz.toFixed(1)}`;
        if (whz < -3) summary += " ⚠️ هزال شديد";
        else if (whz < -2) summary += " ⚠️ هزال متوسط";
        if (haz < -3) summary += " ⚠️ تقزم شديد";
        else if (haz < -2) summary += " ⚠️ تقزم متوسط";
        summaryField.value = summary;
    }
    
    return { waz, haz, whz };
}

/************************************
 * ====== تصنيف سوء التغذية وفقر الدم ======
 ************************************/
function classifyMalnutrition() {
    const age = parseFloat(document.querySelector('[name="age"]')?.value) || 0;
    const weight = parseFloat(document.querySelector('[name="weight"]')?.value) || 0;
    const height = parseFloat(document.querySelector('[name="height"]')?.value) || 0;
    const muac = parseFloat(document.querySelector('[name="muac"]')?.value) || 0;
    const edema = document.querySelector('[name="bilateral_edema"]')?.value || "";
    const severeWasting = document.querySelector('[name="severe_wasting"]')?.value || "";
    const pallor = document.querySelector('[name="pallor_hand"]')?.value || "";
    const hemoglobin = parseFloat(document.querySelector('[name="hemoglobin"]')?.value) || 0;
    
    const resultBox = document.getElementById("nutritionResult");
    if (!resultBox) return;
    
    let result = "";
    let color = "#bbf7d0";
    let actions = [];
    
    const scores = calculateZScores();
    const whz = scores?.whz || 0;
    const waz = scores?.waz || 0;
    const haz = scores?.haz || 0;
    
    // ========== 1. تصنيف سوء التغذية ==========
    
    if (edema === "yes" || muac < 11.5 || whz < -3 || severeWasting === "yes") {
        result = "🔴 سوء تغذية حاد شديد (SAM)";
        color = "#fecaca";
        actions.push("🚑 إحالة فورية للمستشفى");
        actions.push("💊 مضاد حيوي وقائي (أموكسيسيلين أو كوتريموكسازول)");
        actions.push("🍼 بدء تغذية علاجية (F-75 ثم F-100)");
        actions.push("💉 فيتامين A فوراً حسب العمر");
    }
    else if ((muac >= 11.5 && muac < 12.5) || (whz >= -3 && whz < -2)) {
        result = "🟠 سوء تغذية حاد متوسط (MAM)";
        color = "#fde68a";
        actions.push("🍼 دعم غذائي متقدم");
        actions.push("📅 متابعة أسبوعية لمدة شهر");
    }
    else if (haz < -2) {
        result = "🟡 تقزم (تأخر نمو مزمن)";
        color = "#fde68a";
        actions.push("🥗 تحسين التنوع الغذائي");
        actions.push("🧪 مكملات زنك وفيتامينات");
    }
    else if (waz < -2) {
        result = "🟡 نقص وزن بالنسبة للعمر";
        color = "#fde68a";
        actions.push("🍽️ زيادة عدد الوجبات اليومية");
    }
    else if (whz >= -2 && whz <= 2 && waz >= -2 && haz >= -2 && age > 0) {
        result = "🟢 تغذية طبيعية";
        color = "#bbf7d0";
        actions.push("✅ استمرار الرضاعة الطبيعية والأغذية المتوازنة");
    }
    
    // ========== 2. تصنيف فقر الدم ==========
    if (pallor === "severe" || (hemoglobin > 0 && hemoglobin < 7)) {
        result = "🔴 فقر دم شديد";
        color = "#fecaca";
        actions.push("🚑 إحالة عاجلة للمستشفى");
        actions.push("💊 بدء حديد + حمض فوليك");
    } else if (pallor === "mild" || (hemoglobin >= 7 && hemoglobin < 11)) {
        result = "🟡 فقر دم متوسط/خفيف";
        color = "#fde68a";
        actions.push("💊 حديد لمدة 3 أشهر");
        actions.push("🥬 أغذية غنية بالحديد");
    }
    
    if (!result) {
        result = "🟢 الحالة طبيعية";
    }
    
    if (actions.length > 0) {
        result += "<hr><strong>📋 الإجراءات المقترحة:</strong><br>• " + actions.join("<br>• ");
    }
    
    resultBox.innerHTML = result;
    resultBox.style.background = color;
    resultBox.style.color = "#1a1a1a";
    resultBox.style.padding = "10px";
    resultBox.style.borderRadius = "8px";
    
    return { result, actions };
}

/************************************
 * ====== تحديث الإجراءات المتخذة (معدل) ======
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
    
    // ✅ العلاج الجديد لالتهاب الحلق السبحي
    if (throatBox && throatBox.innerHTML.includes("التهاب الحلق السبحي")) {
        allActions.push("💊 باراسيتامول 15 مجم/كجم كل 6 ساعات");
        allActions.push("💉 بنزاثين بنسلين عضل (جرعة واحدة) أو بنسلين فموي 10 أيام");
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
        calculateZScores();
        classifyMalnutrition();
        updateActions();
    }
});
