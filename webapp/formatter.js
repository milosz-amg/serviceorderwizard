sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Prosta metoda testowa
         * @public
         * @returns {string} "Hello World"
         */
        helloWorld: function () {
            return "Hello World";
        },

        /**
         * Formatuje datę z różnych formatów OData do formatu "DD.MM.YYYY"
         * @public
         * @param {Date|string} oDate - Data do sformatowania (może być Date object, string YYYYMMDD, /Date(...)/, ISO string)
         * @returns {string} Sformatowana data lub pusty string jeśli brak daty
         */
        formatDate: function (oDate) {
            if (!oDate) {
                return "";
            }

            // Jeśli to już jest obiekt Date
            if (oDate instanceof Date) {
                return oDate.toLocaleDateString("pl-PL");
            }

            // Jeśli to string
            if (typeof oDate === "string") {
                // OData format /Date(1234567890000)/
                if (oDate.indexOf("/Date(") === 0) {
                    var timestamp = parseInt(oDate.replace(/\/Date\((\d+)\)\//, "$1"));
                    var date = new Date(timestamp);
                    return date.toLocaleDateString("pl-PL");
                }
                
                // Format YYYYMMDD (8 znaków)
                if (oDate.length === 8 && /^\d{8}$/.test(oDate)) {
                    var year = oDate.substring(0, 4);
                    var month = oDate.substring(4, 6);
                    var day = oDate.substring(6, 8);
                    return day + "." + month + "." + year;
                }
                
                // ISO format (YYYY-MM-DD lub YYYY-MM-DDTHH:mm:ss)
                if (oDate.indexOf("-") > 0) {
                    var date = new Date(oDate);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString("pl-PL");
                    }
                }
                
                // Jeśli nic nie pasuje, zwróć oryginalny string
                return oDate;
            }

            return "";
        },

        /**
         * Formatuje datę z <Date> na YYYYMMDD (np. 20240615)
         * @public
         * @param {string} sDate - Data w formacie DD.MM.YYYY
         * @returns {string} Data w formacie YYYYMMDD lub pusty string jeśli brak daty
         */
        formatDateForBackend: function (sDate) {
            if (!sDate) {
                return "";
            }

            var aParts = sDate.split(".");
            if (aParts.length !== 3) {
                return sDate; // Zwraca oryginalną wartość jeśli format jest niepoprawny
            }

            var sDay = aParts[0].padStart(2, "0");
            var sMonth = aParts[1].padStart(2, "0");
            var sYear = aParts[2];

            return sYear + sMonth + sDay;
        },
        /**
         * Formatuje godzine z HH:MM do HHMM (np. 0830)
         * @public
         * @param {string} sTime - Godzina w formacie HH:MM
         * @returns {string} Godzina w formacie HHMM lub pusty string jeśli brak godziny
         */
        formatTimeForBackend: function (sTime) {
            if (!sTime) {
                return "";
            }

            var aParts = sTime.split(":");
            if (aParts.length !== 2) {
                return sTime; // Zwraca oryginalną wartość jeśli format jest niepoprawny
            }

            var sHours = aParts[0].padStart(2, "0");
            var sMinutes = aParts[1].padStart(2, "0");

            return sHours + sMinutes;
        },

        /**
         * Formatuje adres na podstawie dostępnych danych
         * @public
         * @param {string} sFirstLine - Pierwsza linia adresu
         * @param {string} sSecondLine - Druga linia adresu
         * @param {string} sZipCode - Kod pocztowy
         * @param {string} sCity - Miasto
         * @returns {string} Sformatowany adres
         */
        formatAddress: function (sFirstLine, sSecondLine, sZipCode, sCity) {
            var aAddressParts = [];
            
            // Sprawdź czy podano pierwszą linię adresu
            if (sFirstLine && sFirstLine.trim()) {
                aAddressParts.push(sFirstLine.trim());
            }
            
            // Sprawdź czy podano drugą linię adresu
            if (sSecondLine && sSecondLine.trim()) {
                aAddressParts.push(sSecondLine.trim());
            }
            
            // Zawsze dodaj kod pocztowy i miasto (jeśli dostępne)
            var sCityLine = "";
            if (sZipCode && sZipCode.trim()) {
                sCityLine = sZipCode.trim();
            }
            if (sCity && sCity.trim()) {
                if (sCityLine) {
                    sCityLine += " " + sCity.trim();
                } else {
                    sCityLine = sCity.trim();
                }
            }
            
            if (sCityLine) {
                aAddressParts.push(sCityLine);
            }
            
            // Połącz wszystkie części nową linią
            return aAddressParts.join(", ");
        },
        
        /**
         * Usuwa zera wiodące z ID zamówienia, aby było bardziej przyjazne dla użytkownika
         * @public
         * @param {string} sOrderId - ID zamówienia (np. "000123")
         * @returns {string} ID zamówienia bez zer wiodących (np. "123")
         */
        formatOrderId: function(sOrderId) {
            if (!sOrderId) {
                return "";
            }
            
            // Konwertuj na string (jeśli to konieczne) i usuń zera wiodące
            return String(sOrderId).replace(/^0+/, '');
        },
        
        /**
         * Formatuje godzinę z formatu HHMM na HH:MM
         * @public
         * @param {string} sTime - Godzina w formacie HHMM (np. "0830")
         * @returns {string} Godzina w formacie HH:MM (np. "08:30")
         */
        formatTime: function(sTime) {
            if (!sTime) {
                return "";
            }
            
            // Sprawdź czy to string i ma 4 znaki
            var timeStr = String(sTime);
            if (timeStr.length === 4) {
                var hours = timeStr.substring(0, 2);
                var minutes = timeStr.substring(2, 4);
                return hours + ":" + minutes;
            }
            
            // Jeśli format jest inny, zwróć oryginalną wartość
            return timeStr;
        },
        
        /**
         * Formatuje kod pocztowy dodając myślnik (np. "12345" -> "12-345")
         * @public
         * @param {string} sZipCode - Kod pocztowy (np. "12345")
         * @returns {string} Sformatowany kod pocztowy (np. "12-345")
         */
        formatZipCode: function(sZipCode) {
            if (!sZipCode) {
                return "";
            }
            
            // Sprawdź czy to string i ma 5 znaków
            var zipStr = String(sZipCode).trim();
            if (zipStr.length === 5 && /^\d{5}$/.test(zipStr)) {
                return zipStr.substring(0, 2) + "-" + zipStr.substring(2, 5);
            }
            
            // Jeśli kod już zawiera myślnik lub ma inny format, zwróć oryginalną wartość
            return zipStr;
        },
        
        /**
         * Formatuje techniczne nazwy pól na przyjazne dla użytkownika
         * @public
         * @param {string} sFieldName - Oryginalna, techniczna nazwa pola
         * @returns {string} Sformatowana, przyjazna dla użytkownika nazwa pola
         */
        formatFieldName: function (sFieldName) {
            var oFieldNameMap = {
                "OrderId": "ID",
                "Firstname": "Imię",
                "Lastname": "Nazwisko",
                "Phonenumber": "Numer telefonu",
                "Addressfirstline": "Adres linia 1",
                "Addresssecondline": "Adres linia 2",
                "Addresscity": "Miasto",
                "Addresszipcode": "Kod pocztowy",
                "Devicetype": "Typ urządzenia",
                "Devicemodel": "Model urządzenia",
                "Deviceserialnumber": "Numer seryjny urządzenia",
                "Faultdescription": "Opis usterki",
                "Visitdate": "Data wizyty",
                "Visittime": "Godzina wizyty",
                "Status": "Status zlecenia",
                "OrderCreationDate": "Data złożenia"
            };

            return oFieldNameMap[sFieldName] || sFieldName;
        }
    };

});
