# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)


public with sharing class INID_getPromotionController {
    public class PromotionWrapper {
    @AuraEnabled public List<PromotionWithBenefit> promotions { get; set; }
    }

    public class PromotionWithBenefit {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public List<INID_Sale_Promotion_Benefit_Product__c> benefits { get; set; }
    }

    @AuraEnabled(cacheable=true)
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