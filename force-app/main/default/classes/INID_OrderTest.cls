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
    public static List<Product2> fetchDataProducts() {
        return [
            SELECT Id , Name, ProductCode FROM Product2 LIMIT 20
            ];
    }

}



// SELECT Id , INID_Bill_To_Code__c , INID_Account__r.Name , INID_Account__r.Id , INID_Account__r.INID_Customer_Code__c , INID_Account__r.Payment_type__c , INID_Account__r.Payment_term__c FROM INID_Account_Address__c WHERE INID_Account__r.Name = 