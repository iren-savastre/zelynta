// Albaneza (sq) pentru aditivi: nume + categorie (use) pentru toti cei 89,
// plus descriere (desc) pentru cei 36 fara „poveste". Pentru ceilalti 53,
// descrierea vine din additives.stories.ts, care se aplica dupa acest merge.
// Se imbina in additives.ts, la fel ca additives.extra.ts si additives.bgel.ts.
//
// Terminologie, pastrata uniforma:
//   colorant        -> ngjyrues          preservative     -> konservues
//   acidity reg.    -> rregullues aciditeti                emulsifier -> emulsifikues
//   sweetener       -> ëmbëlsues         stabilizer       -> stabilizues
//   antioxidant     -> antioksidant      flavor enhancer  -> përmirësues shijeje
export const additivesSq: Record<
  string,
  { name: { sq: string }; use: { sq: string }; desc?: { sq: string } }
> = {
  e160b: { name: { sq: "Anato (biksinë/norbiksinë)" }, use: { sq: "ngjyrues" } },
  e504: {
    name: { sq: "Karbonat magnezi" },
    use: { sq: "agjent kundër ngjitjes / rregullues aciditeti" },
    desc: {
      sq: "Kripë minerale e përdorur si agjent kundër ngjitjes dhe rregullues aciditeti. E autorizuar në BE; EFSA nuk cakton dozë maksimale të rreptë. Pa rreziqe të njohura në nivelet e zakonshme.",
    },
  },
  e1105: { name: { sq: "Lizozim" }, use: { sq: "konservues" } },
  e341: { name: { sq: "Fosfate kalciumi" }, use: { sq: "emulsifikues / rregullues aciditeti" } },
  e451: { name: { sq: "Trifosfate" }, use: { sq: "emulsifikues / teksturues" } },
  e452: { name: { sq: "Polifosfate" }, use: { sq: "emulsifikues / teksturues" } },
  e100: {
    name: { sq: "Kurkuminë" },
    use: { sq: "ngjyrues" },
    desc: {
      sq: "Ngjyrues natyral i verdhë nga shafrani i Indisë. I autorizuar në BE; EFSA e konsideron të sigurt, pa dozë maksimale të rreptë. I lejuar edhe në SHBA, Azi dhe në mbarë botën. Pa rreziqe të njohura në nivelet e zakonshme.",
    },
  },
  e101: {
    name: { sq: "Riboflavinë (B2)" },
    use: { sq: "ngjyrues" },
    desc: {
      sq: "Vitamina B2, e përdorur edhe si ngjyrues i verdhë. E autorizuar në BE dhe e konsideruar e sigurt nga EFSA; e lejuar në mbarë botën. Lëndë ushqyese thelbësore, plotësisht e sigurt.",
    },
  },
  e102: { name: { sq: "Tartrazinë" }, use: { sq: "ngjyrues" } },
  e104: { name: { sq: "E verdhë kinoline" }, use: { sq: "ngjyrues" } },
  e110: { name: { sq: "E verdhë perëndimi (Sunset Yellow)" }, use: { sq: "ngjyrues" } },
  e120: { name: { sq: "Acid karminik (koçinelë)" }, use: { sq: "ngjyrues" } },
  e122: { name: { sq: "Azorubinë (karmoizinë)" }, use: { sq: "ngjyrues" } },
  e124: { name: { sq: "Ponceau 4R" }, use: { sq: "ngjyrues" } },
  e129: { name: { sq: "E kuqe Allura AC" }, use: { sq: "ngjyrues" } },
  e131: { name: { sq: "Blu patent V" }, use: { sq: "ngjyrues" } },
  e132: { name: { sq: "Indigotinë (karmin indigo)" }, use: { sq: "ngjyrues" } },
  e133: { name: { sq: "Blu brilante FCF" }, use: { sq: "ngjyrues" } },
  e140: {
    name: { sq: "Klorofile" },
    use: { sq: "ngjyrues" },
    desc: {
      sq: "Ngjyrues natyral i gjelbër nga bimët. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Pa rreziqe të njohura.",
    },
  },
  e150a: { name: { sq: "Karamel i thjeshtë" }, use: { sq: "ngjyrues" } },
  e150d: { name: { sq: "Karamel sulfit-amoniak" }, use: { sq: "ngjyrues" } },
  e160a: {
    name: { sq: "Beta-karotenë" },
    use: { sq: "ngjyrues" },
    desc: {
      sq: "Ngjyrues portokalli, paraardhës i vitaminës A. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Natyral dhe i sigurt në nivelet e zakonshme.",
    },
  },
  e160c: {
    name: { sq: "Ekstrakt paprike" },
    use: { sq: "ngjyrues" },
    desc: {
      sq: "Ngjyrues natyral i kuq-portokalli nga specat. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Pa rreziqe të njohura.",
    },
  },
  e163: {
    name: { sq: "Antocianina" },
    use: { sq: "ngjyrues" },
    desc: {
      sq: "Ngjyrues natyral i kuq-vjollcë nga frutat (rrush, manaferra). I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Ka veti antioksiduese.",
    },
  },
  e171: { name: { sq: "Dioksid titani" }, use: { sq: "ngjyrues" } },
  e172: {
    name: { sq: "Okside hekuri" },
    use: { sq: "ngjyrues" },
    desc: {
      sq: "Ngjyrues mineralë (i kuq, i verdhë, i zi). Të autorizuar në BE dhe të konsideruar të sigurt nga EFSA brenda kufijve të miratuar; të lejuar në mbarë botën.",
    },
  },
  e200: { name: { sq: "Acid sorbik" }, use: { sq: "konservues" } },
  e202: { name: { sq: "Sorbat kaliumi" }, use: { sq: "konservues" } },
  e210: { name: { sq: "Acid benzoik" }, use: { sq: "konservues" } },
  e211: { name: { sq: "Benzoat natriumi" }, use: { sq: "konservues" } },
  e220: { name: { sq: "Dioksid squfuri" }, use: { sq: "konservues" } },
  e223: { name: { sq: "Metabisulfit natriumi" }, use: { sq: "konservues" } },
  e250: { name: { sq: "Nitrit natriumi" }, use: { sq: "konservues" } },
  e251: { name: { sq: "Nitrat natriumi" }, use: { sq: "konservues" } },
  e252: { name: { sq: "Nitrat kaliumi" }, use: { sq: "konservues" } },
  e260: {
    name: { sq: "Acid acetik (uthull)" },
    use: { sq: "rregullues aciditeti" },
    desc: {
      sq: "Përbërësi kryesor i uthullës. I autorizuar në BE pa kufi të rreptë (quantum satis) dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Përdoret për ruajtje dhe shije.",
    },
  },
  e270: {
    name: { sq: "Acid laktik" },
    use: { sq: "rregullues aciditeti" },
    desc: {
      sq: "Acid natyral nga fermentimi (kos, turshi). I autorizuar në BE pa kufi të rreptë dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e280: {
    name: { sq: "Acid propionik" },
    use: { sq: "konservues" },
    desc: {
      sq: "Konservues në bukë dhe produkte furre, kundër mykut. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA brenda kufijve të caktuar; i lejuar në mbarë botën.",
    },
  },
  e290: {
    name: { sq: "Dioksid karboni" },
    use: { sq: "gaz karbonizues" },
    desc: {
      sq: "Gazi që i bën pijet me gaz. I autorizuar në BE pa kufi të rreptë dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e296: {
    name: { sq: "Acid malik" },
    use: { sq: "rregullues aciditeti" },
    desc: {
      sq: "Acid natyral nga mollët, për shije të thartë. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e300: {
    name: { sq: "Acid askorbik (vit. C)" },
    use: { sq: "antioksidant" },
    desc: {
      sq: "Vitamina C, e përdorur si antioksidant. E autorizuar në BE pa kufi të rreptë dhe e konsideruar e sigurt nga EFSA; e lejuar në mbarë botën. Madje e dobishme.",
    },
  },
  e301: {
    name: { sq: "Askorbat natriumi" },
    use: { sq: "antioksidant" },
    desc: {
      sq: "Formë e vitaminës C, antioksidant. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e306: {
    name: { sq: "Tokoferole (vit. E)" },
    use: { sq: "antioksidant" },
    desc: {
      sq: "Vitamina E natyrale, antioksidant. E autorizuar në BE dhe e konsideruar e sigurt nga EFSA; e lejuar në mbarë botën. E dobishme.",
    },
  },
  e322: {
    name: { sq: "Lecitina" },
    use: { sq: "emulsifikues" },
    desc: {
      sq: "Emulsifikues natyral (nga soja ose luledielli). I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Gjendet natyrshëm në shumë ushqime. Nëse prodhohet nga soja, soja është alergjen me deklarim të detyrueshëm në BE.",
    },
  },
  e325: {
    name: { sq: "Laktat natriumi" },
    use: { sq: "rregullues aciditeti" },
    desc: {
      sq: "Kripë e acidit laktik, për aciditet dhe lagështi. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e330: {
    name: { sq: "Acid citrik" },
    use: { sq: "rregullues aciditeti" },
    desc: {
      sq: "Acid natyral nga agrumet, për shije të thartë dhe ruajtje. I autorizuar në BE pa kufi të rreptë dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Gjendet natyrshëm në fruta.",
    },
  },
  e331: {
    name: { sq: "Citrate natriumi" },
    use: { sq: "rregullues aciditeti" },
    desc: {
      sq: "Kripëra të acidit citrik, për rregullimin e aciditetit. Të autorizuara në BE dhe të konsideruara të sigurta nga EFSA; të lejuara në mbarë botën.",
    },
  },
  e333: {
    name: { sq: "Citrate kalciumi" },
    use: { sq: "rregullues aciditeti" },
    desc: {
      sq: "Kripëra kalciumi të acidit citrik. Të autorizuara në BE dhe të konsideruara të sigurta nga EFSA; të lejuara në mbarë botën. Japin edhe kalcium.",
    },
  },
  e338: { name: { sq: "Acid fosforik" }, use: { sq: "acidifikues" } },
  e339: { name: { sq: "Fosfate natriumi" }, use: { sq: "rregullues aciditeti" } },
  e340: { name: { sq: "Fosfate kaliumi" }, use: { sq: "rregullues aciditeti" } },
  e375: {
    name: { sq: "Niacinë (vit. B3)" },
    use: { sq: "vitaminë" },
    desc: {
      sq: "Vitamina B3, e shtuar si lëndë ushqyese. E autorizuar në BE dhe e konsideruar e sigurt nga EFSA; e lejuar në mbarë botën.",
    },
  },
  e385: { name: { sq: "EDTA kalcium-dinatriumi" }, use: { sq: "antioksidant" } },
  e406: {
    name: { sq: "Agar" },
    use: { sq: "agjent xhelatinizues" },
    desc: {
      sq: "Agjent natyral xhelatinizues nga algat. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Alternativë bimore e xhelatinës.",
    },
  },
  e407: { name: { sq: "Karragjenan" }, use: { sq: "agjent xhelatinizues" } },
  e410: {
    name: { sq: "Gomë karrubeje" },
    use: { sq: "stabilizues" },
    desc: {
      sq: "Stabilizues natyral nga farat e karrubes. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Fibër natyrale.",
    },
  },
  e412: {
    name: { sq: "Gomë guari" },
    use: { sq: "stabilizues" },
    desc: {
      sq: "Stabilizues natyral nga farat e guarit. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Në sasi të mëdha mund të ketë efekt tretës. Fibër natyrale.",
    },
  },
  e414: {
    name: { sq: "Gomë arabike" },
    use: { sq: "stabilizues" },
    desc: {
      sq: "Stabilizues natyral nga pema e akacies. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Përdoret prej shekujsh.",
    },
  },
  e415: { name: { sq: "Gomë ksantani" }, use: { sq: "stabilizues" } },
  e420: { name: { sq: "Sorbitol" }, use: { sq: "ëmbëlsues" } },
  e422: {
    name: { sq: "Glicerol (glicerinë)" },
    use: { sq: "lagështues" },
    desc: {
      sq: "Mban produktet të lagështa. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e440: {
    name: { sq: "Pektinë" },
    use: { sq: "agjent xhelatinizues" },
    desc: {
      sq: "Agjent natyral xhelatinizues nga frutat, i përdorur në reçelra. I autorizuar në BE pa kufi të rreptë dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën. Fibër natyrale.",
    },
  },
  e450: { name: { sq: "Difosfate" }, use: { sq: "agjent fryrës" } },
  e466: { name: { sq: "Karboksimetil celulozë (CMC)" }, use: { sq: "stabilizues" } },
  e471: { name: { sq: "Mono- dhe digliceride" }, use: { sq: "emulsifikues" } },
  e472e: { name: { sq: "Estere të mono-/diglicerideve" }, use: { sq: "emulsifikues" } },
  e476: { name: { sq: "Poliglicerol poliricinoleat" }, use: { sq: "emulsifikues" } },
  e500: {
    name: { sq: "Bikarbonat natriumi" },
    use: { sq: "agjent fryrës" },
    desc: {
      sq: "Sodë buke e zakonshme, agjent fryrës. E autorizuar në BE pa kufi të rreptë dhe e konsideruar e sigurt nga EFSA; e lejuar në mbarë botën.",
    },
  },
  e503: {
    name: { sq: "Karbonat amoni" },
    use: { sq: "agjent fryrës" },
    desc: {
      sq: "Agjent tradicional fryrës për biskota. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e509: {
    name: { sq: "Klorur kalciumi" },
    use: { sq: "agjent forcues" },
    desc: {
      sq: "Mban të forta perimet dhe frutat e konservuara. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e575: {
    name: { sq: "Glukono-delta-lakton" },
    use: { sq: "rregullues aciditeti" },
    desc: {
      sq: "Rregullon aciditetin, në tofu dhe mish të thatë. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e620: { name: { sq: "Acid glutamik" }, use: { sq: "përmirësues shijeje" } },
  e621: { name: { sq: "Glutamat monosodik (MSG)" }, use: { sq: "përmirësues shijeje" } },
  e627: { name: { sq: "Guanilat dinatriumi" }, use: { sq: "përmirësues shijeje" } },
  e631: { name: { sq: "Inozinat dinatriumi" }, use: { sq: "përmirësues shijeje" } },
  e635: { name: { sq: "Ribonukleotide dinatriumi 5'" }, use: { sq: "përmirësues shijeje" } },
  e640: {
    name: { sq: "Glicinë" },
    use: { sq: "përmirësues shijeje" },
    desc: {
      sq: "Aminoacid i përdorur si përmirësues shijeje. I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e901: {
    name: { sq: "Dyllë bletësh" },
    use: { sq: "agjent shkëlqimi" },
    desc: {
      sq: "Dyllë natyral për shkëlqim (karamele, fruta). I autorizuar në BE dhe i konsideruar i sigurt nga EFSA; i lejuar në mbarë botën.",
    },
  },
  e903: { name: { sq: "Dyllë karnauba" }, use: { sq: "agjent shkëlqimi" } },
  e950: { name: { sq: "Acesulfam K" }, use: { sq: "ëmbëlsues" } },
  e951: { name: { sq: "Aspartam" }, use: { sq: "ëmbëlsues" } },
  e952: { name: { sq: "Ciklamat" }, use: { sq: "ëmbëlsues" } },
  e954: { name: { sq: "Sakarinë" }, use: { sq: "ëmbëlsues" } },
  e955: { name: { sq: "Sukralozë" }, use: { sq: "ëmbëlsues" } },
  e960: {
    name: { sq: "Glikozide steviol (Stevia)" },
    use: { sq: "ëmbëlsues" },
    desc: {
      sq: "Ëmbëlsues natyral pa kalori nga bima e stevias. I autorizuar në BE që nga viti 2011 dhe i konsideruar i sigurt nga EFSA brenda kufirit ditor; i lejuar në mbarë botën. Zgjedhje më e mirë se ëmbëlsuesit artificialë.",
    },
  },
  e965: { name: { sq: "Maltitol" }, use: { sq: "ëmbëlsues" } },
  e967: { name: { sq: "Ksilitol" }, use: { sq: "ëmbëlsues" } },
  e1442: {
    name: { sq: "Niseshte e modifikuar (fosfat hidroksipropil-distarç)" },
    use: { sq: "stabilizues / trashës" },
  },
  e1510: {
    name: { sq: "Etanol (alkool)" },
    use: { sq: "tretës" },
    desc: {
      sq: "I përdorur si tretës për aromat. I autorizuar në BE; i sigurt në sasitë e mbetura që gjenden në ushqim.",
    },
  },
};
