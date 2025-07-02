import { LightningElement, track, wire , api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import LightningConfirm from 'lightning/confirm';
import getRecordId from '@salesforce/apex/INID_OrderController.getRecordId'
import fetchProductOrderItem from '@salesforce/apex/INID_OrderController.fetchProductOrderItem'
import { refreshApex } from '@salesforce/apex';
import fetchOrderFocId from '@salesforce/apex/INID_OrderController.fetchOrderFocId';
import deleteFocFromOrder from '@salesforce/apex/INID_OrderController.deleteFocFromOrder';
import replaceProductItems from '@salesforce/apex/INID_OrderController.replaceProductItems';
import fetchProductOrderItemFoc from '@salesforce/apex/INID_OrderController.fetchProductOrderItemFoc';
import getPromotion from '@salesforce/apex/INID_getPromotionController.getPromotions';
import fetchAccountLicense from '@salesforce/apex/INID_OrderController.fetchAccountLicense';
import fetchProductLicenseExclude from '@salesforce/apex/INID_OrderController.fetchProductLicenseExclude';
import insertOrderSalePromotion from '@salesforce/apex/INID_OrderController.insertOrderSalePromotion'
import insertOrderItemFoc from '@salesforce/apex/INID_OrderController.insertOrderItemFoc'
import fetchOrderToOrderFoc from '@salesforce/apex/INID_OrderController.fetchOrderToOrderFoc';

import insertOrderFocById from '@salesforce/apex/INID_OrderController.insertOrderFocById'
import fetchUserGroup from '@salesforce/apex/INID_OrderController.fetchUserGroup';
import fetchBuGroupId from '@salesforce/apex/INID_OrderController.fetchBuGroupId'
import fetchProductsByBuGroups from '@salesforce/apex/INID_OrderController.fetchProductsByBuGroups'

import getAccountId from '@salesforce/apex/INID_OrderController.getAccountId' ;
import fetchAddonProductPriceBook from '@salesforce/apex/INID_OrderController.fetchAddonProductPriceBook'
import FONT_AWESOME from '@salesforce/resourceUrl/fontawesome';
import fetchOrderSalePromotion from '@salesforce/apex/INID_OrderController.fetchOrderSalePromotion';
import fetchSalePromotionTier from '@salesforce/apex/INID_OrderController.fetchSalePromotionTier'
import fetchSalePromotionBenefitProduct from '@salesforce/apex/INID_OrderController.fetchSalePromotionBenefitProduct';
import fetchSalePromotionId from '@salesforce/apex/INID_OrderController.fetchSalePromotionId' ;
import fetchSalePromotionData from '@salesforce/apex/INID_OrderController.fetchSalePromotionData';
import updateTotalNetPrice from '@salesforce/apex/INID_OrderController.updateTotalNetPrice';
import deletePromotionById from '@salesforce/apex/INID_OrderController.deletePromotionById' ;
import fetchAccountChannel from '@salesforce/apex/INID_OrderController.fetchAccountChannel' ;
import fetchClassifyLicense from '@salesforce/apex/INID_OrderController.fetchClassifyLicense' ;
import fetchClassifyProduct from '@salesforce/apex/INID_OrderController.fetchClassifyProduct' ;
import fetchClassifyType from '@salesforce/apex/INID_OrderController.fetchClassifyType' ;
import fetchAverage from '@salesforce/apex/INID_OrderController.fetchAverage' ;
import getRemarkType from '@salesforce/apex/INID_OrderController.getRemarkType' ;
import { loadStyle } from 'lightning/platformResourceLoader';
import USER_ID from '@salesforce/user/Id';

export default class INID_OrderLine extends LightningElement {
    @track userId = USER_ID; 
    @api recordId;
    @track searchProductTerm = '';
    @track textareaValue = '';
    @track itemNumberFormat = 0;
    @track addonRemark = '' ;
    @track variantBtn = '' ;
    @track currentMaterialCodeForAddOn = '';

    @track orderId;
    @track selectedValue ;
    @track selectedLabel;
    @track accountId ;

    @track userGroup ;
    @track buGroupData = [];
    @track buGroupId;
    @track productsByBuGroups = [] ;
    @track productBuGroupId = [] ;
    @track productBuIds;

    
    @track showProductDropdown = false;
    @track isPopupOpenFreeGood = false ;
    isShowAddfromText = false;
    isShowSummary = false ;
    isLoaded = false;
    hasAlerted = false;
    @track isShowApplyPromotion = false ;
    @track isShowOrderLineItem = true ;

    @track filteredProductOptions = [];
    @track productPriceBook = [];
    @track draftValues = [];
    @track selectedRowIds = [];
    @track selectedProducts = [];
    @track productOrderItemValue = [];
    @track comboGroups = [];
    @track selectedPromotion = [] ;
    @track promotionData = [] ;
    @track orderFocId ;
    @track orderFocItem = [] ;
    @track orderFocDetail = [];
    @track accountLicenseId = [] ;
    @track accountLicenseData = [] ;
    @track accountLicense = [] ;
    @track productLicenseExclude = [] ;
    @track orderSalePromotionData = [] ;
    @track orderSalePromotionId ;
    @track salePromotionBenefitProduct = [] ;
    @track salePromotionBenefitProductId ;
    @track salePromotionTier = [];
    @track salePromotionData = [] ;
    @track salePromotionId ;
    @track fetchAllSalePromotionData = [] ;
    @track titleSummary = 'Select Type Create Order test' ;
    @track totalNetPrice ;

    @track accountChannelData = [] ;
    @track accountChannel;
    @track classifyLicense = [] ;
    @track classifyLicenseId ;
    @track summaryClassify = [] ;
    @track summaryClassifyId ;
    @track classifyType = [];
    @track sellableClassifyIds = [] ;
    @track allBU ;
    @track productAverage = [];
    @track typeAddonOption = [];
    @track mainProductMatched  = [];
    @track mainProductPromotionId = [] ;
    @track summaryRatioProduct = [] ;

    
     

    columns = [
        // { label: 'Material Code', fieldName: 'code', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 120 },
        { label: 'Name', fieldName: 'name', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 120 },
        { label: 'SKU Description', fieldName: 'description', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 200 },
        { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 140 },
        { label: 'Quantity', fieldName: 'quantity', type: 'text', editable: true, hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 100 },
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency',     editable: { fieldName: 'editableSalePrice' }, typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 175 },
        { label: 'Unit', fieldName: 'unit', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 100 },
        { label: 'Total', fieldName: 'total', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' }},
        { 
            label: 'Add On', 
            type: 'button',
            typeAttributes: {
                label: { fieldName: 'nameBtn' },
                name: 'btnAddOn',
                title: 'Add On',
                variant: {fieldName: 'variant'},
                disabled: { fieldName: 'addonDisabled' } 
            },
            cellAttributes: {
                alignment: 'center',
                class: 'slds-text-align_center'
            } ,
        }
    ];

    renderedCallback() {
        if (this.isLoaded) return; 
        const STYLE = document.createElement('style');
        STYLE.innerText = `
            .uiModal .modal-container {
                width: 80vw !important;
                max-width: 95vw;
                min-width: 60vw;
                max-height: 100vh;
                min-height: 55.56vh;
            }
        `;
        const card = this.template.querySelector('lightning-quick-action-panel');
        if (card) card.appendChild(STYLE);
        this.isLoaded = true;
        if (this.quoteItemData) {
            refreshApex(this.quoteItemData); 
        }

        console.log('userId : ' + this.userId) ;
    }

    connectedCallback() {
        loadStyle(this, FONT_AWESOME + '/css/all.min.css');
        this.orderId = this.recordId;

        console.log('recordId', this.recordId);
    }

    @wire(getRemarkType)
    wiredRemarkType({ error, data }) {
        if (data) {
            this.typeAddonOption = data.map(item => ({
                label: item.label,
                value: item.value
            }));
            console.log('type Addon Remark:' + JSON.stringify(this.typeAddonOption , null ,2));
        } else if (error) {
            console.error('Error loading picklist:', error);
        }
    }


    @wire(fetchAddonProductPriceBook , {accountId: '$accountId'})
    wireaddonProductPriceBook({error, data}) {
        if(data){
            this.addonProductPriceBook = data;
        }else if(error){
            console.log(' error fetch addonProductPriceBook : ', error)
        }
            
    }

    @wire(fetchAccountLicense , {accountId: '$accountId'})
    wiredFetchAccountLicense({error , data}) {
        if(data) {
            this.accountLicenseData = data ;
            this.accountLicenseId = this.accountLicenseData.map(accLicenseId => accLicenseId.Id) ;
            this.accountLicense = this.accountLicenseData.map(acc => acc.INID_License__c);
        } else {
            console.log(error) ;
        }
    }

    @wire(fetchUserGroup, {userId: '$userId'})
    wiredUserGroup({ error, data }) {
        if (data) {
            this.userGroup = data;
            console.log('user Gruop : ' + JSON.stringify(this.userGroup, null, 2) );
        } else if (error) {
            console.error('Error fetching user group:', error);
        }
    }

    @wire(fetchBuGroupId, {userGroup: '$userGroup'})
    wiredBuGroupId({ error, data }) {
        if (data) {
            this.buGroupData = data;
            this.buGroupId = this.buGroupData.map(r => r.INID_BU_Group__c);
            this.allBU = this.buGroupData.map(r => r.INID_All_BU__c).join(', ');
            console.log('BU Gruop : ' + JSON.stringify(this.buGroupId, null, 2) );
            console.log('All BU Gruop : ' + JSON.stringify(this.allBU, null, 2) );
        } else if (error) {
            console.error('Error fetching BU Group:', error);
        }
    }

    @wire(fetchProductsByBuGroups, {buGroupIds: '$buGroupId'})
    wiredproductsByBuGroups({ error, data }) {
        if (data) {
            this.productsByBuGroups = data;
            this.productBuGroupId = this.productsByBuGroups.map(r => r.INID_Product_Price_Book__c);
            this.productBuIds = new Set(this.productBuGroupId); 
            console.log('product price book by BU Group : ' + JSON.stringify(this.productBuGroupId, null, 2) );
        } else if (error) {
            console.error('Error fetching Product BU Group:', error);
        }
    }


    @wire(fetchAccountChannel , {accountId: '$accountId'})
        wiredAccountChannel({ error, data }) {
            if (data) {
                this.accountChannelData = data
                // this.accountChannel = this.accountChannelData.map(channel => channel.INID_Channel__c);
                this.accountChannel = this.accountChannelData[0]?.INID_Channel__c || '';
    
                // console.log('Account Channel ' + JSON.stringify(this.accountChannel , null ,2));
            } else if (error) {
                console.error('Error fetching accounts channel:', error);
       }
    }

    @wire(fetchClassifyLicense, { accountChannel: '$accountChannel' })
        wiredFetchClassifyLicense({ error, data }) {
            if (data) {
                this.classifyLicense = JSON.parse(data);
    
                this.classifyLicense = this.classifyLicense.map(record => {
                    const { attributes, ...clean } = record;
                    return clean;
                });
    
                // ดึง INID_Classify__c ไม่ซ้ำ
                this.classifyLicenseId = [...new Set(
                    this.classifyLicense.map(record => record.INID_Classify__c)
                )];
    
                // console.log('classify license Id:', JSON.stringify(this.classifyLicenseId , null , 2));
                // console.log('Clean classifyLicense:', JSON.stringify(this.classifyLicense, null, 2));
    
                if (this.classifyLicenseId.length > 0) {
                    fetchClassifyType({ classifyId: this.classifyLicenseId })
                        .then(result => {
                            this.classifyType = result;
                            console.log(' classify type:', JSON.stringify(this.classifyType, null, 2));
    
                            this.summaryClassify = [];
    
                            //  Map: ClassifyId → requireLicense
                            const requireMap = {};
                            this.classifyType.forEach(item => {
                                requireMap[item.Id] = item.INID_Require_License__c;
                            });
    
                            // จัดกลุ่ม license ตาม classify/group
                            const grouped = {};
                            this.classifyLicense.forEach(record => {
                                const classify = record.INID_Classify__c;
                                const group = record.INID_License_Group__c;
    
                                if (!grouped[classify]) {
                                    grouped[classify] = {};
                                }
                                if (!grouped[classify][group]) {
                                    grouped[classify][group] = [];
                                }
                                grouped[classify][group].push(record);
                            });
    
                            // ประมวลผลแต่ละ classify
                            Object.keys(grouped).forEach(classify => {
                                const requireLicense = requireMap[classify] === true;
                                let canSell = false;
                                let reason = '';
                                let matchedGroup = null;
    
                                const groups = grouped[classify];
                                const groupNumbers = Object.keys(groups);
    
                                const allLicenses = [];
                                Object.values(groups).forEach(records => {
                                    records.forEach(r => {
                                        if (!allLicenses.includes(r.INID_License__c)) {
                                            allLicenses.push(r.INID_License__c);
                                        }
                                    });
                                });
    
                                if (!requireLicense) {
                                    canSell = true;
                                    reason = 'ไม่ต้องใช้ license สามารถขายได้เลย';
                                } else {
                                    if (groupNumbers.length === 1) {
                                        const groupLicenses = groups[groupNumbers[0]].map(r => r.INID_License__c);
                                        const hasAll = groupLicenses.every(lic => this.accountLicense.includes(lic));
                                        canSell = hasAll;
                                        reason = hasAll
                                            ? 'ลูกค้ามี license ครบตามที่กลุ่มนี้กำหนด'
                                            : 'ลูกค้าขาด license ที่จำเป็นในกลุ่มนี้';
                                    } else {
                                        for (let groupNo of groupNumbers) {
                                            const groupLicenses = groups[groupNo].map(r => r.INID_License__c);
                                            const hasAll = groupLicenses.every(lic => this.accountLicense.includes(lic));
                                            if (hasAll) {
                                                canSell = true;
                                                matchedGroup = groupNo;
                                                reason = `ลูกค้ามี license ครบในกลุ่ม ${matchedGroup}`;
                                                break;
                                            }
                                        }
                                        if (!canSell) {
                                            reason = 'ลูกค้าไม่มี license ครบในกลุ่มใดกลุ่มหนึ่ง';
                                        }
                                    }
                                }
    
                                // ✅ เก็บสรุปผล
                                this.summaryClassify.push({
                                    classifyId: classify,
                                    groups,
                                    reason,
                                    canSell,
                                    requireLicense,
                                    ...(matchedGroup ? { matchedGroup } : {})
                                });
    
                                if (groupNumbers.length === 1) {
                                    const groupLicenses = groups[groupNumbers[0]].map(r => r.INID_License__c);
                                } else {
                                    console.log(`   กลุ่มทั้งหมดและ license ในแต่ละกลุ่ม:`);
                                    groupNumbers.forEach(groupNo => {
                                        const groupLicenses = groups[groupNo].map(r => r.INID_License__c);
                                    });
                                }
    
                                console.log(`   ขายได้หรือไม่: ${canSell ? ' ขายได้' : ' ขายไม่ได้'} (${reason})`);
                                console.log('---------------------------------------------------');
                            });
    
                            // สร้างตัวแปรเฉพาะ Classify ที่ขายได้
                            this.sellableClassifyIds = this.summaryClassify
                                .filter(c => c.canSell)
                                .map(c => c.classifyId);
    
                            console.log('Sellable Classify Ids:', JSON.stringify(this.sellableClassifyIds));
                        })
                        .catch(err => {
                            console.error(' Error fetching classify type:', err);
                        });
                }
    
            } else if (error) {
                console.error('Error fetching classify license:', error);
            }
        }

    @wire(fetchClassifyProduct , {sellableClassifyIds: '$sellableClassifyIds'})
    wireFetchClassifyProduct({error , data}) {
    if(data) {
        this.productPriceBook = data;
            console.log('product price book ' + JSON.stringify(this.productPriceBook , null , 2));
        } else if(error) {
            console.error(error) ;
        }
    }

    @wire(fetchProductLicenseExclude , {accountLicenseId: '$accountLicenseId'})
    wirefetchProductLicenseExclude({error , data}) {
        if(data) {
            this.licenseExcludeData = data ;
            this.productLicenseExclude = this.licenseExcludeData.map(prodId => prodId.INID_Product_Price_Book__c);
                
            console.log('license Exclude data : ' + JSON.stringify(this.licenseExcludeData,null, 2)); 
            console.log('Product Exclude' + JSON.stringify(this.productLicenseExclude, null, 2))
        } else if(error) {
            console.log('message error from fetch product license exclude is : ' + JSON.stringify(error , null ,2)) ;
        }
    }

    //Apex wire: get record id
    @wire(getRecordId, { orderId: '$recordId' })
    wireGetRecordId({ error, data }) {
        if (data) {
            this.orderId = data
        } else {
            console.log(error);
        }
    }

    @wire(getAccountId,{ orderId: '$recordId' })
     wiredAccountIdByQuote({error, data}){
        if (data) {
            this.accountId = data;
        } else if (error) {
            console.error('Error fetching accounts Id:', error);
        }
    }

    @wire(fetchAccountChannel , {accountId: '$accountId'})
    wiredAccountChannel({ error, data }) {
        if (data) {
            this.accountChannelData = data
            // this.accountChannel = this.accountChannelData.map(channel => channel.INID_Channel__c);
            this.accountChannel = this.accountChannelData[0]?.INID_Channel__c || '';

            console.log('Account Channel ' + JSON.stringify(this.accountChannel , null ,2));
        } else if (error) {
            console.error('Error fetching accounts Channel:', error);
        }
    }
    

    @wire(fetchOrderFocId, { orderId: '$recordId' })
    wiredFocId({ error, data }) {
        if (data) {
            this.orderFocId = data;
            console.log('Order FOC ID:', JSON.stringify(this.orderFocId, null, 2));
        } else if (error) {
            console.error(' เกิดข้อผิดพลาดในการดึง FOC ID:', error);
        }
    }

    @wire(fetchOrderSalePromotion , {orderId: '$orderId'})
    wiredfetchOrderSalePromotion({error , data}) {
        if(data) {
            this.orderSalePromotionData = data ;
            this.orderSalePromotionId = this.orderSalePromotionData.map(promo => promo.INID_Sale_Promotion_Benefit_Product__c)

            console.log('fetchOrderSalePromotion function ' + JSON.stringify(this.orderSalePromotionId , null ,2))
        } else if(error) {
            console.log('error from fetchOrderSalePromotion function ' + JSON.stringify(error , null ,2)) ;
        }
    }

    @wire(fetchSalePromotionBenefitProduct , {salePromotionBenefitProduct: '$orderSalePromotionId'})
    wiredfetchSalePromotionBenefitProduct({error , data}) {
        if(data) {
            this.salePromotionBenefitProduct = data ;
            this.salePromotionBenefitProductId = this.salePromotionBenefitProduct.map(saleBenefitProd => saleBenefitProd.INID_Sale_Promotion_Benefit__c);
            console.log('order sale promotion benefit product Id : ' + JSON.stringify(this.salePromotionBenefitProductId , null , 2));
            
        } else if(error) {
            console.log('error from fetchOrderSalePromotion function ' + JSON.stringify(error , null ,2)) ;
        }
    }

    @wire(fetchSalePromotionTier , {salePromotionBenefitId: '$salePromotionBenefitProductId'})
    wiredfetchSalePromotionTier({error , data}) {
        if(data) {
            this.salePromotionTier = data ;
             this.salePromotionTierId = this.salePromotionTier.map(tier => tier.INID_Sale_Promotion_Tier__c);
            console.log('order sale promotion Tier Id : ' + JSON.stringify(this.salePromotionTierId , null , 2));
            
        } else if(error) {
            console.log('error from fetchOrderSalePromotion function ' + JSON.stringify(error , null ,2)) ;
        }
    }

    @wire(fetchSalePromotionId , {salePromotionTierId: '$salePromotionTierId'})
    wiredfetchSalePromotion({error , data}) {
        if(data) {
            this.salePromotionData = data ;
             this.salePromotionId = this.salePromotionData.map(tier => tier.INID_Sale_Promotion__c);
            console.log('order sale promotion Id : ' + JSON.stringify(this.salePromotionId , null , 2));
            
        } else if(error) {
            console.log('error from fetchOrderSalePromotion function ' + JSON.stringify(error , null ,2)) ;
        }
    }

    @wire(fetchSalePromotionData , {salePromotionId: '$salePromotionId'})
    wiredfetchSalePromotionData({error , data}) {
        if(data) {
            this.fetchAllSalePromotionData = data ;
            console.log('order All sale promotion Data : ' + JSON.stringify(this.fetchAllSalePromotionData , null , 2));
            
        } else if(error) {
            console.log('error from fetchOrderSalePromotion function ' + JSON.stringify(error , null ,2)) ;
        }
    }

    
    @wire(fetchAverage, {accountId: '$accountId'})
    wiredAverge({ error, data }) {
        if (data) {
            this.productAverage = data;

            console.log('productAverage: ' + JSON.stringify(this.productAverage, null, 2) );
        } else if (error) {
            console.error('Error fetching average:', error);
        }
    }


    @wire(fetchProductOrderItem, { orderId: '$recordId' })
    getDataProductOrderItem({ error, data }) {
        if (data) {
            const mainProducts = [];
            const addonProducts = [];

            console.log('data product order item : ' + JSON.stringify(data,null,2))

            data.forEach(row => {
                const isAddon = row.INID_Remark__c != null ;
                const quantity = Number(row.INID_Quantity__c) || 0;
                
                let unitPrice = row.INID_Product_Price_Book__r?.INID_Unit_Price__c || 0;
                const productPriceBookId = row.INID_Product_Price_Book__c;

                    
                console.log('product average : ' + JSON.stringify(this.productAverage, null ,2));
                const matchedAverage = this.productAverage?.find(
                     avg => avg.INID_Product_Price_Book__c === productPriceBookId
                );

                
                console.log('match average : ' + JSON.stringify(matchedAverage, null ,2));

                if (matchedAverage) {
                    unitPrice = matchedAverage.INID_Price__c;
                    console.log(`พบ average ของ ${productPriceBookId} = ${unitPrice}`);
                }  
                
                let salePrice = row.INID_Sale_Price__c || 0;
                const total = parseFloat((quantity * salePrice).toFixed(2));
                                
                let editableSalePrice = false;
                if (this.allBU === "true") {
                    editableSalePrice = true;
                } else if (this.productBuIds && this.productBuIds.has(productPriceBookId)) {
                    editableSalePrice = true;
                }


                const productObj = {
                    rowKey: row.Id,
                    code: row.INID_Material_Code__c,
                    hlItemNumber: row.INID_HL_Item_Number__c,
                    id: row.INID_Product_Price_Book__r?.Id,
                    name: row.INID_Product_Price_Book__r?.Name ,
                    productCode: row.INID_Material_Code__c || '' ,
                    description: row.INID_SKU_Decription__c,
                    unitPrice,
                    quantity,
                    salePrice,
                    unit: row.INID_Product_Price_Book__r?.INID_Unit__c || '',
                    total,
                    nameBtn: isAddon ? row.INID_Remark__c : '+',
                    variant: isAddon ? 'base' : 'brand',
                    addonDisabled: false,
                    isAddOn: isAddon,
                    productPriceBookId: row.INID_Product_Price_Book__c,
                    editableSalePrice
                };

                if (isAddon) {
                    addonProducts.push(productObj);
                } else {
                    mainProducts.push(productObj);
                }
            });

            // ดึง FOC ID ก่อน
            fetchOrderFocId({ orderId: this.orderId })
                .then(focId => {
                    if (!focId) {
                        console.warn('ไม่พบ FOC ID: ข้ามการดึง FOC ไปเลย');
                        // ทำการรวมและ map ปกติเลย
                        mainProducts.forEach(main => {
                            const hasAddon = addonProducts.some(addon => addon.hlItemNumber === main.hlItemNumber);
                            main.addonDisabled = hasAddon;
                        });

                        const combined = [];
                        mainProducts.forEach(main => {
                            combined.push(main);
                            const relatedAddons = addonProducts.filter(addon => addon.hlItemNumber === main.hlItemNumber);
                            combined.push(...relatedAddons);
                        });


                        this.selectedProducts = combined;
                        this.visibleRows = this.selectedProducts.map(row => ({
                            ...row,
                            showAddonBtn: !row.isAddOn
                        }));

                        return null; 
                    }
                    return fetchProductOrderItemFoc({ orderFocId: focId });
                })
                .then(focItems => {
                    if (!focItems) return;

                    focItems.forEach(foc => {
                        const quantity = Number(foc.INID_Quantity__c) || 0;
                        const salePrice = Number(foc.INID_Sale_Price__c) || 0;
                        const total = parseFloat((quantity * salePrice).toFixed(2));
                        const materialCode = foc.INID_Product_Price_Book__r?.INID_Material_Code__c;

                        const matchedMain = mainProducts.find(main => main.code === materialCode);
                        const hlItemNumber = matchedMain?.hlItemNumber || null;

                        const addonObj = {
                            rowKey: 'FOC-' + Math.random(),
                            code: materialCode,
                            name: foc.INID_Product_Price_Book__r?.Name || '',
                            hlItemNumber: hlItemNumber,
                            id: null,
                            productCode: materialCode,
                            description: foc.INID_Product_Price_Book__r?.INID_SKU_Description__c,
                            unitPrice: foc.INID_Product_Price_Book__r?.INID_Unit_Price__c || 0,
                            quantity,
                            salePrice,
                            unit: foc.INID_Product_Price_Book__r?.INID_Unit__c || '',
                            total,
                            nameBtn: foc.INID_Remark__c,
                            variant: 'base',
                            addonDisabled: false,
                            isAddOn: true,
                            productPriceBookId: foc.INID_Product_Price_Book__c
                        };

                        if (hlItemNumber) {
                            const isDuplicate = addonProducts.some(existing =>
                                existing.code === addonObj.code &&
                                existing.hlItemNumber === addonObj.hlItemNumber &&
                                existing.nameBtn === addonObj.nameBtn
                            );

                            if (!isDuplicate) {
                                addonProducts.push(addonObj);
                            } else {
                                console.warn(`Add-on ซ้ำ: ${addonObj.code} (${addonObj.nameBtn})`);
                            }
                        } else {
                            console.warn(`ไม่พบ Main Product ที่ตรงกับ Material Code: ${materialCode}`);
                        }
                    });

                    mainProducts.forEach(main => {
                        const hasAddon = addonProducts.some(addon => addon.hlItemNumber === main.hlItemNumber);
                        main.addonDisabled = hasAddon;
                    });
                    

                    const combined = [];
                    mainProducts.forEach(main => {
                        combined.push(main);
                        const relatedAddons = addonProducts.filter(addon => addon.hlItemNumber === main.hlItemNumber);
                        combined.push(...relatedAddons);
                    });

                    this.selectedProducts = combined;
                    this.visibleRows = this.selectedProducts.map(row => ({
                        ...row,
                        showAddonBtn: !row.isAddOn
                    }));
                })
                .catch(err => {
                    console.error('ดึงข้อมูล FOC ไม่สำเร็จ:', err);
                });

        } else if (error) {
            console.error('ดึงข้อมูล Product Order Item ไม่สำเร็จ:', error);
        }
    }

    @wire(fetchOrderToOrderFoc , {orderId: '$orderId'})
    getOrderToOrderFoc({error , data}) {
        if(data) {
            this.orderFocDetail = data ;
        } else {
            console.log('error is : ' + error) ;
        }
    }

    

    handleRowAction(event) {
        const addonAction = event.detail.action.name;
        const rowAction = event.detail.row;

        if (rowAction.nameBtn === '+') {
            this.isPopupOpenFreeGood = true;
            this.currentMaterialCodeForAddOn = rowAction.code; 
        }
    }

    getAddonLabel(value) {
        const option = this.options.find(opt => opt.value === value);
        return option ? option.label : '';
    }

    //Product search input handler
    handleInputProduct(event) {
        this.searchProductTerm = event.target.value;
        const term = this.searchProductTerm.toLowerCase().trim();
        this.showProductDropdown = term.length > 2;
        this.filteredProductOptions = this.productPriceBook.filter(p => {
            const productId = p.INID_Product_Price_Book__r.Id;
            const nameStr = p.INID_Product_Price_Book__r.INID_SKU_Description__c?.toLowerCase() || '';
            const codeStr = p.INID_Product_Price_Book__r.INID_Material_Code__c?.toLowerCase() || '';
            const name = p.INID_Product_Price_Book__r.Name?.toLowerCase() || '';
            const matchesSearch = nameStr.includes(term) || name.includes(term);
            const isExcluded = this.productLicenseExclude.includes(productId);
            return matchesSearch && !isExcluded;
        });
    }

    //Select product to table
    handleSelectProduct(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedProduct = this.productPriceBook.find(p => p.INID_Product_Price_Book__r.Id === selectedId);

        if (!selectedProduct) return;
        const isAlreadySelected = this.selectedProducts.some(p => p.id === selectedId);
        if (isAlreadySelected) {
            this.showToast('รายการซ้ำ', 'สินค้านี้มีอยู่ในตารางแล้ว', 'warning');
        } else {
            const newProduct = this.mapProduct(selectedProduct);
            this.selectedProducts = [...this.selectedProducts, newProduct];
        }

           // ตรวจสอบ Add-on
        const matchedAddon = this.addonProductPriceBook.find(rule =>
            rule.INID_Main_Quantity__c === 1 &&
            rule.INID_Product_Price_Book__c === product.productPriceBookId
        );

        if (matchedAddon) {
                const addonId = `${product.rowKey}_addon_auto_${Date.now()}`;
                const addonProduct = {
                    rowKey: addonId,
                    id: addonId,
                    code: matchedAddon.INID_Product_Price_Book__r.INID_Material_Code__c,
                    name: matchedAddon.INID_Product_Price_Book__r.Name,
                    description: matchedAddon.INID_Product_Price_Book__r.INID_SKU_Description__c,
                    unitPrice: 0,
                    salePrice: 0,
                    quantity: matchedAddon.INID_Add_on_Quantity__c,
                    unit: matchedAddon.INID_Product_Price_Book__r.INID_Unit__c,
                    total: 0,
                    productPriceBookId: matchedAddon.INID_Product_Price_Book__c,
                    nameBtn: this.getAddonLabel('1'),
                    variant: 'base',
                    editableSalePrice: false,
                    addOnText: matchedAddon.INID_Remark__c || 'ของแถม',
                    hlItemNumber: product.hlItemNumber,
                    isAddOn: true,
                    productCode: product.code,
                    parentRowKey: matchedMain.rowKey, 
                };

                const isAddonExists = this.selectedProducts.some(p =>
                    p.code === addonProduct.code &&
                    p.unitPrice === 0 &&
                    p.hlItemNumber === product.hlItemNumber
                );

                if (!isAddonExists) {
                    this.selectedProducts = [...this.selectedProducts, addonProduct];
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'เพิ่มของแถมอัตโนมัติ',
                        message: `${addonProduct.code} (${addonProduct.quantity} ${addonProduct.unit})`,
                        variant: 'info'
                    }));
                }

               
            }
    
        // Reset search state
        this.searchProductTerm = '';
        this.showProductDropdown = false;
    }
    //Map product for table row
    mapProduct(source) {
        const unitPrice = source.INID_Product_Price_Book__r.INID_Unit_Price__c || 0;
        const quantity = 1;
        const productPriceBookId = source.INID_Product_Price_Book__r.Id;
        let editableSalePrice = false;

        let salePrice = source.INID_Product_Price_Book__r.INID_Unit_Price__c || 0;
        const matchedAverage = this.productAverage?.find(avg => avg.INID_Product_Price_Book__c === productPriceBookId);
        if (matchedAverage) {
            salePrice = matchedAverage.INID_Price__c;
        }

        if (this.allBU === "true") {
            editableSalePrice = true;
        } else if (this.productBuIds && this.productBuIds.has(productPriceBookId)) {
            editableSalePrice = true;
        }

        return {
            rowKey: source.INID_Product_Price_Book__r.Id,
            id: source.INID_Product_Price_Book__r.Id,
            productPriceBookId: source.INID_Product_Price_Book__r.Id, 
            code: source.INID_Product_Price_Book__r.INID_Material_Code__c,
            name: source.INID_Product_Price_Book__r.Name ,
            description: source.INID_Product_Price_Book__r.INID_SKU_Description__c,
            unitPrice: salePrice, 
            quantity,
            salePrice,
            unit: source.INID_Product_Price_Book__r.INID_Unit__c || '',
            total: unitPrice * quantity,
            nameBtn: '+',
            variant: 'brand',
            addonDisabled: false, 
            editableSalePrice
        };
    }


    showProductCode() {
        this.isShowAddfromText = !this.isShowAddfromText;
    }

    //Handle textarea input for product codes
    enterProductOnchange(event) {
        const textareaValue = event.target.value || '';
        const uniqueCodes = new Set();
        this.enteredProductCodes = textareaValue
            .split('\n')
            .map(code => code.trim())
            .filter(code => {
                if (!code) return false;
                const normalized = code.toLowerCase();
                if (uniqueCodes.has(normalized)) return false;
                uniqueCodes.add(normalized);
                return true;
            });
    }


    addProductToTable() {
        if (!this.enteredProductCodes?.length) {
            this.showToast('ไม่มีข้อมูล', 'กรุณากรอกรหัสสินค้าอย่างน้อย 1 รายการ', 'error');
            return;
        }

        const added = [];
        const duplicates = [];
        const invalid = [];
        const excluded = [];

        this.enteredProductCodes.forEach(code => {
            const match = this.productPriceBook.find(p => 
                p.INID_Product_Price_Book__r.INID_Material_Code__c === code
            );
            if (!match) {
                invalid.push(code);
            } else {
                const productId = match.INID_Product_Price_Book__r.Id;
                const isExcluded = this.productLicenseExclude.includes(productId);
                const alreadyExists = this.selectedProducts.some(p => p.code === code);

                if (isExcluded) {
                    excluded.push(code);
                } else if (alreadyExists) {
                    duplicates.push(code);
                } else {
                    let unitPrice = match.INID_Product_Price_Book__r.INID_Unit_Price__c || 0;

                    const matchedAverage = this.productAverage?.find(avg => avg.INID_Product_Price_Book__c === productId);
                    if (matchedAverage) {
                        unitPrice = matchedAverage.INID_Price__c;
                    }
                    const quantity = 1;

                    let editableSalePrice = false;
                    if (this.allBU === "true") {
                        editableSalePrice = true;
                    } else if (this.productBuIds && this.productBuIds.has(productPriceBookId)) {
                        editableSalePrice = true;
                    }

                   added.push({
                        rowKey: productId,
                        id: productId,
                        productPriceBookId: productId,
                        code: match.INID_Product_Price_Book__r.INID_Material_Code__c,
                        name: match.INID_Product_Price_Book__r.Name,
                        description: match.INID_Product_Price_Book__r.INID_SKU_Description__c,
                        quantity,
                        salePrice: unitPrice,
                        unit: match.INID_Product_Price_Book__r.INID_Unit__c,
                        unitPrice,
                        total: unitPrice * quantity,
                        editableSalePrice,
                        nameBtn: '+',
                        variant: 'brand',
                        addonDisabled: false
                    });
                }
            }
        });

        if (added.length) {
            this.selectedProducts = [...this.selectedProducts, ...added];
            this.isShowAddfromText = false;
        }
        if (duplicates.length) {
            this.showToast('รายการซ้ำ', `สินค้านี้มีอยู่ในตารางแล้ว: ${duplicates.join(', ')}`, 'warning');
        }
        if (excluded.length) {
            this.showToast('สินค้าถูกยกเว้น', `ไม่สามารถเพิ่มสินค้า: ${excluded.join(', ')}`, 'error');
        }
        if (invalid.length) {
            this.showToast('ไม่พบ Product Code', `กรุณาตรวจสอบ: ${invalid.join(', ')}`, 'error');
        }

        this.textareaValue = '';
        this.enteredProductCodes = [];
        const textarea = this.template.querySelector('lightning-textarea');
        if (textarea) textarea.value = '';
    }



    get hasSelectedProducts() {
        return this.selectedProducts && this.selectedProducts.length > 0;
    }

    handleSaveEditedRows(event) {
        const updatedValues = event.detail.draftValues;
        const newSelectedProducts = [...this.selectedProducts];
        const matchedAddons = [];

        updatedValues.forEach(updated => {
            const index = newSelectedProducts.findIndex(p => p.rowKey === updated.rowKey);
            if (index === -1) {
                console.warn(`ไม่พบ rowKey: ${updated.rowKey} ใน selectedProducts`);
                return;
            }

            const product = newSelectedProducts[index];
            const qty = Math.max(0, Number(updated.quantity ?? product.quantity));
            const price = Math.max(0, Number(updated.salePrice ?? product.salePrice));

            const updatedProduct = {
                ...product,
                ...updated,
                quantity: qty,
                salePrice: price,
                total: qty * price
            };

            newSelectedProducts[index] = updatedProduct;

            const matchedRule = this.addonProductPriceBook.find(rule =>
                rule.INID_Product_Price_Book__c === updatedProduct.productPriceBookId &&
                rule.INID_Main_Quantity__c === qty && updatedProduct.nameBtn === '+'
            );

            if (matchedRule) {
                // เช็คว่ามี Add-on สำหรับ Product นี้อยู่แล้วหรือยัง (ระบุ parentRowKey ให้ชัด)
                const hasAddon = newSelectedProducts.some(p =>
                    p.isAddOn === true &&
                    p.parentRowKey === updatedProduct.rowKey &&
                    p.productPriceBookId === matchedRule.INID_Product_Price_Book__c
                );

                if (hasAddon) {
                    return; 
                }

                updatedProduct.addonDisabled = true;

                const addonProduct = {
                    rowKey: `addon_${Date.now()}`,
                    code: matchedRule.INID_Product_Price_Book__r.INID_Material_Code__c,
                    productPriceBookId: matchedRule.INID_Product_Price_Book__c,
                    description: matchedRule.INID_Product_Price_Book__r.INID_SKU_Description__c,
                    unitPrice: matchedRule.INID_Product_Price_Book__r.INID_Unit_Price__c,
                    quantity: matchedRule.INID_Add_on_Quantity__c,
                    salePrice: 0,
                    total: 0,
                    isAddOn: true,
                    parentRowKey: updatedProduct.rowKey,
                    nameBtn: matchedRule.INID_Remark__c,
                    variant: 'base',
                    editableSalePrice: false,
                    productCode: updatedProduct.code
                };


                newSelectedProducts[index] = updatedProduct;
                newSelectedProducts.splice(index + 1, 0, addonProduct);
                matchedAddons.push({ product: updatedProduct, addon: addonProduct });
            }

        });

        this.selectedProducts = newSelectedProducts;
        this.draftValues = [];
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Edit field successfully',
                variant: 'success'
            })
        );
    }


    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        let newSelectedIds = [];
        let selectedDetailItems = [];

        selectedRows.forEach(row => {
            const isMain = row.nameBtn === '+';
            const type = isMain ? 'SALE' : 'FREE';

            newSelectedIds.push(row.rowKey);

            selectedDetailItems.push({
                rowKey: row.rowKey,
                code: row.code,
                type: type
            });

            if (isMain) {
                const mainItem = this.selectedProducts.find(p =>
                    p.rowKey === row.rowKey
                );

                if (mainItem) {
                    const addOnItems = this.selectedProducts.filter(p =>
                        p.nameBtn !== '+' && p.code === mainItem.code
                    );

                    if (addOnItems.length > 0) {
                        const addonList = addOnItems.map(a => `• ${a.rowKey}`).join('\n');
                    } 

                    addOnItems.forEach(addon => {
                        if (!newSelectedIds.includes(addon.rowKey)) {
                            newSelectedIds.push(addon.rowKey);
                            selectedDetailItems.push({
                                rowKey: addon.rowKey,
                                code: addon.code,
                                type: 'FREE'
                            });
                        }
                    });
                }

            } else {
                const relatedMain = this.selectedProducts.find(p =>
                    p.salePrice !== 0 && p.code === row.code
                );
            }
        });

        this.selectedRowIds = [...new Set(newSelectedIds)];
        this.selectedDetailItems = selectedDetailItems;

        const datatable = this.template.querySelector('lightning-datatable');
        if (datatable) {
            datatable.selectedRows = this.selectedRowIds;
        }
    }

    async handleDeleteSelected() {
        if (!this.selectedDetailItems || this.selectedDetailItems.length === 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'แจ้งเตือน',
                    message: 'ยังไม่เลือกสักรายการ',
                    variant: 'warning',
                    mode: 'dismissable'
                })
            );
            return;
        }

        const deleteKeys = new Set(this.selectedDetailItems.map(item => item.rowKey));
        const mainItems = this.selectedDetailItems.filter(item => item.type === 'SALE');
        const addOnItems = this.selectedDetailItems.filter(item => item.type === 'FREE');

        // แสดงรายการที่จะลบ
        if (mainItems.length > 0) {
            const mainCodes = mainItems.map(m => `• ${m.code} (rowKey: ${m.rowKey})`).join('\n');
        }

        if (addOnItems.length > 0) {
            const addonCodes = addOnItems.map(a => `• ${a.code} (rowKey: ${a.rowKey})`).join('\n');
        }

        const confirmed = await LightningConfirm.open({
            message: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการต่อไปนี้?`,
            variant: 'destructive',
            label: 'ยืนยันการลบ',
        });

        if (!confirmed) {
            return;
        }

        // ลบออกจากข้อมูลหลัก
        this.selectedProducts = this.selectedProducts.filter(p => !deleteKeys.has(p.rowKey)); 

        addOnItems.forEach(deletedAddon => {
            const relatedMain = this.selectedProducts.find(main =>
                !main.isAddOn && main.code === deletedAddon.code
            );

            if (relatedMain) {
                const hasOtherAddon = this.selectedProducts.some(item =>
                    item.isAddOn && item.code === relatedMain.code
                );

                relatedMain.addonDisabled = hasOtherAddon;
            }
        });

        this.selectedRowIds = [];
        this.selectedDetailItems = [];

        const datatable = this.template.querySelector('lightning-datatable');
        if (datatable) {
            datatable.selectedRows = [];
        }

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'สำเร็จ',
                message: 'ลบรายการที่เลือกเรียบร้อยแล้ว',
                variant: 'success'
            })
        );

    }

    async handleSaveSuccess() {
        this.showToast('รายการแจ้งเตือน', 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    get isNextDisabled() {
        return !(this.selectedProducts && this.selectedProducts.length > 0);
    }

    handleSaveError(error) {
        console.error('Save Error:', JSON.stringify(error));
        let msg = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล : ' + error;
        alert('Error JSON:\n' + JSON.stringify(error, null, 2));
        if (error && error.body && error.body.message) {
            msg = error.body.message;
        } else if (error && error.message) {
            msg = error.message;
        }
        this.showToast('Error saving data', msg, 'error');
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    get checkDataEnable() {
        return this.selectedProducts.length === 0;
    }

    handleChangeFreeGoods(event) {
        this.selectedValue = event.detail.value;
        this.selectedLabel = event.detail.label;
    }

    closePopupFreeGood() {
        this.isPopupOpenFreeGood = false;
        this.selectedValue = '';
        this.selectedLabel = ''; 
        this.searchProductTermAddOn = '';   
    }

    handleSaveAddon() {
        if (!this.selectedValue) {
            this.showToast('Error', 'กรุณาเลือกประเภทของแถม', 'error');
            return;
        }

        const matchedMainIndex = this.selectedProducts.findIndex(
            p => p.code === this.currentMaterialCodeForAddOn && p.nameBtn === '+'
        );

        if (matchedMainIndex < 0) {
            this.showToast('Error', 'ไม่พบสินค้าหลัก', 'error');
            return;
        }

        const matchedMain = this.selectedProducts[matchedMainIndex];
        const addonId = matchedMain.id + '_addon_' + this.selectedValue;
        const alreadyExists = this.selectedProducts.some(p =>
            p.isAddOn === true &&
            p.parentRowKey === matchedMain.rowKey &&
            p.nameBtn === this.getAddonLabel(this.selectedValue)
            );

        if (alreadyExists) {
            this.showToast('Warning', 'Add-on นี้ถูกเพิ่มไปแล้ว', 'warning');
            return;
        }

        const addonProduct = {
            rowKey: addonId,
            parentRowKey: matchedMain.rowKey,
            id: addonId,
            name: matchedMain.name ,
            code: matchedMain.code,
            description: matchedMain.description,
            unitPrice: 0,
            salePrice: 0,
            quantity: 1,
            unit: matchedMain.unit,
            total: 0,
            nameBtn: this.selectedValue,
            variant: 'base',
            editableSalePrice: false,
            hlItemNumber: matchedMain.hlItemNumber || matchedMain.code,
            productPriceBookId: matchedMain.id,
            isAddOn: true
        };

        this.addAddonToProduct(addonProduct);
        this.selectedProducts[matchedMainIndex].addonDisabled = true;

        this.showToast('เพิ่ม Add-on สำเร็จ', `คุณเลือกประเภท: ${addonProduct.nameBtn}`, 'success');

        this.isPopupOpenFreeGood = false;
        this.selectedValue = '';
        this.currentMaterialCodeForAddOn = '';
    }

    addAddonToProduct(addonProduct) {
        const mainIndex = this.selectedProducts.findIndex(
            p => p.code === addonProduct.code &&  p.nameBtn === '+'
        );

        if (mainIndex >= 0) {
            this.selectedProducts.splice(mainIndex + 1, 0, addonProduct);
            this.selectedProducts = [...this.selectedProducts]; 
        }
    }

    freeProductInsertItems(hlcurrent = 0) {
        let hlCounter = hlcurrent;
        let itemIndex = hlcurrent + 1;
        const result = [];

        if (Array.isArray(this.freeProductPromotion)) {
            this.freeProductPromotion.forEach((free) => {
                const formattedNumber = (itemIndex * 10).toString().padStart(6, '0');
                let quantity = null;

                if (free.benefitType === 'Free Product (Fix Quantity)') {
                    quantity = free.fixQty;
                } else if (free.benefitType === 'Free Product (Ratio)') {
                    quantity = this.summaryRatioProduct || 0;

                    // ✅ ถ้า Ratio = 0 → ไม่ต้อง insert
                    if (quantity === 0) {
                        console.log(`❌ Skipping Free Product (Ratio) with 0 quantity: ${free.productPriceBookId}`);
                        return; // ข้ามตัวนี้
                    }
                }

                result.push({
                    INID_Quantity__c: quantity,
                    INID_Sale_Price__c: 0,
                    INID_Product_Price_Book__c: free.productPriceBookId,
                    INID_Type__c: 'FREE',
                    INID_Order__c: this.orderId,
                    INID_HL_Number__c: ++hlCounter,
                    INID_Item_Number__c: formattedNumber,
                    INID_Remark__c: 'โปรโมชั่น'
                });

                itemIndex++;
            });
        }

        return result;
    }



    async handleSave() {
        try {
            const confirmed = await LightningConfirm.open({
                message: 'คุณแน่ใจหรือไม่ว่าต้องการบันทึกรายการ?',
                variant: 'header',
                label: 'ยืนยันการบันทึก',
            });

            if (!confirmed) return;

            let hlNumber = 1;
            let recordsToInsert = [];
            let itemIndex = 1;

            const focProducts = this.selectedProducts.filter(
                p => p.salePrice === 0 && p.nameBtn === 'ของแถมนอกบิล (FOC)'
            );

            const addonFocProducts = this.selectedProducts.filter(
                p => p.salePrice === 0 && p.nameBtn !== 'ของแถมนอกบิล (FOC)'
            );

            const focMap = new Map();
            focProducts.forEach(prod => {
                const key = prod.productPriceBookId + '-' + prod.nameBtn;
                if (focMap.has(key)) {
                    const exist = focMap.get(key);
                    exist.quantity += parseFloat(prod.quantity);
                } else {
                    focMap.set(key, { ...prod, quantity: parseFloat(prod.quantity) });
                }
            });
            const uniqueFocProducts = Array.from(focMap.values());
            const focRecordsToInsert = uniqueFocProducts.map((prod, index) => {
                const formattedNumber = ((index + 1) * 10).toString().padStart(6, '0');
                return {
                    INID_Quantity__c: prod.quantity,
                    INID_Sale_Price__c: parseFloat(prod.salePrice),
                    INID_Quote__c: this.recordId,
                    INID_Order_Foc__c: this.orderFocId,
                    INID_Product_Price_Book__c: prod.productPriceBookId,
                    INID_Type__c: 'FREE',
                    INID_Remark__c: prod.nameBtn,
                    INID_HL_Number__c: index + 1,
                    INID_Item_Number__c: formattedNumber,
                };
            });

            this.selectedProducts.forEach((prod) => {
                const isFoc = prod.nameBtn === 'ของแถมนอกบิล (FOC)';
                const isAddon = prod.nameBtn !== '+';

                if (!isAddon && !isFoc) {
                    hlNumber = recordsToInsert.length + 1;
                }

                const formattedNumber = (itemIndex * 10).toString().padStart(6, '0');

                recordsToInsert.push({
                    INID_Quantity__c: parseFloat(prod.quantity),
                    INID_Sale_Price__c: parseFloat(prod.salePrice),
                    INID_Quote__c: this.recordId,
                    INID_Order__c: this.orderId,
                    INID_Product_Price_Book__c: (isFoc || isAddon) ? prod.productPriceBookId : prod.id,
                    INID_Type__c: isFoc ? 'FREE' : isAddon ? 'FREE' : 'SALE',
                    INID_Remark__c: (isFoc || isAddon) ? prod.nameBtn : null,
                    INID_HL_Number__c: hlNumber,
                    INID_Item_Number__c: formattedNumber,
                });
                itemIndex++;
            });

            const freeProductItems = this.freeProductInsertItems(recordsToInsert.length);
            recordsToInsert.push(...freeProductItems);

            if (uniqueFocProducts.length === 0 && this.orderFocId) {
                await this.deleteFocItemsOnly(this.orderFocId);
            }

            if (!this.orderFocId && focRecordsToInsert.length > 0) {
                const newOrderFocDetail = this.orderFocDetail.map(item => {
                    const { 
                        Id,
                        Status ,
                        EffectiveDate ,
                        Type , 
                        INID_PaymentType__c,
                        INID_PaymentTerm__c ,
                        INID_Bill_To_Code__c ,
                        INID_Ship_To_Code__c, 
                        INID_Organization__c,
                        INID_ExcVAT__c ,
                        INID_IncVAT__c ,
                        INID_NoteInternal__c,
                        INID_NoteAgent__c,
                        Account ,
                        INID_Address_Billto__c ,
                        INID_Address_Billto2__c ,
                        INID_Address_Shipto__c ,
                        INID_Address_Number_Bill_To__c ,
                        INID_PostCode_Billto__c ,
                        INID_PostCode_Shipto__c ,
                        INID_Street_Billto__c ,
                        INID_Street_Shipto__c ,
                        INID_Province_Billto__c ,
                        INID_Province_Shipto__c ,
                        INID_City_Billto__c ,
                        INID_City_Shipto__c,
                        INID_PurchaseOrderNumber__c ,
                        
                        ...rest 
                    } = item;
                    
                    const accountId = item.AccountId;

                    return {
                        ...rest,
                        INID_AccountId__c: accountId ,
                        INID_Original_Order__c: Id,
                        INID_Order_Foc__c: this.orderFocId ,
                        NID_EffectiveDate__c: new Date().toISOString(),
                        INID_Type__c: Type ,
                        INID_Bill_To_Code__c: INID_Bill_To_Code__c,	
                        INID_Ship_To_Code__c: INID_Ship_To_Code__c,
                        INID_PurchaseOrderNumber__c: INID_PurchaseOrderNumber__c,
                        INID_NoteInternal__c: INID_NoteInternal__c,
                        INID_NoteAgent__c : INID_NoteAgent__c,
                        INID_ExcVAT__c: INID_ExcVAT__c,
                        INID_IncVAT__c: INID_IncVAT__c,
                
                        // INID_TotalAmount__c:  this.totalFocPrice,
                        INID_Status__c: Status ,
                        INID_Organization__c:INID_Organization__c ,
                        INID_PaymentTerm__c:INID_PaymentTerm__c ,
                        INID_PaymentType__c:INID_PaymentType__c ,
                        INID_Address_Billto__c: INID_Address_Billto__c,
                        INID_Address_Billto2__c: INID_Address_Billto2__c ,

                        INID_Address_Shipto__c: INID_Address_Shipto__c ,
                        INID_Address_Number_Bill_To__c:INID_Address_Number_Bill_To__c ,
                        INID_PostCode_Billto__c: INID_PostCode_Billto__c,
                        INID_PostCode_Shipto__c: INID_PostCode_Shipto__c,
                        INID_Street_Billto__c: INID_Street_Billto__c ,
                        INID_Street_Shipto__c: INID_Street_Shipto__c,
                        INID_City_Billto__c: INID_City_Billto__c ,
                        INID_City_Shipto__c: INID_City_Shipto__c ,
                        INID_Province_Billto__c: INID_Province_Billto__c, 
                        INID_Province_Shipto__c: INID_Province_Shipto__c,
                        INID_NetAmount__c: this.totalFocPrice,

                    };
                });

                console.log('order FOC Detail : ' + JSON.stringify(this.orderFocDetail, null ,2));
                console.log('new order FOC Detail : ' + JSON.stringify(newOrderFocDetail, null ,2));

                try {
                    const createdOrderFoc = await insertOrderFocById({ orderFocList: newOrderFocDetail });

                    if (createdOrderFoc && Array.isArray(createdOrderFoc) && createdOrderFoc.length > 0) {
                        this.orderFocId = createdOrderFoc[0].Id;

                        const focItemsWithOrderFocId = focRecordsToInsert.map(item => ({
                            ...item,
                            INID_Order_Foc__c: this.orderFocId
                        }));

                        await insertOrderItemFoc({
                            orderFocId: this.orderFocId,
                            orderItemList: focItemsWithOrderFocId
                        });
                    } else {
                        console.warn('insertOrderFocById คืนค่าผิดปกติ:', createdOrderFoc);
                        this.orderFocId = null;
                    }
                } catch (error) {
                    console.error('Error insertOrderFocById หรือ insertOrderItemFoc:', error);
                    this.showToast('ผิดพลาด', 'ไม่สามารถสร้าง Order FOC หรือเพิ่มรายการ FOC ได้', 'error');
                    return; 
                }
            } else if (this.orderFocId && focRecordsToInsert.length > 0) {
                await insertOrderItemFoc({
                    orderFocId: this.orderFocId,
                    orderItemList: focRecordsToInsert
                });
            }

            const recordsToInsertFiltered = recordsToInsert.filter(
                item => !(item.INID_Type__c === 'FREE' && item.INID_Remark__c === 'ของแถมนอกบิล (FOC)')
            );

            await replaceProductItems({
                orderId: this.orderId,
                products: recordsToInsertFiltered
            });

            // บันทึก Promotion ที่เลือก
            const selectedBenefitItems = [];

            this.comboGroups.forEach(group => {
                const selectedBenefits = group.groupedBenefits
                    .flatMap(bg => bg.benefits)
                    .filter(b => b.selected);

                // selectedBenefits.forEach(benefit => {
                //     selectedBenefitItems.push({
                //         INID_Order__c: this.orderId,
                //         INID_Sale_Promotion_Benefit_Product__c: benefit.Id
                //     });
                // });

                selectedBenefits.forEach(benefit => {
                    if (benefit.benefitType === 'Free Product (Ratio)') {
                        const matchedMainProduct = this.mainProductMatched.find(p => this.mainProductPromotionId.includes(p.id));
                        const mainQty = matchedMainProduct ? matchedMainProduct.quantity : 0;
                        const numerator = benefit.INID_Free_Product_Quantity_Numerator__c || 1;
                        const denominator = benefit.INID_Free_Product_Quantity_Denominator__c || 0;

                        let devide = 0;
                        if (mainQty >= numerator) {
                            devide = mainQty / numerator;
                            devide = (devide % 1 < 0.5) ? Math.floor(devide) : Math.ceil(devide);
                        }

                        const summaryProduct = devide * denominator;

                        console.log(`🧪 Checking Ratio Promotion: mainQty=${mainQty}, summaryProduct=${summaryProduct}`);

                        if (summaryProduct > 0) {
                            selectedBenefitItems.push({
                                INID_Order__c: this.orderId,
                                INID_Sale_Promotion_Benefit_Product__c: benefit.Id
                            });
                        } else {
                            console.warn(`⚠️ Skipping Ratio Promotion (summaryProduct = 0) for benefitId: ${benefit.Id}`);
                        }
                    } else {
                        selectedBenefitItems.push({
                            INID_Order__c: this.orderId,
                            INID_Sale_Promotion_Benefit_Product__c: benefit.Id
                        });
                    }
                });
            });

            if (selectedBenefitItems.length > 0) {
                try {
                    await insertOrderSalePromotion({ orderSalePromotionList: selectedBenefitItems });
                } catch (error) {
                    console.error('Insert Promotion Error:', error);
                    this.showToast('ผิดพลาด', 'ไม่สามารถบันทึก Promotion ได้', 'error');
                }
            } else {
                await deletePromotionById({ orderId: this.orderId });
            }

            await updateTotalNetPrice({ orderId: this.orderId, totalNetPrice: this.totalNetPrice });
            
            this.showToast('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย', 'success');
            this.selectedProducts = [];
            
            setTimeout(() => {
                window.location.reload();
            }, 200);

        } catch (error) {
            console.error('Save Error:', JSON.stringify(error.message));
        }
    }



    async deleteFocItemsOnly(orderFocId) {
        try {
            await deleteFocFromOrder({ orderFocId });
        } catch (error) {
            console.error('Error deleting FOC items:', error);
        }
    }


    @track comboGroups = [];
    @track isShowApplyPromotionData = true

    async handleNext() {
        this.isShowApplyPromotion = true;
        this.isShowOrderLineItem = false;
        this.isLoaded = false;

        const orderItemList = this.selectedProducts.map((item) => {

            return {
                INID_Quantity__c: item.quantity,
                INID_Sale_Price__c: item.salePrice,
                INID_Product_Price_Book__c: item.productPriceBookId, 
                INID_Total__c: item.total,
                };
            });

        try {
            const getPromotions = await getPromotion({ orderList: orderItemList, accountId: this.accountId })
            console.log('getPromotion'+ JSON.stringify(getPromotions,null,2));

            // ตรวจสอบว่ามี promotions หรือไม่
            if (!getPromotions || !Array.isArray(getPromotions.promotions) || getPromotions.promotions.length === 0) {
                this.isShowApplyPromotionData = false;
                console.log('ไม่มี promotions ที่ได้จาก API');
                this.comboGroups = [];
                return;
            } else {
                this.isShowApplyPromotionData = true;
            }

            console.log('selected product: ' + JSON.stringify(this.selectedProducts , null ,2));

            this.mainProductPromotionId = getPromotions.promotions.map(promo => promo.mainProduct);
            console.log('main product promotion Id:', JSON.stringify(this.mainProductPromotionId, null, 2));

            const mainProductMatches = this.selectedProducts
            .filter(prod => this.mainProductPromotionId.includes(prod.productPriceBookId))
            .map(prod => ({
                id: prod.productPriceBookId,
                quantity: prod.quantity
            }));

            console.log('🟩 main product ที่ user เลือกพร้อม quantity:', JSON.stringify(mainProductMatches, null, 2));
            this.mainProductMatched = mainProductMatches;


            this.comboGroups = getPromotions.promotions.map(promo => {
                const benefitGroups = {};

                promo.benefits.forEach(b => {
                    const remark = (b.INID_Remark__c || '').trim();
                    const batch = (b.INID_Batch_Lot_No__c || '').trim();
                    // ✅ ถ้า Remark และ Batch ว่างทั้งคู่ ไม่ต้องแสดง benefit นี้
                    const item = {
                        id: b.Id,
                        // ...properties อื่นๆ
                        remark: remark || null, // assign null ถ้าว่าง เพื่อให้ if:true fail
                        batch: batch || null
                    };

                    const condType = b.INID_Sale_Promotion_Benefit__r?.INID_Condition_Type__c || 'OR';
                    const isSelectPromotionBenefit = this.orderSalePromotionId?.includes(b.Id);

                    if (!benefitGroups[condType]) {
                        benefitGroups[condType] = [];
                    }

                    benefitGroups[condType].push({
                        ...b,
                        id: b.Id,
                        Name: b.Name,
                        BenefitProduct: b.INID_Product_Price_Book__c,
                        benefitType: b.INID_Benefit_Type__c,
                        isExpanded: false,
                        selected: isSelectPromotionBenefit,
                        className: isSelectPromotionBenefit ? 'benefit-box selected' : 'benefit-box',
                        discountAmount: b.INID_Discount_Amount__c || null,
                        discountPercent: b.INID_Discount__c || null,
                        freeProductQuantityFix: b.INID_Free_Product_Quantity_Fix__c || null,
                        freeProductQuantityRatioNumerator: b.INID_Free_Product_Quantity_Numerator__c || null,
                        freeProductQuantityRatioDenominator: b.INID_Free_Product_Quantity_Denominator__c || null,
                        batch: b.INID_Batch_Lot_No__c || null,
                        setPrice: b.INID_SetPrice__c || null,
                        remark: b.INID_Remark__c || '',
                        freeProductLabelFix: b.INID_Product_Price_Book__r
                            ? `${b.INID_Product_Price_Book__r.INID_Material_Code__c || ''} - ${b.INID_Product_Price_Book__r.INID_SKU_Description__c || ''}`.trim()
                            : '',
                        isDiscountAmount: b.INID_Benefit_Type__c === 'Discount Amount',
                        isDiscountPercent: b.INID_Benefit_Type__c === 'Discount(%)',
                        isFreeProductFix: b.INID_Benefit_Type__c === 'Free Product (Fix Quantity)',
                        isFreeProductRatio: b.INID_Benefit_Type__c === 'Free Product (Ratio)',
                        isSetPrice: b.INID_Benefit_Type__c === 'Set Price',
                        displayBenefit:
                            b.INID_Benefit_Type__c === 'Free Product (Ratio)'
                                ? b.INID_Benefit_Type__c + ' ' + b.INID_Free_Product_Quantity_Numerator__c + ' : ' + b.INID_Free_Product_Quantity_Denominator__c
                                : b.INID_Benefit_Type__c === 'Free Product (Fix Quantity)'
                                ? b.INID_Benefit_Type__c + ' : ' + b.INID_Free_Product_Quantity_Fix__c
                                : b.INID_Benefit_Type__c === 'Set Price'
                                ? b.INID_Benefit_Type__c + ' ' + b.INID_SetPrice__c
                                : b.INID_Benefit_Type__c === 'Discount Amount'
                                ? b.INID_Benefit_Type__c + ' ' + b.INID_Discount_Amount__c + ' THB '
                                : b.INID_Benefit_Type__c === 'Discount(%)'
                                ? b.INID_Benefit_Type__c + ' : ' + b.INID_Discount__c + ' % '
                                : 'N/A'
                    });
                });

                // const groupedBenefits = Object.keys(benefitGroups).map(type => ({
                //     conditionType: type,
                //     benefits: benefitGroups[type]
                // }));
                const groupedBenefits = Object.keys(benefitGroups).map(type => {
                    const benefits = benefitGroups[type];
                    const isAndGroup = type === 'AND';

                    // เช็คว่ามีตัวไหน selected อยู่ไหม
                    const hasSelected = benefits.some(benefit => benefit.selected);

                    // ถ้าเป็น AND และมี benefit ถูกเลือก ให้เลือกทั้งหมด
                    if (isAndGroup && hasSelected) {
                        benefits.forEach(benefit => {
                            benefit.selected = true;
                            benefit.className = 'benefit-box selected';
                        });
                    }

                    return {
                        conditionType: type,
                        benefits: benefits
                    };
                });
                const hasSelectedBenefit = groupedBenefits.some(group =>
                    group.benefits.some(benefit => benefit.selected)
                );

                return {
                    promotionId: promo.id,
                    promotionName: promo.name,
                    promotionDescript: promo.description,
                    isSelected: hasSelectedBenefit,
                    isExpanded: hasSelectedBenefit, 
                    arrowSymbol: 'fa-solid fa-circle-chevron-down',
                    className: hasSelectedBenefit ? 'promotion-box selected' : 'promotion-box',
                    groupedBenefits: groupedBenefits
                };
            });
            
            this.updateFreeProductPromotion(); 
            console.log('combo group : ' + JSON.stringify(this.comboGroups , null , 2)) ;

        } catch(error) {
            console.error('❌ Full error detail:', JSON.stringify(error.message, null, 2));
            alert('error\n'+ (error.body?.message || error.message || JSON.stringify(error)));
        }   
    }

    handleTogglePromotion(event) {
        const promoId = event.currentTarget.dataset.promoid;
        this.comboGroups = this.comboGroups.map(group => {
            if (group.promotionId === promoId) {
                // เช็คว่ามี benefit ที่เลือกอยู่มั้ย
                const hasSelectedBenefit = group.groupedBenefits.some(bg =>
                    bg.benefits.some(b => b.selected)
                );

                // toggle expand
                const newExpanded = !group.isExpanded;

                return {
                    ...group,
                    isExpanded: newExpanded,
                    isSelected: hasSelectedBenefit, 
                    arrowIconClass: newExpanded
                        ? 'fa-solid fa-circle-chevron-up'
                        : 'fa-solid fa-circle-chevron-down',
                    className: hasSelectedBenefit
                        ? 'promotion-box selected'
                        : 'promotion-box'
                };
            }
            return group;
        });
    }

    handleToggleBenefit(event) {
        const promoId = event.currentTarget.dataset.promoid;
        const benefitId = event.currentTarget.dataset.benefitid;

        this.comboGroups = this.comboGroups.map(group => {
            if (group.promotionId !== promoId) return group;

            const currentGroupType = group.groupedBenefits.find(bg => 
                bg.benefits.some(b => b.Id === benefitId)
            )?.conditionType;

            const updatedGrouped = group.groupedBenefits.map(bg => {
                const isBenefitInGroup = bg.benefits.some(b => b.Id === benefitId);

                // ล้างฝั่งตรงข้าม
                const isOppositeType = (bg.conditionType !== currentGroupType);

                if (isOppositeType) {
                    const cleared = bg.benefits.map(b => ({
                        ...b,
                        selected: false,
                        className: 'benefit-box'
                    }));
                    return { ...bg, benefits: cleared };
                }

                // เจอกลุ่มที่เรากด
                if (isBenefitInGroup) {
                    if (bg.conditionType === 'AND') {
                        const isAllSelected = bg.benefits.every(b => b.selected);
                        const newSelected = !isAllSelected;
                        const updatedBenefits = bg.benefits.map(b => ({
                            ...b,
                            selected: newSelected,
                            className: newSelected ? 'benefit-box selected' : 'benefit-box'
                        }));
                        return { ...bg, benefits: updatedBenefits };
                    } else { // OR
                        const isAlreadySelected = bg.benefits.find(b => b.Id === benefitId)?.selected;
                        const updatedBenefits = bg.benefits.map(b => {
                            if (b.Id === benefitId) {
                                const newSelected = !isAlreadySelected;
                                return {
                                    ...b,
                                    selected: newSelected,
                                    className: newSelected ? 'benefit-box selected' : 'benefit-box'
                                };
                            }
                            return {
                                ...b,
                                selected: false,
                                className: 'benefit-box'
                            };
                        });
                        return { ...bg, benefits: updatedBenefits };
                    }
                }

                return bg;
            });

            return {
                ...group,
                groupedBenefits: updatedGrouped
            };
        });

        this.updateSelectedBenefits();
        this.updateFreeProductPromotion();  
    }


    updateSelectedBenefits() {
        this.selectedBenefits = [];
        this.comboGroups = this.comboGroups.map(group => {
            // เก็บ benefit ที่เลือก
            const hasSelectedBenefit = group.groupedBenefits.some(bg =>
                bg.benefits.some(b => b.selected)
            );

            // เก็บ selected benefit ลง array
            group.groupedBenefits.forEach(bg => {
                bg.benefits.forEach(b => {
                    if (b.selected) {
                        this.selectedBenefits.push({
                            productPriceBook: b.INID_Product_Price_Book__c,
                            promotionId: group.promotionId,
                            benefitId: b.Id,
                            benefitType: b.benefitType,
                            value: {
                                discountAmount: b.discountAmount,
                                discountPercent: b.discountPercent,
                                freeProductQuantityFix: b.freeProductQuantityFix,
                                freeProductQuantityRatioNumerator: b.freeProductQuantityRatioNumerator,
                                freeProductQuantityRatioDenominator: b.freeProductQuantityRatioDenominator,
                                setPrice: b.setPrice,
                                batch: b.batch
                            }
                        });
                    }
                });
            });

            return {
                ...group,
                isSelected: hasSelectedBenefit, 
                isExpanded: hasSelectedBenefit || group.isExpanded, 
                arrowSymbol: hasSelectedBenefit || group.isExpanded
                    ? 'fa-solid fa-circle-chevron-up'
                    : 'fa-solid fa-circle-chevron-down',
                arrowIconClass: hasSelectedBenefit || group.isExpanded
                    ? 'fa-solid fa-circle-chevron-up'
                    : 'fa-solid fa-circle-chevron-down',
                className: hasSelectedBenefit ? 'promotion-box selected' : 'promotion-box'
            };
        });
    }

    updateFreeProductPromotion() {
        this.freeProductPromotion = [];

        this.comboGroups.forEach(promoGroup => {
            promoGroup.groupedBenefits.forEach(group => {
                group.benefits.forEach(benefit => {
                    const isSelected = benefit.selected === true;
                    const isFreeProduct = benefit.benefitType === 'Free Product (Fix Quantity)';
                    const isRatio = benefit.benefitType === 'Free Product (Ratio)';

                    if (isSelected && (isFreeProduct || isRatio)) {
                        const [materialCode = '', skuDescription = ''] =
                            (benefit.freeProductLabelFix || '').split(' - ');

                        const freeProductObj = {
                            productPriceBookId: benefit.BenefitProduct,
                            materialCode,
                            skuDescription,
                            benefitType: benefit.benefitType,
                            fixQty: isFreeProduct ? (benefit.freeProductQuantityFix || null) : null,
                            ratioNumerator: isRatio ? (benefit.freeProductQuantityRatioNumerator || null) : null,
                            ratioDenominator: isRatio ? (benefit.freeProductQuantityRatioDenominator || null) : null,
                            promotionId: promoGroup.promotionId,
                            promotionName: promoGroup.promotionName,

                        };
                        console.log('Selected Free Product:', JSON.stringify(freeProductObj, null, 2));
                        this.freeProductPromotion.push(freeProductObj);
                    }
                });
            });
        });
    }

    handleBack() {
        this.isShowApplyPromotion = false ;
        this.isShowOrderLineItem = true ;
        this.isLoaded = false ;
    }

    backtoProduct() {
        this.isShowApplyPromotion = false;
        this.isShowOrderLineItem = true;
        this.isLoaded = false ;
    }


    backToApply() {
        this.isShowApplyPromotion = true;
        this.isShowSummary = false;
        this.isShowOrderLineItem = false;
        this.isLoaded = false;
    }


    // start summary
    summaryColumns = [
        // { label: 'Material Code', fieldName: 'code', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 150 },
        { label: 'Name', fieldName: 'name', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 150 },
        { label: 'SKU Description', fieldName: 'description', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 200 },
        { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true , cellAttributes: { alignment: 'right' } , initialWidth: 300 },
        { label: 'Quantity', fieldName: 'quantity', type: 'number', hideDefaultActions: true, cellAttributes: { alignment: 'right' } },
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true ,cellAttributes: { alignment: 'right' } , initialWidth: 130},
        { label: 'Unit', fieldName: 'unit', type: 'text', cellAttributes: { alignment: 'right' } , hideDefaultActions: true  , initialWidth: 100 },
        { label: 'Total', fieldName: 'total', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 120},
        { label: 'Remark', fieldName: 'addOnText', type: 'text', cellAttributes: { alignment: 'right' } , initialWidth: 150 , hideDefaultActions: true },
        { label: 'Net Price', fieldName: 'netPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true , initialWidth: 110 }
    ];

    columnPromotionsTitle = [
       { label: 'Promotion ', fieldName: 'promotionName' ,hideDefaultActions: true },
       { label: 'Descirption ', fieldName: 'promotionDescription' ,hideDefaultActions: true },
    ];

    getColumnsByType(type) {
        if (type === 'Free Product (Fix Quantity)') {
            return [
                // { label: 'Material Code', fieldName: 'promotionMaterialCode', hideDefaultActions: true },
                { label: 'Name', fieldName: 'name', hideDefaultActions: true },
                { label: 'SKU Description', fieldName: 'promotionDescription', hideDefaultActions: true },
                { label: 'Unit', fieldName: 'unit', hideDefaultActions: true },
                { label: 'Quantity', fieldName: 'freeProductQuantity', hideDefaultActions: true },
            ];
        } else if (type === 'Discount Amount') {
            return [
                { label: 'Discount Type', fieldName: 'discountType', hideDefaultActions: true },
                { label: 'Total(AMOUNT/PERCENT)', fieldName: 'discountAmount', hideDefaultActions: true }
            ];
        } else if (type === 'Set Price') {
            return [
                // { label: 'Material Code', fieldName: 'promotionMaterialCode', hideDefaultActions: true },
                { label: 'Name', fieldName: 'name', hideDefaultActions: true },
                { label: 'SKU Description', fieldName: 'promotionDescription', hideDefaultActions: true } ,
                { label: 'Sales Price', fieldName: 'setPrice', hideDefaultActions: true } ,
                { label: 'Unit', fieldName: 'unit', hideDefaultActions: true },
            ];
        } else if (type === 'Free Product (Ratio)') {
            return [
                // { label: 'Material Code', fieldName: 'promotionMaterialCode', hideDefaultActions: true },
                { label: 'Name', fieldName: 'name', hideDefaultActions: true },
                { label: 'SKU Description', fieldName: 'promotionDescription', hideDefaultActions: true } ,
                { label: 'Unit', fieldName: 'unit', hideDefaultActions: true },
                { label: 'Numerator', fieldName: 'numerator', hideDefaultActions: true },
                { label: 'Denominator', fieldName: 'denomiator', hideDefaultActions: true },
                { label: 'summaryProduct', fieldName: 'summaryProduct', hideDefaultActions: true },
            ];
        } else {
            return [
                { label: 'Discount Type', fieldName: 'discountType', hideDefaultActions: true },
                { label: 'Total(AMOUNT/PERCENT)', fieldName: 'discountPercent', hideDefaultActions: true }
            ];
        }
    }


    showSummary() {
        this.isShowOrder = false;
        this.isShowSummary = true;
        this.isShowApplyPromotion = false;
        this.summaryProducts = [];
        this.promotionData = []; 
        this.selectedPromotion = []; 
        this.isLoaded = false;

        const mainProducts = this.selectedProducts.filter(p => p.nameBtn === '+');

        mainProducts.forEach(main => {
            const relatedAddons = this.selectedProducts.filter(
                p => p.code === main.code && p.isAddOn
            );

            const mainQty = Number(main.quantity || 0);
            const mainTotal = Number(main.total || (main.unitPrice * mainQty) || 0);
            const addonQtySum = relatedAddons.reduce((sum, a) => sum + Number(a.quantity || 0), 0);
            const addonTotalSum = relatedAddons.reduce((sum, a) => sum + Number(a.total || 0), 0);
            const totalQty = mainQty + addonQtySum;
            const totalSum = mainTotal + addonTotalSum;
            const netPrice = totalQty > 0 ? (totalSum / totalQty).toFixed(2) : '0.00';

            this.summaryProducts.push({
                ...main,
                netPrice,
                addOnText: null
            });

            if (!this.selectedPromotion.some(p => p.id === main.id)) {
                this.selectedPromotion.push({ ...main });
            }

            relatedAddons.forEach(addon => {
                this.summaryProducts.push({
                    ...addon,
                    addOnText: addon.nameBtn
                });
            });
        });

        const focAddons = this.summaryProducts.filter(p => p.addOnText === 'ของแถมนอกบิล (FOC)');
        const focList = focAddons.map(foc => {
            const main = this.summaryProducts.find(mp => !mp.addOnText && mp.code === foc.productCode);
            return { focProduct: foc };
        });

        const focTotal = focList.reduce((sum, item) => {
            return sum + (item.focProduct.total || 0); // ถ้า field เป็นชื่ออื่น เช่น price * quantity แก้ตรงนี้
        }, 0);

        console.log(`ราคารวมเฉลี่ยสุทธิของ FOC ทั้งหมด: ${focTotal.toFixed(2)} บาท`);
        this.totalFocPrice = focTotal;

        this.focProducts = focList;
        const selectedPromotions = this.comboGroups.filter(group => group.isSelected);
        selectedPromotions.forEach(group => {
            const selectedBenefits = group.groupedBenefits
                .flatMap(gb => gb.benefits)
                .filter(b => b.selected);

            let targetGroup = this.promotionData.find(p => p.promotionName === group.promotionName);
            if (!targetGroup) {
                targetGroup = {
                    id: group.promotionId || group.id,
                    promotionName: group.promotionName,
                    promotionDescription: group.promotionDescript,
                    benefits: []
                };
                this.promotionData.push(targetGroup);
            }

            console.log('selectedBenefits:' + JSON.stringify(selectedBenefits , null , 2))

            selectedBenefits.forEach(b => {
                const type = b.INID_Benefit_Type__c;
                const columnKey = JSON.stringify(this.getColumnsByType(type));

                let existingBenefitGroup = targetGroup.benefits.find(bg =>
                    JSON.stringify(bg.columns) === columnKey
                );

                if (!existingBenefitGroup) {
                    existingBenefitGroup = {
                        id: b.Id,
                        columns: this.getColumnsByType(type),
                        data: []
                    };
                    targetGroup.benefits.push(existingBenefitGroup);
                }



                const matchedMainProduct = this.mainProductMatched.find(p => this.mainProductPromotionId.includes(p.id));
                const mainQty = matchedMainProduct ? matchedMainProduct.quantity : 0;
                const numerator = b.INID_Free_Product_Quantity_Numerator__c || 1;
                const denominator = b.INID_Free_Product_Quantity_Denominator__c || 0;

                // console.log('matchedMainProduct:' + JSON.stringify(matchedMainProduct , null , 2));
                // console.log('mainQty:' + JSON.stringify(mainQty , null , 2));
                // console.log('numerator:' + JSON.stringify(numerator , null , 2));
                // console.log('denominator:' + JSON.stringify(denominator , null , 2));

                let devide = 0;                
                if (mainQty >= numerator) {
                    devide = (mainQty / numerator);
                    if (devide % 1 < 0.5) {
                        devide = Math.floor(devide);
                    } else {
                        devide = Math.ceil(devide);
                    }
                } else {
                    devide = 0;
                }

                const summaryProduct = devide * denominator;
                this.summaryRatioProduct = summaryProduct ;

                existingBenefitGroup.data.push({
                    promotionMaterialCode: b.INID_Product_Price_Book__r?.INID_Material_Code__c || '',
                    promotionDescription: b.INID_Product_Price_Book__r?.INID_SKU_Description__c || '',
                    unit: b.INID_Product_Price_Book__r?.INID_Unit__c || '-',
                    numerator: b.INID_Free_Product_Quantity_Numerator__c,
                    denomiator: b.INID_Free_Product_Quantity_Denominator__c,
                    freeProductQuantity: b.INID_Free_Product_Quantity_Fix__c,
                    discountAmount: b.INID_Discount_Amount__c, 
                    discountType: type,
                    discountPercent: b.INID_Discount__c,
                    setPrice: b.INID_SetPrice__c,
                    summaryProduct:summaryProduct ,
                });
            });
        });

        const totalNetPrice = this.summaryProducts
            .filter(p => !p.addOnText)
            .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
        
        this.totalNetPrice = totalNetPrice ;


        const selectedPromotionsCount = this.comboGroups.filter(g => g.isSelected).length;
        if (selectedPromotionsCount < 1) {
            this.titleSummary = '';
        } else {
            this.titleSummary = 'Promotion Summary';
        }
    }


    get promoList() {
        const result = this.promotionData.map(p => ({
            ...p,
            rowWrapper: [{
                id: p.id,
                promotionName: p.promotionName,
                promotionDescription: p.promotionDescription
            }]
        }));
        return result;
    }



}