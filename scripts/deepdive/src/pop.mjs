// Pop culture prompts.
const P = { person: true, wm: /singer|musician|rapper|personality|actress|actor|model|drummer|guitarist|born|businesswoman|media|member|songwriter|bassist/i };
const A = { wm: /album/i };
export default [
{ id: "pc-beatles", q: "A member of the Beatles (ever)", ...P, list: `
John Lennon
Paul McCartney
George Harrison
Ringo Starr
Pete Best # The drummer before Ringo, sacked in 1962
Stuart Sutcliffe # The original bassist, left in 1961 to paint in Hamburg` },
{ id: "pc-stones", q: "A member of the Rolling Stones (ever)", ...P, list: `
Mick Jagger
Keith Richards
Charlie Watts
Ronnie Wood
Bill Wyman
Brian Jones
Mick Taylor # Lead guitarist 1969-74, between Brian Jones and Ronnie Wood
Ian Stewart @Ian Stewart (musician) # "The sixth Stone": founding pianist, later road manager` },
{ id: "pc-1d", q: "A member of One Direction", ...P, list: `
Harry Styles
Zayn Malik | Zayn
Niall Horan
Louis Tomlinson
Liam Payne` },
{ id: "pc-bsb", q: "A member of the Backstreet Boys", ...P, list: `
Nick Carter @Nick Carter (singer)
Brian Littrell
AJ McLean | A.J. McLean
Kevin Richardson @Kevin Richardson (musician)
Howie Dorough | Howie D | Howie` },
{ id: "pc-spice", q: "A Spice Girl", ...P, list: `
Victoria Beckham | Posh Spice | Posh
Mel B | Scary Spice | Scary | Melanie Brown
Geri Halliwell | Ginger Spice | Ginger | Geri Horner
Emma Bunton | Baby Spice | Baby
Mel C | Sporty Spice | Sporty | Melanie C | Melanie Chisholm` },
{ id: "pc-bts", q: "A member of BTS", ...P, list: `
Jungkook | Jung Kook | Jeon Jungkook
V | Kim Taehyung | Taehyung @V (singer)
Jimin | Park Jimin @Jimin
Jin | Kim Seokjin @Jin (singer)
Suga | Agust D | Min Yoongi @Suga (rapper)
RM | Rap Monster | Kim Namjoon @RM (musician)
J-Hope | Jung Hoseok @J-Hope` },
{ id: "pc-kardashian", q: "A Kardashian or Jenner sibling (Kris Jenner's children)", ...P, list: `
Kim Kardashian | Kim
Kylie Jenner | Kylie
Kendall Jenner | Kendall
Khloé Kardashian | Khloe
Kourtney Kardashian | Kourtney
Rob Kardashian | Rob` },
{ id: "pc-taylor", q: "A Taylor Swift studio album", ...A, list: `
1989 @1989 (Taylor Swift album);1989 (album)
Folklore @Folklore (Taylor Swift album);Folklore (album)
Midnights @Midnights
Red @Red (Taylor Swift album)
Reputation @Reputation (album);Reputation (Taylor Swift album)
Lover @Lover (album)
Fearless @Fearless (Taylor Swift album)
Speak Now @Speak Now
Evermore @Evermore
The Tortured Poets Department | TTPD @The Tortured Poets Department
The Life of a Showgirl @The Life of a Showgirl
Taylor Swift | Debut @Taylor Swift (album)` },
{ id: "pc-beyonce", q: "A Beyoncé studio album", ...A, list: `
Lemonade @Lemonade (album)
Renaissance @Renaissance (Beyoncé album)
Cowboy Carter @Cowboy Carter
Beyoncé | Beyonce @Beyoncé (album)
Dangerously in Love @Dangerously in Love
I Am... Sasha Fierce | Sasha Fierce @I Am... Sasha Fierce
4 @4 (Beyoncé album)
B'Day @B'Day` },
{ id: "pc-mj", q: "A Michael Jackson solo studio album", ...A, list: `
Thriller @Thriller (album)
Bad @Bad (album)
Off the Wall @Off the Wall
Dangerous @Dangerous (Michael Jackson album)
HIStory | History @HIStory: Past, Present and Future, Book I
Invincible @Invincible (Michael Jackson album)
Ben @Ben (Michael Jackson album);Ben (album) # 1972 Motown album; the title song is about a pet rat
Got to Be There @Got to Be There # His 1972 solo debut on Motown
Music & Me | Music and Me @Music & Me
Forever, Michael | Forever Michael @Forever, Michael` },
{ id: "pc-madonna", q: "A Madonna studio album", ...A, list: `
Like a Virgin @Like a Virgin (album)
Like a Prayer @Like a Prayer (album)
Ray of Light @Ray of Light
True Blue @True Blue (Madonna album)
Confessions on a Dance Floor @Confessions on a Dance Floor
Madonna @Madonna (album)
Erotica @Erotica (album)
Music @Music (Madonna album)
Bedtime Stories @Bedtime Stories (Madonna album)
Hard Candy @Hard Candy (Madonna album);Hard Candy (album)
American Life @American Life
MDNA @MDNA (album)
Rebel Heart @Rebel Heart
Madame X @Madame X (album)` },
{ id: "pc-zodiac", q: "A Western zodiac sign", wt: ["{} (astrology)"], wm: /astrolog|sign|zodiac/i, list: `
Aries
Taurus
Gemini
Cancer
Leo
Virgo
Libra
Scorpio
Sagittarius
Capricorn
Aquarius
Pisces` },
{ id: "pc-chinese-zodiac", q: "An animal of the Chinese zodiac", manual: true, list: `
Dragon
Tiger
Rat
Snake
Monkey
Dog
Horse
Rabbit
Pig | Boar
Ox | Cow | Bull
Rooster | Chicken
Goat | Sheep | Ram` },
{ id: "pc-dwarfs", q: "One of Disney's Seven Dwarfs", manual: true, list: `
Dopey
Grumpy
Sleepy
Happy
Sneezy
Doc # The leader, with glasses
Bashful # The shy one who blushes` },
{ id: "pc-reindeer", q: "One of Santa's reindeer", manual: true, list: `
Rudolph
Dasher
Prancer
Comet
Cupid
Vixen # "...Prancer and Vixen"
Dancer
Donner | Donder # "...Donner and Blitzen" (Donder in the 1823 poem)
Blitzen` },
{ id: "pc-scooby", q: "A member of Scooby-Doo's Mystery Inc.", manual: true, list: `
Scooby-Doo | Scooby
Shaggy | Shaggy Rogers | Norville Rogers
Velma | Velma Dinkley
Fred | Fred Jones | Freddie
Daphne | Daphne Blake
Scrappy-Doo | Scrappy # Scooby's nephew, joined in 1979` },
{ id: "pc-clue-suspects", q: "A suspect in the board game Clue (Cluedo)", manual: true, list: `
Colonel Mustard | Mustard
Miss Scarlet | Scarlet | Miss Scarlett | Scarlett
Professor Plum | Plum
Mrs. Peacock | Peacock
Mr. Green | Green | Reverend Green
Mrs. White | White # The housekeeper/cook
Dr. Orchid | Orchid # Replaced Mrs. White in 2016` },
{ id: "pc-clue-weapons", q: "A weapon in the board game Clue (Cluedo)", manual: true, list: `
Candlestick
Knife | Dagger
Revolver | Pistol | Gun
Rope
Lead Pipe | Pipe
Wrench | Spanner # Called the spanner in the UK` },
{ id: "pc-monopoly", q: "A space you can buy in Monopoly (US board)", manual: true, list: `
Boardwalk
Park Place
Baltic Avenue | Baltic
Mediterranean Avenue | Mediterranean
Reading Railroad | Reading
Marvin Gardens # The only yellow property not called an avenue (and misspelled: the real place is Marven)
Pennsylvania Avenue | Pennsylvania
Atlantic Avenue | Atlantic
Illinois Avenue | Illinois
Kentucky Avenue | Kentucky
New York Avenue | New York
St. Charles Place | St Charles | Saint Charles Place # First pink/magenta property, after Jail
Oriental Avenue | Oriental
Vermont Avenue | Vermont
Connecticut Avenue | Connecticut
Electric Company
Water Works
States Avenue | States
Virginia Avenue | Virginia
St. James Place | St James | Saint James Place # First orange property
Tennessee Avenue | Tennessee
Indiana Avenue | Indiana
Ventnor Avenue | Ventnor # Yellow, next to Atlantic
Pacific Avenue | Pacific # First green property
North Carolina Avenue | North Carolina
Short Line | Short Line Railroad # The fourth railroad, before Park Place
B&O Railroad | B and O | Baltimore and Ohio Railroad # Third railroad, between the oranges and reds
Pennsylvania Railroad | Pennsylvania # Second railroad, between the magentas and oranges` },
{ id: "pc-starters", q: "A starter Pokémon (any generation)", manual: true, list: `
Charmander
Bulbasaur
Squirtle
Mudkip
Piplup
Totodile
Cyndaquil
Chikorita
Torchic
Treecko
Chimchar
Turtwig
Froakie
Rowlet
Litten
Popplio
Oshawott
Tepig
Snivy
Fennekin
Chespin
Sobble
Scorbunny
Grookey
Sprigatito # Gen IX grass cat (Scarlet & Violet)
Fuecoco # Gen IX fire crocodile (Scarlet & Violet)
Quaxly # Gen IX water duckling (Scarlet & Violet)` },
{ id: "pc-poke-types", q: "A Pokémon type", manual: true, list: `
Fire
Water
Grass
Electric
Psychic
Normal
Flying
Ghost
Dragon
Poison
Fighting
Rock
Ground
Ice
Bug
Dark
Fairy # Added in Gen VI to balance Dragon
Steel` },
{ id: "pc-nintendo", q: "A Nintendo home console", wm: /console|video game|nintendo/i, list: `
Nintendo Switch | Switch
Wii
Nintendo 64 | N64
Nintendo Entertainment System | NES
Super Nintendo Entertainment System | SNES | Super Nintendo
GameCube | Nintendo GameCube
Wii U
Nintendo Switch 2 | Switch 2` },
{ id: "pc-playstation", q: "A Sony PlayStation console (home or handheld)", wm: /console|video game|handheld/i, list: `
PlayStation | PS1 | PlayStation 1 | PSX @PlayStation (console)
PlayStation 2 | PS2
PlayStation 4 | PS4
PlayStation 5 | PS5
PlayStation 3 | PS3
PlayStation Portable | PSP
PlayStation Vita | PS Vita | Vita` },
{ id: "pc-gta", q: "A Grand Theft Auto game", note: "Released games up to Nov 2026 (not GTA VI).", wm: /game/i, list: `
Grand Theft Auto V | GTA V | GTA 5
Grand Theft Auto: San Andreas | San Andreas | GTA San Andreas
Grand Theft Auto: Vice City | Vice City | GTA Vice City
Grand Theft Auto IV | GTA IV | GTA 4
Grand Theft Auto III | GTA III | GTA 3
Grand Theft Auto | GTA 1 @Grand Theft Auto (video game)
Grand Theft Auto 2 | GTA 2
Grand Theft Auto: Liberty City Stories | Liberty City Stories
Grand Theft Auto: Vice City Stories | Vice City Stories
Grand Theft Auto: Chinatown Wars | Chinatown Wars
Grand Theft Auto Advance | GTA Advance
Grand Theft Auto: London 1969 | London 1969 # 1999 expansion pack for the first game` },
{ id: "pc-weasley", q: "A Weasley in Harry Potter (Arthur and Molly's family)", manual: true, list: `
Ron Weasley | Ron | Ronald
Ginny Weasley | Ginny | Ginevra
Fred Weasley | Fred
George Weasley | George
Molly Weasley | Molly
Arthur Weasley | Arthur
Percy Weasley | Percy # Third son, Head Boy, Ministry man
Bill Weasley | Bill # Eldest; curse-breaker for Gringotts, married Fleur
Charlie Weasley | Charlie # Second son; works with dragons in Romania` },
{ id: "pc-avengers", q: "One of the six original Avengers in the 2012 film", manual: true, list: `
Iron Man | Tony Stark
Captain America | Steve Rogers | Cap
Thor
Hulk | Bruce Banner | The Hulk
Black Widow | Natasha Romanoff
Hawkeye | Clint Barton # Jeremy Renner's archer` },
];
