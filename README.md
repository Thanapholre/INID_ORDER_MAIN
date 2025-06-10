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



combo group : [
  {
    "promotionId": "a0G85000000y7BVEAY",
    "promotionName": "Free Amount Test",
    "promotionDescript": "ซื้อไปเถอะ",
    "isSelected": false,
    "arrowSymbol": "fa-solid fa-circle-chevron-down",
    "className": "promotion-box",
    "groupedBenefits": [
      {
        "conditionType": "AND",
        "benefits": [
          {
            "Id": "a0h850000010SuzAAE",
            "Name": "SPBP-0280",
            "INID_Product_Price_Book__c": "a078500000KrqwPAAR",
            "INID_Free_Product_Quantity_Numerator__c": 20,
            "INID_Free_Product_Quantity_Denominator__c": 5,
            "INID_Benefit_Type__c": "Free Product (Ratio)",
            "INID_Sale_Promotion_Benefit__c": "a0H85000000FoFpEAK",
            "INID_Product_Price_Book__r": {
              "INID_Material_Code__c": "100020",
              "INID_SKU_Description__c": "Sample SKU Desc 20",
              "INID_Unit__c": "Box",
              "Id": "a078500000KrqwPAAR"
            },
            "INID_Sale_Promotion_Benefit__r": {
              "INID_Condition_Type__c": "AND",
              "Id": "a0H85000000FoFpEAK"
            },
            "id": "a0h850000010SuzAAE",
            "BenefitProduct": "a078500000KrqwPAAR",
            "selected": false,
            "className": "benefit-box"
          },
          {
            "Id": "a0h850000010Sv2AAE",
            "Name": "SPBP-0283",
            "INID_Product_Price_Book__c": "a078500000KTOHeAAP",
            "INID_Free_Product_Quantity_Fix__c": 30,
            "INID_Benefit_Type__c": "Free Product (Fix Quantity)",
            "INID_Sale_Promotion_Benefit__c": "a0H85000000FoFsEAK",
            "INID_Product_Price_Book__r": {
              "INID_Material_Code__c": "10002",
              "INID_SKU_Description__c": "Sample SKU Desc 2",
              "Id": "a078500000KTOHeAAP"
            },
            "INID_Sale_Promotion_Benefit__r": {
              "INID_Condition_Type__c": "AND",
              "Id": "a0H85000000FoFsEAK"
            },
            "id": "a0h850000010Sv2AAE",
            "BenefitProduct": "a078500000KTOHeAAP",
            "selected": false,
            "className": "benefit-box"
          }
        ]
      },
      {
        "conditionType": "OR",
        "benefits": [
          {
            "Id": "a0h850000010Sv0AAE",
            "Name": "SPBP-0281",
            "INID_Product_Price_Book__c": "a078500000KTOHdAAP",
            "INID_SetPrice__c": 300,
            "INID_Benefit_Type__c": "Set Price",
            "INID_Sale_Promotion_Benefit__c": "a0H85000000FoFqEAK",
            "INID_Product_Price_Book__r": {
              "INID_Material_Code__c": "10001",
              "INID_SKU_Description__c": "Sample SKU Desc 1",
              "INID_Unit__c": "Box",
              "Id": "a078500000KTOHdAAP"
            },
            "INID_Sale_Promotion_Benefit__r": {
              "INID_Condition_Type__c": "OR",
              "Id": "a0H85000000FoFqEAK"
            },
            "id": "a0h850000010Sv0AAE",
            "BenefitProduct": "a078500000KTOHdAAP",
            "selected": false,
            "className": "benefit-box"
          },
          {
            "Id": "a0h850000010Sv1AAE",
            "Name": "SPBP-0282",
            "INID_Product_Price_Book__c": "a078500000KTOHiAAP",
            "INID_SetPrice__c": 30,
            "INID_Benefit_Type__c": "Set Price",
            "INID_Sale_Promotion_Benefit__c": "a0H85000000FoFrEAK",
            "INID_Product_Price_Book__r": {
              "INID_Material_Code__c": "10006",
              "INID_SKU_Description__c": "Sample SKU Desc 6",
              "Id": "a078500000KTOHiAAP"
            },
            "INID_Sale_Promotion_Benefit__r": {
              "INID_Condition_Type__c": "OR",
              "Id": "a0H85000000FoFrEAK"
            },
            "id": "a0h850000010Sv1AAE",
            "BenefitProduct": "a078500000KTOHiAAP",
            "selected": false,
            "className": "benefit-box"
          }
        ]
      }
    ]
  }
]


