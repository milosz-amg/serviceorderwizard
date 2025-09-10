## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Mon Sep 01 2025 15:52:02 GMT+0200 (Central European Summer Time)|
|**App Generator**<br>SAP Fiori Application Generator|
|**App Generator Version**<br>1.18.6|
|**Generation Platform**<br>Visual Studio Code|
|**Template Used**<br>Basic|
|**Service Type**<br>None|
|**Service URL**<br>N/A|
|**Module Name**<br>serviceorderwizard|
|**Application Title**<br>Service Order Wizard|
|**Namespace**<br>com.mr|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.139.0|
|**Enable Code Assist Libraries**<br>False|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>False|

## serviceorderwizard

Aplikacja SAPUI5 do tworzenia zleceń serwisowych z wykorzystaniem kreatora (wizard).

### Starting the generated app

-   This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite.  To launch the generated application, run the following from the generated application root folder:

```
    npm start
```

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)


## TODO
✅✅✅✅✅✅✅✅
Walidacje:
* kod pocztowy z myślnikiem
* nr telefonu z myślnikami, spacjami
* poprawić wyświetlanie na ekranie podsumowania (spacje przy pustych adresach, przecinek hardcoded)
* miasto – tylko litery
* przycisk „Dalej” dostępny, gdy pola wymagane są uzupełnione; walidacja (np. czy numer telefonu ma poprawny format) po kliknięciu „Dalej”

Ekran Orders (tabelka):
* dodać filtrowanie, np. po statusie
* sortowanie od najnowszych
* dodać pole „Kiedy złożono zamówienie”
* „Więcej” ładniejsze – nie sztywny tekst
* dodać formater na zera wiodące w ID
* dodać edycję zamówienia już utworzonego
* oDatowy model zamiast JSON-owego

i18n:
* pozbyć się hardcoded stringów

Refactor front:
* formatery do formatera
* oData daje model *Device* i na podstawie tego pokazać typy (konsola → \[Xbox, PlayStation, …])
* uprościć formatowanie daty – przy wysyłaniu na backend
* po złożeniu zamówienia przekierowanie na *orders.view*, a nie na *home.view*

Refactor backend:
lepiej ubrać w try/catch → rzucać wyjątek np. po nieudanym insercie

Extra:
* czy `setProperty()` jest potrzebne, czy robi się automatycznie?
* czy czyszczenie modelu JSON można zrobić przez `unbind`?
* resource model z manifestu
* path pobierany z modeli zamiast hardcoded endpointa – spróbować na końcu




