export interface ProdottoConsigliato {
  nome: string;
  nomeBrevissimo: string; // max ~25 caratteri per il titolo card
  descrizione: string;
  badge?: string;
  asin?: string;     // solo per prodotti Amazon (per compatibilità legacy)
  imageUrl?: string;
  affiliateLink: string;
}

export interface Guida {
  slug: string;
  titolo: string;
  sottotitolo: string;
  intro: string;
  tipo?: string; // link al catalogo
  icona: string;
  parametri?: { label: string; valore: string }[];
  pros: string[];
  cons: string[];
  consigli: string[];
  sezioni: { titolo: string; testo: string }[];
  correlate?: string[]; // slug guide correlate
  prodottiConsigliati?: ProdottoConsigliato[];
  titoloProdotti?: string;       // es. "Filamenti PLA consigliati"
  descrizioneProdotti?: string;  // testo sotto il titolo
}

export const GUIDE: Guida[] = [
  {
    slug: "pla",
    titolo: "Guida al PLA",
    sottotitolo: "Il filamento più usato nella stampa 3D FDM",
    tipo: "PLA",
    icona: "🟢",
    intro:
      "Il PLA (Acido Polilattico) è il materiale di riferimento per chiunque si avvicini alla stampa 3D. Derivato da fonti rinnovabili (mais, canna da zucchero), è facile da stampare, disponibile in centinaia di colori e ideale per prototipi, decorazioni e oggetti quotidiani non soggetti a calore.",
    parametri: [
      { label: "Temp. stampa", valore: "180–230 °C" },
      { label: "Temp. piatto", valore: "0–60 °C (opzionale)" },
      { label: "Difficoltà", valore: "Molto facile" },
      { label: "Enclosure", valore: "Non necessaria" },
      { label: "Igroscopico", valore: "Moderatamente" },
    ],
    pros: [
      "Facilissimo da stampare — ideale per principianti",
      "Nessuna emissione di odori forti",
      "Ottima qualità superficiale e definizione dei dettagli",
      "Enorme scelta di colori e varianti (Silk, Matte, CF, Marble...)",
      "Prezzo molto accessibile",
      "Origine biologica (materiale rinnovabile)",
    ],
    cons: [
      "Scarsa resistenza termica: si deforma sopra 55–60 °C",
      "Fragile agli urti rispetto ad ABS o PETG",
      "Non adatto ad ambienti umidi prolungati",
      "Si degrada con l'esposizione UV intensa nel lungo periodo",
    ],
    consigli: [
      "Inizia con 190–200 °C e alzale gradualmente se noti under-extrusion",
      "Piatto a 50–60 °C migliora l'adesione del primo layer, ma non è obbligatorio",
      "Stampa a 40–60 mm/s per risultati ottimali; il PLA sopporta velocità elevate",
      "Il PLA Matte nasconde meglio i layer lines e ha un aspetto premium",
      "Il PLA+ è più resistente agli urti ma richiede 5–10 °C in più rispetto al PLA standard",
      "Conserva la bobina in un sacchetto ermetico con silica gel quando non in uso",
    ],
    sezioni: [
      {
        titolo: "Varianti principali",
        testo:
          "PLA Standard: economico, ottima qualità di base. PLA+ (o PLA Pro): impatto migliorato, ideale per parti funzionali leggere. PLA Matte: finitura opaca elegante, nasconde i segni di strato. PLA Silk: effetto metallizzato lucido, spettacolare per decorazioni. PLA-CF: rinforzato con fibra di carbonio, maggiore rigidità e resistenza. PLA Marble/Wood/Metal: effetti estetici speciali per modelli decorativi.",
      },
      {
        titolo: "Utilizzi ideali",
        testo:
          "Prototipi estetici, modelli architettonici, figurine e cosplay, oggetti di arredo, organizer da scrivania, supporti e fixture leggere. Non usarlo per parti esposte al sole diretto, a temperature elevate o in applicazioni meccaniche ad alto carico.",
      },
      {
        titolo: "Migliori brand",
        testo:
          "Bambu Lab PLA/PLA Matte (qualità premium), eSUN PLA+ (ottimo rapporto qualità-prezzo), Polymaker PolyLite e PolyTerra (sostenibili), Prusament (tolleranze strettissime), 3DJake ecoPLA (budget). Per colori speciali: Bambu Lab Silk e Multicolor, eSUN Silk.",
      },
    ],
    correlate: ["petg", "pla-cf", "come-scegliere"],
    titoloProdotti: "Filamenti PLA consigliati",
    descrizioneProdotti: "I migliori PLA selezionati dai nostri shop partner. Confronta i prezzi e trova quello più adatto a te.",
    prodottiConsigliati: [
      {
        nome: "eSUN PLA Basic Blu scuro 1000g",
        nomeBrevissimo: "eSUN PLA Basic",
        descrizione: "Ottimo PLA entry-level di eSUN: qualità costante, prezzo imbattibile. Disponibile in decine di colori.",
        badge: "Best Value",
        imageUrl: "https://ueeshop.ly200-cdn.com/u_file/UPBC/UPBC810/2411/25/products/5e619cb995.jpg",
        affiliateLink: "https://www.awin1.com/cread.php?awinmid=99267&awinaffid=2803624&ued=https%3A%2F%2Fesun3dstoreeu.com%2Fproducts%2Fepla",
      },
      {
        nome: "Elegoo PLA Basic 1000g",
        nomeBrevissimo: "Elegoo PLA Basic",
        descrizione: "PLA affidabile di Elegoo con ottima adesione e pochi problemi di stampa. Buon rapporto qualità-prezzo.",
        badge: "Qualità",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/46661_a9f471a8.128x128.webp",
        affiliateLink: "https://eu.elegoo.com/products/pla-filament-1-75mm-colored-1kg?variant=47394241216788",
      },
    ],
  },

  {
    slug: "petg",
    titolo: "Guida al PETG",
    sottotitolo: "Resistente, versatile e facile da stampare",
    tipo: "PETG",
    icona: "🔵",
    intro:
      "Il PETG (Polietilene Tereftalato Glicole) combina la facilità di stampa del PLA con la resistenza meccanica e termica dell'ABS. È impermeabile, resistente agli urti e agli agenti chimici leggeri, il che lo rende il secondo materiale più usato dopo il PLA.",
    parametri: [
      { label: "Temp. stampa", valore: "220–250 °C" },
      { label: "Temp. piatto", valore: "70–85 °C" },
      { label: "Difficoltà", valore: "Facile" },
      { label: "Enclosure", valore: "Non necessaria" },
      { label: "Igroscopico", valore: "Sì — conservare bene" },
    ],
    pros: [
      "Buona resistenza termica (fino a 70–80 °C)",
      "Resistente agli urti e flessibile quanto basta",
      "Impermeabile — ottimo per contenitori e parti a contatto con liquidi",
      "Non richiede enclosure",
      "Basso ritiro (warping quasi assente)",
      "Ottima adesione tra layer",
    ],
    cons: [
      "Tende a formare filamenti sottili (oozing/stringing) se mal calibrato",
      "Superficie leggermente più ruvida del PLA",
      "Molto igroscopico: assorbe umidità rapidamente",
      "Aderisce troppo bene a certi piani (rischio strappo)",
    ],
    consigli: [
      "Usa una temperatura ugello leggermente alta (240–245 °C) per ridurre lo stringing",
      "Applica un velo di lacca o usa una superficie PEI testurizzata per il piano",
      "Aumenta la retraction e abbassa la temperatura se hai troppo stringing",
      "Se la bobina è rimasta all'aria, essicca 4–6 ore a 65 °C prima di usarla",
      "Il PETG-CF è più rigido ma richiede un nozzle hardened",
    ],
    sezioni: [
      {
        titolo: "Applicazioni ideali",
        testo:
          "Contenitori per alimenti (non in contatto con cibi caldi), parti meccaniche leggere, supporti, cover per elettronica, parti all'aperto (resiste meglio del PLA ai raggi UV), protesi e ortesi leggere, custodie stampanti 3D.",
      },
      {
        titolo: "PETG vs PLA",
        testo:
          "Scegli PETG quando hai bisogno di maggiore resistenza termica, meccanica o all'umidità rispetto al PLA. Scegli PLA per massima facilità di stampa, migliore finitura estetica e costo inferiore.",
      },
      {
        titolo: "Migliori brand",
        testo:
          "Bambu Lab PETG-HF (alta velocità), eSUN PETG (affidabile ed economico), Polymaker PolyLite PETG, Prusament PETG (tolleranze eccellenti), 3DJake 3DJAKE PETG.",
      },
    ],
    correlate: ["pla", "abs-asa", "come-scegliere"],
    titoloProdotti: "Filamenti PETG consigliati",
    descrizioneProdotti: "PETG selezionato dai migliori shop: resistente, versatile e facile da stampare.",
    prodottiConsigliati: [
      {
        nome: "Bambu Lab PETG Transparent 1000g",
        nomeBrevissimo: "Bambu Lab PETG",
        descrizione: "PETG trasparente di alta qualità Bambu Lab. Ottima scorrevolezza, compatibile con tutte le stampanti FDM.",
        badge: "Best Value",
        imageUrl: "https://m.media-amazon.com/images/I/41v5h12dsML._AC_UL320_.jpg",
        affiliateLink: "https://www.amazon.it/dp/B0F24KWRS5?tag=pignabot-21",
      },
      {
        nome: "Elegoo PETG Basic 1000g",
        nomeBrevissimo: "Elegoo PETG Basic",
        descrizione: "PETG affidabile di Elegoo: buona resistenza meccanica e termica, basso stringing.",
        badge: "Qualità",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/87475_83142ceb.128x128.webp",
        affiliateLink: "https://eu.elegoo.com/products/rapid-petg-filament-1-75mm-colored-1kg?variant=48802771566868",
      },
      {
        nome: "Sunlu PETG Basic 1000g",
        nomeBrevissimo: "Sunlu PETG Basic",
        descrizione: "PETG economico di Sunlu con ottima adesione tra layer. Disponibile in molti colori.",
        badge: "Versatile",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/86620_175576053068a6c792ab190.128x128.png",
        affiliateLink: "https://www.3djake.it/sunlu/petg-chocolate",
      },
    ],
  },

  {
    slug: "abs-asa",
    titolo: "Guida ad ABS e ASA",
    sottotitolo: "Per parti tecniche resistenti al calore e agli UV",
    tipo: "ABS",
    icona: "🟠",
    intro:
      "ABS e ASA sono materiali tecnici per chi ha bisogno di resistenza termica elevata. L'ABS è il classico materiale per parti meccaniche (sopporta fino a 100 °C), mentre l'ASA è la sua evoluzione con aggiunta resistenza ai raggi UV — ideale per applicazioni all'aperto. Entrambi richiedono più attenzione nella stampa rispetto a PLA e PETG.",
    parametri: [
      { label: "Temp. stampa ABS", valore: "220–250 °C" },
      { label: "Temp. stampa ASA", valore: "235–255 °C" },
      { label: "Temp. piatto", valore: "90–110 °C" },
      { label: "Difficoltà", valore: "Difficile" },
      { label: "Enclosure", valore: "Necessaria (fortemente consigliata)" },
    ],
    pros: [
      "Ottima resistenza termica (90–105 °C deflection)",
      "Buona resistenza meccanica e agli urti",
      "L'ASA è stabile ai raggi UV per anni",
      "Levigabile con acetone (ABS) per finiture superficiali perfette",
      "Molto usato nell'industria (LEGO, Tupperware, parti auto)",
    ],
    cons: [
      "Warping significativo — richiede enclosure e piatto caldo a 100+ °C",
      "Emissione di fumi (VOC): ventilare il locale",
      "Più difficile da stampare rispetto a PLA e PETG",
      "L'ASA è costoso rispetto agli altri materiali",
    ],
    consigli: [
      "L'enclosure è quasi obbligatoria: mantieni la temperatura interna > 40 °C",
      "Usa un adesivo (glue stick, hairspray, ABS juice) sul piano riscaldato",
      "Stampa lentamente il primo layer (20–25 mm/s) per massima adesione",
      "Con l'ABS puoi levigare a vapore di acetone per una finitura quasi lucida",
      "Se hai stringing sull'ASA, abbassa la temperatura di 5 °C e aumenta la retraction",
      "Attenzione all'umidità: essicca entrambi prima di stampare",
    ],
    sezioni: [
      {
        titolo: "ABS vs ASA",
        testo:
          "L'ABS è il materiale storico, economico e ben studiato. L'ASA è migliorato chimicamente per resistere ai raggi UV senza degrado (yellowing/brittleness). Per applicazioni outdoor (supporti per pannelli solari, parti automotive esterne, segnali) usa sempre ASA. Per parti interne ad alta temperatura usa ABS o ASA indifferentemente.",
      },
      {
        titolo: "Applicazioni ideali",
        testo:
          "Parti automotive (cruscotto, supporti), elettrodomestici, involucri per elettronica, parti outdoor (ASA), giunti e staffe meccaniche, prototipi funzionali per test termici.",
      },
    ],
    correlate: ["petg", "nylon-pa", "come-scegliere"],
    titoloProdotti: "Filamenti ABS/ASA consigliati",
    descrizioneProdotti: "ABS e ASA selezionati per resistenza termica e meccanica elevata. Richiedono enclosure.",
    prodottiConsigliati: [
      {
        nome: "eSUN ABS Standard 1000g",
        nomeBrevissimo: "eSUN ABS Standard",
        descrizione: "ABS classico di eSUN: buona resistenza termica fino a 100 °C, levigabile con acetone.",
        badge: "Best Value",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/32261_72f7bfc2.128x128.jpg",
        affiliateLink: "https://www.3djake.it/esun/abs-yellow-5",
      },
      {
        nome: "Elegoo ASA Standard Nero 1000g",
        nomeBrevissimo: "Elegoo ASA Standard",
        descrizione: "ASA di Elegoo resistente ai raggi UV: ideale per applicazioni outdoor come supporti e pannelli.",
        badge: "Qualità",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/46721_7d031e42.128x128.webp",
        affiliateLink: "https://eu.elegoo.com/products/asa-filament-1-75mm-colored-1kg?variant=47555441885460",
      },
      {
        nome: "Sunlu ABS Standard 1000g",
        nomeBrevissimo: "Sunlu ABS Standard",
        descrizione: "ABS economico di Sunlu con buona consistenza di stampa. Adatto a parti meccaniche interne.",
        badge: "Versatile",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/76775_17465241466819d7f2a16ae.128x128.png",
        affiliateLink: "https://www.3djake.it/sunlu/abs-red-7",
      },
    ],
  },

  {
    slug: "tpu",
    titolo: "Guida al TPU",
    sottotitolo: "Materiale flessibile per parti elastiche e resistenti",
    tipo: "TPU",
    icona: "🟣",
    intro:
      "Il TPU (Poliuretano Termoplastico) è il materiale flessibile per eccellenza nella stampa 3D FDM. Produce parti gommose, elastiche e resistenti agli urti — perfetto per guarnizioni, cover per telefoni, suole, grip e qualsiasi applicazione che richieda flessibilità.",
    parametri: [
      { label: "Temp. stampa", valore: "210–240 °C" },
      { label: "Temp. piatto", valore: "30–60 °C (opzionale)" },
      { label: "Difficoltà", valore: "Medio" },
      { label: "Enclosure", valore: "Non necessaria" },
      { label: "Durezza Shore A", valore: "85A–98A (più alto = più rigido)" },
    ],
    pros: [
      "Flessibile e gommoso — assorbe urti e vibrazioni",
      "Eccellente resistenza all'abrasione",
      "Resistente a oli, grassi e solventi leggeri",
      "Non si rompe ma si piega — lunga durata",
      "Ottima adesione tra layer per le parti flessibili",
    ],
    cons: [
      "Difficile da stampare con estrusori Bowden — meglio Direct Drive",
      "Stampa lenta: max 20–30 mm/s per evitare inceppamenti",
      "Molto igroscopico: assorbe umidità in poche ore",
      "La retraction va minimizzata (o azzerata) per evitare buckling",
    ],
    consigli: [
      "Se hai un estrusore Bowden, riduci la velocità a 15–20 mm/s",
      "Con Direct Drive puoi arrivare a 30–40 mm/s senza problemi",
      "Azzera o minimizza la retraction (max 1–2 mm) per evitare che il filamento si attorcigli",
      "Essicca prima di stampare: il TPU umido produce bolle e superficie porosa",
      "Usa shore 95A per bilanciare flessibilità e stampabilità",
      "Aumenta il numero di perimetri per parti più robuste mantenendo la flessibilità interna",
    ],
    sezioni: [
      {
        titolo: "Applicazioni ideali",
        testo:
          "Cover per smartphone e tablet, guarnizioni, ammortizzatori, suole e solette, grip per utensili, tappi e protezioni, pneumatici per robot e RC cars, parti anti-vibrazione per macchine.",
      },
      {
        titolo: "Shore A: quale scegliere?",
        testo:
          "Shore 85A: molto morbido, quasi gommoso puro. Shore 95A: equilibrio ideale tra flessibilità e stampabilità — il più consigliato per iniziare. Shore 98A: quasi rigido, simile al PETG flessibile, più facile da stampare.",
      },
      {
        titolo: "Migliori brand",
        testo:
          "eSUN eTPU-95A (economico e affidabile), Bambu Lab TPU 95A (eccellente su Bambu), Polymaker PolyFlex TPU95, Fiberlogy Fiberflex 40D (molto morbido).",
      },
    ],
    correlate: ["pla", "petg", "come-scegliere"],
    titoloProdotti: "Filamenti TPU consigliati",
    descrizioneProdotti: "TPU flessibile selezionato per qualità e stampabilità. Shore 95A: il più equilibrato per iniziare.",
    prodottiConsigliati: [
      {
        nome: "Polymaker PolyFlex TPU95 1000g",
        nomeBrevissimo: "Polymaker TPU 95A",
        descrizione: "TPU 95A di Polymaker: ottima flessibilità, basso stringing. Compatibile con estrusori Bowden e Direct Drive.",
        badge: "Best Value",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/28843_0061e651.128x128.png",
        affiliateLink: "https://www.3djake.it/polymaker/filamento-polyflex-yellow",
      },
      {
        nome: "eSUN eTPU-95A 1000g",
        nomeBrevissimo: "eSUN TPU 95A",
        descrizione: "TPU 95A di eSUN: affidabile e ben testato. Ottima resistenza all'abrasione e agli oli.",
        badge: "Qualità",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/32715_f5c60aae.128x128.jpg",
        affiliateLink: "https://www.3djake.it/esun/tpu-95a-rainbow-b",
      },
      {
        nome: "Elegoo TPU 95A 1000g",
        nomeBrevissimo: "Elegoo TPU 95A",
        descrizione: "TPU di Elegoo al prezzo più competitivo: buona elasticità e finitura superficiale.",
        badge: "Versatile",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/46673_13f14fc8.128x128.jpg",
        affiliateLink: "https://eu.elegoo.com/products/tpu-filament-1-75mm-colored-1kg?variant=47962766213396",
      },
    ],
  },

  {
    slug: "nylon-pa",
    titolo: "Guida al Nylon e PA",
    sottotitolo: "Resistenza meccanica estrema per parti funzionali",
    tipo: "NYLON",
    icona: "🔵",
    intro:
      "Il Nylon (Poliammide / PA) è il materiale tecnico più resistente meccanicamente tra i comuni filamenti FDM. Combina alta resistenza agli urti, ottima flessibilità strutturale, resistenza alla fatica e tolleranza alle temperature fino a 130–160 °C a seconda del tipo. Il prezzo è il compromesso: è difficile da stampare e molto igroscopico.",
    parametri: [
      { label: "Temp. stampa PA6/PA12", valore: "240–260 °C" },
      { label: "Temp. stampa PA-CF", valore: "260–280 °C" },
      { label: "Temp. piatto", valore: "70–90 °C" },
      { label: "Difficoltà", valore: "Difficile" },
      { label: "Igroscopico", valore: "Molto — essiccare sempre" },
    ],
    pros: [
      "Massima resistenza meccanica tra i materiali comuni FDM",
      "Buona resistenza termica (fino a 130–160 °C)",
      "Flessibile strutturalmente — non si rompe di schianto",
      "Resistente agli agenti chimici, oli e grassi",
      "PA-CF: rigidità estrema con peso minimo",
    ],
    cons: [
      "Igroscopicità estrema: assorbe umidità in poche ore dal momento dell'apertura",
      "Richiede enclosure e temperature elevate",
      "Warping possibile senza adesivo adeguato",
      "PA-CF richiede nozzle hardened (rubino, acciaio temperato)",
      "Costo più elevato rispetto a PLA/PETG",
    ],
    consigli: [
      "Essicca sempre la bobina prima di usarla: 80–90 °C per 8–12 ore in essiccatore",
      "Stampa direttamente dall'essiccatore con il tubo che parte dal dry box",
      "Usa una superficie adesiva (PEI + glue, Magigoo PA) per prevenire il warping",
      "L'enclosure è fondamentale per ridurre il warping e migliorare l'adesione tra layer",
      "Per PA-CF usa esclusivamente nozzle hardened: distrugge i nozzle in ottone in ore",
    ],
    sezioni: [
      {
        titolo: "PA6 vs PA12 vs PA-CF",
        testo:
          "PA6: il più comune, buona resistenza meccanica e termica. PA12: più flessibile, meno igroscopico del PA6, costoso. PA-CF (fibra di carbonio): rigidità e resistenza estreme con densità ridotta — il materiale per parti strutturali professionali. PA-GF (fibra di vetro): alternativa al CF, meno rigida ma più economica.",
      },
      {
        titolo: "Applicazioni ideali",
        testo:
          "Ingranaggi, boccole e cuscinetti, parti per droni e RC, supporti strutturali, parti automotive, guide lineari, componenti industriali leggeri, parti sostitutive per macchine.",
      },
    ],
    correlate: ["abs-asa", "pla-cf", "come-scegliere"],
    titoloProdotti: "Filamenti Nylon consigliati",
    descrizioneProdotti: "Nylon e PA selezionati per resistenza meccanica estrema. Essicca sempre prima di usarli.",
    prodottiConsigliati: [
      {
        nome: "Sunlu Nylon PA12 1000g",
        nomeBrevissimo: "Sunlu Nylon PA12",
        descrizione: "PA12 di Sunlu: meno igroscopico del PA6, ottima resistenza meccanica e flessibilità strutturale.",
        badge: "Best Value",
        imageUrl: "https://cdn.shopify.com/s/files/1/0704/0027/8683/files/PA12-CF_1_1a719201-be95-4755-9fb2-409006ef3b62.png?v=1770709583",
        affiliateLink: "https://it.store.sunlu.com/products/sunlu-engineering-filament-kollektion-epa-pcabs-pa6cf-pa12cf-pa6gf-1kg?variant=46808545165467",
      },
      {
        nome: "Fiberlogy Nylon PA12 Naturale 1000g",
        nomeBrevissimo: "Fiberlogy Nylon PA12",
        descrizione: "PA12 premium di Fiberlogy: tolleranze eccellenti e consistenza di stampa superiore.",
        badge: "Qualità",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/33859_423fb16f.128x128.jpg",
        affiliateLink: "https://www.3djake.it/fiberlogy/nylon-pa12-natural",
      },
      {
        nome: "Polymaker CoPA Nylon PA6/66 Nero 1000g",
        nomeBrevissimo: "Polymaker CoPA Nylon",
        descrizione: "Copolimero PA6/66 di Polymaker: massima resistenza termica e meccanica tra i Nylon comuni.",
        badge: "Versatile",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/30299_f1ff4ee8.128x128.png",
        affiliateLink: "https://www.3djake.it/polymaker/nylon-copa-6-6-6-black",
      },
    ],
  },

  {
    slug: "pla-cf",
    titolo: "Filamenti rinforzati con fibra di carbonio",
    sottotitolo: "Massima rigidità e aspetto professionale",
    icona: "⚫",
    intro:
      "I filamenti rinforzati con fibra di carbonio (CF) combinano la base polimerica (PLA, PETG, PA, ABS) con fibre di carbonio corte che aumentano drasticamente la rigidità e riducono il peso. L'aspetto superficiale è caratteristico: texture opaca grigio-scuro o nera con riflessi metallici.",
    parametri: [
      { label: "Temp. stampa PLA-CF", valore: "200–220 °C" },
      { label: "Temp. stampa PETG-CF", valore: "230–250 °C" },
      { label: "Temp. stampa PA-CF", valore: "260–280 °C" },
      { label: "Nozzle", valore: "Hardened obbligatorio (hardened steel, ruby)" },
      { label: "Difficoltà", valore: "Medio (dipende dalla base)" },
    ],
    pros: [
      "Rigidità superiore rispetto alla base polimerica standard",
      "Peso ridotto rispetto ad acciaio o alluminio",
      "Ottimo aspetto estetico professionale",
      "PLA-CF: facile da stampare con nozzle hardened",
      "PA-CF: massima resistenza meccanica disponibile in FDM",
    ],
    cons: [
      "Richiede obbligatoriamente un nozzle hardened",
      "Le fibre abradono in poche ore i nozzle in ottone standard",
      "Nessuna flessibilità — si rompe di schianto sotto stress",
      "Non paintable facilmente (superfici ruvide)",
      "Prezzo più elevato del materiale base",
    ],
    consigli: [
      "Investire in un nozzle hardened steel prima di stampare qualsiasi CF",
      "Abbassa la velocità rispetto al materiale base (-20%)",
      "PLA-CF è ottimo per iniziare con i CF grazie alla bassa temperatura",
      "Per massima resistenza meccanica usa PA-CF (ma con enclosure e alta temperatura)",
      "Non servono supporti speciali — comportamento simile alla base polimerica",
    ],
    sezioni: [
      {
        titolo: "Quale base scegliere?",
        testo:
          "PLA-CF: il più facile, ottimo per parti rigide decorative o funzionali non soggette a calore. PETG-CF: buon compromesso rigidità/temperatura. PA-CF: il più prestazionale — per parti strutturali ad alte prestazioni. ABS-CF: buona resistenza termica con rigidità aggiunta.",
      },
      {
        titolo: "Nozzle consigliati",
        testo:
          "Per uso occasionale: hardened steel (Micro-Swiss, E3D). Per uso intensivo: Ruby-tipped (Olsson Ruby). Evita assolutamente i nozzle in ottone standard: si consumano in 20–50 ore di stampa CF.",
      },
    ],
    correlate: ["pla", "nylon-pa", "come-scegliere"],
    titoloProdotti: "Filamenti in fibra di carbonio consigliati",
    descrizioneProdotti: "CF selezionati per rigidità e aspetto professionale. Richiedono nozzle hardened obbligatoriamente.",
    prodottiConsigliati: [
      {
        nome: "Bambu Lab PLA-CF Nero 1000g",
        nomeBrevissimo: "Bambu Lab PLA-CF",
        descrizione: "PLA-CF di Bambu Lab: il più facile da stampare tra i CF, ottima finitura opaca grigio-nero.",
        badge: "Best Value",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/48115_9c00e495.128x128.webp",
        affiliateLink: "https://www.3djake.it/bambu-lab/pla-cf-black",
      },
      {
        nome: "Polymaker PolyLite PLA-CF Nero 1000g",
        nomeBrevissimo: "Polymaker PLA-CF",
        descrizione: "PLA-CF di Polymaker: rigidità superiore, superficie opaca professionale. Stampa a 200–220 °C.",
        badge: "Qualità",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/28271_aed6d414.128x128.png",
        affiliateLink: "https://www.3djake.it/polymaker/polylite-pla-cf-black",
      },
      {
        nome: "eSUN PLA-CF Standard 1000g",
        nomeBrevissimo: "eSUN PLA-CF",
        descrizione: "PLA-CF economico di eSUN: buon compromesso tra prestazioni e prezzo, ideale per iniziare con i filamenti CF.",
        badge: "Versatile",
        imageUrl: "https://ueeshop.ly200-cdn.com/u_file/UPBC/UPBC810/2409/13/products/8cb5091f28.jpg",
        affiliateLink: "https://www.amazon.it/dp/B0CNC835PY?tag=pignabot-21",
      },
    ],
  },

  {
    slug: "come-scegliere",
    titolo: "Come scegliere il filamento giusto",
    sottotitolo: "Guida all'acquisto per principianti e intermedi",
    icona: "🎯",
    intro:
      "Con decine di materiali disponibili, scegliere il filamento giusto può sembrare complesso. Questa guida ti aiuta a scegliere in base all'utilizzo finale, alla stampante e al budget — senza sprecare soldi su materiali sbagliati.",
    pros: [],
    cons: [],
    consigli: [
      "Se sei alle prime armi: inizia con PLA da un brand noto (Bambu, eSUN, Polymaker)",
      "Per parti funzionali leggere: PETG è il miglior compromesso",
      "Per applicazioni all'esterno (UV): ASA o PETG",
      "Per massima flessibilità: TPU 95A Shore",
      "Per alte temperature (> 80 °C): ABS, ASA, o PA",
      "Per massima resistenza meccanica: PA-CF o PA-GF",
      "Non comprare da brand sconosciuti senza recensioni: risparmia poco e rischi problemi di qualità",
    ],
    sezioni: [
      {
        titolo: "Scelta per applicazione",
        testo:
          "Decorazioni/modelli: PLA Standard o PLA Matte. Prototipi funzionali: PLA+ o PETG. Parti meccaniche leggere: PETG o ABS. Applicazioni outdoor: ASA o PETG. Parti flessibili: TPU 95A. Ingranaggi/parti ad alto carico: PA o PA-CF. Parti a contatto con cibo freddo: PETG food-safe o PLA food-safe (solo nuovi nozzle in acciaio!).",
      },
      {
        titolo: "Scelta per stampante",
        testo:
          "Stampante entry-level senza enclosure: PLA, PLA+, PETG. Con enclosure: tutti i materiali. Bowden estrusore: evita TPU morbido (< 95A). Direct Drive: tutti i materiali senza limiti. Nozzle in ottone standard: PLA, PETG, ABS, TPU. Con nozzle hardened: tutti i CF, PA-CF, PA-GF.",
      },
      {
        titolo: "Budget vs qualità",
        testo:
          "Budget (< 15 €/kg): 3DJake basic, eSUN standard. Mid-range (15–25 €/kg): Bambu Lab, Polymaker, Fiberlogy. Premium (> 25 €/kg): Prusament, Fillamentum, ColorFabb. I brand premium garantiscono tolleranze più strette (± 0.02–0.03 mm) e meno rotture durante la stampa. Per uso occasionale il budget va bene; per produzione consiglio mid-range.",
      },
      {
        titolo: "Diametro: 1.75 vs 2.85 mm",
        testo:
          "Il 99% delle stampanti consumer usa 1.75 mm. Il 2.85 mm è usato da Ultimaker, alcuni Prusa e macchine professionali. Verifica sempre prima di acquistare.",
      },
    ],
    correlate: ["pla", "petg", "tpu", "abs-asa", "conservazione"],
  },

  {
    slug: "conservazione",
    titolo: "Come conservare i filamenti",
    sottotitolo: "Mantieni le bobine in condizioni ottimali ed evita stampe fallite",
    icona: "📦",
    intro:
      "L'umidità è il nemico principale dei filamenti FDM. PLA, PETG, Nylon e TPU assorbono acqua dall'aria — e anche poche ore di esposizione possono compromettere la qualità di stampa con bolle, stringing e superfici brutte. Una corretta conservazione prolunga la vita delle bobine e ti fa risparmiare denaro.",
    pros: [],
    cons: [],
    consigli: [
      "Conserva sempre in sacchetti ziplock con silica gel (colore-change per monitorare saturazione)",
      "Un contenitore ermetico dedicato (dry box) è ancora meglio dei sacchetti",
      "Rigenera la silica gel in forno a 120 °C per 2–3 ore quando diventa satura",
      "Se la bobina crepita durante la stampa, è umida: essicca prima di continuare",
      "Stampa direttamente dall'essiccatore per i materiali più sensibili (Nylon, TPU, PETG)",
    ],
    sezioni: [
      {
        titolo: "Livelli di igroscopicità",
        testo:
          "Basso (PLA, ABS): possono stare all'aria qualche giorno senza grossi problemi. Medio (PETG, ASA): iniziano a deteriorarsi dopo 12–24 ore di esposizione. Alto (TPU, PLA+): peggiorano in 6–12 ore. Molto alto (Nylon/PA, PVA): compromessi in 2–4 ore — usare sempre dry box.",
      },
      {
        titolo: "Come essiccare una bobina",
        testo:
          "Forno di casa: 45–65 °C per 4–8 ore (verifica che le parti plastiche della bobina reggano). Essiccatore alimentare: il metodo più comune e pratico. Essiccatore dedicato per filamenti (Polymaker PolyDryer, Sunlu Filament Dryer): la soluzione migliore — mantiene la bobina asciutta durante la stampa.",
      },
      {
        titolo: "Segnali di umidità eccessiva",
        testo:
          "Crepitii o scoppiettii durante la stampa, bolle o superfici ruvide/porose, stringing eccessivo rispetto alla norma, rotture frequenti del filamento, colori tendenti a cambiare leggermente.",
      },
      {
        titolo: "Dry box fai-da-te",
        testo:
          "Una scatola ermetica IKEA o Tupperware con fori passacavo (Bowden PTFE da 4mm) + silica gel = dry box funzionale per 5–10 euro. Alternativa: contenitori Sunlu Dry Box pronto all'uso con riscaldamento integrato.",
      },
    ],
    correlate: ["come-scegliere", "pla", "nylon-pa"],
    prodottiConsigliati: [
      {
        nome: "eSUN eBOX Lite",
        nomeBrevissimo: "eSUN eBOX Lite",
        descrizione:
          "Dry box compatta con riscaldamento fino a 55 °C. Puoi stampare direttamente dalla scatola senza togliere la bobina. Ottimo per chi inizia.",
        badge: "Best Value",
        asin: "B094XXJMT6",
        imageUrl: "https://m.media-amazon.com/images/I/618dWl0PuuL._AC_SL1500_.jpg",
        affiliateLink: "https://amzn.to/4s0QBZP",
      },
      {
        nome: "SUNLU FilaDryer S1 Plus",
        nomeBrevissimo: "SUNLU FilaDryer S1+",
        descrizione:
          "Essiccatore con ventola integrata per calore uniforme. Compatibile con PLA, PETG, ABS, Nylon e TPU. Display digitale e timer.",
        badge: "Bestseller",
        asin: "B09HJL95RH",
        imageUrl: "https://m.media-amazon.com/images/I/7110An+nO1L._SL1500_.jpg",
        affiliateLink: "https://amzn.to/3N91w4E",
      },
      {
        nome: "Creality Dryer Box Pro",
        nomeBrevissimo: "Creality Dryer Box Pro",
        descrizione:
          "Riscaldamento 360° per un'asciugatura uniforme. Compatibile con filamenti 1.75 e 2.85 mm. Buona capacità e costruzione solida.",
        badge: "Versatile",
        asin: "B0DN5LK4HH",
        imageUrl: "https://m.media-amazon.com/images/I/71hBHGU32yL._SL1500_.jpg",
        affiliateLink: "https://amzn.to/46S5YeD",
      },
      {
        nome: "SUNLU AMS Heater (4 bobine)",
        nomeBrevissimo: "SUNLU AMS Heater",
        descrizione:
          "Progettato per Bambu Lab AMS Gen 1: asciuga e stampa fino a 4 bobine contemporaneamente. Raggiunge 70 °C in soli 20 minuti.",
        badge: "Per Bambu Lab",
        asin: "B0FJL1G9KY",
        imageUrl: "https://m.media-amazon.com/images/I/61pWwR-JtlL._AC_SL1500_.jpg",
        affiliateLink: "https://amzn.to/40oS28l",
      },
    ],
  },

  // ── PETG-CF ────────────────────────────────────────────────────────────────
  {
    slug: "petg-cf",
    titolo: "Guida al PETG-CF",
    sottotitolo: "Resistenza meccanica e termica con fibra di carbonio",
    tipo: "PETG-CF",
    icona: "🔷",
    intro:
      "Il PETG-CF combina la base PETG — impermeabile, resistente agli urti e facile da stampare — con fibre di carbonio corte che aumentano significativamente la rigidità e riducono il peso. Il risultato è un materiale tecnico ad alte prestazioni con un caratteristico aspetto opaco grigio-scuro, ideale per parti funzionali che richiedono sia resistenza meccanica che termica.",
    parametri: [
      { label: "Temp. stampa",   valore: "230–260 °C" },
      { label: "Temp. piatto",   valore: "70–90 °C" },
      { label: "Nozzle",         valore: "Hardened obbligatorio (acciaio temperato o rubino)" },
      { label: "Difficoltà",     valore: "Medio" },
      { label: "Enclosure",      valore: "Consigliata ma non obbligatoria" },
    ],
    pros: [
      "Rigidità nettamente superiore al PETG standard",
      "Mantiene la resistenza all'umidità e agli agenti chimici del PETG",
      "Aspetto estetico professionale — opaco, texture carbonio",
      "Nessun warping significativo (meglio di ABS e PA-CF)",
      "Temperature di stampa più basse rispetto a PA-CF",
      "Ottima adesione tra layer anche senza enclosure",
    ],
    cons: [
      "Richiede obbligatoriamente un nozzle hardened",
      "Più stringing del PETG standard — da gestire con calibrazione",
      "Fragile agli urti puri (le fibre aumentano rigidità, non tenacità)",
      "Prezzo più elevato del PETG base",
      "Superficie più ruvida del PETG — difficile da levigare",
    ],
    consigli: [
      "Usa sempre un nozzle in acciaio temperato o hardened: il PETG-CF logora l'ottone in poche ore",
      "Stampa a 240–250 °C per ridurre lo stringing; aumenta se hai under-extrusion",
      "Aumenta il flow del 5–8% rispetto al PETG standard per compensare la minore scorrevolezza",
      "L'enclosure non è obbligatoria ma riduce lo stringing e migliora la coesione dei layer",
      "Abbassa la velocità del 15–20% rispetto al PETG base per risultati più precisi",
      "Essicca la bobina a 65 °C per 4–6 ore se rimasta all'aria — il PETG-CF è igroscopico",
    ],
    sezioni: [
      {
        titolo: "PETG-CF vs PLA-CF vs PA-CF",
        testo:
          "PLA-CF: il più facile, temperature basse, ottimo per parti rigide non termiche. PETG-CF: bilanciato — più resistente al calore del PLA-CF (fino a 80–85 °C), impermeabile, non richiede enclosure. PA-CF: il più prestazionale ma difficile da stampare, temperature elevate e enclosure obbligatoria. Per la maggior parte delle applicazioni funzionali quotidiane, il PETG-CF è il punto di equilibrio ideale.",
      },
      {
        titolo: "Applicazioni ideali",
        testo:
          "Parti meccaniche leggere (staffe, supporti, giunti), componenti per droni, telai RC, custodie per elettronica, parti outdoor resistenti agli UV, elementi strutturali stampanti 3D, protezioni e coperture in ambienti umidi.",
      },
      {
        titolo: "Migliori brand",
        testo:
          "Bambu Lab PETG-CF (ottimo per stampanti Bambu, nozzle hardened incluso nelle X-series), eSUN PETG+CF (economico e affidabile), Polymaker PolyMax PETG-CF (tolleranze eccellenti), 3DJake PETG-CF (buon rapporto qualità-prezzo).",
      },
    ],
    correlate: ["pla-cf", "petg", "nylon-pa"],
    titoloProdotti: "Filamenti PETG-CF consigliati",
    descrizioneProdotti: "PETG rinforzato con fibra di carbonio: resistenza e rigidità senza rinunciare alla stampabilità. Nozzle hardened obbligatorio.",
    prodottiConsigliati: [
      {
        nome: "Bambu Lab PETG-CF Nero 1000g",
        nomeBrevissimo: "Bambu Lab PETG-CF",
        descrizione: "PETG-CF di Bambu Lab: ottima stampabilità, specie sulle stampanti Bambu X-series con nozzle hardened integrato.",
        badge: "Best Value",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/48116_d1a7ddb5.128x128.webp",
        affiliateLink: "https://www.3djake.it/bambu-lab/petg-cf-black",
      },
      {
        nome: "Polymaker PolyMax PETG-CF Nero 1000g",
        nomeBrevissimo: "Polymaker PETG-CF",
        descrizione: "PETG-CF premium di Polymaker: tolleranze strettissime, basso stringing e ottima adesione tra layer.",
        badge: "Qualità",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/28272_6f3e2d00.128x128.png",
        affiliateLink: "https://www.3djake.it/polymaker/polymide-petgcf-black",
      },
      {
        nome: "eSUN PETG+CF Nero 1000g",
        nomeBrevissimo: "eSUN PETG-CF",
        descrizione: "PETG-CF economico di eSUN: buona rigidità e resistenza all'umidità, ideale per chi inizia con i compositi.",
        badge: "Versatile",
        imageUrl: "https://ueeshop.ly200-cdn.com/u_file/UPBC/UPBC810/2411/25/products/5e619cb995.jpg",
        affiliateLink: "https://www.3djake.it/esun/petg-cf-black",
      },
    ],
  },

  // ── PC ─────────────────────────────────────────────────────────────────────
  {
    slug: "pc",
    titolo: "Guida al Policarbonato (PC)",
    sottotitolo: "Il materiale più resistente al calore tra i termoplastici FDM",
    tipo: "PC",
    icona: "🔴",
    intro:
      "Il Policarbonato (PC) è il materiale tecnico con la resistenza termica più alta tra i filamenti FDM comuni: regge fino a 110–130 °C senza deformarsi. È trasparente nella versione naturale, molto resistente agli urti e agli agenti chimici. Richiede però temperature di stampa elevate, enclosure obbligatoria e una stampante ben tarata. Non è per principianti, ma per applicazioni industriali o prototipi funzionali ad alte prestazioni non ha eguali.",
    parametri: [
      { label: "Temp. stampa",   valore: "250–300 °C" },
      { label: "Temp. piatto",   valore: "90–120 °C" },
      { label: "Enclosure",      valore: "Obbligatoria — temperatura interna > 50 °C" },
      { label: "Difficoltà",     valore: "Difficile" },
      { label: "Igroscopico",    valore: "Sì — essiccare sempre" },
    ],
    pros: [
      "Resistenza termica fino a 110–130 °C (deflection temperature)",
      "Eccellente resistenza agli urti — non si rompe di schianto",
      "Ottica: versione trasparente con trasmissione luce > 85%",
      "Resistente ad acidi leggeri, oli e carburanti",
      "Ottima resistenza alla fatica meccanica ciclica",
      "Materiale usato nell'industria (elmetti, visiere, componentistica auto)",
    ],
    cons: [
      "Richiede temperature molto elevate (260–300 °C) — non tutte le stampanti le reggono",
      "Warping forte: enclosure con temperatura interna > 50 °C è obbligatoria",
      "Aderisce ai piani in modo irregolare — necessita surface preparation accurata",
      "Molto igroscopico: si degrada in ore se non conservato correttamente",
      "Il PC trasparente ingiallisce con esposizione UV prolungata",
      "Prezzo più elevato di PLA/PETG/ABS",
    ],
    consigli: [
      "Usa un hot-end all-metal: il PTFE non regge le temperature richieste dal PC",
      "Stampa a 270–290 °C per la migliore adesione tra layer e minore porosità",
      "Il piano deve essere a 100–110 °C con uno strato di collante (Magigoo PC, glue stick con PEI)",
      "Enclosure con temperatura > 50 °C è fondamentale per ridurre il warping",
      "Essicca sempre la bobina: 80 °C per 6–8 ore prima di ogni uso",
      "Stampa lentamente (30–50 mm/s) per massima coesione dei layer",
      "Se la stampante non raggiunge 260 °C, considera il PC/ABS (blend più facile da stampare)",
    ],
    sezioni: [
      {
        titolo: "PC vs ABS vs PA",
        testo:
          "ABS: simile per temperatura ma più facile da stampare, resistenza termica fino a 100 °C. PC: temperature più alte, resistenza termica superiore (fino a 130 °C) e migliore resistenza agli urti. PA (Nylon): resistenza meccanica estrema e flessibilità strutturale, ma più igroscopico. Scegli PC quando hai bisogno di resistenza termica molto elevata mantenendo ottima trasparenza o dimensioni precise.",
      },
      {
        titolo: "PC/ABS: il blend più stampabile",
        testo:
          "Il blend PC/ABS combina la resistenza termica del PC con la stampabilità dell'ABS. Temperature di stampa 240–260 °C, enclosure consigliata ma meno critica. La resistenza termica è intermedia (95–105 °C) ma la stampabilità è nettamente migliore del PC puro. Ottimo compromesso per chi vuole le proprietà del PC senza affrontare la curva di apprendimento del PC 100%.",
      },
      {
        titolo: "Applicazioni ideali",
        testo:
          "Involucri per elettronica che dissipano calore, componenti automotive interni, parti per macchine CNC, supporti per LED ad alta potenza, attrezzature per sterilizzazione, visiere e protezioni trasparenti, stampi per colata resina a bassa temperatura.",
      },
      {
        titolo: "Preparazione della superficie",
        testo:
          "PEI texture + glue stick: la combinazione più affidabile. Garolite (G10): ottima per PC, non serve collante. BuildTak: buona adesione ma rimozione difficile. Kapton tape + hairspray: soluzione classica per chi ha piatti in vetro. Dopo la stampa, lascia raffreddare completamente prima di rimuovere (il PC si stacca facilmente a freddo).",
      },
    ],
    correlate: ["abs-asa", "nylon-pa", "come-scegliere"],
    titoloProdotti: "Filamenti PC e PC/ABS consigliati",
    descrizioneProdotti: "Policarbonato e blends selezionati per resistenza termica estrema. Richiedono all-metal hot-end e enclosure.",
    prodottiConsigliati: [
      {
        nome: "Polymaker PolyMax PC Nero 1000g",
        nomeBrevissimo: "Polymaker PolyMax PC",
        descrizione: "PC ottimizzato di Polymaker: temperatura ridotta rispetto al PC standard (240–260 °C), ottima resistenza agli urti e al calore.",
        badge: "Best Value",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/29044_2dcaa79c.128x128.png",
        affiliateLink: "https://www.3djake.it/polymaker/polymax-pc-black",
      },
      {
        nome: "Fillamentum PC/ABS Traffic Black 1000g",
        nomeBrevissimo: "Fillamentum PC/ABS",
        descrizione: "Blend PC/ABS premium di Fillamentum: ottima stampabilità con proprietà termiche vicine al PC puro. Tolleranze eccellenti.",
        badge: "Qualità",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/33046_7e6b6b1c.128x128.jpg",
        affiliateLink: "https://www.3djake.it/fillamentum/pc-abs-traffic-black",
      },
      {
        nome: "Prusament PC Blend 970g",
        nomeBrevissimo: "Prusament PC Blend",
        descrizione: "PC Blend di Prusament con tolleranze ±0.02 mm: resistenza termica fino a 113 °C, ottima per stampanti Prusa.",
        badge: "Precisione",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/45408_b62e8bb4.128x128.jpg",
        affiliateLink: "https://www.3djake.it/prusament/pc-blend-prusament-natural-1",
      },
    ],
  },

  // ── CALIBRAZIONE ───────────────────────────────────────────────────────────
  {
    slug: "calibrazione",
    titolo: "Come calibrare la stampante 3D",
    sottotitolo: "Guida pratica a temperatura, flusso, retraction e primo layer",
    icona: "🔧",
    intro:
      "Una calibrazione corretta è la differenza tra stampe perfette e ore di fallimenti. Non importa quanto costoso sia il filamento: se la stampante non è calibrata, i risultati saranno sempre deludenti. Questa guida copre le calibrazioni fondamentali nell'ordine giusto — dalla temperatura al flusso, dalla retraction al primo layer — per ottenere il massimo da ogni bobina.",
    parametri: [
      { label: "Tempo richiesto",   valore: "2–4 ore (una volta per setup)" },
      { label: "Frequenza",         valore: "Ad ogni cambio filamento o brand" },
      { label: "Difficoltà",        valore: "Medio — richiede pazienza" },
      { label: "Strumenti",         valore: "Calibration cube, temp tower, flow test" },
    ],
    pros: [],
    cons: [],
    consigli: [
      "Calibra sempre nell'ordine: temperatura → flusso (E-steps) → retraction → primo layer",
      "Una temperature tower ti dà la temperatura ottimale visivamente in un'unica stampa",
      "Non usare filamenti economici sconosciuti per calibrare: la variabilità del diametro falsa i risultati",
      "Ri-calibra il flusso ad ogni cambio di brand anche per lo stesso tipo di filamento",
      "Il cubo di calibrazione (20mm) è il test finale — misura con calibro: deve essere ±0.2mm",
      "Annota sempre i parametri ottimali per ogni bobina in un foglio o nel slicer",
    ],
    sezioni: [
      {
        titolo: "1. Temperature Tower — trovare la temperatura ottimale",
        testo:
          "Stampa una temperature tower scaricando il modello da Printables o Thingiverse. Il modello cambia temperatura ogni sezione (es. da 220 °C a 190 °C a step di 5 °C). Cerca la sezione con: superficie più liscia, migliore definizione dei ponti (bridging), nessun stringing tra i pilastri. Quella è la tua temperatura ottimale. Parti sempre dai valori consigliati dal produttore del filamento e allargati di ±15 °C.",
      },
      {
        titolo: "2. E-Steps / Flow Rate — calibrare l'estrusione",
        testo:
          "Segna 100mm di filamento sopra l'estrusore. Estrudi 100mm dal software. Misura quanto è effettivamente uscito. Se sono usciti meno di 100mm, aumenta gli E-steps (o flow%); se di più, diminuisci. Formula: E-steps corretti = (E-steps attuali × 100) / mm effettivi estrussi. Dopo gli E-steps base, rifina con il cube test: misura le pareti e correggi il flow% nello slicer.",
      },
      {
        titolo: "3. Retraction — eliminare lo stringing",
        testo:
          "Stampa un test di retraction (es. twin towers) a varie distanze (2mm, 4mm, 6mm per Bowden; 1mm, 2mm, 3mm per Direct Drive). Cerca la combinazione con meno fili tra le torri senza sotto-estrusione. Parametri tipici: Direct Drive = 0.5–2mm a 25–45 mm/s; Bowden = 4–7mm a 40–60 mm/s. Troppa retraction causa heat creep e click dell'estrusore.",
      },
      {
        titolo: "4. Livellamento e primo layer",
        testo:
          "Il primo layer è il più critico. Usa il babystep Z durante la prima stampa per trovare l'offset esatto: il layer deve essere leggermente compresso (aspetto traslucido, non gonfi e arrotondati). Il Live Adjust Z di PrusaSlicer e il baby step in Klipper/Marlin permettono di affinare in real-time. Con stampanti Bambu Lab e Creality con auto-leveling, usa il paper test solo come verifica finale.",
      },
      {
        titolo: "5. Pressure Advance / Linear Advance",
        testo:
          "Klipper chiama questa funzione Pressure Advance (PA), Marlin Linear Advance (LA). Compensa la compressione del filamento nell'hotend agli angoli e alle accelerazioni. Stampa il test pattern ufficiale Klipper o il test LA di Teaching Tech. Il valore corretto elimina i 'blobbing' agli angoli e il sotto-riempimento dopo le curve. Tipicamente: 0.03–0.07 per Direct Drive, 0.5–1.0 per Bowden.",
      },
      {
        titolo: "Strumenti e test consigliati",
        testo:
          "Calibration Cube (20mm): misura dimensioni X/Y/Z con calibro digitale. Temperature Tower: da Printables, adatta al tuo slicer. Retraction Test (twin towers): verifica stringing. Overhang Test: testa angoli 30°/45°/60°/70°. Bridging Test: testa ponti a varie lunghezze. Tutti questi file sono gratuiti su Printables.com o Thingiverse.com.",
      },
    ],
    correlate: ["stampa-veloce", "inceppamento", "come-scegliere"],
  },

  // ── STAMPA VELOCE ──────────────────────────────────────────────────────────
  {
    slug: "stampa-veloce",
    titolo: "Stampa ad alta velocità",
    sottotitolo: "Come stampare più veloce senza perdere qualità",
    icona: "⚡",
    intro:
      "Le stampanti moderne come Bambu Lab, Creality K-series e Voron con Klipper sono capaci di velocità impensabili fino a pochi anni fa: 300–600 mm/s sono ormai realtà. Ma stampare veloce non significa semplicemente alzare lo slider della velocità nello slicer — richiede calibrazioni specifiche, filamenti adatti e una stampante preparata per reggere le accelerazioni elevate.",
    parametri: [
      { label: "Velocità base (PLA)",      valore: "60–150 mm/s" },
      { label: "Velocità alta (PLA HS)",   valore: "200–400 mm/s" },
      { label: "Accelerazione",            valore: "3.000–20.000 mm/s² (dipende dalla macchina)" },
      { label: "Requisito principale",     valore: "Input shaping + Pressure Advance (Klipper)" },
    ],
    pros: [],
    cons: [],
    consigli: [
      "Non alzare solo la velocità: aumenta anche la temperatura di 5–10 °C per ogni +50% di velocità",
      "I filamenti High Speed (HS) come Bambu PLA HF sono formulati per scorrere meglio ad alta velocità",
      "L'Input Shaping (Klipper/Bambu) è fondamentale: senza di esso a 200+ mm/s si hanno ghost/ringing sulle pareti",
      "Aumenta il flusso massimo volumetrico nello slicer (Volumetric Speed): punto di partenza 15–20 mm³/s",
      "Abbassa lo strato a 0.15–0.20mm per compensare la minore qualità superficiale ad alta velocità",
      "Il raffreddamento deve essere eccellente: parti non raffreddate bene collassano a velocità elevate",
    ],
    sezioni: [
      {
        titolo: "I limiti fisici della stampa veloce",
        testo:
          "Ci sono tre bottleneck principali: (1) Flusso volumetrico: l'hotend ha un limite di quanti mm³/s riesce a fondere. Un hotend standard arriva a ~10–15 mm³/s; un Volcano/CHT ad alta velocità a 30–50 mm³/s. (2) Risonanza meccanica: a velocità elevate, la struttura della stampante vibra causando ghost/ringing. Input Shaping misura e compensa queste vibrazioni. (3) Raffreddamento: il materiale depositato deve solidificarsi prima che il layer successivo lo schiacci — ventola potenziata e temperatura ambiente adeguata.",
      },
      {
        titolo: "Input Shaping (Resonance Compensation)",
        testo:
          "Klipper offre Input Shaping con accelerometro ADXL345 integrato nella maggior parte delle build. Bambu Lab lo fa in automatico durante il calibration initial setup. Il principio: misura la frequenza di risonanza della stampante in X e Y, poi filtra le frequenze problematiche dal motion planning. Il risultato: zero ghost/ringing anche a 250+ mm/s. Su stampanti con Marlin si può usare una versione manuale (Marlin 2.x) ma meno precisa.",
      },
      {
        titolo: "Filamenti HS (High Speed)",
        testo:
          "I filamenti HS sono formulati con additivi che migliorano la scorrevolezza ad alta temperatura senza degradare le proprietà meccaniche. Esempi: Bambu Lab PLA HF (High Flow), eSUN eHighSpeed PLA, Polymaker PolyLite PLA. Caratteristiche chiave: viscosità ridotta ad alta temperatura, minor stringing, maggiore stabilità termica alle velocità elevate. Non sono necessari per velocità < 150 mm/s, ma fanno differenza a 250+ mm/s.",
      },
      {
        titolo: "Impostazioni slicer per la stampa veloce",
        testo:
          "In OrcaSlicer/BambuStudio: imposta Max Volumetric Speed (es. 20 mm³/s per PLA HS) invece di una velocità fissa — lo slicer calcola la velocità ottimale per ogni geometria. Aumenta la temperatura di 5–10 °C rispetto alla norma. Abbassa la Layer Height al 50–75% del diametro nozzle per migliore adesione. Aumenta i giri della ventola al 100% per raffreddamento massimo. Usa Line Width più larga (0.6–0.8mm) per aumentare il flusso senza alzare la velocità lineare.",
      },
      {
        titolo: "Stampanti ottimizzate per la velocità",
        testo:
          "Bambu Lab A1/P1/X1 (CoreXY con input shaping automatico): 300–500 mm/s out of the box. Creality K1/K1 Max (CoreXY Klipper): 300–600 mm/s dopo ottimizzazione. Voron 2.4/Trident (DIY Klipper): 300–800 mm/s con hotend CHT. Prusa MK4/Core One (Nextruder): 200–300 mm/s con qualità eccellente. Stampanti Cartesian classiche (Ender 3): limite pratico 80–120 mm/s per il design meccanico.",
      },
    ],
    correlate: ["calibrazione", "pla", "petg"],
    prodottiConsigliati: [
      {
        nome: "Bambu Lab PLA HF (High Flow) 1000g",
        nomeBrevissimo: "Bambu Lab PLA HF",
        descrizione: "PLA High Flow di Bambu Lab: formulato per velocità 300–500 mm/s. Ottimo su Bambu X1/P1 con AMS.",
        badge: "Best Value",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/48114_c8b3e7e4.128x128.webp",
        affiliateLink: "https://www.3djake.it/bambu-lab/pla-hf-black",
      },
      {
        nome: "eSUN PLA High Speed 1000g",
        nomeBrevissimo: "eSUN PLA HS",
        descrizione: "PLA High Speed di eSUN: buon flusso ad alta velocità, compatibile con tutte le stampanti CoreXY. Prezzo contenuto.",
        badge: "Veloce",
        imageUrl: "https://ueeshop.ly200-cdn.com/u_file/UPBC/UPBC810/2411/25/products/5e619cb995.jpg",
        affiliateLink: "https://www.3djake.it/esun/pla-high-speed-black",
      },
      {
        nome: "Polymaker PolyLite PLA Rapide 1000g",
        nomeBrevissimo: "Polymaker PLA Rapide",
        descrizione: "PLA ad alta velocità di Polymaker con tolleranze ±0.03mm: qualità costante anche a 250+ mm/s.",
        badge: "Qualità",
        imageUrl: "https://3d.nice-cdn.com/upload/image/product/large/default/28842_b0123abc.128x128.png",
        affiliateLink: "https://www.3djake.it/polymaker/polylite-pla-rapide-black",
      },
    ],
  },

  // ── INCEPPAMENTO ───────────────────────────────────────────────────────────
  {
    slug: "inceppamento",
    titolo: "Come risolvere gli inceppamenti",
    sottotitolo: "Diagnosi e soluzione ai problemi più comuni della stampa 3D",
    icona: "🔩",
    intro:
      "L'inceppamento (clog o jam) dell'ugello è uno dei problemi più frequenti nella stampa 3D FDM. Si manifesta come sotto-estrusione, linee mancanti, click dell'estrusore o filamento che non fuoriesce. Fortunatamente, la maggior parte degli inceppamenti segue pattern prevedibili — con la diagnosi giusta si risolve in pochi minuti.",
    parametri: [
      { label: "Sintomo principale",  valore: "Estrusore clicca, sotto-estrusione, filamento non esce" },
      { label: "Causa più comune",    valore: "Temperatura troppo bassa o filamento umido" },
      { label: "Tempo di risoluzione", valore: "5–30 minuti" },
    ],
    pros: [],
    cons: [],
    consigli: [
      "Il 70% degli inceppamenti si risolve con una 'cold pull' (atomic pull)",
      "Se l'estrusore clicca, verifica prima la temperatura — potrebbe essere 5 °C troppo bassa",
      "Filamento crepitante durante la stampa = filamento umido → essicca prima di continuare",
      "Non stampare mai sotto la temperatura minima indicata dal produttore",
      "Pulisci l'ugello con un ago da 0.3mm ogni 5–10 kg di filamento stampato",
      "Dopo un inceppamento, rimuovi sempre tutto il filamento prima di riprovare",
    ],
    sezioni: [
      {
        titolo: "Diagnosi rapida: che tipo di problema è?",
        testo:
          "Estrusore clicca a vuoto (skip): l'hotend è ostruito o la temperatura è troppo bassa. Sotto-estrusione intermittente: diametro filamento variabile, bobina aggrovigliata o hotend parzialmente ostruito. Nessun filamento esce: inceppamento totale o heat creep. Click + filamento si rompe: temperatura troppo bassa o retraction eccessiva. Filamento esce laterale dall'hotend: PTFE liner danneggiato o gap tra PTFE e nozzle.",
      },
      {
        titolo: "Cold Pull (Atomic Pull) — la soluzione principe",
        testo:
          "Scalda l'hotend alla temperatura di stampa del materiale inceppato. Inserisci del Nylon o PLA se l'ugello è ostruito. Escludi poi il filamento manualmente mentre abbassi la temperatura a 90 °C (PLA) o 130 °C (PETG/ABS). Tira con forza decisa ma costante. Il filamento uscirà portando con sé i residui nell'ugello. Ripeti 2–3 volte fino a quando il filamento estratto non ha più residui scuri. È il metodo più efficace senza smontare l'hotend.",
      },
      {
        titolo: "Heat Creep — l'inceppamento subdolo",
        testo:
          "Il heat creep avviene quando il calore risale dall'hotend nella zona fredda (cold zone), fondendo il filamento troppo in alto. Il filamento solidifica nella cold zone creando un tappo che l'estrusore non riesce a spingere. Sintomi: stampa che funziona all'inizio poi si blocca dopo 10–30 minuti. Cause: ventola del radiatore inefficiente, temperatura ambiente elevata, velocità di stampa troppo bassa (poco filamento a raffreddare la cold zone). Soluzione: pulisci o sostituisci la ventola del radiatore, aumenta la velocità minima, considera un all-metal hotend con migliore dissipazione.",
      },
      {
        titolo: "Aghi e strumenti per la pulizia",
        testo:
          "Ago da 0.3–0.4mm (incluso in molte stampanti): con l'hotend caldo, inserisci nell'ugello dall'alto per spingere i residui. Piano di pulizia: brucia i residui sull'ugello con un accendino (catrami e bruciato) poi passa l'ago. Drill bit set: set di micro punte per pulire ugelli senza smontarli. Acetone (ABS/ASA): immergi l'ugello smontato per sciogliere i residui di materiale. Non usare acetone su componenti plastica dell'hotend.",
      },
      {
        titolo: "Prevenzione: come evitare gli inceppamenti",
        testo:
          "Stampa sempre alla temperatura corretta per il filamento (usa una temperature tower). Essicca i filamenti igroscopici prima dell'uso. Usa filamenti di qualità con diametro costante (±0.05mm). Taglia sempre il filamento a 45° prima di inserirlo. Esegui una retraction calibrata (non eccessiva). Sostituisci il tubo PTFE ogni 6–12 mesi se usi materiali abrasivi o temperature elevate. Aggiungi un filtro filamento (spugna con olio minerale) per lubrificare leggermente e filtrare la polvere.",
      },
      {
        titolo: "Quando sostituire l'ugello",
        testo:
          "Un ugello in ottone dura 300–500h di stampa con materiali non abrasivi (PLA, PETG, TPU). Con materiali abrasivi (CF, Nylon, ASA), un ugello in ottone dura 20–50h. Segnali di usura: diametro foro aumentato (sotto-estrusione con flusso corretto), superfici di stampa peggiorano, dimensioni non più precise. Gli ugelli costano poco (0.5–5€) — cambialo preventivamente ogni 500h con PLA, ogni 200h con PETG, ad ogni bobina di CF.",
      },
    ],
    correlate: ["calibrazione", "conservazione", "stampa-veloce"],
    prodottiConsigliati: [
      {
        nome: "Set ugelli ottone E3D V6 0.2–1.0mm",
        nomeBrevissimo: "Set Ugelli E3D V6",
        descrizione: "Set completo ugelli E3D compatibili con la maggior parte delle stampanti. Include 0.2, 0.4, 0.6, 0.8mm.",
        badge: "Essenziale",
        imageUrl: "https://m.media-amazon.com/images/I/61P4gJOjFhL._AC_SL1200_.jpg",
        affiliateLink: "https://amzn.to/3YmM4qF",
      },
      {
        nome: "Ugello Hardened Steel 0.4mm E3D",
        nomeBrevissimo: "Ugello Hardened E3D",
        descrizione: "Ugello in acciaio temperato per filamenti abrasivi (CF, GF, Glow). Dura 10× più di un ugello in ottone.",
        badge: "Durevole",
        imageUrl: "https://m.media-amazon.com/images/I/51gLWLBcfCL._AC_SL1500_.jpg",
        affiliateLink: "https://amzn.to/3RZGLJF",
      },
      {
        nome: "Filtro filamento + olio minerale",
        nomeBrevissimo: "Filtro filamento",
        descrizione: "Blocchetto spugna con olio minerale: lubrifica il filamento prima dell'estrusore, riduce attrito e inceppamenti.",
        badge: "Preventivo",
        imageUrl: "https://m.media-amazon.com/images/I/41OM6JVlDwL._AC_SL1500_.jpg",
        affiliateLink: "https://amzn.to/4fRhGXB",
      },
    ],
  },
];

export function getGuida(slug: string): Guida | undefined {
  return GUIDE.find((g) => g.slug === slug);
}
