// Bulgara, greaca si albaneza pentru sfaturile pe categorii de produs.
// Fisierul principal (advice.ts) a ramas pe 9 limbi, deci utilizatorii bg/el
// vedeau sectiunea de recomandari in engleza, desi restul aplicatiei era
// tradus. Se imbina in advice.ts.
type T3 = { bg: string; el: string; sq: string };

export const adviceLabelsBgElSq: Record<string, T3> = {
  title: { bg: "Препоръки", el: "Συστάσεις", sq: "Rekomandime" },
  benefits: { bg: "Ползи", el: "Οφέλη", sq: "Përfitime" },
  when: { bg: "Кога", el: "Πότε", sq: "Kur" },
  how: { bg: "Как", el: "Πώς", sq: "Si" },
  who: { bg: "За кого", el: "Για ποιους", sq: "Për kë" },
  children: { bg: "Деца", el: "Παιδιά", sq: "Fëmijët" },
  childrenWarn: { bg: "Внимание за деца", el: "Προσοχή για παιδιά", sq: "Kujdes për fëmijët" },
  childrenBad: {
    bg: "Слаба оценка (твърде много добавки, сол, мазнини или захар). Не се препоръчва за деца.",
    el: "Χαμηλή βαθμολογία (υπερβολικά πρόσθετα, αλάτι, λιπαρά ή ζάχαρη). Δεν συνιστάται για παιδιά.",
    sq: "Vlerësim i dobët (tepër aditivë, kripë, yndyrna ose sheqer). Nuk rekomandohet për fëmijët.",
  },
  childrenModerate: {
    bg: "Средна оценка — само понякога и в малки количества за деца.",
    el: "Μέτρια βαθμολογία — μόνο περιστασιακά και σε μικρές ποσότητες για παιδιά.",
    sq: "Vlerësim mesatar — vetëm herë pas here dhe në sasi të vogla për fëmijët.",
  },
};

