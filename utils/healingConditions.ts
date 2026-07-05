// Indexul de afectiuni de pe Harta 2 "The Healing Web", transcris manual din
// imaginea de rezolutie mare (nu OCR brut). Fiecare afectiune are trei
// perspective, exact ca pe harta: cauze posibile, abordarea farmaceutica
// (Pharma) si abordarea holistica (Holistic).
//
// Textul-sursa e in ENGLEZA (limba hartii). In aplicatie, fiecare card se
// traduce automat in limba utilizatorului (vezi app/healing-map2.tsx), la fel
// ca lista de ingrediente — asa acopera toate cele 9 limbi fara traduceri
// scrise de mana pentru fiecare termen medical.
//
// IMPORTANT (context): sunt opiniile autorului hartii (Dylan L. Monroe),
// prezentate spre informare; NU sfat medical. Pagina afiseaza un disclaimer.

export type Condition = {
  key: string;
  name: string;
  causes: string;
  pharma: string;
  holistic: string;
};

export const HEALING_CONDITIONS: Condition[] = [
  {
    key: "heart",
    name: "Heart Disease & Hypertension",
    causes:
      "Standard American Diet, processed food & meat, fried food, white carbs, fast food, stress, obesity.",
    pharma: "Antihypertensives, statins, stent & bypass surgery, cholesterol deprivation.",
    holistic:
      "Organic diet, exercise, celery juice, weight loss, meditation, stress reduction, potassium-rich foods.",
  },
  {
    key: "cancer",
    name: "Cancer",
    causes:
      "Genetic and environmental factors, sugar, carcinogens, radiation, preservatives, GMOs, herbicides, pesticides, acrylamides, artificial sweeteners & coloring.",
    pharma:
      "Chemotherapy & radiation therapy (themselves carcinogens), surgery, stem cell transplant, screening tests.",
    holistic:
      "Carcinogen avoidance, toxic-environment elimination, organic diet, turmeric, soursop, coffee enemas, B17, light therapy, energy healing, crystals, sound healing, releasing trauma, green tea, leafy greens, cruciferous vegetables, black seed oil, frankincense, IV vitamin C, immune support, sleep & relaxation, apple cider vinegar, exercise, rebounding, PEMF therapy, lymph massage, alkaline diet.",
  },
  {
    key: "neuro",
    name: "Neurodegenerative Diseases (Alzheimer's, Dementia, Parkinson's, ALS, MS)",
    causes:
      "Metal poisoning (aluminium), antiperspirant, statins, antihypertensives, anesthesia, poor sleep.",
    pharma: "Symptom-management medications, cholinesterase inhibitors, memantine.",
    holistic:
      "Detox, natural chelation, organic diet, ketogenic diet, coconut oil, frankincense, IV vitamin C, immune support, exercise, physical therapy, PEMF therapy, lymph massage, vibration therapy, alkaline diet.",
  },
  {
    key: "infection",
    name: "Infection (Cold, Flu, Pneumonia)",
    causes: "Flu shot, chemtrails, toxin overload, weakened immune system.",
    pharma: "Acetaminophen, ibuprofen, antibiotics, decongestants, expectorants, flu shot.",
    holistic:
      "Immune support, vitamin C, echinacea, astragalus, herbal tea, raw honey, licorice, adaptogens, steam, neti pot, eucalyptus oil, water, sunshine, fresh air, sound healing, organic diet, olive leaf, garlic, exercise, lymph stimulation.",
  },
  {
    key: "allergies",
    name: "Allergies & Sinusitis",
    causes: "Toxic environment, toxin overload, smoking, mold, dust, food additives, GMOs, cleaning products.",
    pharma: "Antihistamines, corticosteroids, decongestants.",
    holistic:
      "Exposure therapy, toxic-environment elimination, stress reduction, exercise, raw local honey, neti pot, organic diet, cannabis, CBD, ashwagandha.",
  },
  {
    key: "asthma",
    name: "Hyperimmune, Asthma, Food Allergy",
    causes: "Toxic environment, toxin overload, smoking, mold, dust, hypersensitivity (fabrics, cleaning products, detergents, EMFs), stress, herbicides, GMOs, pasteurized milk.",
    pharma: "Antihistamines, corticosteroids, inhalers.",
    holistic: "Exposure therapy, toxic-environment elimination, stress reduction, exercise, raw honey, neti pot, organic diet.",
  },
  {
    key: "diabetes",
    name: "Diabetes (Type I autoimmune, Type II metabolic)",
    causes: "Genetic and environmental factors, obesity, Standard American Diet, sugar.",
    pharma: "Insulin, metformin, endocrinology.",
    holistic:
      "Organic diet, keto, Whole30, low-glycemic diet, sugar elimination, detox, berberine, milk thistle, probiotics, apple cider vinegar, cinnamon, exercise (weight loss).",
  },
  {
    key: "gastro",
    name: "Gastrointestinal Disorders (IBS, IBD, Leaky Gut)",
    causes: "Standard American Diet, GMOs, food additives, stress, antibiotics, glyphosate.",
    pharma: "Corticosteroids, antihistamines, immunosuppressants.",
    holistic: "Organic diet, detox, water filtration, bone broth, probiotics, fasting, digestive enzymes, L-glutamine, collagen, aloe vera.",
  },
  {
    key: "lupus",
    name: "Lupus & Fibromyalgia",
    causes: "Chronic inflammation, age, obesity, injury, autoimmune reaction.",
    pharma: "NSAIDs, adalimumab, corticosteroids.",
    holistic: "Chronic-inflammation reduction, physical therapy, chiropractic, PEMF, Reiki, turmeric, cannabis, anti-inflammatory diet.",
  },
  {
    key: "thyroid",
    name: "Thyroid (Hypo / Hyper)",
    causes: "Chronic toxicity & inflammation, iodine deficiency, malnourishment.",
    pharma: "Endocrinology; hyper: radioactive iodine, surgery; hypo: levothyroxine.",
    holistic: "Detox, iodine, selenium, ashwagandha, organic diet, stress reduction, sea vegetables.",
  },
  {
    key: "addiction",
    name: "Addiction",
    causes: "Alcohol, tobacco, opioids, oxycodone, fentanyl, sugar, diet beverages, artificial flavor.",
    pharma: "Psychiatry, AA, methadone, liver-function support.",
    holistic: "Psychology, self-expression, hypnotherapy, ayahuasca, spiritual healing, releasing trauma, reprogramming, exercise, nutrition.",
  },
  {
    key: "depression",
    name: "Mental Disorders — Depression, Chronic Fatigue",
    causes: "Wage slavery, Big Pharma, vegan frankenfood, malnourishment.",
    pharma: "Psychiatry, antidepressants, SSRIs.",
    holistic: "Psychology, self-expression, releasing trauma, reprogramming, sunlight, exercise, nutrition, community, purpose.",
  },
  {
    key: "anxiety",
    name: "Anxiety & PTSD",
    causes: "Wage slavery, Big Pharma, Military Industrial Complex, trauma of war.",
    pharma: "Anti-anxiety: benzodiazepines, SSRIs, LSD.",
    holistic: "Psychology, self-expression, hypnotherapy, ayahuasca, spiritual healing, releasing trauma, reprogramming.",
  },
  {
    key: "adhd",
    name: "Neurobehavioral — ADHD, ADD",
    causes: "Standard American Diet, artificial food coloring, television, screens.",
    pharma: "Amphetamine, Adderall.",
    holistic: "Psychology, diet change, reduced screen time, nature, exercise, omega-3.",
  },
  {
    key: "gender",
    name: "Gender Dysphoria",
    causes: "Atrazine, estrogenic and endocrine-disrupting chemicals, non-native EMFs, trauma.",
    pharma: "Gender reassignment, hormone therapy.",
    holistic: "Psychology, self-expression, hypnotherapy, spiritual healing, releasing trauma, reprogramming.",
  },
  {
    key: "aids",
    name: "AIDS, Viral Infection, COVID-19",
    causes: "Infection, biological warfare, immune suppression.",
    pharma: "Antivirals, PrEP prophylaxis; COVID: flu protocol, remdesivir.",
    holistic: "Immune support, MMS, ozone, cannabis, anti-aging protocols, organic raw diet, vitamin C, detox.",
  },
  {
    key: "lyme",
    name: "Lyme (Bacterial Infection)",
    causes: "Infection, biological warfare.",
    pharma: "Antibiotics, IV antibiotics, stem cell transplant.",
    holistic: "Immune support, detox, organic diet, MMS (chlorine dioxide), cannabis, natural antibiotics, herbal supplements, coconut oil, raw meat, bioresonance, IV vitamin C, glutathione, sunlight.",
  },
  {
    key: "parasites",
    name: "Parasites & Malaria",
    causes: "Infection, mosquito bite, contaminated drinking water.",
    pharma: "Antiparasitic drugs, antimalarial drugs.",
    holistic: "MMS, wormwood, black walnut hull, clove, diatomaceous earth, lemon, blood electrification (micro-pulsing).",
  },
  {
    key: "physical",
    name: "Physical Injury",
    causes: "Accidents, physical trauma, sports injury.",
    pharma: "Surgery, hospitalization, opioids, emergency medicine, casts, wheelchair, crutches, artificial limbs.",
    holistic: "Physical therapy, chiropractic, electric muscle stimulation, kratom, MSM, massage, stem cell therapy.",
  },
  {
    key: "obesity",
    name: "Obesity",
    causes: "Standard American Diet, PUFA (vegetable oils), white carbs, sugar, diet products, fast food, sedentary lifestyle, wage slavery, depression.",
    pharma: "Gastric bypass, liposuction, weight-loss medications.",
    holistic: "Organic raw diet, exercise, physical therapy, vegan or whole-food diet, intermittent fasting.",
  },
  {
    key: "cosmetic",
    name: "Cosmetic (Skin & Hair)",
    causes: "Aging, UV damage, substance abuse.",
    pharma: "Plastic surgery, dermatology, sunscreen; hair: transplant, finasteride, minoxidil.",
    holistic: "Anti-aging, botanical gold, tepezcohuite, biohacking, essential oils, collagen, ASEA, antioxidants, bentonite clay, LED photon mask; hair: He Shou Wu, scalp massage, laser stimulation, biotin.",
  },
  {
    key: "genetic",
    name: "Genetic Disorders",
    causes: "DNA damage, ionizing radiation, carcinogens, EMFs, SSRIs, X-rays, CT scans, ultrasound, chemical exposure, random mutation.",
    pharma: "Management strategies, therapy, gene therapy, stem cell therapy.",
    holistic: "Prevention, clean environment, nutrition, detox before conception.",
  },
  {
    key: "radiation",
    name: "Radiation (Ionizing & Non-Ionizing)",
    causes: "Ionizing: X-rays, CT scans, fallout, radioactive contamination, nuclear power, air travel. Non-ionizing: non-native EMFs, power lines, cell towers, WiFi, Bluetooth, cellular networks (4G/5G), Internet of Things.",
    pharma: "Ionizing: decontamination, potassium iodide, DTPA, Prussian blue. Non-ionizing: denial of health dangers.",
    holistic: "Ionizing: natural chelation, chlorella. Non-ionizing: airplane mode, protective stones (shungite, tourmaline, hematite), Faraday case for phone, relocation (escape EMF sources), subterranean bunkers.",
  },
  {
    key: "bones",
    name: "Bones & Osteoporosis",
    causes: "Chronic toxicity, pasteurized milk, vegan frankenfood, malnourishment.",
    pharma: "Bisphosphonates, pasteurized milk.",
    holistic: "Bone broth, connective tissue, exercise, physical therapy, MSM, C60, vitamin K2, magnesium.",
  },
  {
    key: "dental",
    name: "Dental (Tooth Decay)",
    causes: "Sugar, white carbs, malnutrition.",
    pharma: "Mercury fillings, fluoride toothpaste.",
    holistic: "Brush & floss, SLS- and fluoride-free toothpaste, remineralization, organic diet, oil pulling.",
  },
  {
    key: "vision",
    name: "Vision (Near / Far-Sightedness)",
    causes: "Genetic and environmental factors, eye strain.",
    pharma: "Optometry, glasses, contacts, LASIK surgery.",
    holistic: "Vitamin A, stenopeic glasses, sun gazing, blue-light filtration, sananga, eye exercises.",
  },
  {
    key: "pregnancy",
    name: "Pregnancy & Birth",
    causes: "Approach to a natural process.",
    pharma: "Ultrasound, hospital delivery, C-section, newborn vaccines, circumcision, umbilical cutting, epidural.",
    holistic: "Pre-conception detox, home / water / hypno birth, placenta, breastmilk, unassisted birth.",
  },
  {
    key: "death",
    name: "Death",
    causes: "The end of life.",
    pharma: "Hospice, incineration, death tax, embalming, euthanasia, organ donor.",
    holistic: "Ascension, decomposition, reincarnation, karma, return to Source.",
  },
];
