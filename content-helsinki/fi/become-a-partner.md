---
title: Tule kumppaniksi
translationKey: become-a-partner
is_dark: true
form:
- name: section_general
  input_type: title
  label: "Tuote / kokemus"
  required: true
- name: Has your company been a supplier or subcontractor to any shipyard?
  input_type: select
  label: "Onko yrityksenne ollut telakan toimittaja tai alihankkija?"
  options:
  - "Yes"
  - "No"
  required: true
- name: shipyard_details
  input_type: textarea
  label: "Mille telakoille ja minä vuonna?"
  description: "muodossa: Telakka - Vuosi"
  required: true
- name: Vessel segment
  input_type: multiselect
  label: "Alussegmentti"
  description: "Mille alustyypeille yrityksenne on tarjonnut palveluja"
  options:
  - "Yachts"
  - "Cruise ships"
  - "Icebreakers"
  - "Naval"
  - "Other"
  required: true
- name: Choose the best systems related to your offering.
  input_type: multiselect
  label: "Laivan järjestelmät"
  description: "Yhdistä tarjoamanne laivan järjestelmiin. Voit valita useita."
  options:
  - "TOWING AND ANCHOR HANDLING SYSTEMS"
  - "EMERGENCY RESPONSE SYSTEMS"
  - "CARGO TANK SYSTEMS"
  - "CARGO DECK AND SPECIAL DECK OUTFITTING"
  - "HULL, GENERAL"
  - "AFT SHIP"
  - "HULL MIDSHIP STRUCTURES"
  - "FORE SHIP"
  - "SUPERSTRUCTURES"
  - "SUBCONTRACTED HULL PARTS"
  - "HULL FITTINGS"
  - "PAINTING, CORROSION PROTECTION"
  - "CABIN SPACES"
  - "PUBLIC SPACES"
  - "CREW PUBLIC SPACES"
  - "SERVICE SPACES AND STORES"
  - "INSULATION, PANELLING AND DECK COVERING"
  - "ACCOMMODATION DOORS"
  - "WINDOWS, STAIRS, LIFTS AND FITTINGS"
  - "SPECIAL SYSTEMS"
  - "INVENTORIES"
  - "WATER SYSTEMS"
  - "SEWAGE AND DRAIN SYSTEMS"
  - "HEATING SYSTEMS"
  - "REFRIGERATING PLANTS"
  - "WASTE HANDLING SYSTEMS"
  - "VENTILATION AND AIR CONDITIONING IN ACCOMMODATION"
  - "FIRE PROTECTION AND EXTINGUISHING SYSTEMS"
  - "POWER PLANT ENGINES"
  - "POWER TRANSMISSION"
  - "SHAFTING AND PROPELLERS"
  - "FUEL OIL FEED SYSTEMS"
  - "LUBRICATING OIL SYSTEMS FOR MACHINERY"
  - "COOLING AND HEATING SYSTEMS FOR MACHINERY"
  - "STEAM AND HEAT GENERATION"
  - "COMPRESSED AIR AND LIQUID SYSTEMS"
  - "FILLING, TRANSFER AND PURIFICATION SYSTEMS FOR FUEL AND LUBRICATION OIL"
  - "PIPE SYSTEMS FOR SHIP'S PURPOSES"
  - "EXHAUST GAS SYSTEMS"
  - "WALKWAYS IN MACHINERY SPACES AND SERVICE SYSTEMS OF MACHINERY"
  - "ANCHORING AND MOORING SYSTEMS"
  - "STEERING SYSTEMS"
  - "FIN STABILIZER SYSTEMS"
  - "LIFE BOATS AND RESCUE EQUIPMENT"
  - "GENERAL EQUIPMENT"
  - "SPECIAL EQUIPMENT"
  - "WORKSHOPS AND STORES"
  - "ELECTRICITY GENERATION, TRANSFORMATION AND DISTRIBUTION"
  - "LIGHTING"
  - "MONITORING, CONTROL AND AUTOMATION"
  - "ALARM AND SAFETY SYSTEMS"
  - "NAVIGATION AND EXTERNAL COMMUNICATION"
  - "INTERNAL COMMUNICATION"
  - "CABLES, CABLE TRAYS AND PENETRATIONS"
  - "OTHER CONTROL SYSTEMS"
  required: true
