// Movies & TV prompts. "~1994" = release year (used to find the Wikipedia article).
const F = { wt: ["{} ({y} film)", "{} (film)", "{}"], wm: /film|movie/i };
const P = { person: true, wm: /actor|actress|director|person|born|film/i };
export default [
{ id: "mtv-best-picture", q: "A Best Picture Oscar winner", ...F, list: `
Wings ~1927
The Broadway Melody ~1929
All Quiet on the Western Front ~1930
Cimarron ~1931
Grand Hotel ~1932
Cavalcade ~1933
It Happened One Night ~1934
Mutiny on the Bounty ~1935
The Great Ziegfeld ~1936
The Life of Emile Zola ~1937
You Can't Take It with You ~1938
Gone with the Wind ~1939
Rebecca ~1940
How Green Was My Valley ~1941
Mrs. Miniver ~1942
Casablanca ~1942
Going My Way ~1944
The Lost Weekend ~1945
The Best Years of Our Lives ~1946
Gentleman's Agreement ~1947
Hamlet ~1948
All the King's Men ~1949
All About Eve ~1950
An American in Paris ~1951
The Greatest Show on Earth ~1952
From Here to Eternity ~1953
On the Waterfront ~1954
Marty ~1955
Around the World in 80 Days | Around the World in Eighty Days ~1956
The Bridge on the River Kwai ~1957
Gigi ~1958
Ben-Hur ~1959
The Apartment ~1960
West Side Story ~1961
Lawrence of Arabia ~1962
Tom Jones ~1963
My Fair Lady ~1964
The Sound of Music ~1965
A Man for All Seasons ~1966
In the Heat of the Night ~1967
Oliver! ~1968
Midnight Cowboy ~1969
Patton ~1970
The French Connection ~1971
The Godfather ~1972
The Sting ~1973
The Godfather Part II | Godfather 2 | The Godfather II ~1974
One Flew Over the Cuckoo's Nest | Cuckoo's Nest ~1975
Rocky ~1976
Annie Hall ~1977
The Deer Hunter ~1978
Kramer vs. Kramer | Kramer versus Kramer ~1979
Ordinary People ~1980
Chariots of Fire ~1981
Gandhi ~1982
Terms of Endearment ~1983
Amadeus ~1984
Out of Africa ~1985
Platoon ~1986
The Last Emperor ~1987
Rain Man ~1988
Driving Miss Daisy ~1989
Dances with Wolves ~1990
The Silence of the Lambs ~1991
Unforgiven ~1992
Schindler's List ~1993
Forrest Gump ~1994
Braveheart ~1995
The English Patient ~1996
Titanic ~1997
Shakespeare in Love ~1998
American Beauty ~1999
Gladiator ~2000
A Beautiful Mind ~2001
Chicago ~2002
The Lord of the Rings: The Return of the King | The Return of the King | Return of the King ~2003
Million Dollar Baby ~2004
Crash ~2004
The Departed ~2006
No Country for Old Men ~2007
Slumdog Millionaire ~2008
The Hurt Locker ~2008
The King's Speech ~2010
The Artist ~2011
Argo ~2012
12 Years a Slave | Twelve Years a Slave ~2013
Birdman | Birdman or (The Unexpected Virtue of Ignorance) ~2014
Spotlight ~2015
Moonlight ~2016
The Shape of Water ~2017
Green Book ~2018
Parasite ~2019
Nomadland ~2020
CODA ~2021
Everything Everywhere All at Once | Everything Everywhere ~2022
Oppenheimer ~2023
Anora ~2024
One Battle After Another ~2025` },
{ id: "mtv-mcu", q: "A Marvel Cinematic Universe film", note: "Theatrical MCU films released up to Nov 2026.", ...F, list: `
Iron Man ~2008
The Incredible Hulk ~2008
Iron Man 2 ~2010
Thor ~2011
Captain America: The First Avenger | The First Avenger ~2011
The Avengers | Avengers ~2012
Iron Man 3 ~2013
Thor: The Dark World | The Dark World ~2013
Captain America: The Winter Soldier | The Winter Soldier | Winter Soldier ~2014
Guardians of the Galaxy ~2014
Avengers: Age of Ultron | Age of Ultron ~2015
Ant-Man ~2015
Captain America: Civil War | Civil War ~2016
Doctor Strange ~2016
Guardians of the Galaxy Vol. 2 | Guardians of the Galaxy 2 ~2017
Spider-Man: Homecoming | Homecoming ~2017
Thor: Ragnarok | Ragnarok ~2017
Black Panther ~2018
Avengers: Infinity War | Infinity War ~2018
Ant-Man and the Wasp ~2018
Captain Marvel ~2019
Avengers: Endgame | Endgame ~2019
Spider-Man: Far From Home | Far From Home ~2019
Black Widow ~2021
Shang-Chi and the Legend of the Ten Rings | Shang-Chi ~2021
Eternals ~2021
Spider-Man: No Way Home | No Way Home ~2021
Doctor Strange in the Multiverse of Madness | Multiverse of Madness ~2022
Thor: Love and Thunder | Love and Thunder ~2022
Black Panther: Wakanda Forever | Wakanda Forever ~2022
Ant-Man and the Wasp: Quantumania | Quantumania ~2023
Guardians of the Galaxy Vol. 3 | Guardians of the Galaxy 3 ~2023
The Marvels ~2023
Deadpool & Wolverine | Deadpool and Wolverine ~2024
Captain America: Brave New World | Brave New World ~2025
Thunderbolts* | Thunderbolts | The New Avengers ~2025
The Fantastic Four: First Steps | Fantastic Four: First Steps | First Steps ~2025
Spider-Man: Brand New Day | Brand New Day ~2026` },
{ id: "mtv-pixar", q: "A Pixar feature film", ...F, list: `
Toy Story ~1995
A Bug's Life ~1998
Toy Story 2 ~1999
Monsters, Inc. | Monsters Inc ~2001
Finding Nemo ~2003
The Incredibles ~2004
Cars ~2006
Ratatouille ~2007
WALL-E | Wall E ~2008
Up ~2009
Toy Story 3 ~2010
Cars 2 ~2011
Brave ~2012
Monsters University ~2013
Inside Out ~2015
The Good Dinosaur ~2015
Finding Dory ~2016
Cars 3 ~2017
Coco ~2017
Incredibles 2 | The Incredibles 2 ~2018
Toy Story 4 ~2019
Onward ~2020
Soul ~2020
Luca ~2021
Turning Red ~2022
Lightyear ~2022
Elemental ~2023
Inside Out 2 ~2024
Elio ~2025
Hoppers ~2026
Toy Story 5 ~2026` },
{ id: "mtv-bond", q: "A James Bond film", note: "The 25 official Eon films, plus Never Say Never Again.", ...F, list: `
Dr. No | Doctor No ~1962
From Russia with Love ~1963
Goldfinger ~1964
Thunderball ~1965
You Only Live Twice ~1967
On Her Majesty's Secret Service | OHMSS ~1969
Diamonds Are Forever ~1971
Live and Let Die ~1973
The Man with the Golden Gun ~1974
The Spy Who Loved Me ~1977
Moonraker ~1979
For Your Eyes Only ~1981
Octopussy ~1983
A View to a Kill ~1985
The Living Daylights ~1987
Licence to Kill | License to Kill ~1989
GoldenEye ~1995
Tomorrow Never Dies ~1997
The World Is Not Enough ~1999
Die Another Day ~2002
Casino Royale ~2006
Quantum of Solace ~2008
Skyfall ~2012
Spectre ~2015
No Time to Die ~2021
Never Say Never Again ~1983` },
{ id: "mtv-hp", q: "A Harry Potter film", wm: /film/i, list: `
Harry Potter and the Philosopher's Stone | Philosopher's Stone | Sorcerer's Stone | Harry Potter and the Sorcerer's Stone @Harry Potter and the Philosopher's Stone (film)
Harry Potter and the Chamber of Secrets | Chamber of Secrets @Harry Potter and the Chamber of Secrets (film)
Harry Potter and the Prisoner of Azkaban | Prisoner of Azkaban @Harry Potter and the Prisoner of Azkaban (film)
Harry Potter and the Goblet of Fire | Goblet of Fire @Harry Potter and the Goblet of Fire (film)
Harry Potter and the Order of the Phoenix | Order of the Phoenix @Harry Potter and the Order of the Phoenix (film)
Harry Potter and the Half-Blood Prince | Half-Blood Prince @Harry Potter and the Half-Blood Prince (film)
Harry Potter and the Deathly Hallows – Part 1 | Deathly Hallows Part 1 | Deathly Hallows @Harry Potter and the Deathly Hallows – Part 1
Harry Potter and the Deathly Hallows – Part 2 | Deathly Hallows Part 2 | Deathly Hallows @Harry Potter and the Deathly Hallows – Part 2` },
{ id: "mtv-starwars", q: "A live-action Star Wars film", note: "Theatrical releases up to Nov 2026.", ...F, list: `
Star Wars | A New Hope | Episode IV @Star Wars (film)
The Empire Strikes Back | Empire Strikes Back | Episode V
Return of the Jedi | Episode VI
The Phantom Menace | Episode I @Star Wars: Episode I – The Phantom Menace
Attack of the Clones | Episode II @Star Wars: Episode II – Attack of the Clones
Revenge of the Sith | Episode III @Star Wars: Episode III – Revenge of the Sith
The Force Awakens | Episode VII @Star Wars: The Force Awakens
Rogue One @Rogue One
The Last Jedi | Episode VIII @Star Wars: The Last Jedi
Solo | Solo: A Star Wars Story @Solo: A Star Wars Story
The Rise of Skywalker | Episode IX @Star Wars: The Rise of Skywalker
The Mandalorian and Grogu @The Mandalorian and Grogu` },
{ id: "mtv-nolan", q: "A film directed by Christopher Nolan", ...F, list: `
Following ~1998
Memento ~2000
Insomnia ~2002
Batman Begins ~2005
The Prestige ~2006
The Dark Knight ~2008
Inception ~2010
The Dark Knight Rises ~2012
Interstellar ~2014
Dunkirk ~2017
Tenet ~2020
Oppenheimer ~2023
The Odyssey ~2026` },
{ id: "mtv-tarantino", q: "A film directed by Quentin Tarantino", ...F, list: `
Reservoir Dogs ~1992
Pulp Fiction ~1994
Jackie Brown ~1997
Kill Bill: Volume 1 | Kill Bill Vol 1 | Kill Bill @Kill Bill: Volume 1
Kill Bill: Volume 2 | Kill Bill Vol 2 | Kill Bill @Kill Bill: Volume 2
Death Proof ~2007
Inglourious Basterds | Inglorious Bastards ~2009
Django Unchained ~2012
The Hateful Eight | Hateful 8 ~2015
Once Upon a Time in Hollywood ~2019` },
{ id: "mtv-spielberg", q: "A feature film directed by Steven Spielberg", ...F, list: `
Duel ~1971
The Sugarland Express ~1974
Jaws ~1975
Close Encounters of the Third Kind | Close Encounters ~1977
1941 ~1979
Raiders of the Lost Ark ~1981
E.T. the Extra-Terrestrial | E.T. | ET ~1982
Indiana Jones and the Temple of Doom | Temple of Doom ~1984
The Color Purple ~1985
Empire of the Sun ~1987
Indiana Jones and the Last Crusade | Last Crusade ~1989
Always ~1989
Hook ~1991
Jurassic Park ~1993
Schindler's List ~1993
The Lost World: Jurassic Park | The Lost World ~1997
Amistad ~1997
Saving Private Ryan ~1998
A.I. Artificial Intelligence | A.I. | AI ~2001
Minority Report ~2002
Catch Me If You Can ~2002
The Terminal ~2004
War of the Worlds ~2005
Munich ~2005
Indiana Jones and the Kingdom of the Crystal Skull | Kingdom of the Crystal Skull ~2008
The Adventures of Tintin | Tintin ~2011
War Horse ~2011
Lincoln ~2012
Bridge of Spies ~2015
The BFG ~2016
The Post ~2017
Ready Player One ~2018
West Side Story ~2021
The Fabelmans ~2022
Disclosure Day ~2026` },
{ id: "mtv-fast", q: "A Fast & Furious film", ...F, list: `
The Fast and the Furious ~2001
2 Fast 2 Furious ~2003
The Fast and the Furious: Tokyo Drift | Tokyo Drift ~2006
Fast & Furious | Fast and Furious 4 ~2009
Fast Five | Fast 5 ~2011
Fast & Furious 6 | Fast 6 ~2013
Furious 7 | Fast 7 ~2015
The Fate of the Furious | Fast 8 ~2017
Hobbs & Shaw | Fast & Furious Presents: Hobbs & Shaw ~2019
F9 | Fast 9 | F9: The Fast Saga ~2021
Fast X | Fast 10 ~2023` },
{ id: "mtv-jurassic", q: "A Jurassic Park or Jurassic World film", ...F, list: `
Jurassic Park ~1993
The Lost World: Jurassic Park | The Lost World | Jurassic Park 2 ~1997
Jurassic Park III | Jurassic Park 3 ~2001
Jurassic World ~2015
Jurassic World: Fallen Kingdom | Fallen Kingdom ~2018
Jurassic World Dominion | Dominion ~2022
Jurassic World Rebirth | Rebirth ~2025` },
{ id: "mtv-middle-earth", q: "A Peter Jackson Middle-earth film", ...F, list: `
The Lord of the Rings: The Fellowship of the Ring | The Fellowship of the Ring | Fellowship of the Ring @The Lord of the Rings: The Fellowship of the Ring
The Lord of the Rings: The Two Towers | The Two Towers | Two Towers @The Lord of the Rings: The Two Towers
The Lord of the Rings: The Return of the King | The Return of the King | Return of the King @The Lord of the Rings: The Return of the King
The Hobbit: An Unexpected Journey | An Unexpected Journey @The Hobbit: An Unexpected Journey
The Hobbit: The Desolation of Smaug | The Desolation of Smaug | Desolation of Smaug @The Hobbit: The Desolation of Smaug
The Hobbit: The Battle of the Five Armies | The Battle of the Five Armies | Battle of the Five Armies @The Hobbit: The Battle of the Five Armies` },
{ id: "mtv-mi", q: "A Mission: Impossible film", ...F, list: `
Mission: Impossible | Mission Impossible 1 @Mission: Impossible (film)
Mission: Impossible 2 | M:I-2 | MI2 @Mission: Impossible 2
Mission: Impossible III | MI3 @Mission: Impossible III
Mission: Impossible – Ghost Protocol | Ghost Protocol @Mission: Impossible – Ghost Protocol
Mission: Impossible – Rogue Nation | Rogue Nation @Mission: Impossible – Rogue Nation
Mission: Impossible – Fallout | Fallout @Mission: Impossible – Fallout
Mission: Impossible – Dead Reckoning Part One | Dead Reckoning | Dead Reckoning Part 1 @Mission: Impossible – Dead Reckoning Part One
Mission: Impossible – The Final Reckoning | The Final Reckoning | Final Reckoning @Mission: Impossible – The Final Reckoning` },
{ id: "mtv-rocky", q: "A Rocky or Creed film", ...F, list: `
Rocky ~1976
Rocky II ~1979
Rocky III ~1982
Rocky IV ~1985
Rocky V ~1990
Rocky Balboa ~2006
Creed ~2015
Creed II ~2018
Creed III ~2023` },
{ id: "mtv-toystory", q: "A Toy Story film", note: "The five main films (not Lightyear).", ...F, list: `
Toy Story ~1995
Toy Story 2 ~1999
Toy Story 3 ~2010
Toy Story 4 ~2019
Toy Story 5 ~2026` },
{ id: "mtv-indy", q: "An Indiana Jones film", ...F, list: `
Raiders of the Lost Ark ~1981
Indiana Jones and the Temple of Doom | Temple of Doom ~1984
Indiana Jones and the Last Crusade | Last Crusade ~1989
Indiana Jones and the Kingdom of the Crystal Skull | Kingdom of the Crystal Skull | Crystal Skull ~2008
Indiana Jones and the Dial of Destiny | Dial of Destiny ~2023` },
{ id: "mtv-animated-oscar", q: "A Best Animated Feature Oscar winner", ...F, list: `
Shrek ~2001
Spirited Away ~2001
Finding Nemo ~2003
The Incredibles ~2004
Wallace & Gromit: The Curse of the Were-Rabbit | The Curse of the Were-Rabbit | Curse of the Were-Rabbit ~2005
Happy Feet ~2006
Ratatouille ~2007
WALL-E | Wall E ~2008
Up ~2009
Toy Story 3 ~2010
Rango ~2011
Brave ~2012
Frozen ~2013
Big Hero 6 ~2014
Inside Out ~2015
Zootopia | Zootropolis ~2016
Coco ~2017
Spider-Man: Into the Spider-Verse | Into the Spider-Verse | Spider-Verse ~2018
Toy Story 4 ~2019
Soul ~2020
Encanto ~2021
Guillermo del Toro's Pinocchio | Pinocchio ~2022
The Boy and the Heron ~2023
Flow ~2024
KPop Demon Hunters | K-Pop Demon Hunters ~2025` },
{ id: "mtv-ghibli", q: "A Studio Ghibli film", note: "Nausicaä (made just before the studio was founded) counts.", ...F, list: `
Spirited Away ~2001
My Neighbor Totoro | Totoro ~1988
Princess Mononoke ~1997
Howl's Moving Castle ~2004
Kiki's Delivery Service ~1989
Ponyo ~2008
Castle in the Sky | Laputa ~1986
Grave of the Fireflies ~1988
Nausicaä of the Valley of the Wind | Nausicaa ~1984
The Wind Rises ~2013
The Boy and the Heron ~2023
Porco Rosso ~1992
Whisper of the Heart ~1995
Arrietty | The Secret World of Arrietty ~2010
The Cat Returns ~2002
When Marnie Was There ~2014
The Tale of the Princess Kaguya | Princess Kaguya ~2013
From Up on Poppy Hill ~2011
Tales from Earthsea ~2006
Pom Poko ~1994
Only Yesterday ~1991
Ocean Waves ~1993
My Neighbors the Yamadas ~1999
The Red Turtle ~2016
Earwig and the Witch ~2020` },
{ id: "mtv-startrek", q: "A Star Trek TV series", wm: /series|television|show/i, list: `
Star Trek: The Original Series | The Original Series | TOS | Star Trek
Star Trek: The Animated Series | The Animated Series | TAS
Star Trek: The Next Generation | The Next Generation | TNG
Star Trek: Deep Space Nine | Deep Space Nine | DS9 | Deep Space 9
Star Trek: Voyager | Voyager
Star Trek: Enterprise | Enterprise
Star Trek: Discovery | Discovery
Star Trek: Picard | Picard
Star Trek: Lower Decks | Lower Decks
Star Trek: Prodigy | Prodigy
Star Trek: Strange New Worlds | Strange New Worlds
Star Trek: Starfleet Academy | Starfleet Academy` },
{ id: "mtv-bond-actors", q: "An actor who played James Bond on film", note: "Includes David Niven (1967 Casino Royale) and Barry Nelson (1954 TV).", ...P, list: `
Sean Connery
Roger Moore
Daniel Craig
Pierce Brosnan
Timothy Dalton
George Lazenby
David Niven # Played Sir James Bond in the 1967 spoof Casino Royale
Barry Nelson # The first screen Bond: an American "Jimmy Bond" in a 1954 TV Casino Royale` },
{ id: "mtv-batman-actors", q: "An actor who played Batman in live action", note: "Film and the 1960s TV series; the 1940s serials count.", ...P, list: `
Christian Bale
Michael Keaton
Ben Affleck
Robert Pattinson
George Clooney
Val Kilmer
Adam West
Lewis Wilson # The first screen Batman, in the 1943 Columbia serial
Robert Lowery @Robert Lowery (actor) # Batman in the 1949 serial Batman and Robin` },
{ id: "mtv-best-actor", q: "A Best Actor Oscar winner (2000 ceremony onwards)", ...P, list: `
Kevin Spacey
Russell Crowe
Denzel Washington
Adrien Brody
Sean Penn
Jamie Foxx
Philip Seymour Hoffman
Forest Whitaker
Daniel Day-Lewis
Jeff Bridges
Colin Firth
Jean Dujardin
Matthew McConaughey
Eddie Redmayne
Leonardo DiCaprio
Casey Affleck
Gary Oldman
Rami Malek
Joaquin Phoenix
Anthony Hopkins
Will Smith
Brendan Fraser
Cillian Murphy
Michael B. Jordan` },
{ id: "mtv-princess", q: "An official Disney Princess", manual: true, list: `
Cinderella
Ariel
Belle
Snow White
Jasmine
Aurora | Sleeping Beauty # Sleeping Beauty's name; also called Briar Rose
Rapunzel
Mulan
Moana
Tiana # The Princess and the Frog (2009), set in New Orleans
Pocahontas
Merida # Brave (2012), the Scottish archer
Raya # Raya and the Last Dragon (2021), the 13th official princess` },
{ id: "mtv-got", q: "A Great House of Westeros (Game of Thrones)", manual: true, list: `
Stark | House Stark
Lannister | House Lannister
Targaryen | House Targaryen
Baratheon | House Baratheon
Greyjoy | House Greyjoy # Iron Islands; "We do not sow"
Tyrell | House Tyrell # Highgarden; a golden rose
Martell | House Martell # Dorne; a sun pierced by a spear
Tully | House Tully # Riverrun; Catelyn Stark's family
Arryn | House Arryn # The Eyrie; a falcon and moon` },
{ id: "mtv-friends", q: "One of the six main characters in Friends", manual: true, list: `
Rachel Green | Rachel
Ross Geller | Ross
Monica Geller | Monica
Chandler Bing | Chandler
Joey Tribbiani | Joey
Phoebe Buffay | Phoebe` },
{ id: "mtv-simpsons", q: "A member of the Simpson family", note: "The Springfield family (no pets): the five at home plus grandparents and Homer's half-brother.", manual: true, list: `
Homer Simpson | Homer
Bart Simpson | Bart
Lisa Simpson | Lisa
Marge Simpson | Marge
Maggie Simpson | Maggie
Abe Simpson | Grampa | Grandpa | Abraham Simpson | Abe # Grampa: Homer's dad, at the Springfield Retirement Castle
Mona Simpson | Mona # Homer's mother, a 1960s radical in hiding
Herb Powell | Herb # Homer's half-brother; built "The Homer" car` },
];
