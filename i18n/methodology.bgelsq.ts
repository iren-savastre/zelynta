// Bulgara, greaca si albaneza pentru pagina „Cum se calculeaza scorul".
// Fisierul principal (methodology.ts) a ramas pe 9 limbi: bg si el vedeau
// pagina in engleza, desi aplicatia e tradusa in 11 limbi.
// Se imbina in methodology.ts, inainte de pickM().
export const methodologyBgElSq: Record<string, { bg: string; el: string; sq: string }> = {
  title: {
    bg: "Как се изчислява оценката",
    el: "Πώς υπολογίζεται η βαθμολογία",
    sq: "Si llogaritet vlerësimi",
  },
  intro: {
    bg: "Оценката на Zelynta (0–100) е прозрачна: всяка отнета точка има причина, която виждате в приложението под „Защо тази оценка?“. Изгражда се от два критерия плюс правило за честност на данните.",
    el: "Η βαθμολογία του Zelynta (0–100) είναι διαφανής: κάθε πόντος που αφαιρείται έχει έναν λόγο που βλέπετε στην εφαρμογή κάτω από «Γιατί αυτή η βαθμολογία;». Χτίζεται από δύο κριτήρια, συν έναν κανόνα ειλικρίνειας των δεδομένων.",
    sq: "Vlerësimi i Zelynta-s (0–100) është i transparent: çdo pikë e zbritur ka një arsye që e sheh në aplikacion te „Pse ky vlerësim?”. Ndërtohet mbi dy kritere, plus një rregull ndershmërie për të dhënat.",
  },
  nutriTitle: {
    bg: "Хранително качество",
    el: "Διατροφική ποιότητα",
    sq: "Cilësia ushqyese",
  },
  nutriText: {
    bg: "Започваме от 100 точки и отнемаме според количествата на 100 г: захар, наситени мазнини, енергия (калории) и сол — прагове, вдъхновени от метода Nutri-Score, разработен в рамките на Националната програма за хранене и здраве на Франция и подкрепен от Международната агенция за изследване на рака (IARC), агенция на СЗО. Фибрите и белтъчините се отчитат обратно: колкото повече, толкова по-добре. При напитките захарта тежи повече.",
    el: "Ξεκινάμε από 100 πόντους και αφαιρούμε με βάση τις ποσότητες ανά 100 g: ζάχαρη, κορεσμένα λιπαρά, ενέργεια (θερμίδες) και αλάτι — όρια εμπνευσμένα από τη μέθοδο Nutri-Score, που αναπτύχθηκε στο πλαίσιο του Εθνικού Προγράμματος Διατροφής και Υγείας της Γαλλίας και υποστηρίζεται από τον Διεθνή Οργανισμό Έρευνας για τον Καρκίνο (IARC), οργανισμό του ΠΟΥ. Οι φυτικές ίνες και οι πρωτεΐνες μετρούν αντίστροφα: όσο περισσότερες, τόσο καλύτερα. Στα ποτά, η ζάχαρη βαραίνει περισσότερο.",
    sq: "Nisim nga 100 pikë dhe zbresim sipas sasive për 100 g: sheqer, yndyrna të ngopura, energji (kalori) dhe kripë — pragje të frymëzuara nga metoda Nutri-Score, e zhvilluar brenda Programit Kombëtar të Ushqyerjes dhe Shëndetit të Francës dhe e mbështetur nga Agjencia Ndërkombëtare për Kërkimin e Kancerit (IARC), agjenci e OBSH-së. Fibrat dhe proteinat numërohen në të kundërt: sa më shumë, aq më mirë. Te pijet, sheqeri peshon më shumë.",
  },
  addTitle: {
    bg: "Добавки",
    el: "Πρόσθετα",
    sq: "Aditivët",
  },
  addText: {
    bg: "Всяка открита добавка получава ниво на риск въз основа на оценките на европейските органи и признати научни изследвания. Рисковите добавки свалят оценката силно: добавка с „висок риск“ ограничава оценката до 50, а такава „с внимание“ — до 65. Продукт с рискови добавки не може да изглежда здравословен, независимо от останалия състав. Докоснете добавка в анализа, за да прочетете какво представлява, къде отива в тялото и какво може да засегне.",
    el: "Κάθε πρόσθετο που εντοπίζεται παίρνει ένα επίπεδο κινδύνου με βάση τις αξιολογήσεις των ευρωπαϊκών αρχών και αναγνωρισμένες επιστημονικές μελέτες. Τα επικίνδυνα πρόσθετα ρίχνουν πολύ τη βαθμολογία: ένα πρόσθετο «υψηλού κινδύνου» περιορίζει τη βαθμολογία στο 50 και ένα «με προσοχή» στο 65 — ένα προϊόν με επικίνδυνα πρόσθετα δεν μπορεί να φαίνεται υγιεινό, ό,τι κι αν είναι η υπόλοιπη σύνθεση. Πατήστε ένα πρόσθετο στην ανάλυση για να διαβάσετε τι είναι, πού πηγαίνει στο σώμα και τι μπορεί να επηρεάσει.",
    sq: "Çdo aditiv i gjetur merr një nivel rreziku bazuar në vlerësimet e autoriteteve evropiane dhe në studime shkencore të njohura. Aditivët e rrezikshëm e ulin fort vlerësimin: një aditiv me „rrezik të lartë” e kufizon vlerësimin në 50, ndërsa një me „kujdes” në 65 — një produkt me aditivë të rrezikshëm nuk mund të duket i shëndetshëm, sido që të jetë pjesa tjetër e përbërjes. Prek një aditiv në analizë për të lexuar çfarë është, ku shkon në trup dhe çfarë mund të prekë.",
  },
  levelsTitle: {
    bg: "Добавките се разделят в 4 категории на риск:",
    el: "Τα πρόσθετα κατατάσσονται σε 4 κατηγορίες κινδύνου:",
    sq: "Aditivët ndahen në 4 kategori rreziku:",
  },
  authTitle: {
    bg: "Органи и научни източници",
    el: "Αρχές και επιστημονικές πηγές",
    sq: "Autoritete dhe burime shkencore",
  },
  efsaDesc: {
    bg: "Европейски орган за безопасност на храните — оценява всяка добавка, разрешена в ЕС, и определя допустимия дневен прием",
    el: "Ευρωπαϊκή Αρχή για την Ασφάλεια των Τροφίμων — αξιολογεί κάθε πρόσθετο που επιτρέπεται στην ΕΕ και ορίζει αποδεκτές ημερήσιες προσλήψεις",
    sq: "Autoriteti Evropian për Sigurinë Ushqimore — vlerëson çdo aditiv të autorizuar në BE dhe cakton marrjet ditore të pranueshme",
  },
  iarcDesc: {
    bg: "Международна агенция за изследване на рака (агенция на СЗО) — класифицира веществата според канцерогенния им потенциал",
    el: "Διεθνής Οργανισμός Έρευνας για τον Καρκίνο (οργανισμός του ΠΟΥ) — κατατάσσει τις ουσίες ανάλογα με την καρκινογόνο δράση τους",
    sq: "Agjencia Ndërkombëtare për Kërkimin e Kancerit (agjenci e OBSH-së) — klasifikon substancat sipas potencialit kancerogjen",
  },
  euDesc: {
    bg: "Регламенти на ЕС за хранителните добавки — официалният списък на разрешените добавки и границите им на употреба",
    el: "Κανονισμοί της ΕΕ για τα πρόσθετα τροφίμων — ο επίσημος κατάλογος των εγκεκριμένων προσθέτων και τα όρια χρήσης τους",
    sq: "Rregulloret e BE-së për aditivët ushqimorë — lista zyrtare e aditivëve të autorizuar dhe kufijtë e përdorimit",
  },
  studiesDesc: {
    bg: "Признати европейски научни изследвания с рецензия — използвани там, където органите още не са се произнесли",
    el: "Αναγνωρισμένες ευρωπαϊκές επιστημονικές μελέτες με κριτική αξιολόγηση — χρησιμοποιούνται όπου οι αρχές δεν έχουν ακόμη αποφανθεί",
    sq: "Studime shkencore evropiane të njohura, me recensë — përdoren aty ku autoritetet ende nuk janë shprehur",
  },
  honestyTitle: {
    bg: "Честност на данните",
    el: "Ειλικρίνεια των δεδομένων",
    sq: "Ndershmëri e të dhënave",
  },
  honestyText: {
    bg: "Когато продукт няма хранителни данни (например при разчитане на етикета от снимка), оценката се наказва и ограничава — не твърдим, че продукт е здравословен без доказателства. Данните, проверени от общността (Open Food Facts), имат предимство пред текста, разчетен с камерата, а добавките, открити върху физическия етикет, се добавят към анализа, а не го заместват.",
    el: "Όταν ένα προϊόν δεν έχει διατροφικά δεδομένα (για παράδειγμα κατά την ανάγνωση της ετικέτας από φωτογραφία), η βαθμολογία ποινικοποιείται και περιορίζεται — δεν ισχυριζόμαστε ότι ένα προϊόν είναι υγιεινό χωρίς αποδείξεις. Τα δεδομένα που έχουν επαληθευτεί από την κοινότητα (Open Food Facts) υπερισχύουν του κειμένου που διαβάζεται από την κάμερα, ενώ τα πρόσθετα που βρίσκονται στη φυσική ετικέτα προστίθενται στην ανάλυση, δεν την αντικαθιστούν.",
    sq: "Kur një produkt nuk ka të dhëna ushqyese (për shembull kur etiketa lexohet nga një fotografi), vlerësimi penalizohet dhe kufizohet — nuk pretendojmë se një produkt është i shëndetshëm pa prova. Të dhënat e verifikuara nga komuniteti (Open Food Facts) kanë përparësi ndaj tekstit të lexuar me kamerë, ndërsa aditivët e gjetur në etiketën fizike i shtohen analizës, nuk e zëvendësojnë atë.",
  },
  opinion: {
    bg: "Оценката е мнение, формирано от Zelynta въз основа на публично достъпни данни, и е само с информативна цел — тя не замества медицински съвет.",
    el: "Η βαθμολογία είναι μια άποψη που διαμορφώνει το Zelynta από δημόσια διαθέσιμα δεδομένα και έχει μόνο ενημερωτικό χαρακτήρα — δεν αντικαθιστά την ιατρική συμβουλή.",
    sq: "Vlerësimi është një mendim i formuar nga Zelynta mbi bazën e të dhënave publike dhe ka vetëm karakter informues — nuk zëvendëson këshillën mjekësore.",
  },
  sciSources: {
    bg: "Научни източници",
    el: "Επιστημονικές πηγές",
    sq: "Burime shkencore",
  },
};
