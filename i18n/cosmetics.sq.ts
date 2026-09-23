// Albaneza (sq) pentru substantele cosmetice (INCI).
// Se imbina in cosmetics.ts, la fel ca cosmetics.extra.ts si cosmetics.bgel.ts.
//
// Terminologie, pastrata uniforma:
//   preservative  -> konservues
//   fragrance     -> lëndë aromatike
//   foaming agent -> agjent shkumëzues
//   Moderation.   -> Me masë.
//   Caution.      -> Kujdes.
//   Avoid.        -> Shmange.
export const cosmeticsSq: Record<
  string,
  { name: { sq: string }; use: { sq: string }; desc: { sq: string } }
> = {
  methylparaben: {
    name: { sq: "Metilparaben" },
    use: { sq: "konservues" },
    desc: {
      sq: "Konservues nga familja e parabenëve. I lejuar në BE deri në 0,4% (Rreg. 1223/2009) dhe i konsideruar nga SCCS ndër parabenët më të sigurt. Megjithatë, parabenët dyshohen për prishje të sistemit endokrin (hormonal) dhe shumë veta preferojnë t'i shmangin. Me masë.",
    },
  },
  ethylparaben: {
    name: { sq: "Etilparaben" },
    use: { sq: "konservues" },
    desc: {
      sq: "Konservues nga familja e parabenëve. I lejuar në BE deri në 0,4% dhe i konsideruar nga SCCS ndër më të sigurtit. Parabenët dyshohen për prishje hormonale; shumë veta preferojnë t'i shmangin. Me masë.",
    },
  },
  propylparaben: {
    name: { sq: "Propilparaben" },
    use: { sq: "konservues" },
    desc: {
      sq: "Paraben me zinxhir më të gjatë. I kufizuar në BE në 0,14% dhe i NDALUAR në produktet për zonën e pelenave te fëmijët nën 3 vjeç, për shkak të dyshimeve për prishje endokrine. Kujdes.",
    },
  },
  butylparaben: {
    name: { sq: "Butilparaben" },
    use: { sq: "konservues" },
    desc: {
      sq: "Paraben me zinxhir të gjatë. I kufizuar në BE në 0,14% dhe i NDALUAR në produktet për zonën e pelenave te fëmijët nën 3 vjeç. Dyshohet për prishje të sistemit endokrin (hormonal). Kujdes.",
    },
  },
  isobutylparaben: {
    name: { sq: "Izobutilparaben" },
    use: { sq: "konservues" },
    desc: {
      sq: "Paraben i NDALUAR në BE që nga viti 2014 (Rreg. 358/2014), për mungesë të dhënash që të vërtetojnë sigurinë dhe për dyshime mbi prishjen endokrine. Nëse shfaqet në etiketë, produkti është i vjetër ose jo në rregull. Shmange.",
    },
  },
  phenoxyethanol: {
    name: { sq: "Fenoksietanol" },
    use: { sq: "konservues" },
    desc: {
      sq: "Konservues shumë i përhapur. I lejuar në BE deri në 1% dhe i konsideruar i sigurt nga SCCS në këtë kufi. Mund të irritojë lëkurën e ndjeshme; disa vende këshillojnë kujdes te produktet për foshnja. Me masë.",
    },
  },
  formaldehyde: {
    name: { sq: "Formaldehid" },
    use: { sq: "konservues" },
    desc: {
      sq: "Konservues i klasifikuar nga BE si kancerogjen (CMR) dhe alergjen. Shtimi i drejtpërdrejtë i formaldehidit të lirë në kozmetikë është i NDALUAR në BE; produktet që lëshojnë mbi 0,001% duhet të mbajnë paralajmërim se lëshojnë formaldehid. Në SHBA lejohet ende brenda kufijve. Shmange.",
    },
  },
  methylisothiazolinone: {
    name: { sq: "Metilizotiazolinon (MIT)" },
    use: { sq: "konservues" },
    desc: {
      sq: "Konservues që shkaktoi një epidemi alergjish kontakti në Evropë. BE e NDALOI në produktet që qëndrojnë mbi lëkurë dhe e kufizoi rreptësisht te ato që shpëlahen. Alergjen i fortë. Kujdes.",
    },
  },
  methylchloroisothiazolinone: {
    name: { sq: "Metilkloroizotiazolinon (CMIT)" },
    use: { sq: "konservues" },
    desc: {
      sq: "Konservues fuqishëm alergjizues, shpesh i kombinuar me MIT. I lejuar në BE vetëm në produktet që shpëlahen dhe në përqendrim shumë të ulët. I ndaluar në produktet që qëndrojnë mbi lëkurë. Kujdes.",
    },
  },
  triclosan: {
    name: { sq: "Triklosan" },
    use: { sq: "konservues antibakterial" },
    desc: {
      sq: "Lëndë antibakteriale e lidhur me rezistencën ndaj antibiotikëve dhe me prishje endokrine. BE e kufizoi rreptësisht dhe e ndaloi në shumë produkte; përdorimi i saj është shumë i kufizuar. E ndaluar në sapunët në SHBA që nga viti 2016. Shmange.",
    },
  },
  hydroquinone: {
    name: { sq: "Hidrokinon" },
    use: { sq: "agjent zbardhues i lëkurës" },
    desc: {
      sq: "Lëndë për zbardhimin e lëkurës. E NDALUAR në kozmetikën e BE-së (lejohet vetëm me recetë mjekësore). Dyshohet për efekte kancerogjene në studime mbi kafshët. Në SHBA është e ndaluar në produktet pa recetë. Shmange.",
    },
  },
  limonene: {
    name: { sq: "Limonen" },
    use: { sq: "lëndë aromatike" },
    desc: {
      sq: "Lëndë aromatike me erë agrumesh, shumë e përhapur. Një nga 26 alergjenët aromatikë me deklarim të detyrueshëm në BE (Rreg. 1223/2009). Me oksidimin në ajër bëhet alergjen më i fortë. Kujdes për personat e ndjeshëm.",
    },
  },
  linalool: {
    name: { sq: "Linalool" },
    use: { sq: "lëndë aromatike" },
    desc: {
      sq: "Lëndë aromatike me erë lulesh, shumë e përhapur (në 85-90% të produkteve). Një nga 26 alergjenët aromatikë me deklarim të detyrueshëm në BE. E oksiduar në ajër bëhet alergjen më i fortë. Kujdes për personat e ndjeshëm.",
    },
  },
  citronellol: {
    name: { sq: "Citronelol" },
    use: { sq: "lëndë aromatike" },
    desc: {
      sq: "Lëndë aromatike me erë lulesh. Një nga 26 alergjenët aromatikë me deklarim të detyrueshëm në BE. Mund të shkaktojë alergji kontakti te personat e ndjeshëm. Kujdes.",
    },
  },
  geraniol: {
    name: { sq: "Geraniol" },
    use: { sq: "lëndë aromatike" },
    desc: {
      sq: "Lëndë aromatike me erë trëndafili. Një nga 26 alergjenët aromatikë me deklarim të detyrueshëm në BE. Mund të shkaktojë alergji kontakti. Kujdes për personat e ndjeshëm.",
    },
  },
  eugenol: {
    name: { sq: "Eugenol" },
    use: { sq: "lëndë aromatike" },
    desc: {
      sq: "Lëndë aromatike me erë karafili. Një nga 26 alergjenët aromatikë me deklarim të detyrueshëm në BE. Alergjen kontakti i njohur. Kujdes për personat e ndjeshëm.",
    },
  },
  coumarin: {
    name: { sq: "Kumarinë" },
    use: { sq: "lëndë aromatike" },
    desc: {
      sq: "Lëndë aromatike me erë vanilje dhe bari të thatë. Një nga 26 alergjenët aromatikë me deklarim të detyrueshëm në BE. Mund të shkaktojë alergji kontakti. Kujdes.",
    },
  },
  citral: {
    name: { sq: "Citral" },
    use: { sq: "lëndë aromatike" },
    desc: {
      sq: "Lëndë aromatike me erë limoni. Një nga 26 alergjenët aromatikë me deklarim të detyrueshëm në BE. Mund të shkaktojë alergji kontakti. Kujdes për personat e ndjeshëm.",
    },
  },
  parfum: {
    name: { sq: "Parfum (përzierje aromash)" },
    use: { sq: "lëndë aromatike" },
    desc: {
      sq: "Term i përgjithshëm pas të cilit mund të fshihen dhjetëra lëndë që nuk deklarohen veç e veç. BE e lejon fjalën parfum, por 26 alergjenët e njohur duhet të deklarohen veçmas. Aroma është një nga shkaqet më të shpeshta të alergjive nga kozmetika. Me masë, sidomos për lëkurën e ndjeshme.",
    },
  },
  bht: {
    name: { sq: "BHT (butilhidroksitoluen)" },
    use: { sq: "antioksidant" },
    desc: {
      sq: "Antioksidant që parandalon prishjen e yndyrnave. I lejuar në BE dhe i konsideruar i sigurt në përqendrimet e zakonshme, por ka debat për efekte të mundshme endokrine. Mund të shkaktojë alergji të rralla. Me masë.",
    },
  },
  triclocarban: {
    name: { sq: "Triklokarban" },
    use: { sq: "agjent antibakterial" },
    desc: {
      sq: "Lëndë antibakteriale e afërt me triklosanin. E lidhur me prishje endokrine dhe me probleme mjedisore. E kufizuar rreptësisht në BE dhe e ndaluar në sapunët në SHBA që nga viti 2016. Shmange.",
    },
  },
  glycerin: {
    name: { sq: "Glicerinë" },
    use: { sq: "hidratues" },
    desc: {
      sq: "Përbërës hidratues shumë i përhapur dhe i sigurt. I lejuar në BE pa kufizime. Tërheq dhe mban ujin në lëkurë. Pa rreziqe të njohura.",
    },
  },
  niacinamide: {
    name: { sq: "Niacinamid" },
    use: { sq: "përbërës aktiv" },
    desc: {
      sq: "Formë e vitaminës B3, përbërës aktiv i vlerësuar për lëkurën. I lejuar në BE dhe i konsideruar i sigurt. Tolerohet mirë, me efekte të dobishme. Pa rreziqe të njohura.",
    },
  },

  // Cheile de mai jos contin spatii, exact ca in cosmetics.ts.
  "dmdm hydantoin": {
    name: { sq: "DMDM hidantoinë" },
    use: { sq: "konservues" },
    desc: {
      sq: "Konservues që lëshon ngadalë formaldehid (kancerogjen). I lejuar në BE brenda kufijve, por produktet që lëshojnë mbi pragun duhet të mbajnë paralajmërim. Personat alergjikë ndaj formaldehidit ta shmangin. Kujdes.",
    },
  },
  "imidazolidinyl urea": {
    name: { sq: "Imidazolidinil urea" },
    use: { sq: "konservues" },
    desc: {
      sq: "Konservues që lëshon formaldehid. I lejuar në BE brenda kufijve, me paralajmërim të detyrueshëm mbi prag. Mund të shkaktojë alergji kontakti. Kujdes.",
    },
  },
  "diazolidinyl urea": {
    name: { sq: "Diazolidinil urea" },
    use: { sq: "konservues" },
    desc: {
      sq: "Konservues që lëshon formaldehid. I lejuar në BE brenda kufijve, me paralajmërim të detyrueshëm mbi prag. Alergji kontakti të mundshme. Kujdes.",
    },
  },
  "sodium lauryl sulfate": {
    name: { sq: "Natrium lauril sulfat (SLS)" },
    use: { sq: "agjent shkumëzues" },
    desc: {
      sq: "Detergjent shkumëzues në shampo dhe xhel dushi. I lejuar në BE dhe i konsideruar i sigurt, por mund të irritojë lëkurën dhe sytë, sidomos te personat e ndjeshëm ose në përqendrime të larta. Nuk është toksik, vetëm irritues. Me masë.",
    },
  },
  "sodium laureth sulfate": {
    name: { sq: "Natrium laureth sulfat (SLES)" },
    use: { sq: "agjent shkumëzues" },
    desc: {
      sq: "Detergjent më i butë se SLS. I lejuar në BE dhe i konsideruar i sigurt, me më pak irritim. Ndotje e mundshme me gjurmë 1,4-dioksani nga prodhimi (prodhuesit e ulin). Me masë.",
    },
  },
  "cocamidopropyl betaine": {
    name: { sq: "Kokamidopropil betainë" },
    use: { sq: "agjent shkumëzues" },
    desc: {
      sq: "Detergjent i butë me prejardhje nga kokosi. I lejuar në BE dhe i konsideruar i sigurt. Mund të shkaktojë alergji kontakti për shkak të papastërtive nga prodhimi. Me masë.",
    },
  },
  "benzyl alcohol": {
    name: { sq: "Alkool benzilik" },
    use: { sq: "konservues / lëndë aromatike" },
    desc: {
      sq: "Përdoret si tretës, konservues dhe lëndë aromatike. Një nga 26 alergjenët aromatikë me deklarim të detyrueshëm në BE. Mund të shkaktojë alergji kontakti. Kujdes për personat e ndjeshëm.",
    },
  },
};
