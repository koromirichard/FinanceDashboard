Pénzügyi Vezérlőpult és Vagyonkezelő

Egy teljes körű (full-stack), konténerizált webalkalmazás a személyes pénzügyek nyomon követésére, többdevizás számlák kezelésére és valós idejű árfolyamokkal dolgozó belső átutalásokra.



Főbb funkciók Többdevizás portfóliókezelés: Egyenlegek nyilvántartása hagyományos (HUF, EUR, USD) és kriptovalutákban (BTC, ETH), a devizákhoz igazodó, precíz kerekítési és formázási szabályokkal.

Intelligens belső utalások: Zökkenőmentes vagyonmozgatás a különböző devizájú számlák között. A rendszer a belső utalásoknál automatikusan lekéri az aktuális középárfolyamokat a Coinbase API segítségével.

ACID Adatbázis-tranzakciók: A backend utalási logikája szigorú, ACID-kompatibilis tranzakciókkal van védve. A forrás levonása, a valutaátváltás, a célösszeg jóváírása és az opcionális banki költségek kezelése egyetlen hibatűrő blokkban történik.

Interaktív Vezérlőpult: Vizuális vagyoneloszlás és kiadás-kategorizálás a Recharts diagramkönyvtár segítségével.

Moduláris Kliens Architektúra: A frontend letisztult komponens mintára épül, szétválasztva az üzleti logikát és a vizuális elemeket a maximális teljesítmény és karbantarthatóság érdekében.

Alkalmazott Technológiák Frontend: React, TypeScript, Tailwind CSS, React Router, Recharts

Backend: .NET 10 (C#), ASP.NET Core Web API, Entity Framework Core

Adatbázis: Microsoft SQL Server

Infrastruktúra: Docker, Docker Compose (Biztonságos HTTPS/SSL kommunikáció Kestrel szerverrel)

Lokális Futtatás (Gyorsindítás) Az alkalmazás teljes környezete (adatbázis, backend, frontend) egyetlen paranccsal elindítható a Docker segítségével.

Az alkalmazás elindításához használd docker-compose up -d --build parancsot a fő mappában

Érd el az alkalmazást:

https://localhost:5173