export const adviceBgElSq: Record<string, Record<string, T3>> = {
  salt: {
    benefits: {
      bg: "Натрият и хлорът помагат на водния баланс в тялото и на работата на нервите и мускулите. Солта нигари (магнезиев хлорид) добавя и магнезий, полезен за мускулите и костите.",
      el: "Το νάτριο και το χλώριο βοηθούν στην ισορροπία του νερού στο σώμα και στη λειτουργία των νεύρων και των μυών. Το αλάτι νιγκάρι (χλωριούχο μαγνήσιο) προσφέρει επιπλέον μαγνήσιο, χρήσιμο για μυς και οστά.",
      sq: "Natriumi dhe klori ndihmojnë ekuilibrin e ujit në trup dhe punën e nervave e të muskujve. Kripa nigari (klorur magnezi) sjell edhe magnez, të dobishëm për muskujt dhe kockat.",
    },
    when: {
      bg: "В малки количества, при готвене. Нигари се използва най-вече за подсирване на тофу. СЗО препоръчва под 5 г сол на ден (около една чаена лъжичка).",
      el: "Σε μικρές ποσότητες, στο μαγείρεμα. Το νιγκάρι χρησιμοποιείται κυρίως για να πήξει το τόφου. Ο ΠΟΥ συνιστά κάτω από 5 g αλάτι την ημέρα (περίπου ένα κουταλάκι).",
      sq: "Në sasi të vogla, gjatë gatimit. Nigari përdoret kryesisht për të mpiksur tofunë. OBSH rekomandon nën 5 g kripë në ditë (rreth një lugë çaji).",
    },
    how: {
      bg: "Добавяйте малко, към края на готвенето. Твърде многото сол повишава кръвното налягане. Нигари се разтваря в топла вода и се разбърква в соевото мляко.",
      el: "Προσθέστε λίγο, προς το τέλος του μαγειρέματος. Το πολύ αλάτι ανεβάζει την πίεση. Το νιγκάρι διαλύεται σε ζεστό νερό και ανακατεύεται στο γάλα σόγιας.",
      sq: "Shto pak, nga fundi i gatimit. Kripa e tepërt ngre tensionin e gjakut. Nigari tretet në ujë të ngrohtë dhe përzihet në qumështin e sojës.",
    },
    who: {
      bg: "Хората с високо кръвно налягане или бъбречни проблеми трябва да я ограничат. Нигари в излишък има разслабващ ефект (заради магнезия).",
      el: "Όσοι έχουν υψηλή πίεση ή προβλήματα νεφρών πρέπει να το περιορίσουν. Το νιγκάρι σε υπερβολή έχει καθαρτική δράση (λόγω του μαγνησίου).",
      sq: "Personat me tension të lartë ose me probleme të veshkave duhet ta kufizojnë. Nigari i tepërt ka efekt laksativ (nga magnezi).",
    },
    children: {
      bg: "На бебета под 1 година НЕ се добавя сол — бъбреците им са твърде незрели. Малките деца имат нужда от много по-малко сол от възрастните.",
      el: "Στα μωρά κάτω του 1 έτους ΔΕΝ προστίθεται αλάτι — τα νεφρά τους είναι ακόμη ανώριμα. Τα μικρά παιδιά χρειάζονται πολύ λιγότερο αλάτι από τους ενήλικες.",
      sq: "Foshnjave nën 1 vjeç NUK u shtohet kripë — veshkat e tyre janë ende të papjekura. Fëmijët e vegjël kanë nevojë për shumë më pak kripë se të rriturit.",
    },
  },
  water: {
    benefits: {
      bg: "Хидратира, подпомага храносмилането, кръвообращението и телесната температура. Минералните води могат да доставят калций и магнезий.",
      el: "Ενυδατώνει, υποστηρίζει την πέψη, την κυκλοφορία και τη θερμοκρασία του σώματος. Τα μεταλλικά νερά μπορούν να προσφέρουν ασβέστιο και μαγνήσιο.",
      sq: "Hidraton, ndihmon tretjen, qarkullimin dhe temperaturën e trupit. Ujërat minerale mund të japin kalcium dhe magnez.",
    },
    when: {
      bg: "През целия ден. Около 1,5–2 литра дневно за възрастен, повече при горещини или физическо натоварване.",
      el: "Καθ' όλη τη διάρκεια της ημέρας. Περίπου 1,5–2 λίτρα ημερησίως για έναν ενήλικα, περισσότερο σε ζέστη ή άσκηση.",
      sq: "Gjatë gjithë ditës. Rreth 1,5–2 litra në ditë për një të rritur, më shumë në vapë ose gjatë stërvitjes.",
    },
    how: {
      bg: "Пийте редовно, на малки глътки, не само когато сте много жадни. Предпочитайте водата пред подсладените напитки.",
      el: "Πίνετε τακτικά, σε μικρές γουλιές, όχι μόνο όταν διψάτε πολύ. Προτιμήστε το νερό αντί για ζαχαρούχα ποτά.",
      sq: "Pi rregullisht, me gllënjka të vogla, jo vetëm kur ke shumë etje. Parapëlqe ujin në vend të pijeve të ëmbla.",
    },
    who: {
      bg: "Подходяща за всички. При води с много натрий, внимание за хората с високо кръвно налягане.",
      el: "Κατάλληλο για όλους. Στα νερά με πολύ νάτριο, προσοχή αν έχετε υψηλή πίεση.",
      sq: "I përshtatshëm për të gjithë. Te ujërat me shumë natrium, kujdes nëse ke tension të lartë.",
    },
    children: {
      bg: "Най-добрата напитка за деца. Кърмените бебета не се нуждаят от допълнителна вода преди 6-месечна възраст.",
      el: "Το καλύτερο ρόφημα για τα παιδιά. Τα θηλάζοντα μωρά δεν χρειάζονται επιπλέον νερό πριν τους 6 μήνες.",
      sq: "Pija më e mirë për fëmijët. Foshnjat me gji nuk kanë nevojë për ujë shtesë para 6 muajsh.",
    },
  },
  soda: {
    benefits: {
      bg: "Малко хранителни ползи — по същество вода със захар и/или подсладители и въглероден диоксид.",
      el: "Λίγα διατροφικά οφέλη — ουσιαστικά νερό με ζάχαρη ή/και γλυκαντικά και διοξείδιο του άνθρακα.",
      sq: "Pak përfitime ushqyese — në thelb ujë me sheqer dhe/ose ëmbëlsues dhe dioksid karboni.",
    },
    when: {
      bg: "Само понякога. Сладките газирани напитки са основен източник на скрита захар.",
      el: "Μόνο περιστασιακά. Τα ζαχαρούχα αναψυκτικά είναι βασική πηγή κρυφής ζάχαρης.",
      sq: "Vetëm herë pas here. Pijet e gazuara me sheqer janë burim kryesor i sheqerit të fshehur.",
    },
    how: {
      bg: "Заменете ги с вода, газирана вода с лимон или неподсладен чай. Версиите „зеро“ нямат захар, но съдържат подсладители.",
      el: "Αντικαταστήστε τα με νερό, ανθρακούχο νερό με λεμόνι ή ανγλύκαντο τσάι. Οι εκδοχές «zero» δεν έχουν ζάχαρη αλλά περιέχουν γλυκαντικά.",
      sq: "Zëvendësoji me ujë, ujë të gazuar me limon ose çaj pa sheqer. Variantet „zero” nuk kanë sheqer, por përmbajnë ëmbëlsues.",
    },
    who: {
      bg: "Най-добре да се избягват при диабет и при следене на теглото. Кофеинът в някои напитки не е подходящ вечер.",
      el: "Καλύτερα να αποφεύγονται σε διαβήτη και όταν προσέχετε το βάρος. Η καφεΐνη σε ορισμένα ποτά δεν είναι ιδανική το βράδυ.",
      sq: "Më mirë të shmangen në diabet dhe kur ke kujdes për peshën. Kafeina në disa pije nuk është e përshtatshme në mbrëmje.",
    },
    children: {
      bg: "Не се препоръчват за деца: твърде много захар, риск от затлъстяване и кариеси. Кофеинът не е подходящ за малките.",
      el: "Δεν συνιστώνται για παιδιά: υπερβολική ζάχαρη, κίνδυνος παχυσαρκίας και τερηδόνας. Η καφεΐνη δεν είναι κατάλληλη για μικρά παιδιά.",
      sq: "Nuk rekomandohen për fëmijët: tepër sheqer, rrezik mbipeshe dhe prishjeje dhëmbësh. Kafeina nuk u shkon të vegjëlve.",
    },
  },
  juice: {
    benefits: {
      bg: "100% плодовите сокове дават витамини (например витамин C). Все пак съдържат естествената захар на плода, без фибрите на целия плод.",
      el: "Οι χυμοί 100% φρούτων δίνουν βιταμίνες (π.χ. βιταμίνη C). Ωστόσο περιέχουν τη φυσική ζάχαρη του φρούτου χωρίς τις φυτικές ίνες του ολόκληρου φρούτου.",
      sq: "Lëngjet 100% frutash japin vitamina (p.sh. vitaminë C). Megjithatë përmbajnë sheqerin natyral të frutit, pa fibrat e frutit të plotë.",
    },
    when: {
      bg: "С мярка, най-много една малка чаша на ден. Целият плод почти винаги е по-добър избор.",
      el: "Με μέτρο, το πολύ ένα μικρό ποτήρι την ημέρα. Το ολόκληρο φρούτο είναι σχεδόν πάντα καλύτερη επιλογή.",
      sq: "Me masë, më së shumti një gotë e vogël në ditë. Fruti i plotë është pothuajse gjithmonë zgjedhje më e mirë.",
    },
    how: {
      bg: "Избирайте „100% сок“, без добавена захар. За децата разреждайте с вода. Нектарите имат добавена захар.",
      el: "Επιλέξτε «100% χυμό», χωρίς πρόσθετη ζάχαρη. Για τα παιδιά αραιώστε με νερό. Τα νέκταρ έχουν πρόσθετη ζάχαρη.",
      sq: "Zgjidh „lëng 100%”, pa sheqer të shtuar. Për fëmijët holloje me ujë. Nektarët kanë sheqer të shtuar.",
    },
    who: {
      bg: "Внимание при диабет. Следящите теглото си да предпочитат целия плод.",
      el: "Προσοχή σε διαβήτη. Όσοι προσέχουν το βάρος τους ας προτιμούν το ολόκληρο φρούτο.",
      sq: "Kujdes në diabet. Ata që kujdesen për peshën le të parapëlqejnë frutin e plotë.",
    },
    children: {
      bg: "Под 1 година избягвайте сок. След това само разреден и от време на време — твърде многото вреди на зъбите и апетита.",
      el: "Κάτω του 1 έτους αποφύγετε τον χυμό. Μετά, μόνο αραιωμένο και περιστασιακά — η υπερβολή βλάπτει δόντια και όρεξη.",
      sq: "Nën 1 vjeç shmang lëngun. Më pas, vetëm i holluar dhe herë pas here — tepria dëmton dhëmbët dhe oreksin.",
    },
  },
  milk: {
    benefits: {
      bg: "Добър източник на калций, белтъчини и витамин B12, важни за костите и мускулите.",
      el: "Καλή πηγή ασβεστίου, πρωτεΐνης και βιταμίνης B12, σημαντικών για οστά και μυς.",
      sq: "Burim i mirë kalciumi, proteinash dhe vitamine B12, të rëndësishme për kockat dhe muskujt.",
    },
    when: {
      bg: "Всеки ден, като част от балансирано хранене. На закуска или като междинно хранене.",
      el: "Καθημερινά, ως μέρος μιας ισορροπημένης διατροφής. Στο πρωινό ή ως σνακ.",
      sq: "Çdo ditë, si pjesë e një ushqyerjeje të ekuilibruar. Në mëngjes ose si meze.",
    },
    how: {
      bg: "Полуобезмаслените версии намаляват наситените мазнини. Растителните напитки са алтернатива при непоносимост (изберете обогатени с калций).",
      el: "Οι ημιαποβουτυρωμένες εκδοχές μειώνουν τα κορεσμένα λιπαρά. Τα φυτικά ροφήματα είναι εναλλακτική για όσους έχουν δυσανεξία (επιλέξτε εμπλουτισμένα με ασβέστιο).",
      sq: "Variantet gjysmë të skremuara ulin yndyrnat e ngopura. Pijet bimore janë alternativë për ata me intolerancë (zgjidh ato të pasuruara me kalcium).",
    },
    who: {
      bg: "Хората с лактозна непоносимост може да изпитат дискомфорт — съществуват версии без лактоза.",
      el: "Όσοι έχουν δυσανεξία στη λακτόζη μπορεί να νιώσουν ενόχληση — υπάρχουν εκδοχές χωρίς λακτόζη.",
      sq: "Personat me intolerancë ndaj laktozës mund të ndiejnë siklet — ka variante pa laktozë.",
    },
    children: {
      bg: "Много полезно за растящите кости. Бебетата под 1 година се нуждаят от кърма или адаптирано мляко, не от обикновено краве мляко.",
      el: "Πολύ χρήσιμο για τα οστά που αναπτύσσονται. Τα μωρά κάτω του 1 έτους χρειάζονται μητρικό γάλα ή φόρμουλα, όχι αγελαδινό γάλα.",
      sq: "Shumë i dobishëm për kockat në rritje. Foshnjat nën 1 vjeç kanë nevojë për qumësht gjiri ose formulë, jo për qumësht lope të zakonshëm.",
    },
  },
  yogurt: {
    benefits: {
      bg: "Дава калций, белтъчини и полезни бактерии (пробиотици), които помагат на храносмилането.",
      el: "Προσφέρει ασβέστιο, πρωτεΐνη και ωφέλιμα βακτήρια (προβιοτικά) που βοηθούν την πέψη.",
      sq: "Jep kalcium, proteina dhe baktere të dobishme (probiotikë) që ndihmojnë tretjen.",
    },
    when: {
      bg: "Всеки ден, на закуска или като здравословна закуска между храненията.",
      el: "Καθημερινά, στο πρωινό ή ως υγιεινό σνακ.",
      sq: "Çdo ditë, në mëngjes ose si meze e shëndetshme.",
    },
    how: {
      bg: "Изберете натурално кисело мляко без добавена захар и добавете плодове сами. Плодовите кисели млека често имат много захар.",
      el: "Επιλέξτε απλό γιαούρτι χωρίς πρόσθετη ζάχαρη και προσθέστε μόνοι σας φρούτα. Τα γιαούρτια με φρούτα έχουν συχνά πολλή ζάχαρη.",
      sq: "Zgjidh kos të thjeshtë pa sheqer të shtuar dhe shto vetë fruta. Kosi me fruta shpesh ka shumë sheqer.",
    },
    who: {
      bg: "Понася се добре от мнозина с лактозна непоносимост. Гръцките видове имат повече белтъчини.",
      el: "Γίνεται καλά ανεκτό από πολλούς με δυσανεξία στη λακτόζη. Οι τύποι στραγγιστού έχουν περισσότερη πρωτεΐνη.",
      sq: "Tolerohet mirë nga shumë veta me intolerancë ndaj laktozës. Llojet greke kanë më shumë proteina.",
    },
    children: {
      bg: "Отлично за деца. За бебета изберете натурално, пълномаслено кисело мляко без захар.",
      el: "Εξαιρετικό για παιδιά. Για μωρά επιλέξτε απλό, πλήρες γιαούρτι χωρίς ζάχαρη.",
      sq: "I shkëlqyer për fëmijët. Për foshnjat zgjidh kos të thjeshtë, me yndyrë të plotë, pa sheqer.",
    },
  },
  cheese: {
    benefits: {
      bg: "Богато на калций и белтъчини. Но концентрира и наситени мазнини и сол.",
      el: "Πλούσιο σε ασβέστιο και πρωτεΐνη. Συγκεντρώνει όμως και κορεσμένα λιπαρά και αλάτι.",
      sq: "I pasur me kalcium dhe proteina. Por përqendron edhe yndyrna të ngopura dhe kripë.",
    },
    when: {
      bg: "На малки порции, като част от храненията. Не в големи количества всеки ден.",
      el: "Σε μικρές μερίδες, ως μέρος των γευμάτων. Όχι σε μεγάλες ποσότητες κάθε μέρα.",
      sq: "Në racione të vogla, si pjesë e vakteve. Jo në sasi të mëdha çdo ditë.",
    },
    how: {
      bg: "Една порция е колкото два пръста. Съчетавайте със зеленчуци. Твърдите сирена са по-солени.",
      el: "Μια μερίδα είναι περίπου όσο δύο δάχτυλα. Συνδυάστε με λαχανικά. Τα σκληρά τυριά είναι πιο αλμυρά.",
      sq: "Një racion është sa dy gishta. Shoqëroje me perime. Djathërat e fortë janë më të kripur.",
    },
    who: {
      bg: "Хората с високо кръвно налягане да следят солта. Пастьоризираното сирене е по-безопасно.",
      el: "Όσοι έχουν υψηλή πίεση ας προσέχουν το αλάτι. Το παστεριωμένο τυρί είναι ασφαλέστερο.",
      sq: "Personat me tension të lartë le të kenë kujdes me kripën. Djathi i pasterizuar është më i sigurt.",
    },
    children: {
      bg: "Добър източник на калций. За малки деца и бременни избягвайте сирена от непастьоризирано мляко.",
      el: "Καλή πηγή ασβεστίου. Για μικρά παιδιά και εγκύους αποφύγετε τυριά από μη παστεριωμένο γάλα.",
      sq: "Burim i mirë kalciumi. Për fëmijët e vegjël dhe gratë shtatzëna shmang djathërat nga qumështi i papasterizuar.",
    },
  },
  bread: {
    benefits: {
      bg: "Източник на енергия (въглехидрати). Пълнозърнестият хляб дава и фибри и витамини от група B.",
      el: "Πηγή ενέργειας (υδατάνθρακες). Το ολικής άλεσης ψωμί προσφέρει επίσης φυτικές ίνες και βιταμίνες B.",
      sq: "Burim energjie (karbohidrate). Buka integrale jep edhe fibra dhe vitamina të grupit B.",
    },
    when: {
      bg: "Всеки ден, с храненията. При следене на теглото предпочитайте умерени количества.",
      el: "Καθημερινά, με τα γεύματα. Αν προσέχετε το βάρος, προτιμήστε μέτριες ποσότητες.",
      sq: "Çdo ditë, me vaktet. Nëse ke kujdes për peshën, parapëlqe sasi të moderuara.",
    },
    how: {
      bg: "Изберете пълнозърнест вместо бял хляб — засища повече и е по-щадящ за кръвната захар.",
      el: "Επιλέξτε ολικής άλεσης αντί για λευκό ψωμί — χορταίνει περισσότερο και είναι ηπιότερο για το σάκχαρο.",
      sq: "Zgjidh bukën integrale në vend të asaj të bardhë — ngop më shumë dhe është më e butë për sheqerin në gjak.",
    },
    who: {
      bg: "Хората с целиакия или чувствителност към глутен трябва да избират безглутенови варианти.",
      el: "Όσοι έχουν κοιλιοκάκη ή ευαισθησία στη γλουτένη πρέπει να επιλέγουν προϊόντα χωρίς γλουτένη.",
      sq: "Personat me celiaki ose ndjeshmëri ndaj glutenit duhet të zgjedhin variante pa gluten.",
    },
    children: {
      bg: "Подходящ за деца. За малките пълнозърнестият е по-хранителен от белия хляб.",
      el: "Κατάλληλο για παιδιά. Για τα μικρά, το ολικής άλεσης είναι πιο θρεπτικό από το λευκό ψωμί.",
      sq: "E përshtatshme për fëmijët. Për të vegjlit, buka integrale është më ushqyese se ajo e bardhë.",
    },
  },
  cereals: {
    benefits: {
      bg: "Пълнозърнестите храни (овес, обикновено мюсли) дават фибри и трайна енергия.",
      el: "Τα δημητριακά ολικής άλεσης (βρώμη, απλό μούσλι) δίνουν φυτικές ίνες και διαρκή ενέργεια.",
      sq: "Drithërat integrale (tërshëra, myslit i thjeshtë) japin fibra dhe energji të qëndrueshme.",
    },
    when: {
      bg: "На закуска. Пълнозърнестите засищат за по-дълго.",
      el: "Στο πρωινό. Τα ολικής άλεσης χορταίνουν για περισσότερη ώρα.",
      sq: "Në mëngjes. Ato integrale ngopin më gjatë.",
    },
    how: {
      bg: "Проверете захарта на етикета — много „детски“ зърнени закуски са много сладки. Обикновеният овес е най-добрият избор.",
      el: "Ελέγξτε τη ζάχαρη στην ετικέτα — πολλά «παιδικά» δημητριακά είναι πολύ γλυκά. Η απλή βρώμη είναι η καλύτερη επιλογή.",
      sq: "Kontrollo sheqerin në etiketë — shumë drithëra „për fëmijë” janë tepër të ëmbla. Tërshëra e thjeshtë është zgjedhja më e mirë.",
    },
    who: {
      bg: "Внимание със захарта при диабет. Има и безглутенови варианти за чувствителните.",
      el: "Προσοχή στη ζάχαρη σε διαβήτη. Υπάρχουν και επιλογές χωρίς γλουτένη για τους ευαίσθητους.",
      sq: "Kujdes me sheqerin në diabet. Ka edhe variante pa gluten për të ndjeshmit.",
    },
    children: {
      bg: "Избирайте зърнени закуски с малко захар. Ярко оцветените и много сладки са по-близо до десерт.",
      el: "Επιλέξτε δημητριακά με λίγη ζάχαρη. Τα έντονα χρωματιστά και πολύ γλυκά μοιάζουν περισσότερο με επιδόρπιο.",
      sq: "Zgjidh drithëra me pak sheqer. Ato me ngjyra të forta dhe shumë të ëmbla i ngjajnë më shumë një ëmbëlsire.",
    },
  },
  oil: {
    benefits: {
      bg: "Растителните масла (особено зехтинът) дават полезни мазнини, добри за сърцето.",
      el: "Τα φυτικά έλαια (ιδίως το ελαιόλαδο) προσφέρουν καλά λιπαρά, ωφέλιμα για την καρδιά.",
      sq: "Vajrat bimore (sidomos ai i ullirit) japin yndyrna të shëndetshme, të mira për zemrën.",
    },
    when: {
      bg: "Всеки ден, но в малки количества — маслото е много калорично.",
      el: "Καθημερινά, αλλά σε μικρές ποσότητες — το λάδι είναι πολύ θερμιδικό.",
      sq: "Çdo ditë, por në sasi të vogla — vaji ka shumë kalori.",
    },
    how: {
      bg: "Екстра върджин зехтинът е идеален студен (салати). За пържене изберете масла, стабилни при нагряване.",
      el: "Το εξαιρετικό παρθένο ελαιόλαδο είναι ιδανικό ωμό (σαλάτες). Για τηγάνισμα επιλέξτε έλαια σταθερά στη θερμότητα.",
      sq: "Vaji i ullirit ekstra i virgjër është ideal i ftohtë (sallata). Për skuqje zgjidh vajra të qëndrueshëm ndaj nxehtësisë.",
    },
    who: {
      bg: "Подходящо за всички с мярка. Избягвайте да претопляте многократно едно и също масло.",
      el: "Κατάλληλο για όλους με μέτρο. Αποφύγετε να ξαναζεσταίνετε επανειλημμένα το ίδιο λάδι.",
      sq: "I përshtatshëm për të gjithë me masë. Shmang ringrohjen e përsëritur të të njëjtit vaj.",
    },
    children: {
      bg: "Важно за развитието на децата. Използвайте малки количества при готвене.",
      el: "Σημαντικό για την ανάπτυξη των παιδιών. Χρησιμοποιήστε μικρές ποσότητες στο μαγείρεμα.",
      sq: "I rëndësishëm për zhvillimin e fëmijëve. Përdor sasi të vogla në gatim.",
    },
  },
  meat: {
    benefits: {
      bg: "Източник на качествен белтък, желязо и витамин B12, полезни за кръвта и мускулите.",
      el: "Πηγή ποιοτικής πρωτεΐνης, σιδήρου και βιταμίνης B12, χρήσιμων για το αίμα και τους μυς.",
      sq: "Burim proteinash cilësore, hekuri dhe vitamine B12, të dobishme për gjakun dhe muskujt.",
    },
    when: {
      bg: "Няколко пъти седмично. Бялото месо (пиле, пуйка) е по-постно от червеното.",
      el: "Λίγες φορές την εβδομάδα. Το λευκό κρέας (κοτόπουλο, γαλοπούλα) είναι πιο άπαχο από το κόκκινο.",
      sq: "Disa herë në javë. Mishi i bardhë (pulë, gjeldeti) është më pak i yndyrshëm se ai i kuq.",
    },
    how: {
      bg: "Гответе месото добре — на скара, печено или варено, не често пържено. Избирайте постни разфасовки.",
      el: "Μαγειρέψτε καλά το κρέας — στη σχάρα, στον φούρνο ή βραστό, όχι συχνά τηγανητό. Επιλέξτε άπαχα κομμάτια.",
      sq: "Gatuaje mishin mirë — në skarë, në furrë ose i zier, jo shpesh i skuqur. Zgjidh copa pa dhjamë.",
    },
    who: {
      bg: "Високата консумация на червено месо се свързва със сърдечни рискове. Поддържайте умерени порции.",
      el: "Η υψηλή κατανάλωση κόκκινου κρέατος συνδέεται με καρδιαγγειακούς κινδύνους. Κρατήστε μέτριες μερίδες.",
      sq: "Konsumi i lartë i mishit të kuq lidhet me rreziqe për zemrën. Mbaj racione të moderuara.",
    },
    children: {
      bg: "Важно за желязото при децата. Уверете се, че е добре сготвено и ситно нарязано за малките.",
      el: "Σημαντικό για τον σίδηρο στα παιδιά. Φροντίστε να είναι καλά ψημένο και ψιλοκομμένο για τα μικρά.",
      sq: "I rëndësishëm për hekurin te fëmijët. Sigurohu që të jetë gatuar mirë dhe i prerë imët për të vegjlit.",
    },
  },
  "processed-meat": {
    benefits: {
      bg: "Удобно и вкусно, но с малко ползи — много сол, мазнини и консерванти.",
      el: "Βολικό και νόστιμο, αλλά με λίγα οφέλη — πολύ αλάτι, λιπαρά και συντηρητικά.",
      sq: "I rehatshëm dhe i shijshëm, por me pak përfitime — shumë kripë, yndyrna dhe konservues.",
    },
    when: {
      bg: "Възможно най-рядко. СЗО класифицира преработените меса (шунка, салам, наденици) като канцерогенни при честа употреба.",
      el: "Όσο το δυνατόν σπανιότερα. Ο ΠΟΥ κατατάσσει τα επεξεργασμένα κρέατα (ζαμπόν, σαλάμι, λουκάνικα) ως καρκινογόνα με συχνή κατανάλωση.",
      sq: "Sa më rrallë të jetë e mundur. OBSH i klasifikon mishrat e përpunuar (proshutë, sallam, suxhuk) si kancerogjenë me konsum të shpeshtë.",
    },
    how: {
      bg: "Гледайте на тях като на изключение. Предпочитайте прясно месо, което сготвяте сами.",
      el: "Αντιμετωπίστε τα ως περιστασιακή εξαίρεση. Προτιμήστε φρέσκο κρέας που μαγειρεύετε μόνοι σας.",
      sq: "Trajtoji si përjashtim të rastit. Parapëlqe mishin e freskët që e gatuan vetë.",
    },
    who: {
      bg: "Най-добре да се ограничат особено при високо кръвно налягане или риск от рак на дебелото черво.",
      el: "Καλύτερα να περιοριστούν ιδίως σε υψηλή πίεση ή κίνδυνο καρκίνου του παχέος εντέρου.",
      sq: "Më mirë të kufizohen sidomos në tension të lartë ose rrezik për kancer kolorektal.",
    },
    children: {
      bg: "Давайте рядко на деца: твърде много сол и нитрити. Не е ежедневен избор за кутията за обяд.",
      el: "Δώστε σπάνια στα παιδιά: πολύ αλάτι και νιτρώδη. Δεν είναι καθημερινή επιλογή για το κολατσιό.",
      sq: "Jepu rrallë fëmijëve: tepër kripë dhe nitrite. Nuk është zgjedhje e përditshme për drekën e shkollës.",
    },
  },
  fish: {
    benefits: {
      bg: "Постен белтък и омега-3 мазнини (в мазната риба: сьомга, сардини), полезни за сърцето и мозъка.",
      el: "Άπαχη πρωτεΐνη και ωμέγα-3 λιπαρά (στα λιπαρά ψάρια: σολομός, σαρδέλες), καλά για καρδιά και εγκέφαλο.",
      sq: "Proteina pa dhjamë dhe yndyrna omega-3 (te peshku i yndyrshëm: salmon, sardele), të mira për zemrën dhe trurin.",
    },
    when: {
      bg: "1–2 пъти седмично, включително веднъж мазна риба.",
      el: "1–2 φορές την εβδομάδα, συμπεριλαμβανομένης μίας φοράς λιπαρού ψαριού.",
      sq: "1–2 herë në javë, përfshirë një herë peshk të yndyrshëm.",
    },
    how: {
      bg: "Печена, на пара или на скара. Консервираните сардини/риба тон са практични и хранителни.",
      el: "Ψητό, στον ατμό ή στη σχάρα. Οι σαρδέλες/ο τόνος σε κονσέρβα είναι πρακτικά και θρεπτικά.",
      sq: "I pjekur, me avull ose në skarë. Sardelet/toni i konservuar janë praktikë dhe ushqyes.",
    },
    who: {
      bg: "Едрите риби (тон, риба меч) може да съдържат живак — мярка за бременни жени.",
      el: "Τα μεγάλα ψάρια (τόνος, ξιφίας) μπορεί να περιέχουν υδράργυρο — μέτρο για τις εγκύους.",
      sq: "Peshqit e mëdhenj (ton, shpatak) mund të përmbajnë merkur — masë për gratë shtatzëna.",
    },
    children: {
      bg: "Добра за развитието на мозъка. Внимателно отстранете костите и ограничете рибата с много живак за малките.",
      el: "Καλό για την ανάπτυξη του εγκεφάλου. Αφαιρέστε προσεκτικά τα κόκαλα και περιορίστε τα ψάρια με πολύ υδράργυρο για τα μικρά.",
      sq: "I mirë për zhvillimin e trurit. Hiq me kujdes halat dhe kufizo peshqit me shumë merkur për të vegjlit.",
    },
  },
  chocolate: {
    benefits: {
      bg: "Черният шоколад (над 70% какао) съдържа антиоксиданти и магнезий. Млечният има много повече захар.",
      el: "Η μαύρη σοκολάτα (πάνω από 70% κακάο) περιέχει αντιοξειδωτικά και μαγνήσιο. Η σοκολάτα γάλακτος έχει πολύ περισσότερη ζάχαρη.",
      sq: "Çokollata e zezë (mbi 70% kakao) përmban antioksidantë dhe magnez. Ajo me qumësht ka shumë më tepër sheqer.",
    },
    when: {
      bg: "Понякога, в малки количества. Едно-две квадратчета черен шоколад.",
      el: "Περιστασιακά, σε μικρές ποσότητες. Ένα δύο τετραγωνάκια μαύρης σοκολάτας.",
      sq: "Herë pas here, në sasi të vogla. Një-dy katrorë çokollate të zezë.",
    },
    how: {
      bg: "Предпочитайте черен шоколад, с повече какао и по-малко захар. Хапвайте го бавно, с наслада.",
      el: "Προτιμήστε μαύρη σοκολάτα, με περισσότερο κακάο και λιγότερη ζάχαρη. Απολαύστε την αργά.",
      sq: "Parapëlqe çokollatën e zezë, me më shumë kakao dhe më pak sheqer. Shijoje ngadalë.",
    },
    who: {
      bg: "Съдържа кофеин — внимание вечер и при чувствителност. Много захар за диабетици.",
      el: "Περιέχει καφεΐνη — προσοχή το βράδυ και σε ευαισθησία. Πολλή ζάχαρη για διαβητικούς.",
      sq: "Përmban kafeinë — kujdes në mbrëmje dhe në rast ndjeshmërie. Shumë sheqer për diabetikët.",
    },
    children: {
      bg: "Като лакомство от време на време. Избягвайте големи количества (захар и кофеин) при малки деца, особено вечер.",
      el: "Ως περιστασιακή απόλαυση. Αποφύγετε μεγάλες ποσότητες (ζάχαρη και καφεΐνη) στα μικρά παιδιά, ιδίως το βράδυ.",
      sq: "Si ëmbëlsirë herë pas here. Shmang sasitë e mëdha (sheqer dhe kafeinë) te fëmijët e vegjël, sidomos në mbrëmje.",
    },
  },
  sweets: {
    benefits: {
      bg: "Удоволствие и бърза енергия, но по същество само захар — без витамини и фибри.",
      el: "Ευχαρίστηση και γρήγορη ενέργεια, αλλά ουσιαστικά μόνο ζάχαρη — χωρίς βιταμίνες ή φυτικές ίνες.",
      sq: "Kënaqësi dhe energji e shpejtë, por në thelb vetëm sheqer — pa vitamina e pa fibra.",
    },
    when: {
      bg: "Рядко и на малки порции, като лакомство, не всеки ден.",
      el: "Σπάνια και σε μικρές μερίδες, ως απόλαυση, όχι καθημερινά.",
      sq: "Rrallë dhe në racione të vogla, si shije, jo çdo ditë.",
    },
    how: {
      bg: "Яжте ги след хранене, не на гладно, за да намалите ефекта върху кръвната захар и зъбите.",
      el: "Φάτε τα μετά το γεύμα, όχι με άδειο στομάχι, για να μειωθεί η επίδραση στο σάκχαρο και στα δόντια.",
      sq: "Hani pas vaktit, jo me stomak bosh, që të zbutet efekti mbi sheqerin në gjak dhe mbi dhëmbët.",
    },
    who: {
      bg: "Най-добре да се избягват при диабет и при следене на теглото.",
      el: "Καλύτερα να αποφεύγονται σε διαβήτη και όταν προσέχετε το βάρος.",
      sq: "Më mirë të shmangen në diabet dhe kur ke kujdes për peshën.",
    },
    children: {
      bg: "Основна причина за кариеси. Ограничете количеството и мийте зъбите след това. Не са ежедневна закуска.",
      el: "Βασική αιτία τερηδόνας. Περιορίστε την ποσότητα και βουρτσίστε τα δόντια μετά. Δεν είναι καθημερινό σνακ.",
      sq: "Shkak kryesor i prishjes së dhëmbëve. Kufizo sasinë dhe laji dhëmbët pas. Nuk janë meze e përditshme.",
    },
  },
  snacks: {
    benefits: {
      bg: "Вкусни и удобни, но обикновено солени, мазни и ултрапреработени — малко ползи.",
      el: "Νόστιμα και βολικά, αλλά συνήθως αλμυρά, λιπαρά και υπερεπεξεργασμένα — λίγα οφέλη.",
      sq: "Të shijshëm dhe praktikë, por zakonisht të kripur, të yndyrshëm dhe ultra të përpunuar — pak përfitime.",
    },
    when: {
      bg: "Понякога. За ежедневни закуски предпочитайте плодове, зеленчуци или ядки.",
      el: "Περιστασιακά. Για καθημερινά σνακ προτιμήστε φρούτα, λαχανικά ή ξηρούς καρπούς.",
      sq: "Herë pas here. Për meze të përditshme parapëlqe fruta, perime ose arra.",
    },
    how: {
      bg: "Сипете малка порция в купичка, вместо да ядете направо от пакета. Проверете солта на етикета.",
      el: "Βάλτε μια μικρή μερίδα σε μπολ αντί να τρώτε από τη σακούλα. Ελέγξτε το αλάτι στην ετικέτα.",
      sq: "Vendos një racion të vogël në një tas në vend që të hash nga qesja. Kontrollo kripën në etiketë.",
    },
    who: {
      bg: "Най-добре да се ограничат при високо кръвно налягане и при следене на теглото.",
      el: "Καλύτερα να περιοριστούν σε υψηλή πίεση και όταν προσέχετε το βάρος.",
      sq: "Më mirë të kufizohen në tension të lartë dhe kur ke kujdes për peshën.",
    },
    children: {
      bg: "Давайте рядко. Излишната сол не е добра за малките деца; предложете здравословни алтернативи.",
      el: "Δώστε σπάνια. Η υπερβολική αλατότητα δεν κάνει καλό στα μικρά παιδιά· προσφέρετε υγιεινές εναλλακτικές.",
      sq: "Jepu rrallë. Kripa e tepërt nuk u bën mirë fëmijëve të vegjël; ofro alternativa të shëndetshme.",
    },
  },
  coffee: {
    benefits: {
      bg: "Кофеинът повишава бодростта и съдържа антиоксиданти. С мярка може да има ползи.",
      el: "Η καφεΐνη αυξάνει την εγρήγορση και περιέχει αντιοξειδωτικά. Με μέτρο μπορεί να έχει οφέλη.",
      sq: "Kafeina rrit vigjilencën dhe përmban antioksidantë. Me masë, mund të ketë përfitime.",
    },
    when: {
      bg: "Сутрин и в ранния следобед. Избягвайте вечер, за да не нарушава съня.",
      el: "Το πρωί και νωρίς το απόγευμα. Αποφύγετε το βράδυ για να μην διαταράσσει τον ύπνο.",
      sq: "Në mëngjes dhe herët pasdite. Shmange në mbrëmje që të mos prishë gjumin.",
    },
    how: {
      bg: "До 3–4 чаши на ден за възрастен. Без много захар и сметана, за да остане здравословно.",
      el: "Έως 3–4 φλιτζάνια την ημέρα για έναν ενήλικα. Χωρίς πολλή ζάχαρη και κρέμα, για να παραμείνει υγιεινός.",
      sq: "Deri në 3–4 filxhanë në ditë për një të rritur. Pa shumë sheqer e krem, që të mbetet i shëndetshëm.",
    },
    who: {
      bg: "Бременните жени трябва да ограничат кофеина. Внимание при тревожност или сърдечни проблеми.",
      el: "Οι έγκυες πρέπει να περιορίζουν την καφεΐνη. Προσοχή σε άγχος ή καρδιακά προβλήματα.",
      sq: "Gratë shtatzëna duhet ta kufizojnë kafeinën. Kujdes në ankth ose probleme me zemrën.",
    },
    children: {
      bg: "Кафето НЕ е за деца — кофеинът влияе на съня и сърцето им. Избягвайте го напълно.",
      el: "Ο καφές ΔΕΝ είναι για παιδιά — η καφεΐνη επηρεάζει τον ύπνο και την καρδιά τους. Αποφύγετέ τον εντελώς.",
      sq: "Kafeja NUK është për fëmijët — kafeina prek gjumin dhe zemrën e tyre. Shmange plotësisht.",
    },
  },
  tea: {
    benefits: {
      bg: "Хидратира и съдържа антиоксиданти. Зеленият чай се цени заради полифенолите си.",
      el: "Ενυδατώνει και περιέχει αντιοξειδωτικά. Το πράσινο τσάι εκτιμάται για τις πολυφαινόλες του.",
      sq: "Hidraton dhe përmban antioksidantë. Çaji jeshil vlerësohet për polifenolet e tij.",
    },
    when: {
      bg: "През целия ден. Съдържащите кофеин (черен, зелен) е по-добре да се избягват вечер.",
      el: "Καθ' όλη τη διάρκεια της ημέρας. Όσα έχουν καφεΐνη (μαύρο, πράσινο) καλύτερα να αποφεύγονται το βράδυ.",
      sq: "Gjatë gjithë ditës. Ato me kafeinë (i zi, jeshil) më mirë të shmangen në mbrëmje.",
    },
    how: {
      bg: "Пийте го неподсладен или с много малко захар/мед. Билковите чайове са без кофеин.",
      el: "Πιείτε το ανγλύκαντο ή με πολύ λίγη ζάχαρη/μέλι. Τα αφεψήματα βοτάνων δεν έχουν καφεΐνη.",
      sq: "Pije pa sheqer ose me shumë pak sheqer/mjaltë. Çajrat e bimëve janë pa kafeinë.",
    },
    who: {
      bg: "Бременните да ограничат кофеина. Прекаленият чай може да намали усвояването на желязо.",
      el: "Οι έγκυες ας περιορίσουν την καφεΐνη. Το υπερβολικό τσάι μπορεί να μειώσει την απορρόφηση σιδήρου.",
      sq: "Gratë shtatzëna le ta kufizojnë kafeinën. Çaji i tepërt mund të ulë thithjen e hekurit.",
    },
    children: {
      bg: "За деца изберете билкови чайове без кофеин, неподсладени. Избягвайте черен/зелен чай.",
      el: "Για τα παιδιά επιλέξτε αφεψήματα βοτάνων χωρίς καφεΐνη, ανγλύκαντα. Αποφύγετε μαύρο/πράσινο τσάι.",
      sq: "Për fëmijët zgjidh çajra bimorë pa kafeinë, pa sheqer. Shmang çajin e zi/jeshil.",
    },
  },
  nuts: {
    benefits: {
      bg: "Ядките и семената дават полезни мазнини, белтъчини, фибри и минерали. Отлична закуска.",
      el: "Οι ξηροί καρποί και οι σπόροι προσφέρουν καλά λιπαρά, πρωτεΐνη, φυτικές ίνες και μέταλλα. Εξαιρετικό σνακ.",
      sq: "Arrat dhe farat japin yndyrna të shëndetshme, proteina, fibra dhe minerale. Meze e shkëlqyer.",
    },
    when: {
      bg: "Всеки ден, по една малка шепа (около 30 г). Калорични са, затова не в големи количества.",
      el: "Καθημερινά, μια μικρή χούφτα (περίπου 30 g). Είναι θερμιδικά, οπότε όχι σε μεγάλες ποσότητες.",
      sq: "Çdo ditë, një grusht i vogël (rreth 30 g). Kanë shumë kalori, ndaj jo në sasi të mëdha.",
    },
    how: {
      bg: "Предпочитайте ги сурови или само изпечени, несолени. Избягвайте захаросаните или силно солените.",
      el: "Προτιμήστε τους ωμούς ή απλά καβουρδισμένους, ανάλατους. Αποφύγετε τους ζαχαρωμένους ή πολύ αλατισμένους.",
      sq: "Parapëlqeji të papjekura ose vetëm të pjekura, pa kripë. Shmang ato të sheqerosura ose shumë të kripura.",
    },
    who: {
      bg: "ВНИМАНИЕ: алергиите към фъстъци и ядки могат да са тежки. Алергичните трябва да ги избягват напълно.",
      el: "ΠΡΟΣΟΧΗ: οι αλλεργίες σε φιστίκια και ξηρούς καρπούς μπορεί να είναι σοβαρές. Οι αλλεργικοί πρέπει να τους αποφεύγουν εντελώς.",
      sq: "KUJDES: alergjitë ndaj kikirikëve dhe arrave mund të jenë të rënda. Personat alergjikë duhet t'i shmangin plotësisht.",
    },
    children: {
      bg: "Целите ядки са опасност от задавяне под 4–5 години — давайте ги смлени или като гладко ядково масло.",
      el: "Οι ολόκληροι ξηροί καρποί είναι κίνδυνος πνιγμού κάτω των 4–5 ετών — δώστε τους αλεσμένους ή ως λείο βούτυρο ξηρών καρπών.",
      sq: "Arrat e plota janë rrezik mbytjeje nën 4–5 vjeç — jepi të bluara ose si gjalpë arrash i lëmuar.",
    },
  },
  honey: {
    benefits: {
      bg: "Натурален подсладител със следи от антиоксиданти. Все пак по същество е захар.",
      el: "Φυσικό γλυκαντικό με ίχνη αντιοξειδωτικών. Ωστόσο, ουσιαστικά είναι ζάχαρη.",
      sq: "Ëmbëlsues natyral me gjurmë antioksidantësh. Megjithatë, në thelb është sheqer.",
    },
    when: {
      bg: "С мярка, като алтернатива на захарта. Подходящ в чай или върху хляб.",
      el: "Με μέτρο, ως εναλλακτική της ζάχαρης. Ωραίο στο τσάι ή στο ψωμί.",
      sq: "Me masë, si alternativë e sheqerit. I mirë në çaj ose mbi bukë.",
    },
    how: {
      bg: "Една чаена лъжичка е достатъчна. Не го добавяйте в много горещи течности, за да запази ароматите си.",
      el: "Ένα κουταλάκι αρκεί. Μην το προσθέτετε σε πολύ καυτά υγρά, για να διατηρήσει τα αρώματά του.",
      sq: "Një lugë çaji mjafton. Mos e shto në lëngje shumë të nxehta, që të ruajë aromat.",
    },
    who: {
      bg: "Диабетиците да го третират като захар. Не е по-нискокалоричен от захарта.",
      el: "Οι διαβητικοί ας το αντιμετωπίζουν σαν ζάχαρη. Δεν έχει λιγότερες θερμίδες από τη ζάχαρη.",
      sq: "Diabetikët le ta trajtojnë si sheqer. Nuk ka më pak kalori se sheqeri.",
    },
    children: {
      bg: "ВАЖНО: НЕ давайте мед на бебета под 1 година — риск от детски ботулизъм, тежко заболяване.",
      el: "ΣΗΜΑΝΤΙΚΟ: ΜΗΝ δίνετε μέλι σε μωρά κάτω του 1 έτους — κίνδυνος βρεφικής αλλαντίασης, σοβαρής νόσου.",
      sq: "E RËNDËSISHME: MOS u jep mjaltë foshnjave nën 1 vjeç — rrezik botulizmi foshnjor, sëmundje e rëndë.",
    },
  },
  egg: {
    benefits: {
      bg: "Пълноценен белтък, витамини (A, D, B12) и холин, полезни за мозъка и мускулите.",
      el: "Πλήρης πρωτεΐνη, βιταμίνες (A, D, B12) και χολίνη, καλά για τον εγκέφαλο και τους μυς.",
      sq: "Proteinë e plotë, vitamina (A, D, B12) dhe kolinë, të mira për trurin dhe muskujt.",
    },
    when: {
      bg: "Няколко пъти седмично или всеки ден за повечето здрави хора.",
      el: "Λίγες φορές την εβδομάδα ή καθημερινά για τους περισσότερους υγιείς ανθρώπους.",
      sq: "Disa herë në javë, ose çdo ditë për shumicën e njerëzve të shëndetshëm.",
    },
    how: {
      bg: "Варени, поширани или като омлет с малко олио са най-здравословните варианти.",
      el: "Βραστά, ποσέ ή ως ομελέτα με λίγο λάδι είναι οι πιο υγιεινές επιλογές.",
      sq: "Të ziera, të poshuara ose si omëletë me pak vaj janë zgjedhjet më të shëndetshme.",
    },
    who: {
      bg: "Съществува алергия към яйца, особено при децата. Гответе яйцата добре, за да избегнете салмонела.",
      el: "Υπάρχει αλλεργία στο αυγό, ιδίως στα παιδιά. Μαγειρεύετε καλά τα αυγά για να αποφύγετε τη σαλμονέλα.",
      sq: "Alergjia ndaj vezës ekziston, sidomos te fëmijët. Gatuaji vezët mirë për të shmangur salmonelën.",
    },
    children: {
      bg: "Добри за деца, добре сготвени. Яйцето може да се въведе от захранването, напълно сготвено.",
      el: "Καλά για τα παιδιά, καλά μαγειρεμένα. Το αυγό μπορεί να εισαχθεί από τον απογαλακτισμό, πλήρως ψημένο.",
      sq: "Të mira për fëmijët, të gatuara mirë. Veza mund të futet që nga fillimi i ushqimit të ngurtë, plotësisht e gatuar.",
    },
  },
  beans: {
    benefits: {
      bg: "Бобовите (боб, леща, нахут) дават растителен белтък, фибри и желязо. Засищащи и евтини.",
      el: "Τα όσπρια (φασόλια, φακές, ρεβίθια) δίνουν φυτική πρωτεΐνη, φυτικές ίνες και σίδηρο. Χορταστικά και φθηνά.",
      sq: "Bishtajoret (fasule, thjerrëza, qiqra) japin proteina bimore, fibra dhe hekur. Ngopëse dhe të lira.",
    },
    when: {
      bg: "Няколко пъти седмично, като заместител на месото.",
      el: "Λίγες φορές την εβδομάδα, ως υποκατάστατο του κρέατος.",
      sq: "Disa herë në javë, si zëvendësues i mishit.",
    },
    how: {
      bg: "Гответе ги добре. Сушените се накисват през нощта. Изплакнатият консервиран боб е бърз вариант.",
      el: "Μαγειρέψτε τα καλά. Τα ξερά μουλιάζουν όλη νύχτα. Τα ξεπλυμένα φασόλια κονσέρβας είναι γρήγορη λύση.",
      sq: "Gatuaji mirë. Të thatat lihen në ujë gjithë natën. Fasulet e konservuara, të shpëlara, janë zgjidhje e shpejtë.",
    },
    who: {
      bg: "Могат да предизвикат подуване — увеличавайте количеството постепенно. Много полезни при вегетарианско хранене.",
      el: "Μπορεί να προκαλέσουν φούσκωμα — αυξήστε σταδιακά την ποσότητα. Πολύ χρήσιμα σε χορτοφαγική διατροφή.",
      sq: "Mund të shkaktojnë fryrje — rrite sasinë gradualisht. Shumë të dobishme në ushqyerjen vegjetariane.",
    },
    children: {
      bg: "Добри за деца, добре сварени и намачкани за малките. Ценен източник на желязо.",
      el: "Καλά για τα παιδιά, καλοβρασμένα και λιωμένα για τα μικρά. Πολύτιμη πηγή σιδήρου.",
      sq: "Të mira për fëmijët, të ziera mirë dhe të shtypura për të vegjlit. Burim i vyer hekuri.",
    },
  },
  fruit: {
    benefits: {
      bg: "Витамини, фибри, антиоксиданти и вода. Един от най-здравословните избори.",
      el: "Βιταμίνες, φυτικές ίνες, αντιοξειδωτικά και νερό. Μία από τις πιο υγιεινές επιλογές.",
      sq: "Vitamina, fibra, antioksidantë dhe ujë. Një nga zgjedhjet më të shëndetshme.",
    },
    when: {
      bg: "Всеки ден, като част от „5 порции плодове и зеленчуци дневно“. Отлични като закуска.",
      el: "Καθημερινά, ως μέρος των «5 μερίδων φρούτων και λαχανικών την ημέρα». Εξαιρετικά ως σνακ.",
      sq: "Çdo ditë, si pjesë e „5 racioneve fruta e perime në ditë”. Të shkëlqyera si meze.",
    },
    how: {
      bg: "Яжте ги цели, с измита кора където е възможно — фибрите са ценни. По-добре от сок.",
      el: "Φάτε τα ολόκληρα, με πλυμένη φλούδα όπου γίνεται — οι φυτικές ίνες είναι πολύτιμες. Καλύτερα από τον χυμό.",
      sq: "Hani të plota, me lëkurën e larë kur është e mundur — fibrat janë të vyera. Më mirë se lëngu.",
    },
    who: {
      bg: "Подходящи за всички. Диабетиците могат да ядат плодове, но да следят порциите.",
      el: "Κατάλληλα για όλους. Οι διαβητικοί μπορούν να τρώνε φρούτα, αλλά ας προσέχουν τις μερίδες.",
      sq: "Të përshtatshme për të gjithë. Diabetikët mund të hanë fruta, por le të kenë kujdes me racionet.",
    },
    children: {
      bg: "Идеални за деца. Режете гроздето и твърдите плодове на малки парчета, за да няма задавяне.",
      el: "Ιδανικά για παιδιά. Κόψτε τα σταφύλια και τα σκληρά φρούτα σε μικρά κομμάτια για να αποφευχθεί ο πνιγμός.",
      sq: "Ideale për fëmijët. Prej rrushin dhe frutat e forta në copa të vogla, që të mos mbyten.",
    },
  },
  vegetable: {
    benefits: {
      bg: "Пълни с фибри, витамини и минерали, с малко калории. Основата на здравословното хранене.",
      el: "Γεμάτα φυτικές ίνες, βιταμίνες και μέταλλα, με λίγες θερμίδες. Η βάση μιας υγιεινής διατροφής.",
      sq: "Plot fibra, vitamina dhe minerale, me pak kalori. Themeli i një ushqyerjeje të shëndetshme.",
    },
    when: {
      bg: "При всяко хранене, ако е възможно. Половината чиния трябва да е зеленчуци.",
      el: "Σε κάθε γεύμα, αν γίνεται. Το μισό πιάτο πρέπει να είναι λαχανικά.",
      sq: "Në çdo vakt, nëse është e mundur. Gjysma e pjatës duhet të jenë perime.",
    },
    how: {
      bg: "Сурови, на пара или печени запазват най-много витамини. Избягвайте пърженето в много мазнина.",
      el: "Ωμά, στον ατμό ή ψητά διατηρούν τις περισσότερες βιταμίνες. Αποφύγετε το τηγάνισμα σε πολύ λάδι.",
      sq: "Të papërpunuara, me avull ose të pjekura ruajnë më shumë vitamina. Shmang skuqjen në shumë vaj.",
    },
    who: {
      bg: "Подходящи за всички. Разнообразявайте цветовете за по-широка гама хранителни вещества.",
      el: "Κατάλληλα για όλους. Ποικίλετε τα χρώματα για ευρύτερο φάσμα θρεπτικών συστατικών.",
      sq: "Të përshtatshme për të gjithë. Ndryshoji ngjyrat për një gamë më të gjerë lëndësh ushqyese.",
    },
    children: {
      bg: "Въвеждайте ги рано и често. Режете дребно за малките. Търпението помага — вкусът се учи.",
      el: "Εισάγετέ τα νωρίς και συχνά. Κόψτε τα μικρά για τα μικρά παιδιά. Η υπομονή βοηθά — η γεύση μαθαίνεται.",
      sq: "Futi herët dhe shpesh. Prej imët për të vegjlit. Durimi ndihmon — shija mësohet.",
    },
  },
  generic: {
    benefits: {
      bg: "Вижте оценката, добавките и хранителните стойности по-горе за пълна картина на този продукт.",
      el: "Δείτε τη βαθμολογία, τα πρόσθετα και τα διατροφικά στοιχεία παραπάνω για πλήρη εικόνα αυτού του προϊόντος.",
      sq: "Shih vlerësimin, aditivët dhe vlerat ushqyese më lart për një pamje të plotë të këtij produkti.",
    },
    when: {
      bg: "Съобразете колко често го ядете със степента на преработка: непреработените по-често, ултрапреработените рядко.",
      el: "Προσαρμόστε το πόσο συχνά το τρώτε στο πόσο επεξεργασμένο είναι: τα μη επεξεργασμένα συχνότερα, τα υπερεπεξεργασμένα σπάνια.",
      sq: "Përshtate sa shpesh e ha me sa i përpunuar është: të papërpunuarat më shpesh, ultra të përpunuarat rrallë.",
    },
    how: {
      bg: "Прочетете списъка със съставки: колкото по-кратък и по-ясен, толкова по-добре. Внимавайте със захарта и солта.",
      el: "Διαβάστε τη λίστα συστατικών: όσο πιο σύντομη και σαφής, τόσο καλύτερα. Προσοχή στη ζάχαρη και το αλάτι.",
      sq: "Lexo listën e përbërësve: sa më e shkurtër dhe e qartë, aq më mirë. Kujdes me sheqerin dhe kripën.",
    },
    who: {
      bg: "Съобразете се със собствените си нужди (алергии, диабет, кръвно налягане). При съмнение попитайте специалист.",
      el: "Λάβετε υπόψη τις δικές σας ανάγκες (αλλεργίες, διαβήτης, πίεση). Σε περίπτωση αμφιβολίας, ρωτήστε ειδικό.",
      sq: "Merr parasysh nevojat e tua (alergji, diabet, tension). Në rast dyshimi, pyet një specialist.",
    },
    children: {
      bg: "За деца предпочитайте най-малко преработените продукти, с по-малко захар и сол.",
      el: "Για τα παιδιά προτιμήστε τα λιγότερο επεξεργασμένα προϊόντα, με λιγότερη ζάχαρη και αλάτι.",
      sq: "Për fëmijët parapëlqe produktet më pak të përpunuara, me më pak sheqer dhe kripë.",
    },
  },
};
