// Geography prompts. Line syntax: "Display | alias | alias ~year @Wiki title;Alt title # memory tip =points"
const C = { wm: /country|state|kingdom|republic|island|nation|principality|city|territory/i, country: true };
export default [
{ id: "geo-africa", q: "A country in Africa", ...C, list: `
Nigeria
Egypt
South Africa
Kenya
Ethiopia
Morocco
Algeria
Ghana
Tanzania
Uganda
Sudan
Libya
Tunisia
Angola
Mozambique
Madagascar
Cameroon
Ivory Coast
Niger
Mali
Senegal
Zimbabwe
Zambia
Somalia
Rwanda
DR Congo
Republic of the Congo
Namibia
Botswana
Chad
Malawi
Burkina Faso
Guinea
Benin
Togo
Sierra Leone
Liberia
Eritrea
South Sudan
Central African Republic
Gabon
Mauritania
Burundi
Lesotho
Eswatini
Djibouti
Gambia
Guinea-Bissau
Equatorial Guinea
Mauritius
Cape Verde
Comoros
Seychelles
São Tomé and Príncipe` },
{ id: "geo-europe", q: "A country in Europe", note: "Transcontinental countries (Russia, Turkey, Georgia, Armenia, Azerbaijan, Kazakhstan, Cyprus) count.", ...C, list: `
France
Germany
Italy
Spain
United Kingdom
Portugal
Netherlands
Belgium
Switzerland
Austria
Poland
Greece
Sweden
Norway
Denmark
Finland
Ireland
Iceland
Russia
Ukraine
Czech Republic
Hungary
Romania
Bulgaria
Croatia
Serbia
Slovakia
Slovenia
Bosnia and Herzegovina
Montenegro
Albania
North Macedonia
Kosovo
Moldova
Belarus
Lithuania
Latvia
Estonia
Luxembourg
Monaco
Liechtenstein
Andorra
San Marino
Malta
Vatican City
Turkey
Cyprus
Georgia
Armenia
Azerbaijan
Kazakhstan` },
{ id: "geo-asia", q: "A country in Asia", note: "Transcontinental countries (Russia, Turkey, Georgia, Armenia, Azerbaijan, Kazakhstan, Cyprus) count; so do Taiwan and Palestine.", ...C, list: `
China
India
Japan
South Korea
North Korea
Indonesia
Pakistan
Bangladesh
Vietnam
Thailand
Philippines
Malaysia
Singapore
Iran
Iraq
Saudi Arabia
Israel
Turkey
Russia
Afghanistan
Nepal
Sri Lanka
Myanmar
Cambodia
Laos
Mongolia
Kazakhstan
Uzbekistan
Taiwan
Syria
Jordan
Lebanon
United Arab Emirates
Qatar
Kuwait
Oman
Yemen
Bahrain
Bhutan
Maldives
Brunei
East Timor
Kyrgyzstan
Tajikistan
Turkmenistan
Georgia
Armenia
Azerbaijan
Cyprus
Palestine` },
{ id: "geo-southamerica", q: "A country in South America", ...C, list: `
Brazil
Argentina
Chile
Peru
Colombia
Venezuela
Ecuador
Bolivia
Uruguay
Paraguay
Guyana
Suriname` },
{ id: "geo-centralamerica", q: "A country in Central America", ...C, list: `
Panama
Costa Rica
Guatemala
Honduras
Nicaragua
El Salvador
Belize` },
{ id: "geo-caribbean", q: "A sovereign island country in the Caribbean", ...C, list: `
Jamaica
Cuba
Haiti
Dominican Republic
Bahamas
Barbados
Trinidad and Tobago
Grenada
Saint Lucia
Antigua and Barbuda
Dominica
Saint Kitts and Nevis
Saint Vincent and the Grenadines` },
{ id: "geo-oceania", q: "A sovereign country in Oceania", ...C, list: `
Australia
New Zealand
Fiji
Papua New Guinea
Samoa
Tonga
Vanuatu
Solomon Islands
Kiribati
Micronesia
Marshall Islands
Palau
Tuvalu
Nauru` },
{ id: "geo-seasia", q: "A country in Southeast Asia", ...C, list: `
Thailand
Vietnam
Indonesia
Philippines
Malaysia
Singapore
Cambodia
Myanmar
Laos
Brunei
East Timor` },
{ id: "geo-eu", q: "A member state of the European Union", ...C, list: `
Austria
Belgium
Bulgaria
Croatia
Cyprus
Czech Republic
Denmark
Estonia
Finland
France
Germany
Greece
Hungary
Ireland
Italy
Latvia
Lithuania
Luxembourg
Malta
Netherlands
Poland
Portugal
Romania
Slovakia
Slovenia
Spain
Sweden` },
{ id: "geo-landlocked", q: "A landlocked country", ...C, list: `
Afghanistan
Andorra
Armenia
Austria
Azerbaijan
Belarus
Bhutan
Bolivia
Botswana
Burkina Faso
Burundi
Central African Republic
Chad
Czech Republic
Eswatini
Ethiopia
Hungary
Kazakhstan
Kosovo
Kyrgyzstan
Laos
Lesotho
Liechtenstein
Luxembourg
Malawi
Mali
Moldova
Mongolia
Nepal
Niger
North Macedonia
Paraguay
Rwanda
San Marino
Serbia
Slovakia
South Sudan
Switzerland
Tajikistan
Turkmenistan
Uganda
Uzbekistan
Vatican City
Zambia
Zimbabwe` },
{ id: "geo-border-germany", q: "A country that borders Germany", ...C, list: `
France
Poland
Austria
Switzerland
Netherlands
Belgium
Denmark
Czech Republic
Luxembourg` },
{ id: "geo-border-china", q: "A country that borders China", ...C, list: `
India
Russia
Mongolia
North Korea
Vietnam
Pakistan
Afghanistan
Nepal
Kazakhstan
Myanmar
Laos
Bhutan
Kyrgyzstan
Tajikistan` },
{ id: "geo-border-russia", q: "A country that borders Russia (by land)", ...C, list: `
China
Ukraine
Finland
Norway
Poland
Belarus
Kazakhstan
Mongolia
Estonia
Latvia
Lithuania
Georgia
Azerbaijan
North Korea` },
{ id: "geo-border-brazil", q: "A country that borders Brazil", note: "France counts, via French Guiana.", ...C, list: `
Argentina
Uruguay
Paraguay
Bolivia
Peru
Colombia
Venezuela
Guyana
Suriname
France # French Guiana, an overseas region of France, shares a 730 km border with Brazil` },
{ id: "geo-stan", q: "A country whose name ends in \"-stan\"", ...C, list: `
Pakistan
Afghanistan
Kazakhstan
Uzbekistan
Kyrgyzstan
Tajikistan
Turkmenistan` },
{ id: "geo-arabian", q: "A country on the Arabian Peninsula", ...C, list: `
Saudi Arabia
United Arab Emirates
Qatar
Oman
Yemen
Kuwait
Bahrain` },
{ id: "geo-nordic", q: "A Nordic country", ...C, list: `
Sweden
Norway
Denmark
Finland
Iceland` },
{ id: "geo-danube", q: "A country the Danube flows through", ...C, list: `
Germany
Austria
Hungary
Romania
Serbia
Slovakia
Bulgaria
Croatia
Ukraine
Moldova # The Danube touches Moldova for only about 600 metres, at Giurgiulești` },
{ id: "geo-equator", q: "A country the Equator passes through", note: "Includes countries where it crosses only territorial waters (Maldives, Kiribati) or a small islet (São Tomé).", ...C, list: `
Ecuador
Brazil
Colombia
Indonesia
Kenya
Uganda
DR Congo
Republic of the Congo
Gabon
Somalia
Maldives
Kiribati
São Tomé and Príncipe` },
{ id: "geo-us-states", q: "A US state", wm: /state/i, list: `
California
Texas
Florida
New York @New York (state)
Alaska
Hawaii
Washington @Washington (state)
Georgia @Georgia (U.S. state)
Arizona
Colorado
Nevada
Ohio
Michigan
Illinois
Pennsylvania
Massachusetts
New Jersey
Virginia
North Carolina
South Carolina
Tennessee
Kentucky
Louisiana
Alabama
Mississippi
Oregon
Utah
Idaho
Montana
Wyoming
North Dakota
South Dakota
Nebraska
Kansas
Oklahoma
New Mexico
Minnesota
Wisconsin
Iowa
Missouri
Arkansas
Indiana
West Virginia
Maryland
Delaware
Connecticut
Rhode Island
Vermont
New Hampshire
Maine` },
{ id: "geo-canada", q: "A Canadian province or territory", list: `
Ontario
Quebec
British Columbia
Alberta
Manitoba
Saskatchewan
Nova Scotia
New Brunswick
Newfoundland and Labrador | Newfoundland
Prince Edward Island | PEI
Yukon
Northwest Territories
Nunavut` },
{ id: "geo-mexico", q: "A Mexican state (or Mexico City)", list: `
Jalisco
Yucatán
Quintana Roo
Baja California
Baja California Sur
Chihuahua
Sonora
Oaxaca
Nuevo León
Veracruz
Chiapas
Guerrero
Puebla
Sinaloa
Mexico City | CDMX | Ciudad de Mexico
State of Mexico | Mexico State | Estado de Mexico @State of Mexico
Michoacán
Guanajuato
Tamaulipas
Coahuila
Durango
Zacatecas
Aguascalientes
San Luis Potosí
Querétaro
Hidalgo @Hidalgo (state)
Morelos
Tlaxcala
Tabasco
Campeche
Colima
Nayarit` },
{ id: "geo-australia", q: "An Australian state or mainland territory", list: `
New South Wales | NSW
Queensland
Victoria @Victoria (state)
Western Australia
South Australia
Tasmania
Northern Territory
Australian Capital Territory | ACT` },
{ id: "geo-europe-capitals", q: "The capital city of a European country", note: "Capitals of the transcontinental countries count too.", wm: /capital|city|town|country|state/i, list: `
Paris
London
Berlin
Rome
Madrid
Lisbon
Amsterdam
Brussels
Vienna
Bern
Athens
Dublin
Oslo
Stockholm
Copenhagen
Helsinki
Reykjavík
Warsaw
Prague
Budapest
Bucharest
Sofia
Belgrade
Zagreb
Ljubljana
Bratislava
Moscow
Kyiv | Kiev
Minsk
Vilnius
Riga
Tallinn
Chișinău
Tirana
Skopje
Podgorica
Sarajevo
Pristina
Valletta
Luxembourg City | Luxembourg
Monaco
Vaduz
Andorra la Vella
San Marino @San Marino (city)
Vatican City
Nicosia
Ankara
Tbilisi
Yerevan
Baku
Astana` },
{ id: "geo-sa-capitals", q: "The capital city of a South American country", note: "Bolivia has two: Sucre (constitutional) and La Paz (seat of government).", list: `
Buenos Aires
Brasília
Santiago
Lima
Bogotá
Caracas
Quito
Montevideo
La Paz
Asunción
Sucre
Georgetown @Georgetown, Guyana
Paramaribo` },
{ id: "geo-state-capitals", q: "A US state capital", list: `
Austin @Austin, Texas
Sacramento @Sacramento, California
Boston
Atlanta
Denver
Phoenix @Phoenix, Arizona
Honolulu
Nashville @Nashville, Tennessee
Salt Lake City
Indianapolis
Columbus @Columbus, Ohio
Oklahoma City
Tallahassee @Tallahassee, Florida
Albany @Albany, New York
Richmond @Richmond, Virginia
Raleigh @Raleigh, North Carolina
Baton Rouge @Baton Rouge, Louisiana
Little Rock @Little Rock, Arkansas
Santa Fe @Santa Fe, New Mexico
Juneau @Juneau, Alaska
Madison @Madison, Wisconsin
Providence @Providence, Rhode Island
Hartford @Hartford, Connecticut
Annapolis @Annapolis, Maryland
Harrisburg @Harrisburg, Pennsylvania
Trenton @Trenton, New Jersey
Springfield @Springfield, Illinois
Lansing @Lansing, Michigan
Saint Paul | St Paul @Saint Paul, Minnesota
Des Moines @Des Moines, Iowa
Jefferson City @Jefferson City, Missouri
Topeka @Topeka, Kansas
Lincoln @Lincoln, Nebraska
Bismarck @Bismarck, North Dakota
Pierre @Pierre, South Dakota
Cheyenne @Cheyenne, Wyoming
Helena @Helena, Montana
Boise @Boise, Idaho
Salem @Salem, Oregon
Olympia @Olympia, Washington
Carson City @Carson City, Nevada
Montgomery @Montgomery, Alabama
Jackson @Jackson, Mississippi
Columbia @Columbia, South Carolina
Frankfort @Frankfort, Kentucky
Charleston @Charleston, West Virginia
Dover @Dover, Delaware
Concord @Concord, New Hampshire
Montpelier @Montpelier, Vermont
Augusta @Augusta, Maine` },
{ id: "geo-border-canada", q: "A US state that borders Canada", note: "Ohio and Pennsylvania count through their water borders in Lake Erie.", list: `
Alaska
Washington @Washington (state)
Montana
Michigan
New York @New York (state)
Maine
Minnesota
North Dakota
Idaho
Vermont
New Hampshire
Ohio # Shares a water border with Ontario across Lake Erie
Pennsylvania # Its short Lake Erie shoreline gives it a water border with Ontario` },
{ id: "geo-great-lakes", q: "One of the Great Lakes", list: `
Lake Superior | Superior
Lake Michigan | Michigan
Lake Erie | Erie
Lake Ontario | Ontario
Lake Huron | Huron` },
{ id: "geo-oceans", q: "One of the world's five oceans", list: `
Pacific Ocean | Pacific
Atlantic Ocean | Atlantic
Indian Ocean | Indian
Arctic Ocean | Arctic
Southern Ocean | Southern | Antarctic Ocean` },
{ id: "geo-continents", q: "One of the seven continents", list: `
Asia
Africa
Europe
North America
South America
Australia | Oceania | Australasia @Australia (continent)
Antarctica` },
{ id: "geo-nyc", q: "A borough of New York City", list: `
Manhattan
Brooklyn
Queens
The Bronx | Bronx
Staten Island` },
];
