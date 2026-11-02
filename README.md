# Vegan

Kertoo yhdellä silmäyksellä, onko tuote vegaaninen, ja muuntaa reseptin vegaaniseksi yhdellä napautuksella.

**Sovellus:** https://alicesaarinen.github.io/Vegan/

## Asennus iPhoneen
1. Avaa osoite Safarissa.
2. Napauta Jaa-painiketta ja valitse **Lisää Koti-valikkoon**.

## Toiminnot
- **Ainesosat** – tulos heti tekstistä tai pakkauksen kuvasta (Vegaaninen / Ei vegaaninen / Epävarma + todennäköisyys).
- **Skannaa** – viivakoodi suoraan kamerakuvasta (EAN-13, EAN-8, UPC-A, UPC-E). Tuotetiedot haetaan Open Food Factsista, vegaanisuus arvioidaan aina sovelluksen omalla tietokannalla. Puuttuva ainesosaluettelo kuvataan ja tallennetaan laitteelle viivakoodin kanssa.
- **Resepti** – sääntöpohjainen muunnos: ainesosan rooli päätellään reseptistä, määrät skaalautuvat annosten mukaan ja ohjeet päivittyvät.

## Kielet
Suomi, ruotsi ja englanti. Sovellus tunnistaa ainesosaluettelon tai reseptin kielen ja käyttää sen kielen sanastoa, jotta samannäköiset sanat eivät sekoitu (esim. ruotsin *kola* = kinuski, suomen *kola* = virvoitusjuoma). Ruotsinkieliset reseptit muunnetaan ruotsiksi.

## Tietokanta
- Oma ydintietokanta (ensisijainen): eläinperäiset ja epävarmat ainesosat todennäköisyyksineen sekä reseptien korvaussäännöt.
- `off-taxonomy.json`: Open Food Factsin ainesosa- ja lisäainetaksonomia (yli 13 000 suomen- ja englanninkielistä sekä 3 600 ruotsinkielistä termiä, vegaanisuus periytettynä yläkäsitteiltä). Lisenssi ODbL 1.0.
- Rakennesäännöt mineraalisuoloille, vitamiinien muodoille, aminohapoille ja yhdyssanoille sekä sumea haku kirjoitus- ja tunnistusvirheille.

Tuotetiedot: [Open Food Facts](https://world.openfoodfacts.org) (ODbL).
