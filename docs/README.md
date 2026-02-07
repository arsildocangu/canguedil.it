# Cangu Edil - Sito Web Aziendale

![Cangu Edil Logo](logo.png)

Repository ufficiale del sito web di Cangu Edil, azienda specializzata in costruzioni, ristrutturazioni e lavori di edilizia dal 2001.

## 📋 Descrizione

Questo repository contiene il codice sorgente del sito web di Cangu Edil, un'impresa edile familiare operante dal 2001. Il sito è sviluppato con HTML, CSS e JavaScript puro, senza dipendenze da framework esterni.

## 🚀 Funzionalità

- Design responsive ottimizzato per tutti i dispositivi
- Showcase dei servizi offerti dall'azienda
- Galleria dei progetti realizzati
- Informazioni di contatto e ubicazione
- Integrazione con Google Maps e Instagram
- Animazioni e transizioni fluide

## 🛠️ Tecnologie Utilizzate

- HTML5
- CSS3 (con animazioni e transizioni)
- JavaScript vanilla
- Font Awesome per le icone
- Google Material Icons
- Google Fonts

## 📄 Struttura del Sito

- **Home**: Presentazione dell'azienda con hero section
- **Chi Siamo**: Storia e valori dell'azienda
- **Servizi**: Dettaglio dei servizi offerti
- **Galleria**: Showcase dei progetti realizzati
- **Contatti**: Informazioni per contattare l'azienda

## 🔧 Installazione Locale

Per eseguire il sito localmente:

1. Clona il repository
   ```bash
   git clone https://github.com/tuousername/canguedil.git
   ```
2. Naviga nella directory del progetto
   ```bash
   cd canguedil
   ```
3. Apri il file `index.html` nel tuo browser preferito

### Server Locale (Consigliato)

Per evitare problemi di cache e comportamenti diversi tra browser, puoi avviare un server statico locale.

Foreground (si ferma con Ctrl+C):
```bash
./scripts/serve.sh
```

Background (resta acceso anche chiudendo il terminale):
```bash
./scripts/serve-bg.sh
```

Stop background:
```bash
./scripts/stop-serve.sh
```

Apri poi `http://127.0.0.1:4173` (o `http://localhost:4173`).

Se non risponde:
```bash
./scripts/stop-serve.sh
./scripts/serve.sh
```

Oppure cambia porta:
```bash
./scripts/serve.sh 8080
```

## 🌐 Deployment

Il sito è attualmente ospitato su GitHub Pages ed è accessibile all'indirizzo:
[www.canguedil.it](https://www.canguedil.it)

## 🔄 Aggiornamenti e Manutenzione

Per aggiornare il sito:

1. Modifica i file necessari
2. Effettua il commit delle modifiche
   ```bash
   git add .
   git commit -m "Descrizione delle modifiche apportate"
   ```
3. Carica le modifiche su GitHub
   ```bash
   git push origin main
   ```

GitHub Pages aggiornerà automaticamente il sito in pochi minuti.

## 📝 Licenza

© 2025 Cangu Edil - Tutti i diritti riservati.

---

Realizzato con ❤️ per Cangu Edil
