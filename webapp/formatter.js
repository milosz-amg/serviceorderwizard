// TODO: formatery w formaterze :)
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
         * Formatuje datę z <Date> do formatu "DD.MM.YYYY"
         * @public
         * @param {Date|string} oDate - Data do sformatowania
         * @returns {string} Sformatowana data lub pusty string jeśli brak daty
         */
        formatDate: function (oDate) {
            if (!oDate) {
                return "";
            }

            if (typeof oDate === "string") {
                return oDate;
            }

            return oDate.toLocaleDateString();
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
        }
    };

});
