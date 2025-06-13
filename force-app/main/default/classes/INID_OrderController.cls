public with sharing class INID_OrderController {
    @AuraEnabled(cacheable=true)
    public static List<Account> fetchCustomers() {
        return [SELECT Id , INID_Customer_Code__c, Name , Payment_type__c , Payment_term__c FROM Account WHERE INID_Status__c = 'Activate' ];
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
            SELECT Id , INID_SKU_Description__c, INID_Unit_Price__c , INID_Material_Code__c , INID_Unit__c 
            FROM INID_Product_Price_Book__c
        ];
    }

    @AuraEnabled(cacheable=true)
        public static List<Quote> fetchDataQuotation() {
        return [
            SELECT Id, QuoteNumber, Name, AccountId, Account.Name, Account.INID_Customer_Code__c,
                Account.Payment_type__c, Account.Payment_term__c, Account.INID_Organization__c
            FROM Quote
            WHERE Status = 'Approved' AND Account.INID_Status__c = 'Activate'
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
            SELECT Id , INID_Material_Code__c , INID_SKU_Decription__c , INID_Product_Price_Book__r.INID_Unit_Price__c , 
            INID_Quantity__c , INID_Sale_Price__c , INID_Product_Price_Book__c , INID_Product_Price_Book__r.INID_Unit__c, 
            INID_Total__c , INID_Order__c , INID_Remark__c , INID_HL_Item_Number__c
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

    @AuraEnabled
    public static void replaceProductItems(Id orderId, List<INID_Product_Order_Item__c> products) {
        List<INID_Product_Order_Item__c> oldItems = [
            SELECT Id FROM INID_Product_Order_Item__c
            WHERE INID_Order__c = :orderId
        ];

        if (!oldItems.isEmpty()) {
            delete oldItems;
        }

        if (!products.isEmpty()) {
            insert products;
        }
    }

    @AuraEnabled
    public static void insertOrderSalePromotion(List<INID_Order_Sale_Promotion__c> orderSalePromotionList ) {
        insert orderSalePromotionList ;
        System.debug('orderSalePromotionList : ' + orderSalePromotionList) ;
    }

    @AuraEnabled(cacheable=true)
    public static Id getAccountId(Id orderId) {
        Order o = [SELECT AccountId FROM Order WHERE Id = :orderId];
        return o.AccountId;
    }


    @AuraEnabled 
    public static List<INID_Product_Price_Book__c> getProductPromotionByPID(Id productId) {
        return [SELECT INID_Material_Code__c ,  INID_SKU_Description__c	 FROM INID_Product_Price_Book__c];
    }


    // @AuraEnabled(cacheable=true)
    // public static List<INID_BU_to_Product__c> fetchBuProduct(Id buGroupId) {
    //     return [
    //         SELECT INID_Product_Price_Book__c
    //         FROM INID_BU_to_Product__c                                                                          
    //         WHERE INID_BU_Group__c = :buGroupId 
    //     ];
    // }

    // @AuraEnabled(cacheable=true)
    // public static String fetchBuGroupId(Id userId) {
    //     INID_User_Detail__c userDetail = [ SELECT INID_BU_Group__c FROM INID_User_Detail__c WHERE INID_User__c = :userId ];
    //     System.debug(userDetail.INID_BU_Group__c) ;
    //     return userDetail.INID_BU_Group__c; 
    // }

    @AuraEnabled
    public static List<INID_Order_Foc__c> insertOrderFocById(List<INID_Order_Foc__c> orderFocList) {
        try {
            insert orderFocList;
            return orderFocList;
        } catch (NullPointerException e) {
            throw new AuraHandledException('Null error: ' + e.getMessage());
        } catch (Exception e) {
            throw new AuraHandledException('Error inserting Order FOC records: ' + e.getMessage());
        }
    }



    // @AuraEnabled(cacheable=true)
    // public static String fetchOrderFocId(Id orderId) {
    //     INID_Order_Foc__c orderFocId = [SELECT Id FROM INID_Order_Foc__c WHERE INID_Original_Order__c = :orderId];
    //     return orderFocId.Id;
    // }

    @AuraEnabled(cacheable=true)
    public static Id fetchOrderFocId(Id orderId) {
        try {
            INID_Order_Foc__c foc = [SELECT Id FROM INID_Order_Foc__c WHERE INID_Original_Order__c = :orderId LIMIT 1];
            return foc?.Id;
        } catch (Exception e) {
            // Return null แทน throw error เพื่อให้ JS ฝั่ง client handle ได้
            return null;
        }
    }


    // @AuraEnabled
    // public static void insertOrderItemFoc( Id orderFocId , List<INID_Product_Order_Item_Foc__c> orderItemList){
    //     if(orderFocId == null) {
    //         insert orderItemList ;
    //     } else {
    //         List<INID_Product_Order_Item_Foc__c> oldItems = [
    //             SELECT Id FROM INID_Product_Order_Item_Foc__c
    //             WHERE INID_Order_Foc__c = :orderFocId
    //         ];

    //         delete oldItems;
    //         insert orderItemList;
    //     }
    // }

    @AuraEnabled
    public static void insertOrderItemFoc(Id orderFocId, List<INID_Product_Order_Item_Foc__c> orderItemList){
        if(orderFocId == null) {
            throw new AuraHandledException('Order FOC Id is required for inserting Order Item FOC.');
            // throw null;
        }

        // กำหนดค่า lookup ฟิลด์ INID_Order_Foc__c ให้กับทุกตัวใน orderItemList
        for(INID_Product_Order_Item_Foc__c item : orderItemList) {
            item.INID_Order_Foc__c = orderFocId;
        }

        List<INID_Product_Order_Item_Foc__c> oldItems = [
            SELECT Id FROM INID_Product_Order_Item_Foc__c
            WHERE INID_Order_Foc__c = :orderFocId
        ];

        if(!oldItems.isEmpty()) {
            delete oldItems;
        }

        insert orderItemList;
    }


    @AuraEnabled(cacheable=true)
    public static List<INID_Product_Order_Item_Foc__c> fetchProductOrderItemFoc(Id orderFocId) {
        return [
            SELECT INID_Product_Price_Book__r.INID_Material_Code__c , INID_Product_Price_Book__r.INID_SKU_Description__c , 
            INID_Product_Price_Book__r.INID_Unit_Price__c , INID_Quantity__c , INID_Sale_Price__c , 
            INID_Product_Price_Book__r.INID_Unit__c , INID_Product_Price_Book__r.Id , INID_Total__c ,INID_Remark__c
            FROM INID_Product_Order_Item_Foc__c 
            WHERE INID_Order_Foc__c = :orderFocId
        ];
    }

    @AuraEnabled
    public static void deleteFocFromOrder(Id orderFocId) {
        List<INID_Order_Foc__c> focItems = [SELECT Id FROM INID_Order_Foc__c  WHERE Id = :orderFocId];
        delete focItems;
    }

    @AuraEnabled(cacheable=true)
    public static List<Order> fetchOrderToOrderFoc(Id orderId) {
        return[
            SELECT AccountId , Status , EffectiveDate , Type , INID_PaymentType__c , 
            INID_PaymentTerm__c , INID_Bill_To_Code__c , INID_Ship_To_Code__c , 
            INID_PurchaseOrderNumber__c , INID_Organization__c , INID_NoteInternal__c , 
            INID_ExcVAT__c , INID_IncVAT__c , INID_NoteAgent__c , Account.Name
            FROM Order 
            WHERE Id = :orderId
        ] ;
    }

    @AuraEnabled(cacheable=true)
    public static List<INID_Add_on_Product_Price_Book__c> fetchAddonProductPriceBook(Id accountId) {
        return [
            SELECT INID_Product_Price_Book__c , INID_Product_Price_Book__r.INID_Material_Code__c , 
            INID_Product_Price_Book__r.INID_SKU_Description__c,  INID_Product_Price_Book__r.INID_Unit_Price__c, 
            INID_Product_Price_Book__r.INID_Unit__c,   INID_Main_Quantity__c , INID_Add_on_Quantity__c , INID_Remark__c 
            FROM INID_Add_on_Product_Price_Book__c WHERE INID_Account__c = :accountId
        ];
    }

    @AuraEnabled(cacheable=true)
    public static String fetchUserGroup(Id userId) {
        
        INID_User_Detail__c userGroup = [
            SELECT INID_Group__c FROM INID_User_Detail__c WHERE INID_User__c = :userId
        ] ;

        return userGroup.INID_Group__c;
    }
    

    @AuraEnabled(cacheable=true)
    public static List<INID_Group_Details__c> fetchBuGroupId(String userGroup) {
        return[
            SELECT INID_BU_Group__c FROM INID_Group_Details__c WHERE Group__c = :userGroup 
        ];
    }


    @AuraEnabled(cacheable=true)
    public static List<INID_BU_to_Product__c> fetchProductsByBuGroups(List<Id> buGroupIds)  {
        return [
            SELECT INID_Product_Price_Book__c 
            FROM INID_BU_to_Product__c 
            WHERE INID_BU_Group__c IN :buGroupIds
        ];
    }

}