-- ============================================================
-- FILAMENT FINDER — SEED DATA
-- Dati iniziali: brand, tipi, varianti, tag, shop, stampanti
-- ============================================================

-- ============================================================
-- BRAND
-- ============================================================
INSERT INTO brand (nome, url) VALUES
    ('Bambu Lab',       'https://bambulab.com'),
    ('Prusament',       'https://prusament.com'),
    ('Prusa Research',  'https://prusa3d.com'),
    ('eSUN',            'https://esun3d.com'),
    ('Polymaker',       'https://polymaker.com'),
    ('Fiberlogy',       'https://fiberlogy.com'),
    ('Fillamentum',     'https://fillamentum.com'),
    ('Das Filament',    'https://dasfilament.de'),
    ('3DJake',          'https://3djake.it'),
    ('Sunlu',           'https://sunlu.com'),
    ('Eryone',          'https://eryone3d.com'),
    ('ColorFabb',       'https://colorfabb.com'),
    ('FormFutura',      'https://formfutura.com'),
    ('Amolen',          'https://amolen.com'),
    ('Creality',        'https://creality.com'),
    ('Extrudr',         'https://extrudr.com'),
    ('Hatchbox',        'https://hatchbox3d.com'),
    ('Elegoo',          'https://elegoo.com');

-- ============================================================
-- FILAMENT_TYPE
-- ============================================================
INSERT INTO filament_type (
    nome, descrizione,
    flessibile, igroscopico, difficolta_stampa,
    temp_stampa_min, temp_stampa_max,
    temp_piatto_min, temp_piatto_max,
    richiede_enclosure, food_safe
) VALUES
    ('PLA',     'Acido Polilattico. Il materiale più diffuso: facile da stampare, buon dettaglio, biodegradabile. Non adatto ad alte temperature.',
     FALSE, FALSE, 1,  190, 230,    0,  60,  FALSE, FALSE),

    ('PETG',    'Polietilene Tereftalato Glicole. Buon equilibrio tra facilità di stampa e resistenza meccanica/chimica. Leggera tendenza al stringing.',
     FALSE, FALSE, 2,  230, 250,   70,  85,  FALSE, FALSE),

    ('ABS',     'Acrilonitrile Butadiene Stirene. Resistente e lavorabile post-stampa. Richiede enclosure per evitare warping. Fumi irritanti.',
     FALSE, FALSE, 3,  230, 260,  100, 110,  TRUE,  FALSE),

    ('ASA',     'Acrilonitrile Stirene Acrilato. Simile all''ABS ma con migliore resistenza ai raggi UV. Ottimo per uso esterno.',
     FALSE, FALSE, 3,  240, 260,  100, 110,  TRUE,  FALSE),

    ('TPU',     'Poliuretano Termoplastico. Flessibile e resistente agli urti. La durezza varia per variante (95A, 85A, 83A...).',
     TRUE,  FALSE, 3,  220, 250,   30,  60,  FALSE, FALSE),

    ('NYLON',   'Poliammide (PA). Alta resistenza meccanica e flessibilità. Molto igroscopico, richiede essiccatore.',
     FALSE, TRUE,  4,  240, 270,   70,  90,  TRUE,  FALSE),

    ('PC',      'Policarbonato. Resistenza termica e meccanica eccellenti. Difficile da stampare, richiede hotend ad alta temperatura.',
     FALSE, TRUE,  5,  260, 310,  100, 120,  TRUE,  FALSE),

    ('HIPS',    'High Impact Polystyrene. Usato principalmente come materiale di supporto solubile in limonene per stampanti dual-extrusion.',
     FALSE, FALSE, 3,  220, 250,  100, 115,  TRUE,  FALSE),

    ('PVA',     'Alcool Polivinilico. Supporto solubile in acqua, ideale per strutture complesse con stampanti dual-extrusion.',
     FALSE, TRUE,  3,  185, 200,   45,  60,  FALSE, FALSE),

    ('PLA-CF',  'PLA con fibra di carbonio. Maggiore rigidità e aspetto matte/tecnico. Richiede nozzle in acciaio indurito.',
     FALSE, FALSE, 2,  200, 230,    0,  60,  FALSE, FALSE),

    ('PETG-CF', 'PETG con fibra di carbonio. Alta rigidità, basso peso. Richiede nozzle indurito.',
     FALSE, FALSE, 3,  240, 260,   70,  90,  FALSE, FALSE),

    ('PA-CF',   'Nylon con fibra di carbonio. Prestazioni tecniche elevate, leggero e rigido. Richiede enclosure e nozzle indurito.',
     FALSE, TRUE,  5,  260, 290,   80, 100,  TRUE,  FALSE);