- name: Type of offering
  input_type: multiselect
  label: "Tarjoaman tyyppi"
  options:
  - "Turnkey"
  - "Prefabricates"
  - "Materials"
  - "Materials installed"
  - "Design"
  - "Subcontracted labour"
  required: true
- name: main_product
  input_type: textarea
  label: "Päätuote tai -palvelu"
  description: "Mikä on päätarjoamanne telakalle"
  required: true
- name: section_contact
  input_type: title
  label: "Yhteyshenkilö"
  required: true
- name: name
  input_type: text
  label: "Yhteyshenkilö"
  required: true
- name: contact_role
  input_type: text
  label: "Rooli"
  required: true
- name: email
  input_type: email
  label: "Sähköpostiosoite"
  description: "email@osoite.nn"
  required: true
- name: tel
  input_type: tel
  label: "Puhelinnumero"
  description: "Lisää maatunnus (+358..)"
  required: true
- name: other_references
  input_type: textarea
  label: "Muut referenssit"
  description: "enintään 250 merkkiä"
  required: true
- name: section_company_details
  input_type: title
  label: "Yrityksen tiedot"
  required: true
- name: company_name
  input_type: text
  label: "Yrityksen nimi"
  required: true
- name: address
  input_type: text
  label: "Osoite"
  required: true
- name: country
  input_type: text
  label: "Maa"
  required: true
- name: company_id
  input_type: text
  label: "Y-tunnus"
  description: "Esimerkki suomalaisille yrityksille: 1234567-8"
  required: true
- name: homepage
  input_type: url
  label: "Yrityksen verkkosivut"
  required: true
- name: turnover
  input_type: select
  label: "Liikevaihto"
  options:
  - "< 500.000 EUR"
  - "500.000 - 4.000.000 EUR"
  - "> 4.000.000 - 10.000.000 EUR"
  - "> 10.000.000 EUR"
  required: true
- name: year_established
  input_type: number
  label: "Perustamisvuosi"
  required: true
- name: employees
  input_type: select
  label: "Henkilöstön määrä"
  options:
  - "1-30"
  - "31-80"
  - "81-150"
  - "151-500"
  - "501-"
  required: true
- name: Are you registered in the Reliable Partner report service?
  input_type: select
  label: "Onko yrityksenne Luotettava Kumppani -palvelussa?"
  description: "vastuugroup.fi"
  options:
  - "Yes"
  - "No. We submit to Helsinki Shipyard separate documents required by Finnish laws and/or the shipyard's Supplier Code of Conduct when necessary."
  required: true
- name: Do you already have a contact person at Helsinki Shipyard?
  input_type: text
  label: "Onko teillä jo yhteyshenkilö Helsinki Shipyardilla?"
  description: "Nimi ja/tai osasto"
  required: false
- name: additional_info
  input_type: textarea
  label: "Lisätiedot"
  description: "Tuote tai palvelu (esim. linkki esitteeseen tai luetteloon)"
  required: true
- name: captcha
  input_type: friendlycaptcha
  required: true
- name: privacy
  input_type: checkbox
  label: "Olen lukenut [tietosuojaselosteen](/fi/privacy-notice-dny-finlands-helsinki-shipyards-supplier-subcontractor-and-partner-register) ja hyväksyn sen."
  required: true
- name: submit
  input_type: submit
  label: "Lähetä hakemus"
  required: true
---
---.wide.dark.page

# Tule kumppaniksi

## Täytä alla oleva lomake hakeaksesi kumppaniksi

{{< form >}}
