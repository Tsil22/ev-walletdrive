# EV WalletDrive

Εφαρμογή για ιδιοκτήτες ηλεκτρικών αυτοκινήτων: κόστος φόρτισης, ημερολόγιο φορτίσεων, πραγματική κατανάλωση, τιμές δικτύων, διαδρομές.

- **Εφαρμογή ιστού (και για iPhone):** https://tsil22.github.io/ev-walletdrive/ → στο Safari «Κοινοποίηση» → «Προσθήκη στην οθόνη Αφετηρίας».
- **Πολιτική απορρήτου:** https://tsil22.github.io/ev-walletdrive/privacy.html

## Φάκελοι

| Φάκελος / αρχείο | Τι είναι |
| --- | --- |
| `src/ev-voithos.html` | Η εφαρμογή (μία σελίδα, ίδια με την έκδοση στο claude.ai) |
| `shim.js` | Γέφυρα για εκτός claude.ai: τιμές από `market/*.json`, δεδομένα μόνο στη συσκευή, αποθήκευση αρχείων |
| `build.py` | Φτιάχνει το `docs/` από το `src/` |
| `docs/` | Η σελίδα GitHub Pages και το περιεχόμενο της εφαρμογής Android |
| `docs/market/` | Τιμές και καιρός, ανανεώνονται κάθε μέρα |
| `android/` | Η εφαρμογή Android (Capacitor) |

## Build

```sh
python3 build.py              # σελίδα GitHub Pages
python3 build.py --android    # για την εφαρμογή Android, μετά:
npm ci && npx cap sync android
cd android && ./gradlew bundleRelease   # θέλει keystore.properties + upload-keystore.jks (δεν είναι στο αποθετήριο)
```
