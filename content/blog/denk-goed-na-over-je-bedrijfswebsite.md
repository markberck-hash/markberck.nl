Vandaag liggen veel websites plat door een probleem met PHP.
En geloof mij maar, dit gaat de komende tijd vaker voorkomen. Niet vanwege PHP
maar omdat AI heel snel kwetsbaarheden gaat vinden in server-side talen.

Ik zal niet ingaan in waarom PHP vandaag stuk is en een betoog gaan afsteken
waarom PHP sowieso geen goed idee is. Daar staat het web al vol mee (als deze
sites het nog doen). Met dit stuk wil ik je gaan laten nadenken of je deze
server-side-dynamica eigenlijk wel nodig hebt.

**Heb je de server-side dynamiek eigenlijk wel nodig?**

De meeste bedrijfswebsite bestaan uit een welkomspagina, wat nieuwsberichten, vacatures,
wellicht een blog en wat product- of bedrijfspagina’s. En een contactpagina. Eigenlijk
redelijk statische informatie die hoogstens 1 of 2 keer per dag worden geüpdatet.
Toch gebruiken de meeste websites een CMS die de voorkant (Front-end) dynamisch
genereert om de inhoud (content) te laten zien.

**En dat is eigenlijk in de meeste gevallen nergens voor nodig.**

Ik durf te stellen dat 80% van de bedrijfswebsites af kunnen zonder een
dynamische server-scripttaal en voldoende hebben aan html, css en wat
javascript. Je kan deze met de hand bouwen, laten genereren door een static
site generator (bijvoorbeeld Publii, Lektor, maar er zijn er velen) of tegenwoordig
zelfs met AI goed onderhouden (en daarna zelf publiceren)

Andere voordelen van een statische website, los van een aanvalsvector minder.
Hij laad sneller, wordt vaak kleiner (qua dataverbruik) en je hosting wordt
mogelijk goedkoper.

**Contactformulier?**

Het argument dat ik vaak hoor, ik heb een server-side taal nodig voor de afhandeling
van mijn contactformulier. Maar ik durf te stellen dat dat helemaal niet waar
is.

Je kan via javascript en wat api-calls gebruik maken van externe providers (MS
Forms, via MS Graph, of andere formuliertools). Maar hiermee introduceer je wel
een andere afhankelijkheid en verplaats je wellicht het probleem.

Je kan er ook voor kiezen om geen mailformulier toe te passen en simpelweg een
mailadres te delen. Doe je dat slim met wat javascript om de spammers te weren
(kan best eenvoudig) dan is daar weinig op tegen. Ja je bezoekers moeten in
plaats van een formulier te openen een mailtje tikken; maar als de meeste
organisaties dat doen, dan gaan gebruikers dat vanzelf wel doen. Het argument
dat mensen liever een formulier invullen dan een mailtje tikken verdwijnt dan
vanzelf.
