# MarkBerck.nl statische website

Productie draait op Apache/Linux; lokaal wordt getest op IIS. Blogartikelen
worden via `fetch()` geladen, dus lokaal testen kan niet met `file://` — start
in plaats daarvan een eenvoudige lokale server in deze map, bijvoorbeeld
`npx serve` of `python -m http.server`.

Serverconfiguratie voor de `.md`-content en het doorsturen van routes
(`/blog`, `/cv`, ...) naar `index.html` staat in `.htaccess` (Apache, productie)
en `web.config` (IIS, lokale testomgeving). Beide bestanden mogen naast elkaar
bestaan; elke server negeert de configuratie van de ander.

## Structuur

- `index.html` — de pagina-secties (start, blog, projecten, cv, wie-is-mark, contact).
- `css/styles.css` — één stylesheet met het volledige, huidige ontwerp.
- `js/data.js` — structurele content: cv, projecten, contactgegevens en de bloglijst
  (titel, datum, samenvatting). Bevat bewust geen lange lopende tekst.
- `js/app.js` — de client-side router en het renderen van de content in de pagina.
- `content/blog/<slug>.md` — de volledige tekst van elk blogartikel, als gewone
  Markdown-alinea's. Een nieuw artikel toevoegen: nieuw `.md`-bestand hier neerzetten
  en het bijbehorende `{ slug, title, date, excerpt }`-object toevoegen aan de
  `blog`-lijst in `js/data.js`.
- `images/` — afbeeldingen, inclusief het lokaal gehoste `cavero-logo.png`.

## Blogopmaak

Blogartikelen ondersteunen een beperkte Markdown-opmaak: koppen (`#`), vet en
cursief, links, afbeeldingen, lijsten, citaten, inline code en codeblokken met
drie backticks. Gebruik voor afbeeldingen bij voorkeur een pad vanaf de site-root,
bijvoorbeeld `![Schermafbeelding](/images/voorbeeld.png)`.

~~~markdown
## Voorbeeld

Dit is **belangrijk** en dit is `inline code`.

![Voorbeeld](/images/voorbeeld.png)

```javascript
const antwoord = 42;
```
~~~

HTML wordt niet uitgevoerd en blijft als tekst veilig weergegeven.

## Code-principes

- Code moet leesbaar zijn voor mensen: normale regels, inspringing en duidelijke
  namen. Geen minificatie of eenregelige functies, ook niet bij toekomstige wijzigingen.
- Lange, lopende tekst (blogartikelen) hoort in aparte contentbestanden (`content/`),
  niet als string in JavaScript.
- Eén stylesheet, geen parallelle "oude" en "nieuwe" thema's naast elkaar.
