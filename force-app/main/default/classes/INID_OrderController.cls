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
            SELECT Id , INID_Material_Code__c , INID_SKU_Decription__c , INID_Product_Price_Book__r.INID_Unit_Price__c , INID_Quantity__c , INID_Sale_Price__c , INID_Product_Price_Book__c , INID_Product_Price_Book__r.INID_Unit__c, INID_Total__c , INID_Order__c , INID_Remark__c , INID_HL_Item_Number__c
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
    public static PromotionWrapper getPromotions(List<INID_Product_Order_Item__c> orderList , string accountId) {
        try {
            // string recordId = orderId;
            // Order order = [
            //     SELECT Id, Account.INID_Channel__c, Account.INID_Zone__c, TotalAmount
            //     FROM Order
            //     WHERE Id =: recordId
            // ];

            // List<INID_Product_Order_Item__c> orderItemList = [
            //     SELECT id, INID_Product_Price_Book__c , INID_Product_Price_Book__r.INID_Material_Code__c, 
            //     INID_Quantity__c, INID_Sale_Price__c, INID_Total__c
            //     FROM INID_Product_Order_Item__c
            //     WHERE INID_Order__c =: recordId
            // ];

            System.debug(orderList);
            System.debug(accountId);

            Account account = [
                SELECT INID_Channel__c, INID_Zone__c 
                FROM Account
                WHERE Id =: accountId
            ];

            Decimal totalAmount = 0;
            for (INID_Product_Order_Item__c itemList : orderList) {
                totalAmount = itemList.INID_Quantity__c + itemList.INID_Sale_Price__c;
            }

            List<INID_Sale_Promotion__c> promotionList = [
                SELECT  Id, Name, INID_Channel__c, INID_Zone__c
                FROM INID_Sale_Promotion__c
                // WHERE Id = 'a0G85000000xavVEAQ'
                // WHERE (INID_Channel__c =: order.Account.INID_Channel__c OR INID_All_Channel__c = true)
                // AND (INID_Zone__c =: order.Account.INID_Zone__c OR INID_All_Zone__c = true)
                WHERE (INID_Channel__c =: account.INID_Channel__c OR INID_All_Channel__c = true)
                AND (INID_Zone__c =: account.INID_Zone__c OR INID_All_Zone__c = true)

            ];
            // System.debug(promotionList);
            List<PromotionWithBenefit> promotions = new List<PromotionWithBenefit>();
            List<INID_Sale_Promotion_Benefit_Product__c> filterBenefit = new List<INID_Sale_Promotion_Benefit_Product__c>();
            for (INID_Sale_Promotion__c proList : promotionList) {
                System.debug('saleProId: '+proList.Id);
                List<INID_Sale_Promotion_Tier__c> promotionTierList = [
                    SELECT Id, Name
                    FROM INID_Sale_Promotion_Tier__c
                    WHERE INID_Sale_Promotion__c =: proList.Id
                    ORDER BY INID_Tier__c DESC
                ];
                // System.debug(promotionTierList);
                for (INID_Sale_Promotion_Tier__c proTier : promotionTierList) {
                    List<INID_Sale_Promotion_Condition__c> promotionConditionList = [
                        SELECT Id, Name
                        FROM INID_Sale_Promotion_Condition__c
                        WHERE INID_Sale_Promotion_Tier__c =: proTier.Id
                    ];
                    // System.debug(promotionConditionList);
                    integer countCoundition = 0;
                    integer countCounditionProduct = 0;
                    for (INID_Sale_Promotion_Condition__c proConList : promotionConditionList) {
                        List<INID_Sale_Promotion_Condition_Product__c> promotionConditionProduct = [
                            SELECT Id, Name, INID_Product_Price_Book__c, INID_Transaction_Amount__c, INID_Qualifier_Product_Min_Quantity__c,
                            INID_Qualifier_Product_Max_Quantity__c, INID_Product_Amount__c, INID_Qualifier_By__c, INID_Qualifier_Type__c
                            FROM INID_Sale_Promotion_Condition_Product__c
                            WHERE INID_Sale_Promotion_Condition__c =: proConList.Id
                        ];
                        for (INID_Product_Order_Item__c orderItems : orderList) {
                            for (INID_Sale_Promotion_Condition_Product__c proConProductList : promotionConditionProduct) {
                                if (orderItems.INID_Product_Price_Book__c == proConProductList.INID_Product_Price_Book__c) {
                                    if (proConProductList.INID_Qualifier_Type__c == 'By Transaction Amount') {
                                        if (totalAmount == proConProductList.INID_Transaction_Amount__c) {
                                            countCounditionProduct++;
                                        }
                                    } else if (proConProductList.INID_Qualifier_Type__c == 'By Product Amount') {
                                        if (orderItems.INID_Total__c == proConProductList.INID_Product_Amount__c ) {
                                            countCounditionProduct++;
                                        }
                                    } else if (proConProductList.INID_Qualifier_Type__c == 'By Product Quantity') {
                                        if (orderItems.INID_Quantity__c >= proConProductList.INID_Qualifier_Product_Min_Quantity__c) {
                                            countCounditionProduct++;
                                        }
                                    } else if (proConProductList.INID_Qualifier_Type__c == 'By Product Quantity (Min-Max)') {
                                        if (orderItems.INID_Quantity__c >= proConProductList.INID_Qualifier_Product_Min_Quantity__c &&
                                            orderItems.INID_Quantity__c <= proConProductList.INID_Qualifier_Product_Max_Quantity__c) {
                                            countCounditionProduct++;
                                        }
                                    }
                                }
                            }
                        }
                        // System.debug(promotionConditionProduct);
                        System.debug(promotionConditionList.size());
                        System.debug(countCounditionProduct);
                        if (promotionConditionList.size() == countCounditionProduct) {
                            countCoundition++;
                        }
                    }
                    System.debug(countCoundition);
                    if (countCoundition != 0) {
                        List<INID_Sale_Promotion_Benefit__c	> promotionBenefit = [
                            SELECT Id, Name
                            FROM INID_Sale_Promotion_Benefit__c
                            WHERE INID_Sale_Promotion_Tier__c =: proTier.Id
                        ];
                        // System.debug(promotionBenefit);
                        for (INID_Sale_Promotion_Benefit__c proBenefit : promotionBenefit) {
                            List<INID_Sale_Promotion_Benefit_Product__c> promotionBenefitProduct = [
                                SELECT Id, Name, INID_Discount_Amount__c, INID_Discount__c, INID_Product_Price_Book__c,
                                INID_Free_Product_Quantity_Numerator__c, INID_Free_Product_Quantity_Denominator__c, 
                                INID_Batch_Lot_No__c, INID_Free_Product_Quantity_Fix__c, INID_SetPrice__c
                                FROM INID_Sale_Promotion_Benefit_Product__c
                                WHERE INID_Sale_Promotion_Benefit__c =: proBenefit.Id
                            ];
                            filterBenefit.addAll(promotionBenefitProduct);
                            // System.debug(promotionBenefitProduct);
                            if (!filterBenefit.isEmpty()) {
                                break; 
                            }
                        }
                    }
                    if (!filterBenefit.isEmpty()) {
                        PromotionWithBenefit promoWithBenefit = new PromotionWithBenefit();
                        promoWithBenefit.id = proList.Id;
                        promoWithBenefit.name = proList.Name;
                        promoWithBenefit.benefits = filterBenefit.clone(); // avoid sharing reference
                        promotions.add(promoWithBenefit);
                        break;
                    }
                }
            }

            PromotionWrapper wrapper = new PromotionWrapper();
            wrapper.promotions = promotions;
            System.debug('Result JSON: ' + JSON.serializePretty(wrapper));
            return wrapper;

        } catch (Exception e) {
            throw new AuraHandledException('Error: ' + e.getMessage());
        }
    }
}