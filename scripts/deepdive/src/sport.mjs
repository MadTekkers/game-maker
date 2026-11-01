// Sports prompts. "City/Nickname" lines = team (display "City Nickname", aliases nickname and city).
const T = { team: true, wm: /team|club|franchise|basketball|football|baseball|hockey|soccer/i };
const P = { person: true, wm: /player|driver|racing|footballer|tennis|born|athlete/i };
const C = { country: true, wm: /country|state|kingdom|republic|nation/i };
export default [
{ id: "sp-nba", q: "An NBA team", ...T, list: `
Los Angeles/Lakers
Boston/Celtics
Chicago/Bulls
Golden State/Warriors
Miami/Heat
New York/Knicks
Brooklyn/Nets
San Antonio/Spurs
Houston/Rockets
Dallas/Mavericks
Philadelphia/76ers | Sixers
Phoenix/Suns
Denver/Nuggets
Milwaukee/Bucks
Cleveland/Cavaliers | Cavs
Toronto/Raptors
Oklahoma City/Thunder | OKC
Detroit/Pistons
Atlanta/Hawks
Portland/Trail Blazers | Blazers
Utah/Jazz
Sacramento/Kings
Orlando/Magic
Indiana/Pacers
Minnesota/Timberwolves | Wolves
Memphis/Grizzlies
New Orleans/Pelicans
Charlotte/Hornets
Washington/Wizards
Los Angeles/Clippers | LA Clippers @Los Angeles Clippers` },
{ id: "sp-nfl", q: "An NFL team", ...T, list: `
Dallas/Cowboys
New England/Patriots
Green Bay/Packers
Pittsburgh/Steelers
Kansas City/Chiefs
San Francisco/49ers | Niners | Forty-Niners
Chicago/Bears
New York/Giants
New York/Jets
Philadelphia/Eagles
Seattle/Seahawks
Denver/Broncos
Miami/Dolphins
Las Vegas/Raiders | Oakland Raiders
Baltimore/Ravens
Buffalo/Bills
Detroit/Lions
Minnesota/Vikings
New Orleans/Saints
Los Angeles/Rams
Los Angeles/Chargers
Tampa Bay/Buccaneers | Bucs
Cincinnati/Bengals
Cleveland/Browns
Indianapolis/Colts
Atlanta/Falcons
Carolina/Panthers
Arizona/Cardinals
Houston/Texans
Jacksonville/Jaguars | Jags
Tennessee/Titans
Washington/Commanders | Washington Redskins | Redskins` },
{ id: "sp-mlb", q: "An MLB team", ...T, list: `
New York/Yankees
Boston/Red Sox
Los Angeles/Dodgers
Chicago/Cubs
San Francisco/Giants
St. Louis/Cardinals
New York/Mets
Atlanta/Braves
Houston/Astros
Philadelphia/Phillies
Chicago/White Sox
Detroit/Tigers
Seattle/Mariners
Texas/Rangers @Texas Rangers (baseball)
Toronto/Blue Jays
Baltimore/Orioles
Cleveland/Guardians | Cleveland Indians
San Diego/Padres
Los Angeles/Angels | Anaheim Angels
Athletics | Oakland Athletics | A's | Oakland A's | Sacramento Athletics @Athletics (baseball);Oakland Athletics
Minnesota/Twins
Milwaukee/Brewers
Cincinnati/Reds
Pittsburgh/Pirates
Kansas City/Royals
Colorado/Rockies
Arizona/Diamondbacks | D-backs
Miami/Marlins
Tampa Bay/Rays
Washington/Nationals | Nats` },
{ id: "sp-nhl", q: "An NHL team", ...T, list: `
Toronto/Maple Leafs | Leafs
Montreal/Canadiens | Habs
Boston/Bruins
Chicago/Blackhawks
Detroit/Red Wings
New York/Rangers
Pittsburgh/Penguins
Edmonton/Oilers
Vegas/Golden Knights
Tampa Bay/Lightning
Philadelphia/Flyers
Colorado/Avalanche
Vancouver/Canucks
Calgary/Flames
Florida/Panthers
Washington/Capitals | Caps
Los Angeles/Kings | LA Kings
New York/Islanders
New Jersey/Devils
St. Louis/Blues
Dallas/Stars
Ottawa/Senators | Sens
Buffalo/Sabres
Minnesota/Wild
Winnipeg/Jets
Carolina/Hurricanes | Canes
Anaheim/Ducks
San Jose/Sharks
Seattle/Kraken
Nashville/Predators | Preds
Columbus/Blue Jackets
Utah/Mammoth | Utah Hockey Club` },
{ id: "sp-mls", q: "A Major League Soccer club (2026)", ...T, list: `
Inter Miami | Inter Miami CF @Inter Miami CF
LA Galaxy | Los Angeles Galaxy | Galaxy
Los Angeles FC | LAFC
Seattle Sounders | Sounders @Seattle Sounders FC
Atlanta United | Atlanta United FC @Atlanta United FC
Toronto FC | TFC
New York City FC | NYCFC
New York Red Bulls | Red Bulls
Portland Timbers | Timbers
Orlando City | Orlando City SC @Orlando City SC
Austin FC
Chicago Fire | Chicago Fire FC @Chicago Fire FC
D.C. United | DC United
Columbus Crew | Crew
FC Cincinnati
Philadelphia Union | Union
Nashville SC
Charlotte FC
St. Louis City SC | St. Louis City | St Louis City SC
San Diego FC
Sporting Kansas City | Sporting KC
Real Salt Lake | RSL
Colorado Rapids | Rapids
FC Dallas
Houston Dynamo | Houston Dynamo FC @Houston Dynamo FC
Minnesota United | Minnesota United FC | Loons @Minnesota United FC
New England Revolution | Revolution | Revs
San Jose Earthquakes | Earthquakes
Vancouver Whitecaps | Whitecaps @Vancouver Whitecaps FC
CF Montréal | CF Montreal | Montreal Impact` },
{ id: "sp-epl", q: "A Premier League club (2025–26 season)", wm: /football club|club|association football/i, list: `
Manchester United | Man United | Man Utd @Manchester United F.C.
Liverpool @Liverpool F.C.
Arsenal @Arsenal F.C.
Chelsea @Chelsea F.C.
Manchester City | Man City @Manchester City F.C.
Tottenham Hotspur | Tottenham | Spurs @Tottenham Hotspur F.C.
Newcastle United | Newcastle @Newcastle United F.C.
Aston Villa | Villa @Aston Villa F.C.
West Ham United | West Ham @West Ham United F.C.
Everton @Everton F.C.
Leeds United | Leeds @Leeds United F.C.
Brighton & Hove Albion | Brighton @Brighton & Hove Albion F.C.
Nottingham Forest | Forest @Nottingham Forest F.C.
Crystal Palace | Palace @Crystal Palace F.C.
Wolverhampton Wanderers | Wolves @Wolverhampton Wanderers F.C.
Fulham @Fulham F.C.
Brentford @Brentford F.C.
AFC Bournemouth | Bournemouth @AFC Bournemouth
Sunderland @Sunderland A.F.C.
Burnley @Burnley F.C.` },
{ id: "sp-wc-winners", q: "A country that has won the men's FIFA World Cup", note: "Up to and including Spain's 2026 win.", wt: ["{} national football team"], wm: /football|soccer|team/i, list: `
Brazil
Germany | West Germany
Argentina
France
Italy
Spain
England
Uruguay` },
{ id: "sp-wc-hosts", q: "A country that has hosted the men's FIFA World Cup", note: "Joint hosts count (2002 Japan/South Korea; 2026 USA/Canada/Mexico).", ...C, list: `
Brazil
United States
Germany | West Germany
France
Italy
Mexico
Qatar
Russia
South Africa
England
Spain
Argentina
Japan
South Korea
Uruguay # Hosted (and won) the first World Cup in 1930
Switzerland # 1954, the "Miracle of Bern"
Sweden # 1958, Pelé's first World Cup
Chile # 1962
Canada # Co-host of the 48-team 2026 tournament` },
{ id: "sp-summer-hosts", q: "A country that has hosted the Summer Olympics", ...C, list: `
United States
United Kingdom
France
China
Japan
Greece
Australia
Brazil
Germany
Italy
Spain
Mexico
Canada
South Korea
Soviet Union | USSR | Russia # Moscow 1980, boycotted by the US
Sweden # Stockholm 1912
Netherlands # Amsterdam 1928, the first Olympic flame
Belgium # Antwerp 1920
Finland # Helsinki 1952` },
{ id: "sp-summer-cities", q: "A city that has hosted the Summer Olympics", wm: /city|capital|town|metropol/i, list: `
London
Paris
Los Angeles
Tokyo
Beijing
Athens
Sydney
Rio de Janeiro | Rio
Barcelona
Atlanta
Moscow
Seoul
Berlin
Rome
Mexico City
Munich
Montreal
Melbourne
Amsterdam
Stockholm
Helsinki
Antwerp # 1920, the Games after World War I
St. Louis # 1904, the first Games held in the United States` },
{ id: "sp-winter-hosts", q: "A country that has hosted the Winter Olympics", ...C, list: `
United States
Canada
Japan
Russia
Norway
Italy
France
Switzerland
Germany
Austria
South Korea
China
Yugoslavia # Sarajevo 1984, now in Bosnia and Herzegovina` },
{ id: "sp-sb-winners", q: "An NFL team that has won the Super Bowl", note: "Up to Super Bowl LX (Feb 2026).", ...T, list: `
New England/Patriots
Pittsburgh/Steelers
Dallas/Cowboys
San Francisco/49ers | Niners
Green Bay/Packers
New York/Giants
Kansas City/Chiefs
Denver/Broncos
Las Vegas/Raiders | Oakland Raiders | Los Angeles Raiders
Washington/Commanders | Redskins | Washington Redskins
Philadelphia/Eagles
Seattle/Seahawks
Baltimore/Ravens
Los Angeles/Rams | St. Louis Rams
Miami/Dolphins
Tampa Bay/Buccaneers | Bucs
Indianapolis/Colts | Baltimore Colts
New Orleans/Saints
Chicago/Bears # Super Bowl XX, the 1985 "Super Bowl Shuffle" team
New York/Jets # Super Bowl III: Joe Namath's guarantee` },
{ id: "sp-sb-never", q: "An NFL team that has never won the Super Bowl", note: "As of Super Bowl LX (Feb 2026).", ...T, list: `
Buffalo/Bills
Minnesota/Vikings
Detroit/Lions
Cleveland/Browns
Cincinnati/Bengals
Atlanta/Falcons
Carolina/Panthers
Arizona/Cardinals
Los Angeles/Chargers
Houston/Texans
Jacksonville/Jaguars | Jags
Tennessee/Titans` },
{ id: "sp-nba-champs", q: "An NBA franchise that has won the championship", note: "Current franchises, up to the Knicks' 2026 title.", ...T, list: `
Los Angeles/Lakers
Boston/Celtics
Chicago/Bulls
Golden State/Warriors
San Antonio/Spurs
Miami/Heat
New York/Knicks
Detroit/Pistons
Houston/Rockets
Philadelphia/76ers | Sixers
Cleveland/Cavaliers | Cavs
Milwaukee/Bucks
Dallas/Mavericks
Denver/Nuggets
Toronto/Raptors
Oklahoma City/Thunder | Seattle SuperSonics # 2025 champions; also won in 1979 as Seattle
Portland/Trail Blazers | Blazers # 1977 champions, "Blazermania" with Bill Walton
Washington/Wizards | Washington Bullets # 1978 champions as the Washington Bullets
Atlanta/Hawks | St. Louis Hawks # 1958 champions as the St. Louis Hawks
Sacramento/Kings | Rochester Royals # 1951 champions as the Rochester Royals` },
{ id: "sp-ucl", q: "A club that has won the European Cup / Champions League", note: "Up to Paris Saint-Germain's 2026 win.", wm: /club|football/i, list: `
Real Madrid @Real Madrid CF
Barcelona | FC Barcelona @FC Barcelona
Bayern Munich | Bayern @FC Bayern Munich
Liverpool @Liverpool F.C.
AC Milan | Milan @AC Milan
Manchester United | Man United @Manchester United F.C.
Chelsea @Chelsea F.C.
Manchester City | Man City @Manchester City F.C.
Juventus @Juventus FC
Inter Milan | Inter | Internazionale @Inter Milan
Paris Saint-Germain | PSG @Paris Saint-Germain F.C.
Ajax @AFC Ajax
Borussia Dortmund | Dortmund @Borussia Dortmund
Porto | FC Porto @FC Porto
Benfica @S.L. Benfica
Celtic @Celtic F.C. # 1967 "Lisbon Lions", all born near Glasgow
Nottingham Forest @Nottingham Forest F.C. # Back-to-back 1979 and 1980 under Brian Clough
Aston Villa @Aston Villa F.C. # 1982 winners, beat Bayern in Rotterdam
Marseille | Olympique de Marseille @Olympique de Marseille # 1993: the only French winner until PSG
Hamburger SV | Hamburg @Hamburger SV # 1983, beat Juventus in Athens
Feyenoord @Feyenoord # 1970, the first Dutch winner
PSV Eindhoven | PSV @PSV Eindhoven # 1988, won on penalties vs Benfica
Steaua București | Steaua Bucharest | FCSB @FCSB # 1986, the first Eastern European winner
Red Star Belgrade | Crvena Zvezda @Red Star Belgrade # 1991, beat Marseille on penalties in Bari` },
{ id: "sp-f1-champs", q: "A Formula One World Drivers' Champion", note: "Up to Lando Norris (2025).", ...P, list: `
Lewis Hamilton
Michael Schumacher
Ayrton Senna
Max Verstappen
Sebastian Vettel
Fernando Alonso
Niki Lauda
Alain Prost
Lando Norris
Kimi Räikkönen
Jenson Button
Nico Rosberg
Mika Häkkinen
Damon Hill
Nigel Mansell
James Hunt
Jackie Stewart
Juan Manuel Fangio
Jacques Villeneuve
Nelson Piquet
Jim Clark
Emerson Fittipaldi
Mario Andretti
Graham Hill
Jack Brabham
Alberto Ascari
Keke Rosberg
Jody Scheckter
Alan Jones @Alan Jones (racing driver)
John Surtees
Jochen Rindt
Denny Hulme
Phil Hill
Mike Hawthorn
Giuseppe Farina | Nino Farina` },
{ id: "sp-ballon-dor", q: "A men's Ballon d'Or winner", note: "Up to Harry Kane (2026).", ...P, list: `
Lionel Messi | Messi
Cristiano Ronaldo
Ronaldo | R9 | Ronaldo Nazario @Ronaldo (Brazilian footballer)
Zinedine Zidane
Ronaldinho
Kaká
Luka Modrić
Karim Benzema
Johan Cruyff
Michel Platini
Marco van Basten
Franz Beckenbauer
George Best
Bobby Charlton
Eusébio
Ruud Gullit
Roberto Baggio
Rivaldo
Luís Figo
Michael Owen
Andriy Shevchenko
Fabio Cannavaro
Pavel Nedvěd
Alfredo Di Stéfano
Gerd Müller
Lothar Matthäus
Kevin Keegan
Paolo Rossi
Karl-Heinz Rummenigge
George Weah
Hristo Stoichkov
Rodri @Rodri (footballer, born 1996)
Ousmane Dembélé
Harry Kane
Lev Yashin
Denis Law
Stanley Matthews
Raymond Kopa
Jean-Pierre Papin
Matthias Sammer
Luis Suárez Miramontes | Luis Suarez # The Spanish playmaker (1960), not the Uruguayan striker
Omar Sívori
Josef Masopust
Gianni Rivera
Flórián Albert
Oleg Blokhin
Allan Simonsen
Igor Belanov` },
{ id: "sp-wimbledon-men", q: "A Wimbledon men's singles champion since 1990", ...P, list: `
Roger Federer
Novak Djokovic
Rafael Nadal
Andy Murray
Pete Sampras
Carlos Alcaraz
Andre Agassi
Jannik Sinner
Lleyton Hewitt
Goran Ivanišević
Stefan Edberg
Richard Krajicek
Michael Stich` },
{ id: "sp-wimbledon-women", q: "A Wimbledon women's singles champion since 1990", ...P, list: `
Serena Williams
Venus Williams
Steffi Graf
Maria Sharapova
Martina Navratilova
Martina Hingis
Petra Kvitová
Iga Świątek
Ashleigh Barty
Simona Halep
Angelique Kerber
Garbiñe Muguruza
Lindsay Davenport
Amélie Mauresmo
Elena Rybakina
Marion Bartoli
Jana Novotná
Conchita Martínez
Markéta Vondroušová
Barbora Krejčíková
Linda Nosková` },
{ id: "sp-test-cricket", q: "A Test cricket nation", wt: ["{} national cricket team", "{} cricket team"], wm: /cricket/i, list: `
England
Australia
India
Pakistan
South Africa
New Zealand
West Indies
Sri Lanka
Bangladesh
Zimbabwe
Afghanistan
Ireland` },
{ id: "sp-six-nations", q: "A Six Nations rugby team", wt: ["{} national rugby union team"], wm: /rugby/i, list: `
England
Ireland
Wales
Scotland
France
Italy` },
{ id: "sp-positions", q: "A fielding position in baseball", manual: true, list: `
Pitcher
Catcher
Shortstop
First base | First baseman | 1B
Second base | Second baseman | 2B
Third base | Third baseman | 3B
Center field | Centre field | Center fielder
Left field | Left fielder
Right field | Right fielder` },
{ id: "sp-chess", q: "A chess piece", manual: true, list: `
King
Queen
Knight | Horse
Bishop
Rook | Castle
Pawn` },
{ id: "sp-rings", q: "A colour of the Olympic rings", manual: true, list: `
Red
Blue
Black
Yellow
Green` },
{ id: "sp-tennis-slams", q: "A tennis Grand Slam tournament", manual: true, list: `
Wimbledon
US Open | U.S. Open
French Open | Roland Garros | Roland-Garros
Australian Open` },
];
