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

promotionData :[
  {
    "id": "a0h85000000zqCzAAI",
    "benefitType": "Free Product (Fix Quantity)",
    "promotionName": "TestProductBenefit",
    "promotionDescirption": "ซื้อ 1000 ขึ้นไปเเถม 10 ชิ้น",
    "columns": [
      {
        "label": "Material Code",
        "fieldName": "promotionMaterialCode",
        "hideDefaultActions": true
      },
      {
        "label": "SKU Description",
        "fieldName": "promotionDescription",
        "hideDefaultActions": true
      },
      {
        "label": "Unit",
        "fieldName": "unit",
        "hideDefaultActions": true
      },
      {
        "label": "Quantity",
        "fieldName": "freeProductQuantity",
        "hideDefaultActions": true
      }
    ],
    "data": [
      {
        "promotionMaterialCode": "10002",
        "promotionDescription": "Sample SKU Desc 2",
        "unit": "-",
        "freeProductQuantity": 10
      }
    ]
  },
  {
    "id": "a0h850000010MBFAA2",
    "benefitType": "Free Product (Ratio)",
    "promotionName": "Free Amount Test",
    "promotionDescirption": "ซื้อไปเถอะ",
    "columns": [
      {
        "label": "Material Code",
        "fieldName": "promotionMaterialCode",
        "hideDefaultActions": true
      },
      {
        "label": "SKU Description",
        "fieldName": "promotionDescription",
        "hideDefaultActions": true
      },
      {
        "label": "Unit",
        "fieldName": "unit",
        "hideDefaultActions": true
      },
      {
        "label": "Numerator",
        "fieldName": "numerator",
        "hideDefaultActions": true
      },
      {
        "label": "Quantity",
        "fieldName": "freeProductQuantity",
        "hideDefaultActions": true
      }
    ],
    "data": [
      {
        "promotionMaterialCode": "100020",
        "promotionDescription": "Sample SKU Desc 20",
        "unit": "Box",
        "numerator": 20,
        "denomiator": 5
      }
    ]
  },
  {
    "id": "a0h85000000zqCzAAI",
    "benefitType": "Free Product (Fix Quantity)",
    "promotionName": "TestProductBenefit",
    "promotionDescirption": "ซื้อ 1000 ขึ้นไปเเถม 10 ชิ้น",
    "columns": [
      {
        "label": "Material Code",
        "fieldName": "promotionMaterialCode",
        "hideDefaultActions": true
      },
      {
        "label": "SKU Description",
        "fieldName": "promotionDescription",
        "hideDefaultActions": true
      },
      {
        "label": "Unit",
        "fieldName": "unit",
        "hideDefaultActions": true
      },
      {
        "label": "Quantity",
        "fieldName": "freeProductQuantity",
        "hideDefaultActions": true
      }
    ],
    "data": [
      {
        "promotionMaterialCode": "10002",
        "promotionDescription": "Sample SKU Desc 2",
        "unit": "-",
        "freeProductQuantity": 10
      }
    ]
  },
  {
    "id": "a0h850000010MBFAA2",
    "benefitType": "Free Product (Ratio)",
    "promotionName": "Free Amount Test",
    "promotionDescirption": "ซื้อไปเถอะ",
    "columns": [
      {
        "label": "Material Code",
        "fieldName": "promotionMaterialCode",
        "hideDefaultActions": true
      },
      {
        "label": "SKU Description",
        "fieldName": "promotionDescription",
        "hideDefaultActions": true
      },
      {
        "label": "Unit",
        "fieldName": "unit",
        "hideDefaultActions": true
      },
      {
        "label": "Numerator",
        "fieldName": "numerator",
        "hideDefaultActions": true
      },
      {
        "label": "Quantity",
        "fieldName": "freeProductQuantity",
        "hideDefaultActions": true
      }
    ],
    "data": [
      {
        "promotionMaterialCode": "100020",
        "promotionDescription": "Sample SKU Desc 20",
        "unit": "Box",
        "numerator": 20,
        "denomiator": 5
      }
    ]
  }
]








🎯 สรุป promotionData: [
  {
    "id": "a0G85000000xw1aEAA",
    "promotionName": "TestProductBenefit",
    "promotionDescirption": "ซื้อ 1000 ขึ้นไปเเถม 10 ชิ้น",
    "benefits": [
      {
        "id": "a0h85000000zqCzAAI",
        "columns": [
          {
            "label": "Material Code",
            "fieldName": "promotionMaterialCode",
            "hideDefaultActions": true
          },
          {
            "label": "SKU Description",
            "fieldName": "promotionDescription",
            "hideDefaultActions": true
          },
          {
            "label": "Unit",
            "fieldName": "unit",
            "hideDefaultActions": true
          },
          {
            "label": "Quantity",
            "fieldName": "freeProductQuantity",
            "hideDefaultActions": true
          }
        ],
        "data": [
          {
            "promotionMaterialCode": "10002",
            "promotionDescription": "Sample SKU Desc 2",
            "unit": "-",
            "freeProductQuantity": 10
          }
        ]
      }
    ]
  },
  {
    "id": "a0G85000000y7BVEAY",
    "promotionName": "Free Amount Test",
    "promotionDescirption": "ซื้อไปเถอะ",
    "benefits": [
      {
        "id": "a0h850000010MBFAA2",
        "columns": [
          {
            "label": "Material Code",
            "fieldName": "promotionMaterialCode",
            "hideDefaultActions": true
          },
          {
            "label": "SKU Description",
            "fieldName": "promotionDescription",
            "hideDefaultActions": true
          },
          {
            "label": "Unit",
            "fieldName": "unit",
            "hideDefaultActions": true
          },
          {
            "label": "Numerator",
            "fieldName": "numerator",
            "hideDefaultActions": true
          },
          {
            "label": "Quantity",
            "fieldName": "freeProductQuantity",
            "hideDefaultActions": true
          }
        ],
        "data": [
          {
            "promotionMaterialCode": "100020",
            "promotionDescription": "Sample SKU Desc 20",
            "unit": "Box",
            "numerator": 20,
            "denomiator": 5
          }
        ]
      }
    ]
  }
]