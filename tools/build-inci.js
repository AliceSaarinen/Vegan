#!/usr/bin/env node
/* Rakentaa inci.json-tiedoston kosmetiikan ainesosista (EU:n CosIng-luettelo Open Beauty Factsin
   taksonomiana, ODbL). Luokitus tehdään tässä sovelluksen omilla säännöillä nimen ja kuvauksen
   perusteella:  A = eläinperäinen, U = voi olla eläinperäinen (todennäköisyys), V = vegaaninen.
   Ainesosat, joista ei ole riittävästi tietoa, jätetään pois (sovellus näyttää ne tuntemattomina).
   Käyttö: node tools/build-inci.js <polku/ingredients-cosing-obf.txt> */
'use strict';
const fs = require('fs');
const path = require('path');

const src = process.argv[2];
if (!src) { console.error('Anna CosIng-taksonomian polku'); process.exit(1); }
const raw = fs.readFileSync(src, 'utf8');

// Kasviperäiset tai muuten vegaaniset ilmaukset, jotka sisältävät eläinsanan
const MASK = ["milk thistle", "milkweed", "milk vetch", "coconut milk", "soy milk", "soymilk", "oat milk", "almond milk", "rice milk", "milk of", "honeysuckle", "honeydew", "honeybush", "honey locust", "bee balm", "beebalm", "horse chestnut", "horsetail", "horseradish", "horse radish", "goat's rue", "goats rue", "deer tongue", "crab apple", "crabapple", "eel grass", "eelgrass", "sponge gourd", "luffa", "loofah", "dragon's blood", "dragons blood", "blood orange", "bird's eye", "birds eye", "pearl barley", "pearl millet", "fish mint", "fishmint", "ox-eye", "oxeye", "cat's claw", "cats claw", "devil's claw", "lamb's quarters", "lambs quarters", "lamb's ear", "hen and chicks", "snail vine", "cow parsnip", "cowslip", "elephant", "horny goat weed", "dog rose", "buckthorn", "hawthorn", "synthetic", "artificial", "nature-identical", "vegetable", "plant-derived", "of plant origin", "of vegetable origin", "bioferment", "ferment filtrate", "skin conditioning", "hair conditioning", "skin-conditioning", "hair-conditioning", "worm wood", "wormwood", "spider plant", "lion's mane", "turkey tail", "chicken of the woods", "beefsteak", "bull kelp", "sea lettuce", "goatsbeard", "silk tree", "silk tassel", "silktree", "silky", "corn silk", "cornsilk", "zea mays silk", "silk floss", "silk cotton", "kapok", "egg plant", "eggplant", "egg fruit", "lacto", "lactobacillus", "lactic", "lactate", "lactone", "galacto", "bone-dry", "milky", "honey melon", "honeymelon", "honeyberry", "honey mushroom", "melon"];
const ANIMAL = /\b(lanolin\w*|adeps lanae|wool (?:fat|wax|grease|alcohol)|sheep|ovine|bovine|cattle|cow|cows|calf|calves|ox|porcine|pig|pigs|swine|hog|equine|horse|horses|goat|goats|caprine|camel|donkey|deer|antler|musk|civet|castoreum|beaver|ambergris|whale|spermaceti|cetaceum|shark|squalus|cod|gadus|fish|salmon|salmo|tuna|sardine|anchov\w*|herring|mackerel|caviar|roe|sturgeon|eel|krill|shrimp|prawn|crab|lobster|crustacea\w*|oyster|ostrea|mussel|mytilus|clam|mollus\w*|snail|snails|helix aspersa|slug|squid|octopus|cuttlefish|sepia|coral|corallium|sponge|jellyfish|sea cucumber|starfish|pearl|pearls|nacre|conchiolin|silk|sericin|fibroin|bombyx|silkworm|cocoon|bee|bees|beeswax|honey|honeycomb|mel|apis mellifera|royal jelly|propolis|apitoxin|cera alba|cera flava|lac|shellac|kerria lacca|laccifer|cochineal|carmine|carminic|dactylopius|guanine|milk|lactis|whey|casein\w*|colostrum|buttermilk|yogh?urt|kefir|cheese|lactoferrin|egg|eggs|yolk|ovum|ovi|albumen|ovalbumin|chicken|hen|gallus|duck|goose|emu|ostrich|feather|feathers|keratin|horn|hoof|hooves|wool|cashmere|collagen|elastin|gelatin\w*|placenta\w*|amniotic|umbilical|blood|plasma|hemoglobin|haemoglobin|liver|spleen|pancrea\w*|bile|tallow\w*|lard|suet|animal|animals|mink|marmot|turtle|reptile|snake|frog|leech|hirudo|insect|insects|worm|worms|larva\w*|caterpillar|chitin|cartilage|chondroitin|bone|bones|hide|leather|uric acid|urine|dung|manure|stomach|rennet|pepsin|trypsin|lysozyme|rooster comb|cockscomb|vernix|mucin|secretion of|mouse|mice|rat|rats|rabbit|rabbits|hamster|antibody|antibodies|serum)\b/i;
const EITHER = /(animal or vegetable|vegetable or animal|animal and\/or vegetable|vegetable and\/or animal|animal or plant|plant or animal|animal and vegetable|natural or synthetic origin|of various origin)/i;
const PLANT = /\b(extract|oil|butter|wax|cera|juice|powder|water|flour|meal|starch|protein|ferment|filtrate|cell culture|callus|exosomes?|lysate|sap|resin|gum|fiber|fibre|hydrosol|distillate|tincture)\b[^.]{0,120}\b(of|from)\b[^.]{0,80}\b(leaves|leaf|roots?|rhizomes?|seeds?|fruits?|flowers?|blossoms?|bark|stems?|stalks?|peel|kernels?|nuts?|berries|berry|bulbs?|buds?|wood|whole plant|aerial parts|plants?|herbs?|tubers?|grains?|beans?|thallus|algae?|seaweed|kelp|mushrooms?|fungus|fungi|mycelium|yeast|bacteria|bacterium|lactobacillus|bacillus|streptococcus|saccharomyces|sprouts?|shoots?|needles?|cones?|husks?|hulls?|pods?|petals?|corms?|cotyledons?|germ|bran|pulp|rind|calyx|calyces|stigmas?|grass)\b/i;
const PLANT_NAME = /\b(LEAF|LEAVES|ROOT|ROOTS|SEED|SEEDS|FRUIT|FLOWER|FLOWERS|BLOSSOM|BARK|STEM|STALK|PEEL|KERNEL|NUT|BERRY|RHIZOME|BUD|WOOD|SPROUT|CALLUS|ALGAE|THALLUS|TUBER|BULB|HUSK|HULL|CONE|NEEDLE|RESIN|GUM|JUICE|SAP|POD|PETAL|GERM|BRAN|PULP|RIND|CALYX|MERISTEM CELL|CELL CULTURE|MUSHROOM|MYCELIUM|FERMENT|LYSATE|YEAST)\b/;
const PLANT_FAT = /\b(vegetable|plant|palm|elaeis|coco|coconut|cocos|soy|soja|soybean|glycine soja|olive|olea|rapeseed|brassica|canola|sunflower|helianthus|castor|ricinus|jojoba|simmondsia|shea|butyrospermum|cocoa|theobroma|argan|argania|almond|prunus|avocado|persea|rice|oryza|corn|zea|wheat|triticum|oat|avena|sesame|sesamum|linseed|linum|hemp|cannabis|grape|vitis|apricot|peach|macadamia|safflower|carthamus|cottonseed|gossypium|mango|mangifera|babassu|orbignya|murumuru|cupuacu|kokum|garcinia|illipe|shorea|camellia|meadowfoam|limnanthes|borage|borago|primrose|oenothera|rosehip|rosa|pomegranate|punica|sugar ?cane|saccharum|amaranth|beet|potato|solanum|tapioca|cassava|manihot|hydrogenated vegetable)\b|(palmate|kernelate|olivate|sunflowerate|cocoate|rapeseedate|butterate|castorate|avocadate|babassuate|almondate|jojobate|hempseedate|soyate|cocoyl|coco-|cocamid|cocamine|cocoamph|soyamid|olivoyl|palmitoyl (?:grape|oat|soy))/i;
const POLYMER = /(polymer|copolymer|crosspolymer|siloxane|silicone|methicone|dimethicone|silane|silicate|acrylate|acrylamide|polyquaternium|nylon|polyethylene|polypropylene|polystyrene|polyurethane|polyester|polybutene|polyisobutene|peg-|ppg-|polysorbate|poloxamer|carbomer|edta|paraben|benzoate|sorbate|phenoxyethanol|ci \d{5}|oxide|hydroxide|chloride|sulfate|sulphate|carbonate|phosphate|nitrate|nitrite|fluoride|bromide|iodide|silica|mica|talc|kaolin|bentonite|clay|zeolite|alumina|aluminum|aluminium|zinc|titanium|iron|copper|magnesium|calcium|sodium|potassium|lithium|barium|bismuth|tin |boron|glass|diamond|gold|silver|platinum|sapphire|tourmaline|mineral|paraffin|petrolatum|cera microcristallina|isoparaffin|alkane|hexane|ethanol|alcohol denat|glycol|propanediol|butanediol|hexanediol|amine|amide|amino methyl|dimethyl|trimethyl|ethyl|methyl|propyl|butyl|benzyl|phenyl|acid)/i;

