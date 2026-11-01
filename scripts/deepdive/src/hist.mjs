// History prompts.
const P = { person: true, wm: /president|politician|statesman|king|queen|emperor|leader|general|apostle|saint|consort|born|chancellor|prime minister|lawyer|official|monarch/i };
const C = { country: true, wm: /country|state|kingdom|republic|nation|union/i };
export default [
{ id: "hi-presidents", q: "A President of the United States", ...P, list: `
George Washington
John Adams
Thomas Jefferson
James Madison
James Monroe
John Quincy Adams | JQA
Andrew Jackson
Martin Van Buren
William Henry Harrison
John Tyler
James K. Polk | James Polk
Zachary Taylor
Millard Fillmore
Franklin Pierce
James Buchanan
Abraham Lincoln | Abe Lincoln
Andrew Johnson
Ulysses S. Grant | Ulysses Grant
Rutherford B. Hayes | Rutherford Hayes
James A. Garfield | James Garfield
Chester A. Arthur | Chester Arthur
Grover Cleveland
Benjamin Harrison
William McKinley
Theodore Roosevelt | Teddy Roosevelt | TR
William Howard Taft
Woodrow Wilson
Warren G. Harding | Warren Harding
Calvin Coolidge
Herbert Hoover
Franklin D. Roosevelt | Franklin Roosevelt | FDR
Harry S. Truman | Harry Truman
Dwight D. Eisenhower | Dwight Eisenhower | Ike
John F. Kennedy | John Kennedy | JFK
Lyndon B. Johnson | Lyndon Johnson | LBJ
Richard Nixon
Gerald Ford
Jimmy Carter
Ronald Reagan
George H. W. Bush | George Bush Sr | Bush Sr | George HW Bush
Bill Clinton
George W. Bush | Bush Jr | Dubya | George Bush Jr
Barack Obama
Donald Trump
Joe Biden` },
{ id: "hi-died-office", q: "A US president who died in office", ...P, list: `
Abraham Lincoln
John F. Kennedy | JFK
Franklin D. Roosevelt | FDR | Franklin Roosevelt
William McKinley
James A. Garfield | James Garfield
William Henry Harrison
Zachary Taylor
Warren G. Harding | Warren Harding` },
{ id: "hi-vp-to-pres", q: "A US vice president who later became president", ...P, list: `
Joe Biden
Richard Nixon
Thomas Jefferson
John Adams
Lyndon B. Johnson | LBJ | Lyndon Johnson
Theodore Roosevelt | Teddy Roosevelt
Harry S. Truman | Harry Truman
George H. W. Bush | Bush Sr | George HW Bush
Gerald Ford
Calvin Coolidge
Andrew Johnson
Martin Van Buren
John Tyler
Millard Fillmore
Chester A. Arthur | Chester Arthur` },
{ id: "hi-rushmore", q: "A president carved on Mount Rushmore", ...P, list: `
George Washington
Abraham Lincoln
Thomas Jefferson
Theodore Roosevelt | Teddy Roosevelt` },
{ id: "hi-us-money", q: "A person on a current US banknote", ...P, list: `
George Washington # $1
Abraham Lincoln # $5
Benjamin Franklin # $100
Alexander Hamilton # $10
Andrew Jackson # $20
Ulysses S. Grant | Ulysses Grant # $50
Thomas Jefferson # $2` },
{ id: "hi-colonies", q: "One of the original Thirteen Colonies", wm: /state|colony|province/i, list: `
Virginia
Massachusetts | Massachusetts Bay
New York @New York (state)
Pennsylvania
New Jersey
Georgia @Georgia (U.S. state)
Maryland
Connecticut
North Carolina
South Carolina
Rhode Island
Delaware
New Hampshire` },
{ id: "hi-confederacy", q: "A state that joined the Confederacy", wm: /state/i, list: `
Texas
Virginia
Georgia @Georgia (U.S. state)
Alabama
Mississippi
South Carolina
Louisiana
Florida
Tennessee
North Carolina
Arkansas` },
{ id: "hi-henry-wives", q: "A wife of Henry VIII", ...P, list: `
Anne Boleyn | Boleyn
Catherine of Aragon | Katherine of Aragon | Aragon
Jane Seymour | Seymour @Jane Seymour
Catherine Parr | Katherine Parr | Parr
Anne of Cleves | Cleves
Catherine Howard | Kathryn Howard | Howard` },
{ id: "hi-tudors", q: "A Tudor monarch of England", note: "Lady Jane Grey (the nine-day queen) counts.", ...P, list: `
Henry VIII | Henry the Eighth @Henry VIII
Elizabeth I | Elizabeth the First | Elizabeth @Elizabeth I
Mary I | Bloody Mary | Mary Tudor @Mary I of England
Henry VII | Henry the Seventh @Henry VII of England
Edward VI | Edward the Sixth @Edward VI
Lady Jane Grey | Jane Grey # Queen for nine days in July 1553` },
{ id: "hi-royal-houses", q: "A royal house that has ruled England or Britain", wt: ["House of {}"], wm: /house|dynasty|royal|family/i, list: `
Tudor | Tudors | House of Tudor
Windsor | House of Windsor
Stuart | Stuarts | Stewart | House of Stuart
York | House of York
Lancaster | House of Lancaster
Plantagenet | Plantagenets | Angevin | House of Plantagenet
Hanover | Hanoverians | House of Hanover
Normandy | Normans | Norman | House of Normandy
Saxe-Coburg and Gotha | Saxe-Coburg # Renamed Windsor in 1917 during World War I
Blois | House of Blois # King Stephen (1135-54) and the Anarchy` },
{ id: "hi-caesars", q: "One of Suetonius's Twelve Caesars", ...P, list: `
Julius Caesar
Augustus | Octavian
Nero
Caligula
Tiberius
Claudius
Vespasian
Titus
Domitian
Galba # First of the Year of the Four Emperors (69 AD)
Otho # Ruled three months in 69 AD
Vitellius # Third emperor of 69 AD, killed by Vespasian's troops` },
{ id: "hi-uk-pms", q: "A UK Prime Minister since 1900", ...P, list: `
Winston Churchill
Margaret Thatcher
Tony Blair
Boris Johnson
Theresa May
David Cameron
Keir Starmer
Liz Truss
Rishi Sunak
Gordon Brown
John Major
Neville Chamberlain
Clement Attlee
Harold Wilson
Edward Heath | Ted Heath
James Callaghan | Jim Callaghan
Harold Macmillan
Anthony Eden
David Lloyd George | Lloyd George
Stanley Baldwin
Ramsay MacDonald
Alec Douglas-Home | Douglas-Home
H. H. Asquith | Asquith | Herbert Asquith
Arthur Balfour | Balfour
Bonar Law # Canadian-born; PM for 211 days in 1922-23
Henry Campbell-Bannerman | Campbell-Bannerman # Liberal PM 1905-08, first to be officially called "Prime Minister"
Lord Salisbury | Robert Gascoyne-Cecil | Salisbury @Robert Gascoyne-Cecil, 3rd Marquess of Salisbury # In office until 1902; "Bob's your uncle"` },
{ id: "hi-french-presidents", q: "A President of France's Fifth Republic", ...P, list: `
Emmanuel Macron
Charles de Gaulle | De Gaulle
Nicolas Sarkozy
Jacques Chirac
François Mitterrand
François Hollande
Valéry Giscard d'Estaing | Giscard d'Estaing | Giscard
Georges Pompidou` },
{ id: "hi-german-chancellors", q: "A Chancellor of (West) Germany since 1949", ...P, list: `
Angela Merkel
Helmut Kohl
Olaf Scholz
Friedrich Merz
Konrad Adenauer
Willy Brandt
Gerhard Schröder
Helmut Schmidt
Ludwig Erhard # The "economic miracle" minister, chancellor 1963-66
Kurt Georg Kiesinger | Kiesinger # Led the 1966-69 grand coalition` },
{ id: "hi-greek-gods", q: "A Greek Olympian god (including Hades and Hestia)", wm: /god|deity|goddess|mytholog/i, list: `
Zeus
Poseidon
Hades
Athena
Apollo
Aphrodite
Ares
Hermes
Hera
Artemis
Dionysus
Hephaestus
Demeter
Hestia # Goddess of the hearth, gave up her Olympus seat to Dionysus` },
{ id: "hi-roman-gods", q: "One of the twelve major Roman gods (Dii Consentes)", wt: ["{} (mythology)", "{} (god)", "{}"], wm: /god|deity|goddess|mytholog/i, list: `
Jupiter
Mars
Venus
Neptune
Mercury
Apollo
Juno
Minerva
Diana
Vulcan
Ceres
Vesta # Goddess of the hearth, tended by the Vestal Virgins` },
{ id: "hi-wonders", q: "One of the Seven Wonders of the Ancient World", wm: /wonder|ancient|statue|temple|tomb|lighthouse|pyramid|garden/i, list: `
Great Pyramid of Giza | Great Pyramid | Pyramids of Giza | Pyramids
Hanging Gardens of Babylon | Hanging Gardens
Colossus of Rhodes | Colossus
Lighthouse of Alexandria | Pharos of Alexandria | Pharos
Statue of Zeus at Olympia | Statue of Zeus
Temple of Artemis | Temple of Artemis at Ephesus
Mausoleum at Halicarnassus | Mausoleum of Halicarnassus | Mausoleum # Tomb of Mausolus, the origin of the word "mausoleum"` },
{ id: "hi-ussr", q: "One of the 15 Soviet republics (today's country)", ...C, list: `
Russia
Ukraine
Belarus
Kazakhstan
Georgia
Lithuania
Latvia
Estonia
Uzbekistan
Armenia
Azerbaijan
Moldova
Kyrgyzstan
Tajikistan
Turkmenistan` },
{ id: "hi-warsaw", q: "A member of the Warsaw Pact", ...C, list: `
Soviet Union | USSR
Poland
East Germany | GDR
Czechoslovakia
Hungary
Romania
Bulgaria
Albania # Left in 1968 after siding with China` },
{ id: "hi-nato-founders", q: "A founding member of NATO (1949)", ...C, list: `
United States
United Kingdom
France
Canada
Italy
Netherlands
Belgium
Norway
Denmark
Portugal
Luxembourg
Iceland # Founding member with no standing army` },
{ id: "hi-eec", q: "A founding member of the European Economic Community (1957)", ...C, list: `
France
West Germany | Germany
Italy
Belgium
Netherlands
Luxembourg` },
{ id: "hi-unsc", q: "A permanent member of the UN Security Council", ...C, list: `
United States
China
Russia
United Kingdom
France` },
{ id: "hi-central-powers", q: "One of the Central Powers in World War I", wm: /empire|country|state|kingdom|monarchy/i, list: `
Germany | German Empire @German Empire
Austria-Hungary | Austro-Hungarian Empire
Ottoman Empire | Turkey | Ottomans
Bulgaria | Kingdom of Bulgaria @Kingdom of Bulgaria # Joined in October 1915` },
{ id: "hi-dynasties", q: "A major Chinese imperial dynasty", wt: ["{} dynasty"], wm: /dynasty/i, list: `
Ming | Ming dynasty
Qing | Qing dynasty | Ching | Manchu
Han | Han dynasty
Tang | Tang dynasty
Song | Song dynasty | Sung
Qin | Qin dynasty | Chin
Yuan | Yuan dynasty | Mongol
Zhou | Zhou dynasty | Chou
Shang | Shang dynasty
Sui | Sui dynasty # Reunified China in 589, built the Grand Canal
Jin | Jin dynasty @Jin dynasty (266–420)
Xia | Xia dynasty # The legendary first dynasty, c. 2070-1600 BC` },
{ id: "hi-apostles", q: "One of the Twelve Apostles (or Matthias)", ...P, list: `
Peter | Simon Peter | Saint Peter | Simon @Saint Peter
John | John the Apostle @John the Apostle
Judas Iscariot | Judas
Thomas | Doubting Thomas @Thomas the Apostle
Matthew | Levi @Matthew the Apostle
Andrew @Andrew the Apostle
James son of Zebedee | James the Great | James @James the Great
Philip @Philip the Apostle
Bartholomew | Nathanael @Bartholomew the Apostle
James son of Alphaeus | James the Less | James @James, son of Alphaeus
Thaddeus | Jude | Jude Thaddeus @Jude the Apostle
Simon the Zealot | Simon the Canaanite | Simon @Simon the Zealot
Matthias @Saint Matthias # Chosen by lot to replace Judas` },
];