-- ============================================================
-- FILAMENT_VARIANT
-- ============================================================
-- PLA variants
INSERT INTO filament_variant (id_type, nome, descrizione) VALUES
    ((SELECT id FROM filament_type WHERE nome = 'PLA'), 'Basic',
     'PLA standard, versatile, ottimo per uso generale'),
    ((SELECT id FROM filament_type WHERE nome = 'PLA'), 'Matte',
     'Finitura opaca, nasconde i layer lines, non richiede levigatura'),
    ((SELECT id FROM filament_type WHERE nome = 'PLA'), 'Silk',
     'Finitura lucida/setosa, aspetto premium, colori vivaci'),
    ((SELECT id FROM filament_type WHERE nome = 'PLA'), 'HS',
     'High Speed: formulato per stampa ad alta velocità (>200mm/s)'),
    ((SELECT id FROM filament_type WHERE nome = 'PLA'), 'Plus',
     'Resistenza meccanica superiore al PLA Basic, leggera flessibilità'),
    ((SELECT id FROM filament_type WHERE nome = 'PLA'), 'Galaxy',
     'Con particelle glitterate, effetto galattico'),
    ((SELECT id FROM filament_type WHERE nome = 'PLA'), 'Marble',
     'Effetto marmo/pietra, colori misti');

-- PETG variants
INSERT INTO filament_variant (id_type, nome, descrizione) VALUES
    ((SELECT id FROM filament_type WHERE nome = 'PETG'), 'Basic',
     'PETG standard, ottimo equilibrio tra facilità e resistenza'),
    ((SELECT id FROM filament_type WHERE nome = 'PETG'), 'HF',
     'High Flow: formulato per velocità elevate'),
    ((SELECT id FROM filament_type WHERE nome = 'PETG'), 'Transparent',
     'Versione semitrasparente, ottima per diffusori luce');

-- ABS variants
INSERT INTO filament_variant (id_type, nome, descrizione) VALUES
    ((SELECT id FROM filament_type WHERE nome = 'ABS'), 'Standard',
     'ABS classico per uso generale'),
    ((SELECT id FROM filament_type WHERE nome = 'ABS'), 'ASA-like',
     'Formulazione con migliorata resistenza UV rispetto allo standard');

-- ASA variants
INSERT INTO filament_variant (id_type, nome, descrizione) VALUES
    ((SELECT id FROM filament_type WHERE nome = 'ASA'), 'Standard',
     'ASA classico, ottimo per parti esterne');

-- TPU variants (la durezza è la differenziazione chiave)
INSERT INTO filament_variant (
    id_type, nome, descrizione,
    difficolta_stampa, temp_stampa_min, temp_stampa_max
) VALUES
    ((SELECT id FROM filament_type WHERE nome = 'TPU'), '95A',
     'Durezza Shore 95A: semi-flessibile, la variante più comune',
     3, 220, 240),
    ((SELECT id FROM filament_type WHERE nome = 'TPU'), '90A',
     'Durezza Shore 90A: più morbido del 95A',
     3, 210, 230),
    ((SELECT id FROM filament_type WHERE nome = 'TPU'), '85A',
     'Durezza Shore 85A: molto flessibile',
     4, 200, 230),
    ((SELECT id FROM filament_type WHERE nome = 'TPU'), '83A',
     'Durezza Shore 83A: estremamente morbido',
     4, 200, 225);

-- NYLON variants
INSERT INTO filament_variant (id_type, nome, descrizione) VALUES
    ((SELECT id FROM filament_type WHERE nome = 'NYLON'), 'PA6',
     'Poliammide 6: il più comune, alta resistenza agli urti'),
    ((SELECT id FROM filament_type WHERE nome = 'NYLON'), 'PA12',
     'Poliammide 12: meno igroscopico del PA6, migliore finitura superficie');

-- CF variants
INSERT INTO filament_variant (id_type, nome, descrizione) VALUES
    ((SELECT id FROM filament_type WHERE nome = 'PLA-CF'),  'Standard', 'PLA rinforzato con fibra di carbonio corta'),
    ((SELECT id FROM filament_type WHERE nome = 'PETG-CF'), 'Standard', 'PETG rinforzato con fibra di carbonio corta'),
    ((SELECT id FROM filament_type WHERE nome = 'PA-CF'),   'Standard', 'Nylon rinforzato con fibra di carbonio corta');

-- PC variants
INSERT INTO filament_variant (id_type, nome, descrizione) VALUES
    ((SELECT id FROM filament_type WHERE nome = 'PC'), 'Standard', 'Policarbonato puro, massima resistenza termica');

