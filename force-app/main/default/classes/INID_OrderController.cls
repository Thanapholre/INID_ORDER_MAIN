public with sharing class INID_OrderController {
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

    @AuraEnabled
    public static void insertOrderItem(List<INID_Product_Order_Item__c> orderList){
        insert orderList ;
    }

    @AuraEnabled(cacheable=true)
    public static Id getQuoteId(Id quoteId) {
        return quoteId ;
    }

        @AuraEnabled(cacheable=true)
    public static List<INID_Quote_Item__c> fetchQuoteItemById(Id quoteId) {
        return [
            SELECT INID_Material_Code__c , INID_SKU_Description__c , INID_Quantity__c , INID_Sale_Price__c , INID_Product_Price_Book__r.id, INID_Item_Number__c , INID_Product_Price_Book__r.INID_Unit__c , INID_Product_Price_Book__r.INID_Unit_Price__c , INID_Total__c 
            FROM INID_Quote_Item__c                                                                          
            WHERE INID_Quote__c = :quoteId 
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Id fetchAccountIdByQuote(Id quoteId) {
        Quote accountId = [SELECT AccountId FROM Quote WHERE Id = :quoteId LIMIT 1];
        return accountId.AccountId;
    }   

    @AuraEnabled(cacheable=true)
    public static List<INID_Product_Order_Item__c> fetchProductOrderItem(Id orderId) {
        return [
            SELECT Id , INID_Material_Code__c , INID_SKU_Decription__c , INID_Product_Price_Book__r.INID_Unit_Price__c , INID_Quantity__c , INID_Sale_Price__c , INID_Product_Price_Book__c , INID_Product_Price_Book__r.INID_Unit__c, INID_Total__c , INID_Order__c 
            FROM INID_Product_Order_Item__c                                                                          
            WHERE INID_Order__c = :orderId 
        ];
    }

    @AuraEnabled(cacheable=true)
    public static String getRecordId(Id orderId) {
        return orderId;
    }   

    @AuraEnabled
    public static void deleteProductItems(List<Id> productOrderItemId) {
        try {
            List<INID_Product_Order_Item__c> toDelete = [
                SELECT Id FROM INID_Product_Order_Item__c WHERE Id IN :productOrderItemId
            ];
            delete toDelete;
        } catch (Exception e) {
            throw new AuraHandledException('เกิดข้อผิดพลาดในการลบข้อมูล: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteQuoteItems(List<Id> quoteItemId) {
        try {
            List<INID_Quote_Item__c> toDeleteQuoteItem = [
                SELECT Id FROM INID_Quote_Item__c WHERE Id IN :quoteItemId
            ];
            delete toDeleteQuoteItem;
        } catch (Exception e) {
            throw new AuraHandledException('เกิดข้อผิดพลาดในการลบข้อมูล: ' + e.getMessage());
        }
    }
}
