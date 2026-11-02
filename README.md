# Vegan

Kertoo yhdellä silmäyksellä, onko tuote vegaaninen, ja muuntaa reseptin vegaaniseksi yhdellä napautuksella.

**Sovellus:** https://alicesaarinen.github.io/Vegan/

## Asennus iPhoneen
1. Avaa osoite Safarissa.
2. Napauta Jaa-painiketta ja valitse **Lisää Koti-valikkoon**.

## Luotettavuusperiaate
Vihreä **Vegaaninen** näytetään vain, kun jokainen ainesosa on tietokannassa todettu vegaaniseksi. Tuntematon, epäselvästi luettu tai vain osittain tunnistettu ainesosa antaa aina tuloksen **Epävarma**.

Ainesosaluettelosta ei voi nähdä valmistuksen apuaineita (esim. viinin kirkastus), eläinkokeita eikä kaikkien lähtöaineiden alkuperää, joten tulos kertoo luettelon perusteella tehtävän arvion.

## Toiminnot
- **Ainesosat** – tulos heti tekstistä tai pakkauksen kuvasta (Vegaaninen / Ei vegaaninen / Epävarma + todennäköisyys).
- **Ruoka, kosmetiikka, hygienia, pesuaineet, maalit, liimat, vaatteet ja materiaalit** – tuoteryhmä tunnistetaan luettelosta.
- **Skannaa** – viivakoodi suoraan kamerakuvasta (EAN-13, EAN-8, UPC-A, UPC-E). Tuotetiedot haetaan Open Food, Beauty, Products ja Pet Food Factsista, vegaanisuus arvioidaan aina sovelluksen omalla tietokannalla. Puuttuva ainesosaluettelo kuvataan ja tallennetaan laitteelle viivakoodin kanssa.
- **Resepti** – sääntöpohjainen muunnos: ainesosan rooli päätellään reseptistä, määrät skaalautuvat annosten mukaan ja ohjeet päivittyvät.

## Tekstintunnistus
- Kuvan laatu tarkistetaan ensin (epätarkkuus, heijastukset, pieni teksti).
- Teksti luetaan 2–3 kierroksella eri kuvankäsittelyillä; kierrokset äänestävät sanoista.
- Tunnistettu teksti korjataan sanakirjaan tunnistukselle tyypillisillä sekaannuksilla (rn↔m, l↔1, 0↔o, ä↔a …) ja E-koodit korjataan (E47l → E471).
- Jos korjaus ei ole yksiselitteinen ja vaihtoehdot johtaisivat eri tulokseen, sana korostetaan ja vahvistetaan napautuksella. Vihreää tulosta ei näytetä ennen vahvistusta.
- iPhonen oma tekstintunnistus: tekstikentän *Skannaa teksti* -toiminto tai pikakomento, joka avaa osoitteen `…/Vegan/?t=<teksti>`. Molemmat kulkevat saman korjauksen läpi.

## Kielet
Suomi, ruotsi ja englanti. Sovellus tunnistaa ainesosaluettelon tai reseptin kielen ja käyttää sen kielen sanastoa, jotta samannäköiset sanat eivät sekoitu (esim. ruotsin *kola* = kinuski, suomen *kola* = virvoitusjuoma). Ruotsinkieliset reseptit muunnetaan ruotsiksi.

## Tietokanta
- Eläinten ja eläinperäisten osien sanajuuret (suomi, ruotsi, englanti, latina): myös uudet ja harvinaiset nimet tunnistetaan, harhaanjohtavat sanat (munakoiso, kaakaovoi, puuvilla…) on kirjattu poikkeuksiksi.
- `inci.json`: noin 23 000 kosmetiikan INCI-nimeä (EU CosIng / Open Beauty Facts, ODbL), luokiteltu sovelluksen omilla säännöillä (`tools/build-inci.js`).
- Oma ydintietokanta (ensisijainen): eläinperäiset ja epävarmat ainesosat todennäköisyyksineen sekä reseptien korvaussäännöt.
- `off-taxonomy.json`: Open Food Factsin ainesosa- ja lisäainetaksonomia (yli 13 000 suomen- ja englanninkielistä sekä 3 600 ruotsinkielistä termiä, vegaanisuus periytettynä yläkäsitteiltä). Lisenssi ODbL 1.0.
- Rakennesäännöt mineraalisuoloille, vitamiinien muodoille, aminohapoille ja yhdyssanoille sekä sumea haku kirjoitus- ja tunnistusvirheille.

Tuotetiedot: [Open Food Facts](https://world.openfoodfacts.org) (ODbL).

## Testit
`node tests/run.js` ajaa regressiotestit: käsin kirjoitetut tapaukset (`tests/cases.txt`), reseptit (`tests/recipes.txt`) sekä koko tietokannan läpikäynnin, jossa jokainen eläinperäinen nimi testataan sellaisenaan, taivutettuna, etuliitteen kanssa ja kirjoitusvirheellä. Yksikään ei saa antaa vihreää tulosta.