const U_RULES = [
  [/cholester/i, 0.25, 'Lanoliini (yleisin); kasvisterolit harvoin'],
  [/squalene/i, 0.6, 'Hain maksaöljy tai oliivi'],
  [/squalane/i, 0.85, 'Oliivi tai sokeriruoko (yleisin); hain maksaöljy'],
  [/chitosan|glucosamine/i, 0.4, 'Äyriäisten kuori (yleisin); sienet'],
  [/cystein|cystine/i, 0.4, 'Höyhenet tai karvat (yleisin); käyminen'],
  [/hydrolyzed protein|amino acids|\bprotein\b/i, 0.6, 'Kasvit tai käyminen; voi olla maidosta, silkistä tai keratiinista'],
  [/peptide/i, 0.95, 'Synteettinen (yleisin)'],
  [/hyaluron/i, 0.9, 'Bakteerikäyminen (yleisin); kukon heltta'],
  [/ceramide|sphingo/i, 0.85, 'Synteettinen tai kasvit (yleisin); eläinkudos'],
  [/lecithin/i, 0.9, 'Soija tai auringonkukka (yleisin); kananmuna'],
  [/carnitin/i, 0.9, 'Synteettinen (yleisin); liha'],
  [/retinyl/i, 0.9, 'Synteettinen (yleisin); kalanmaksaöljy'],
  [/glycerin|glycerol(?!.*(phosph))/i, 0.92, 'Kasviöljyt (yleisin) tai tali'],
  [/cetyl|cetearyl|stearyl alcohol|behenyl|arachidyl|myristyl alcohol|oleyl alcohol|octyldodecanol/i, 0.95, 'Palmu- tai kookosöljy (yleisin); tali'],
  [/stear|palmit|myrist|\bole(?:ic|yl|ate|th)\b|oleate|olein|isostear|glyceryl|glyceride|triglyceride|tribehenin|fatty acid|fatty alcohol/i, 0.9, 'Palmu-, kookos- tai muu kasviöljy (yleisin); tali'],
];

