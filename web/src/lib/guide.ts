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
];

export function getGuida(slug: string): Guida | undefined {
  return GUIDE.find((g) => g.slug === slug);
}
