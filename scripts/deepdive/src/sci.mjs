// Science prompts.
const E = { wt: ["{}", "{} (element)"], wm: /element|metal|gas|chemical/i };
export default [
{ id: "sci-elements", q: "A chemical element", ...E, list: `
Hydrogen
Helium
Lithium
Beryllium
Boron
Carbon
Nitrogen
Oxygen
Fluorine
Neon
Sodium
Magnesium
Aluminium | Aluminum
Silicon
Phosphorus
Sulfur | Sulphur
Chlorine
Argon
Potassium
Calcium
Scandium
Titanium
Vanadium
Chromium
Manganese
Iron
Cobalt
Nickel
Copper
Zinc
Gallium
Germanium
Arsenic
Selenium
Bromine
Krypton
Rubidium
Strontium
Yttrium
Zirconium
Niobium
Molybdenum
Technetium
Ruthenium
Rhodium
Palladium
Silver
Cadmium
Indium
Tin
Antimony
Tellurium
Iodine
Xenon
Caesium | Cesium
Barium
Lanthanum
Cerium
Praseodymium
Neodymium
Promethium
Samarium
Europium
Gadolinium
Terbium
Dysprosium
Holmium
Erbium
Thulium
Ytterbium
Lutetium
Hafnium
Tantalum
Tungsten | Wolfram
Rhenium
Osmium
Iridium
Platinum
Gold
Mercury @Mercury (element)
Thallium
Lead
Bismuth
Polonium
Astatine
Radon
Francium
Radium
Actinium
Thorium
Protactinium
Uranium
Neptunium
Plutonium
Americium
Curium
Berkelium
Californium
Einsteinium
Fermium
Mendelevium
Nobelium
Lawrencium
Rutherfordium
Dubnium
Seaborgium
Bohrium
Hassium
Meitnerium
Darmstadtium
Roentgenium
Copernicium
Nihonium
Flerovium
Moscovium
Livermorium
Tennessine
Oganesson` },
{ id: "sci-noble", q: "A noble gas", ...E, list: `
Helium
Neon
Argon
Krypton
Xenon
Radon
Oganesson # Element 118, named after Yuri Oganessian` },
{ id: "sci-alkali", q: "An alkali metal", ...E, list: `
Sodium
Potassium
Lithium
Rubidium
Caesium | Cesium
Francium` },
{ id: "sci-halogens", q: "A halogen", ...E, list: `
Chlorine
Fluorine
Iodine
Bromine
Astatine
Tennessine # Element 117, named after Tennessee` },
{ id: "sci-pgm", q: "A platinum-group metal", ...E, list: `
Platinum
Palladium
Rhodium
Iridium
Osmium
Ruthenium # Named after Ruthenia (Russia); the lightest of the six` },
{ id: "sci-planets", q: "A planet in the Solar System", wt: ["{} (planet)", "{}"], wm: /planet/i, list: `
Earth
Mars
Jupiter
Saturn
Venus
Mercury
Neptune
Uranus` },
{ id: "sci-dwarf-planets", q: "A dwarf planet recognized by the IAU", wt: ["{} (dwarf planet)", "{}"], wm: /planet|object|asteroid/i, list: `
Pluto
Ceres
Eris
Haumea # Egg-shaped, spins every 4 hours, named for a Hawaiian goddess
Makemake # Named for the Rapa Nui (Easter Island) creator god` },
{ id: "sci-galilean", q: "A Galilean moon of Jupiter", wt: ["{} (moon)", "{}"], wm: /moon|satellite/i, list: `
Europa
Io
Ganymede
Callisto` },
{ id: "sci-uranus-moons", q: "One of the five major moons of Uranus", wt: ["{} (moon)", "{}"], wm: /moon|satellite/i, list: `
Titania
Oberon
Miranda
Ariel
Umbriel # Named after a sprite in Pope's The Rape of the Lock` },
{ id: "sci-rovers", q: "A rover that has driven on Mars", wt: ["{} (rover)", "{}"], wm: /rover|mars|vehicle/i, list: `
Curiosity
Perseverance
Opportunity
Spirit
Sojourner # The first, on Mars Pathfinder in 1997
Zhurong # China's first Mars rover, 2021, named for a fire god` },
{ id: "sci-shuttles", q: "A Space Shuttle orbiter", wt: ["Space Shuttle {}"], wm: /shuttle|orbiter|spacecraft/i, list: `
Challenger
Columbia
Discovery
Atlantis
Endeavour | Endeavor
Enterprise # Test orbiter used only for atmospheric flights, named after Star Trek's ship` },
{ id: "sci-moonwalkers", q: "An astronaut who walked on the Moon", person: true, wm: /astronaut|aviator|pilot|engineer|geologist|born/i, list: `
Neil Armstrong
Buzz Aldrin
Alan Shepard
Pete Conrad # Apollo 12 commander, the third man on the Moon
Alan Bean
Edgar Mitchell
David Scott
James Irwin
John Young @John Young (astronaut)
Charles Duke | Charlie Duke
Eugene Cernan | Gene Cernan # Apollo 17: the last man to walk on the Moon (so far)
Harrison Schmitt # Apollo 17 geologist, later a US senator` },
{ id: "sci-atmosphere", q: "A layer of Earth's atmosphere", wm: /atmosphere|layer|region/i, list: `
Troposphere
Stratosphere
Mesosphere
Thermosphere
Exosphere # The outermost layer, fading into space` },
{ id: "sci-rainbow", q: "A colour of the rainbow (ROYGBIV)", manual: true, list: `
Red
Blue
Yellow
Green
Orange
Violet | Purple
Indigo` },
{ id: "sci-si-base", q: "An SI base unit", wt: ["{}", "{} (unit)"], wm: /unit/i, list: `
Metre | Meter
Kilogram
Second
Kelvin
Ampere | Amp
Mole @Mole (unit)
Candela # Luminous intensity, roughly one candle` },
{ id: "sci-si-prefix", q: "An SI metric prefix", manual: true, list: `
Kilo
Mega
Giga
Milli
Centi
Micro
Nano
Tera
Deci
Pico
Peta
Hecto
Deca | Deka
Femto
Exa
Atto
Zetta
Yotta
Zepto
Yocto
Ronna # 10^27, added in 2022
Quetta # 10^30, added in 2022
Ronto # 10^-27, added in 2022
Quecto # 10^-30, added in 2022` },
{ id: "sci-nobel", q: "A Nobel Prize category", manual: true, list: `
Peace | Nobel Peace Prize
Physics
Chemistry
Literature
Medicine | Physiology or Medicine | Physiology
Economics | Economic Sciences | Economy # Added in 1968 by Sweden's central bank` },
{ id: "sci-vitamins", q: "A vitamin", note: "The 13 human vitamins; the letter or the chemical name both count.", wm: /vitamin|compound|acid|nutrient/i, list: `
Vitamin C | C | Ascorbic acid
Vitamin D | D
Vitamin A | A | Retinol
Vitamin B12 | B12 | Cobalamin
Vitamin E | E
Vitamin K | K
Vitamin B6 | B6 | Pyridoxine
Vitamin B1 | B1 | Thiamine | Thiamin @Thiamine
Vitamin B2 | B2 | Riboflavin @Riboflavin
Vitamin B3 | B3 | Niacin @Vitamin B3
Vitamin B9 | B9 | Folate | Folic acid @Folate
Vitamin B7 | B7 | Biotin | Vitamin H @Biotin
Vitamin B5 | B5 | Pantothenic acid @Pantothenic acid` },
{ id: "sci-bears", q: "A living species of bear", wm: /bear|species|mammal/i, list: `
Polar bear | Polar
Brown bear | Brown | Grizzly | Grizzly bear
Giant panda | Panda
American black bear | Black bear
Asian black bear | Moon bear # Has a white crescent on its chest
Sun bear # The smallest bear, from Southeast Asia
Sloth bear # India's shaggy termite-eater
Spectacled bear | Andean bear # The only bear native to South America (Paddington's species)` },
{ id: "sci-penguins", q: "A species of penguin", wm: /penguin|species|bird/i, list: `
Emperor penguin | Emperor
King penguin | King
Adélie penguin | Adelie
Gentoo penguin | Gentoo
Chinstrap penguin | Chinstrap
African penguin | African | Jackass penguin
Little penguin | Little blue penguin | Fairy penguin | Blue penguin
Humboldt penguin | Humboldt
Macaroni penguin | Macaroni
Galápagos penguin | Galapagos
Magellanic penguin | Magellanic
Southern rockhopper penguin | Rockhopper | Southern rockhopper
Northern rockhopper penguin | Northern rockhopper
Royal penguin | Royal
Yellow-eyed penguin | Yellow-eyed | Hoiho
Fiordland penguin | Fiordland
Snares penguin | Snares
Erect-crested penguin | Erect-crested` },
{ id: "sci-panthera", q: "A species in the big-cat genus Panthera", wm: /cat|species|felid/i, list: `
Lion
Tiger
Leopard
Jaguar
Snow leopard # Moved into Panthera in 2008` },
{ id: "sci-apes", q: "A great ape", note: "Answer at the level of common names: orangutan, gorilla, chimpanzee, bonobo, human.", wm: /ape|species|hominid|genus/i, list: `
Gorilla
Chimpanzee | Chimp
Orangutan | Orangutang
Human | Humans | Homo sapiens
Bonobo # The "pygmy chimpanzee", south of the Congo River` },
{ id: "sci-clouds", q: "One of the ten basic cloud types (genera)", wt: ["{} cloud", "{}"], wm: /cloud/i, list: `
Cumulus
Cirrus
Stratus
Cumulonimbus
Nimbostratus
Stratocumulus
Altocumulus
Altostratus
Cirrostratus
Cirrocumulus # Rows of tiny high puffs: a "mackerel sky"` },
{ id: "sci-periods", q: "A geological period of the Phanerozoic eon", wm: /period|geolog/i, list: `
Jurassic
Cretaceous
Triassic
Cambrian
Permian
Carboniferous
Devonian
Ordovician
Silurian
Quaternary
Paleogene | Palaeogene
Neogene` },
{ id: "sci-leg-bones", q: "A bone of the human leg or foot", wm: /bone/i, list: `
Femur | Thigh bone
Tibia | Shin bone | Shinbone
Fibula
Patella | Kneecap
Calcaneus | Heel bone
Talus | Ankle bone | Astragalus @Talus bone
Metatarsals | Metatarsal @Metatarsal bones
Phalanges | Phalanx | Toe bones @Phalanx bone
Navicular | Navicular bone @Navicular bone
Cuboid | Cuboid bone @Cuboid bone
Cuneiform | Cuneiforms | Cuneiform bones @Cuneiform bones` },
];