function maskText(t) { let s = ' ' + t.toLowerCase() + ' '; for (const m of MASK) s = s.split(m).join(' '); return s; }

const out = { A: new Map(), U: new Map(), V: new Map() };
const origins = []; const oi = new Map();
function origin(t) { if (!oi.has(t)) { oi.set(t, origins.length); origins.push(t); } return oi.get(t); }
const stats = { A: 0, U: 0, V: 0, skip: 0 };
const plantGenus = new Map(), animalGenus = new Set();
const NOT_GENUS = /^(hydrolyzed|hydrogenated|sodium|potassium|calcium|magnesium|zinc|peg|ppg|glyceryl|polyglyceryl|ethyl|cetyl|methyl|butyl|propyl|isopropyl|acetyl|palmitoyl|myristoyl|lauroyl|cocoyl|oleoyl|stearoyl|disodium|trisodium|tetrasodium|ammonium|aluminum|aluminium|bis|tris|di|tri|poly|copper|iron|silver|gold|white|black|red|green|yellow|blue|brown|purple|wild|sea|fermented|lactobacillus|saccharomyces|aspergillus|bacillus|streptococcus|bifida|leuconostoc|pseudoalteromonas|alteromonas|vibrio|rhizobian|lactococcus|pediococcus|acetobacter|propionibacterium|bacteroides|enterococcus|pichia|kluyveromyces|torula|rhodosporidium|monascus|rhizopus|mucor|galactomyces|lentinus|ganoderma|tremella|cordyceps)$/;

