public with sharing class INID_OrderTest {
    @AuraEnabled(cacheable=true)
    public static List<Account> fetchCustomers() {
        return [SELECT Id , INID_Customer_Code__c, Name , Payment_type__c , Payment_term__c FROM Account WHERE INID_New__c = 'Activate' ];
    }

    @AuraEnabled(cacheable=true)
    public static List<INID_Account_Address__c > fetchDataBillto(Id accountId) {
        return [SELECT Id , Name , INID_Account__r.Id
            FROM INID_Account_Address__c  
            WHERE INID_Address_Type__c = 'bill to' AND  INID_Account__r.Id = :accountId];
    }

    @AuraEnabled(cacheable=true)
    public static List<INID_Account_Address__c > fetchDataShipto(Id accountId) {
        return [SELECT Id , Name ,INID_Account__r.Id
            FROM INID_Account_Address__c  
            WHERE INID_Address_Type__c = 'ship to' AND  INID_Account__r.Id = :accountId
            ];
    }

    @AuraEnabled(cacheable=true)
    public static List<INID_Product_Price_Book__c> fetchDataProductPriceBook() {
        return [
            SELECT Id , INID_Quantity__C, INID_SKU_Description__c, INID_Unit_Price__c , INID_Material_Code__c , INID_Unit__c
            FROM INID_Product_Price_Book__c LIMIT 20
            ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Quote> fetchDataQuotation() {
        return [
            SELECT Id , QuoteNumber, Name FROM Quote WHERE Status = 'Approved'
        ];
    }


}
