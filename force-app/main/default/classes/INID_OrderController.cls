public with sharing class INID_OrderController {
    @AuraEnabled(cacheable=true)
    public static List<Account> fetchCustomers() {
        return [SELECT Id , INID_Customer_Code__c, Name , Payment_type__c , Payment_term__c FROM Account WHERE INID_New__c = 'Activate' ];
    }

    @AuraEnabled(cacheable=true)
    public static List<INID_Account_Address__c > fetchDataBillto(Id accountId) {
        // if (!Schema.sObjectType.Account.isAccessible()) {
        //     throw new System.SecurityException('You do not have access to Account records.');
        // }
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
            SELECT Id, QuoteNumber, Name, AccountId, Account.Name, Account.INID_Customer_Code__c,
                Account.Payment_type__c, Account.Payment_term__c, Account.INID_Organization__c
            FROM Quote
            WHERE Status = 'Approved' AND Account.INID_New__c = 'Activate'
        ];
    }

    @AuraEnabled
    public static Id insertOrder(Order order) {
        insert order ;
        return order.Id ;
    }


    @AuraEnabled
    public static void insertProductItem(List<INID_Product_Order_Item__c> products) {
        insert products;
    }

    // @AuraEnabled 
    // public static String fetchLastHLNumber() {
    //     List<INID_Product_Order_Item__c> item = [
    //         SELECT INID_HL_Item_Number__c 
    //         FROM INID_Product_Order_Item__c 
    //         WHERE INID_HL_Item_Number__c != null
    //     ];
    // }


    @AuraEnabled(cacheable=true)
    public static Integer fetchLastHLNumber() {
        try {
            INID_Product_Order_Item__c latestRecord = [
                SELECT INID_HL_Item_Number__c 
                FROM INID_Product_Order_Item__c 
                WHERE INID_HL_Item_Number__c != null
                ORDER BY INID_HL_Item_Number__c DESC 
                LIMIT 1
            ];

            return Integer.valueOf(latestRecord) ;
        } catch (Exception e) {
            // กรณีไม่มีข้อมูล หรือแปลงไม่สำเร็จ
            return 0;
        }
    }




    // public static List<Id> insertProductItemAndReturnIds(List<INID_Product_Order_Itemc> products) {
    //     insert products; // insert records
    //     List<Id> insertedIds = new List<Id>();
    //     for(INID_Product_Order_Itemc p : products) {
    //         insertedIds.add(p.Id);
    //     }
    //     return insertedIds; // return list ของ Id record ที่ถูก insert
    // }


    // @AuraEnabled(cacheable=true)
    // public static List<Account> fetchAccountByQuote() {
    //     return []
    // }


}