for (const block of raw.split(/\n\s*\n/)) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const enLine = lines.find(l => /^en:\s/.test(l));
  if (!enLine) continue;
  const names = enLine.slice(3).split(/,\s*/).map(x => x.trim()).filter(Boolean);
  const local = lines.filter(l => /^(fi|sv):\s/.test(l)).flatMap(l => l.slice(3).split(/,\s*/).map(x => x.trim()).filter(Boolean));
  const desc = (lines.find(l => l.startsWith('inci_description:en:')) || '').slice(20).trim();
  const vegan = (lines.find(l => l.startsWith('vegan:en:')) || '').slice(9).trim();
  const inci = names[0];
  const nameText = names.join(' ; ');
  const text = maskText(nameText + ' . ' + desc);
  let cls = null, p = null, orig = null;
  if (/^no\b/.test(vegan)) cls = 'A';
  else if (/^yes\b/.test(vegan)) cls = 'V';
  else if (/synthetic|artificial/i.test(nameText)) cls = 'V';
  else if (ANIMAL.test(text)) {
    if (EITHER.test(desc)) { cls = 'U'; p = 0.85; orig = 'Kasvi- tai eläinperäinen'; }
    else cls = 'A';
  }
  else if (PLANT.test(desc) || PLANT_NAME.test(inci) || PLANT_FAT.test(nameText)) cls = 'V';
  else {
    const r = U_RULES.find(([re]) => re.test(nameText));
    if (r) { cls = 'U'; p = r[1]; orig = r[2]; }
    else if (EITHER.test(desc)) { cls = 'U'; p = 0.85; orig = 'Kasvi- tai eläinperäinen'; }
    else if (desc && desc.length > 3) cls = 'V';
    else if (POLYMER.test(inci)) cls = 'V';
  }
  if (!cls) { stats.skip++; continue; }
  { const m = /^([A-Z]{3,}) ([A-Z]{3,})\b/.exec(inci); if (m) { const g = m[1].toLowerCase();
    if (cls === 'A') animalGenus.add(g);
    else if (cls === 'V' && PLANT.test(desc) && !NOT_GENUS.test(g)) plantGenus.set(g, (plantGenus.get(g) || 0) + 1); } }
  stats[cls]++;
  const clean = x => x.toLowerCase().replace(/\s+/g, ' ').trim();
  const okLocal = x => x.length >= 3 && x.length <= 60 && !/\d+-\d+-\d/.test(x) && !(cls !== 'A' && ANIMAL.test(maskText(x)));
  const terms = [...new Set([...names.map(clean), ...local.map(clean).filter(okLocal)].filter(x => x.length >= 2))];
  for (const t of terms) {
    if (cls === 'A') out.A.set(t, inci);
    else if (cls === 'U') out.U.set(t, [t, p, origin(orig)]);
    else out.V.set(t, 1);
  }
}

// Sama nimi useassa luokassa: pahin voittaa
for (const t of out.A.keys()) { out.U.delete(t); out.V.delete(t); }
for (const t of out.U.keys()) out.V.delete(t);

const json = {
  license: 'Ainesosien nimet: EU CosIng / Open Beauty Facts (ODbL 1.0). Luokitus: Vegan-sovelluksen omat säännöt (tools/build-inci.js).',
  origins,
  plantGenera: [...plantGenus.keys()].filter(g => !animalGenus.has(g)).sort(),
  A: [...out.A.keys()].sort(),
  U: [...out.U.values()].sort((a, b) => a[0] < b[0] ? -1 : 1),
  V: [...out.V.keys()].sort(),
};
const dest = path.join(__dirname, '..', 'inci.json');
fs.writeFileSync(dest, JSON.stringify(json));
console.log('INCI:', stats, 'termejä A', json.A.length, 'U', json.U.length, 'V', json.V.length, 'koko', fs.statSync(dest).size, 'kasvisukuja', json.plantGenera.length);