-- HIPS / PVA
INSERT INTO filament_variant (id_type, nome, descrizione) VALUES
    ((SELECT id FROM filament_type WHERE nome = 'HIPS'), 'Standard', 'Supporto solubile in limonene'),
    ((SELECT id FROM filament_type WHERE nome = 'PVA'),  'Standard', 'Supporto solubile in acqua');

-- ============================================================
-- TAG
-- ============================================================
INSERT INTO tag (nome, descrizione) VALUES
    ('conduttivo',          'Conduce elettricità (filamenti con grafene/carbone conduttivo)'),
    ('UV-resistant',        'Resistente ai raggi UV (ASA, alcune formulazioni speciali)'),
    ('glow-in-dark',        'Fosforescente al buio'),
    ('color-change-temp',   'Cambia colore con la temperatura'),
    ('color-change-uv',     'Cambia colore con la luce UV'),
    ('antibatterico',       'Con agenti antibatterici (es. rame, argento)'),
    ('fibra-carbonio',      'Rinforzato con fibra di carbonio corta'),
    ('fibra-vetro',         'Rinforzato con fibra di vetro'),
    ('fibra-legno',         'Composito con particelle di legno (aspetto e odore legno)'),
    ('fibra-metallo',       'Composito con polvere metallica (ottone, rame, ferro...)'),
    ('supporto-solubile',   'Si dissolve in acqua (PVA) o limonene (HIPS)'),
    ('riciclato',           'Prodotto con materiale riciclato post-consumo'),
    ('refill',              'Bobina refill senza spool (da usare con spool riutilizzabile)'),
    ('food-safe',           'Certificato per contatto alimentare (richiede anche nozzle adeguato)'),
    ('alta-velocita',       'Formulato per stampa ad alta velocità (>200mm/s)'),
    ('nozzle-indurito',     'Richiede nozzle in acciaio indurito o hardened steel'),
    ('bicolore',            'Due colori miscelati nella stessa bobina'),
    ('multicolore',         'Tre o più colori che si alternano');

-- ============================================================
-- PRINTER_PROFILE
-- ============================================================
INSERT INTO printer_profile (nome, brand, diametro_mm, ha_enclosure, max_temp_hotend, max_temp_piatto) VALUES
    -- Bambu Lab
    ('Bambu A1',        'Bambu Lab', 1.75, FALSE, 300, 100),
    ('Bambu A1 Mini',   'Bambu Lab', 1.75, FALSE, 300, 100),
    ('Bambu P1S',       'Bambu Lab', 1.75, TRUE,  300, 120),
    ('Bambu P1P',       'Bambu Lab', 1.75, FALSE, 300, 100),
    ('Bambu X1C',       'Bambu Lab', 1.75, TRUE,  300, 120),
    -- Prusa Research
    ('Prusa MK4',       'Prusa Research', 1.75, FALSE, 290, 120),
    ('Prusa MK3S+',     'Prusa Research', 1.75, FALSE, 280, 120),
    ('Prusa MINI+',     'Prusa Research', 1.75, FALSE, 280, 100),
    ('Prusa XL',        'Prusa Research', 1.75, FALSE, 290, 120),
    -- Creality
    ('Ender 3 V3',      'Creality', 1.75, FALSE, 300, 110),
    ('Ender 3 S1 Pro',  'Creality', 1.75, FALSE, 300, 110),
    ('K1',              'Creality', 1.75, TRUE,  300, 100),
    ('K1 Max',          'Creality', 1.75, TRUE,  300, 100),
    -- Voron (DIY)
    ('Voron 2.4',       'Voron Design', 1.75, TRUE, 350, 130),
    ('Voron Trident',   'Voron Design', 1.75, TRUE, 350, 130);

-- ============================================================
-- SHOP
-- ============================================================
INSERT INTO shop (nome, url, paese, tipo) VALUES
    ('Amazon IT',       'https://amazon.it',            'IT', 'marketplace'),
    ('Amazon DE',       'https://amazon.de',            'DE', 'marketplace'),
    ('Prusa Shop',      'https://prusament.com',        'CZ', 'diretto'),
    ('Bambu Lab Store', 'https://bambulab.com',         'CN', 'diretto'),
    ('Filament2Print',  'https://filament2print.com',   'ES', 'reseller'),
    ('3DJake IT',       'https://3djake.it',            'IT', 'reseller'),
    ('3DJake DE',       'https://3djake.de',            'DE', 'reseller'),
    ('FDM Monster',     'https://fdmmonster.eu',        'PL', 'reseller'),
    ('Ardu3D',          'https://ardu3d.com',           'IT', 'reseller'),
    ('AliExpress',      'https://aliexpress.com',       'CN', 'marketplace'),
    ('Elegoo Store',    'https://elegoo.com/it',        'CN', 'diretto'),
    ('eSUN Store',      'https://esun3d.com',           'CN', 'diretto');
