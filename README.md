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


## TO DO ⏳
Walidacje:
* ✅ kod pocztowy z myślnikiem 
    - regex
* ✅ nr telefonu z myślnikami, spacjami 
    - regex
* ✅ miasto – tylko litery 
    - regex
* ✅ przycisk „Dalej” dostępny, gdy pola wymagane są uzupełnione; walidacja (np. czy numer telefonu ma poprawny format) po kliknięciu „Dalej” 
    - liveChange -> change (sprawdz po zakończeniu wpisywania)
     - sprawdzenie tylko statusu pól przy chęci przejscia dalej, zamiast całkowitej walidacji
* ✅ poprawić wyświetlanie na ekranie podsumowania (spacje przy pustych adresach, przecinek hardcoded)
    - dodano formatery do wyświetlania adresu na podsumowaniu

i18n:
* ⏳ pozbyć się hardcoded stringów
    - przeniesienie elementów tekstowych do i18n

Ekran Orders (tabelka):
* ✅ dodać formater na zera wiodące w ID
    - formatter
* ✅ dodać pole „Kiedy złożono zamówienie”
    - nowe pole w bazie ZMR_ORDERS
    - dodanie odpowiendiego property w oDacie
    - dodanie OrderCreationDate bezpośrednio do Payload
    - wyświetlanie OrderCreationDate w Orders.view (tabela)
* ✅ oDatowy model zamiast JSON-owego
* ✅ sortowanie od najnowszych
    - wysylanie zapytania z urlparameters i stosowanie ich w zapytaniu select na backenddzie
* dodać filtrowanie, np. po statusie
* ✅ „Więcej” ładniejsze – nie sztywny tekst


Refactor front:
* ✅ formatery do formatera
* ❌ oData daje model *Device* i na podstawie tego pokazać typy (konsola → \[Xbox, PlayStation, …])
* ✅ uprościć formatowanie daty – przy wysyłaniu na backend
    - data wywylana normalnie, dodane formatery do wyswietlania daty na podsumowaniu i w Orders.veiw
* ✅ po złożeniu zamówienia przekierowanie na *orders.view*, a nie na *home.view*
    - routing na inny view

Refactor backend:
* ✅ lepiej ubrać w try/catch → rzucać wyjątek np. po nieudanym insercie

Extra:
* czy `setProperty()` jest potrzebne, czy robi się automatycznie? 
    - chyba niekoniecznie, bylo przydatne przy live update, ale nie jest to konieczne
* ✅ czy czyszczenie modelu JSON można zrobić przez `unbind`?
    - niedokońca, model resetujemy i tworzymy nowy pusty jak on init, a ten stary jest unbindowany
* ❌ resource model z manifestu
* ❌ path pobierany z modeli zamiast hardcoded endpointa – spróbować na końcu


## Dodatkowe bugfixy TODO
* ❌ Edytuj -> podaj imie '3' -> można zatwierdzić (przycisk generuj wywołuje validacje wszyskiego)
* ✅ poprawić resetowanie wizarda
* ✅ device model nie przesyla sie do bazy danych
    - brakowało w payloadzie





