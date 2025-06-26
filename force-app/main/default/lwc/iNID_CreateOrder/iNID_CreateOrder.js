import { LightningElement, track, wire , api} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { NavigationMixin } from 'lightning/navigation';
import { IsConsoleNavigation, getFocusedTabInfo, closeTab } from 'lightning/platformWorkspaceApi';
import fetchCustomers from '@salesforce/apex/INID_OrderController.fetchCustomers';
import fetchAccountChannel from '@salesforce/apex/INID_OrderController.fetchAccountChannel';
import fetchDataBillto from '@salesforce/apex/INID_OrderController.fetchDataBillto';
import fetchDataShipto from '@salesforce/apex/INID_OrderController.fetchDataShipto';
import fetchQuoteItemById from '@salesforce/apex/INID_OrderController.fetchQuoteItemById'
import fetchDataQuotation from '@salesforce/apex/INID_OrderController.fetchDataQuotation' ;
import insertOrderSalePromotion from '@salesforce/apex/INID_OrderController.insertOrderSalePromotion'
import insertOrder from '@salesforce/apex/INID_OrderController.insertOrder';
import insertOrderItem from '@salesforce/apex/INID_OrderController.insertOrderItem'
import PAYMENT_TYPE_FIELD from '@salesforce/schema/Account.Payment_type__c';
import PAYMENT_TERM_FIELD from '@salesforce/schema/Account.Payment_term__c';
import INID_Organization__c from '@salesforce/schema/Account.INID_Organization__c';
import ACCOUNT_ID from '@salesforce/schema/Account.Id';
import LightningConfirm from 'lightning/confirm';
import getPromotion from '@salesforce/apex/INID_getPromotionController.getPromotions';
import fetchOrderFocId from '@salesforce/apex/INID_OrderController.fetchOrderFocId'
import insertOrderFocById from '@salesforce/apex/INID_OrderController.insertOrderFocById'
import fetchUserGroup from '@salesforce/apex/INID_OrderController.fetchUserGroup'
import fetchBuGroupId from '@salesforce/apex/INID_OrderController.fetchBuGroupId'
import fetchProductsByBuGroups from '@salesforce/apex/INID_OrderController.fetchProductsByBuGroups'
import insertOrderItemFoc from '@salesforce/apex/INID_OrderController.insertOrderItemFoc'
import fetchAddonProductPriceBook from '@salesforce/apex/INID_OrderController.fetchAddonProductPriceBook'
import fetchAccountLicense from '@salesforce/apex/INID_OrderController.fetchAccountLicense'
import fetchClassifyLicense from '@salesforce/apex/INID_OrderController.fetchClassifyLicense' ;
import fetchClassifyProduct from '@salesforce/apex/INID_OrderController.fetchClassifyProduct' ;
import fetchProductLicenseExclude from '@salesforce/apex/INID_OrderController.fetchProductLicenseExclude' ;
import fetchClassifyType from '@salesforce/apex/INID_OrderController.fetchClassifyType' ;
import fetchAverage from '@salesforce/apex/INID_OrderController.fetchAverage' ;
import fetchAccountDetail from '@salesforce/apex/INID_OrderController.fetchAccountDetail' ;
import getProvinces from '@salesforce/apex/INID_OrderController.getProvinces' ;
import FONT_AWESOME from '@salesforce/resourceUrl/fontawesome';
import { loadStyle } from 'lightning/platformResourceLoader';
import USER_ID from '@salesforce/user/Id';

export default class INID_CreateOrder extends NavigationMixin(LightningElement) {
    
    @api recordId ;
    @track filteredCustomerOptions = [];
    @track searchTerm = '';
    @track searchTermQuote = '' ;
    @track showDropdown = false;
    @track customerId = ''
    @track paymentTypeValue = '';
    @track paymentTermValue = '';
    @track organizationValue = '';
    @track billto = '';
    @track shipto = '';
    @track accounts = [];
    @track quotation = [];
    @track filteredQuotation = [];
    @track showDropdownQuote = false;
    @track shiptoOptions = []; 
    @track productPriceBook = [] ;
    @track purchaseOrderNumber = '';
    @track noteAgent = '';
    @track noteInternal = '';
    @track radioCheckedValue = [];
    @track draftValues = [];
    @track selectedRowIds = [];
    @track isPopupOpenFreeGood = false;
    @track selectedValue = '';
    @track selectedLabel = '';
    @track currentMaterialCodeForAddOn = '';
    @track selectedProducts = [];
    @track filteredProductOptions = [];
    @track showProductDropdown = false;
    @track searchProductTerm = '';
    @track productPriceBook = [];
    @track addonSelections = [];
    @track filteredProductOptionsAddOn = [];
    @track showProductDropdownAddOn = false;
    @track searchProductTermAddOn = '';
    @track selectedProductsAddOn = [];
    @track selectedAddOnProduct;    
    @track enteredProductCodes = [];
    @track textareaValue = '';
    @track isShowAddfromText = false ;
    @track hlNumber = 0 ;
    @track radioButtonOrderLabel1 ='Exclude Vat'
    @track radioButtonOrderLabel2 ='Include Vat'
    @track isShowAddProduct = false ;
    @track globalQuoteId ;
    @track quoteItemValue = [] ;
    @track accountId;
    @track orderId ;
    @track buGroupbyId;
    @track buGroupId;
    @track userId = USER_ID;
    @track productBuIds;
    @track orderFocId ;
    @track orderFocById;
    @track addonProductPriceBook = [] ;
    @track userGroup ;
    @track buGroupData ;
    @track productsByBuGroups = [] ;
    @track productBuGroupId = [] ;
    @track allBU ;
    @track accountLicenseData = [] ;
    @track accountLicense ;
    @track productLicenseData = [] ;
    @track productLicense ;
    @track accountLicenseId = [] ;
    @track licenseExcludeData = [] ;
    @track productLicenseExclude = [] ;
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
    @track accountDetail = [] ;
    @track productAverage = [] ;
    @track totalFocPrice ;
    @track accountName = '' ;
    @track raidoExclude = false ;
    @track raidoInclude = false ;
    @track billToAddress1 = '';
    @track billToAddress2 = '';
    @track billToStreet = '';
    @track billToCity = '';
    @track billToProvince = '';
    @track billToPostCode = '';
    @track shipToAddress1 = '';
    @track shipToAddress2 = '';
    @track shipToStreet = '';
    @track shipToCity = '';
    @track shipToProvince = '';
    @track shipToPostCode = '';
    @track provinceBillToOptions = [] ;
    @track provinceShipToOptions = [];


  
    columns = [
        { label: 'Material Code', fieldName: 'code', type: 'text', hideDefaultActions: true ,  cellAttributes: { alignment: 'right' }, initialWidth: 170},
        { label: 'SKU Description', fieldName: 'description', type: 'text', hideDefaultActions: true , cellAttributes: { alignment: 'right' }, initialWidth: 250}, 
        { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency' , typeAttributes: {minimumFractionDigits: 2}, hideDefaultActions: true, cellAttributes: { alignment: 'right', }, initialWidth: 140},
        { label: 'Quantity', fieldName: 'quantity', type: 'text', editable: true, hideDefaultActions: true , cellAttributes: { alignment: 'right' } , initialWidth: 100}, 
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency' , typeAttributes: {minimumFractionDigits: 2}, editable: {fieldName : 'editableSalePrice'} , hideDefaultActions: true ,  cellAttributes: { alignment: 'center'} , initialWidth: 175},
        { label: 'Unit', fieldName: 'unit', type: 'text', hideDefaultActions: true ,  cellAttributes: { alignment: 'right' } , initialWidth: 100 },
        { label: 'Total', fieldName: 'total', type: 'currency' , typeAttributes: {minimumFractionDigits: 2}, hideDefaultActions: true ,  cellAttributes: { alignment: 'right' } },
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
            }
        }
    ];




    @wire(fetchAccountLicense , {accountId: '$accountId'})
    wiredFetchAccountLicense({error , data}) {
        if(data) {
            this.accountLicenseData = data ;
            this.accountLicenseId = this.accountLicenseData.map(accLicenseId => accLicenseId.Id) ;
            this.accountLicense = this.accountLicenseData.map(acc => acc.INID_License__c);
            console.log('account License : ' + JSON.stringify(this.accountLicense , null ,2)) ;
        } else {
            console.log(error) ;
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

    //closeTab
    @wire(IsConsoleNavigation) isConsoleNavigation;
    async closeTab() {
        if (!this.isConsoleNavigation) {
            return;
        }
        const { tabId } = await getFocusedTabInfo();
        await closeTab(tabId);
    }

    //fetchQuoteItemById
    @wire(fetchQuoteItemById , { quoteId: '$globalQuoteId' })
    wiredQuoteItemById({ error, data }) {
    // alert('recordId:' + this.globalQuoteId)
         if(data) {
            this.quoteItemValue = data ;
            this.selectedProducts = this.quoteItemValue.map((productItem) => {
                return{
                    rowKey: productItem.Id,
                    // recordId: productItem.Id,a
                    id: productItem.INID_Product_Price_Book__r.Id,
                    code: productItem.INID_Material_Code__c ,
                    description: productItem.INID_SKU_Description__c ,
                    unitPrice: productItem.INID_Product_Price_Book__r.INID_Unit_Price__c ,
                    quantity: productItem.INID_Quantity__c ,
                    salePrice: productItem.INID_Sale_Price__c ,
                    unit: productItem.INID_Product_Price_Book__r.INID_Unit__c ,
                    productPriceBookId: productItem.INID_Product_Price_Book__c,
                    total: productItem.INID_Total__c ,
                    nameBtn: '+' ,
                    variant: 'brand' ,
                    editableSalePrice : true 
                }
            })
        }else {
            console.log(error);
        }
    }

    //fetch Customer
    @wire(fetchCustomers)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data;
        } else if (error) {
            console.error('Error fetching Customer:', error);
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
            console.error('Error fetching account channel :', error);
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

            // ✅ ดึง INID_Classify__c ไม่ซ้ำ
            this.classifyLicenseId = [...new Set(
                this.classifyLicense.map(record => record.INID_Classify__c)
            )];

            console.log('📌 classify license Id:', JSON.stringify(this.classifyLicenseId , null , 2));
            console.log('✅ Clean classifyLicense:', JSON.stringify(this.classifyLicense, null, 2));

            if (this.classifyLicenseId.length > 0) {
                fetchClassifyType({ classifyId: this.classifyLicenseId })
                    .then(result => {
                        this.classifyType = result;
                        console.log('✅ classify type:', JSON.stringify(this.classifyType, null, 2));

                        this.summaryClassify = [];

                        // 🔄 Map: ClassifyId → requireLicense
                        const requireMap = {};
                        this.classifyType.forEach(item => {
                            requireMap[item.Id] = item.INID_Require_License__c;
                        });

                        // ✅ จัดกลุ่ม license ตาม classify/group
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

                        // ✅ ประมวลผลแต่ละ classify
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

                            // ✅ แสดง log
                            console.log(`👉 Classify: ${classify}`);
                            console.log(`   🔧 ต้องตรวจ license? : ${requireLicense}`);
                            console.log(`   📌 License ของ Account: ${JSON.stringify(this.accountLicense)}`);
                            console.log(`   📌 License ของ Classify: ${JSON.stringify(allLicenses)}`);

                            if (groupNumbers.length === 1) {
                                const groupLicenses = groups[groupNumbers[0]].map(r => r.INID_License__c);
                                console.log(`   กลุ่มเลข: ${groupNumbers[0]} License ที่ต้องมีครบ: ${JSON.stringify(groupLicenses)}`);
                            } else {
                                console.log(`   กลุ่มทั้งหมดและ license ในแต่ละกลุ่ม:`);
                                groupNumbers.forEach(groupNo => {
                                    const groupLicenses = groups[groupNo].map(r => r.INID_License__c);
                                    console.log(`      - กลุ่ม ${groupNo}: ${JSON.stringify(groupLicenses)}`);
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

    // fetch Auto Field Ship To 
    fetchShipto(accountId) {
    fetchDataShipto({ accountId: accountId })
        .then(data => {
            if (data && data.length > 0) {
                this.shiptoOptions = data.map(addr => ({
                    label: addr.Name,
                    value: addr.Id
                }));
                this.shipto = data[0].Id;
            } else {
                this.shiptoOptions = [];
                this.shipto = '';
            }
        })
        .catch(error => {
            console.error('Error fetching Ship To:', error);
        });
    }

    
    // fetchDataQuotation
    @wire(fetchDataQuotation)
    wiredQuotation({ error, data }) {
        if (data) {
            this.quotation = data;
        } else if (error) {
            console.error('Error fetching quote:', error);
        }
    }

    @wire(fetchAddonProductPriceBook , {accountId: '$accountId'})
    wireaddonProductPriceBook({error, data}) {
        if(data){
            this.addonProductPriceBook = data;
            // console.log('this Addon Product Price Books '+ JSON.stringify(this.addonProductPriceBook , null ,2));
        }else if(error){
            console.log(' error fetch addonProductPriceBook : ', error)
        }
            
    }

    // fetch Auto Field Bill To
    // @wire(fetchDataBillto)
    // fetchBillTo(accountId) {
    // fetchDataBillto({ accountId: accountId }) 
    //     .then(data => {
    //         if (data && data.length > 0) {
    //             this.billto = data[0].Name;
    //         } else {
    //             this.billto = '';
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error fetching Bill To:', error);
    //     });
    // }
    

    // @wire(fetchShipto, { accountId: '$accountId' }) 
    // fetchetchShipto({ error, data }) {
    //     if (data) {
    //         this.billto = data;
    //         // เอาเฉพาะ Name แล้ว join เป็น string
    //         this.billto = this.billto.map(billto => billto.Name).join(', ');

    //         console.log('Bill to:', this.billto);
    //     } else if (error) {
    //         console.error('Error Bill to', error);
    //     }
    // }

    @wire(fetchDataBillto, { accountId: '$accountId' }) 
    fetchBillTo({ error, data }) {
        if (data) {
            this.billto = data;
            // เอาเฉพาะ Name แล้ว join เป็น string
            this.billto = this.billto.map(billto => billto.Name).join(', ');

            console.log('Bill to:', this.billto);
        } else if (error) {
            console.error('Error Bill to', error);
        }
    }

    @wire(fetchUserGroup, {userId: '$userId'})
    wiredUserGroup({ error, data }) {
        if (data) {
            this.userGroup = data;
            console.log('user Group ??? : ' + JSON.stringify(this.userGroup, null, 2) );
        } else if (error) {
            console.error('Error fetching user gruop ', error);
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
            console.log('All BU Gruop : ' + typeof(this.allBU));
        } else if (error) {
            console.error('Error fetching bu group:', error);
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
            console.error('Error fetching product bu:', error);
        }
    }

    @wire(fetchAverage, {accountId: '$accountId'})
    wiredAverge({ error, data }) {
        if (data) {
            this.productAverage = data;

            console.log('productAverage: ' + JSON.stringify(this.productAverage, null, 2) );
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }


    @wire(getRecord, {
        recordId: "$recordId",
        fields: [ACCOUNT_ID , PAYMENT_TYPE_FIELD, PAYMENT_TERM_FIELD, INID_Organization__c]
    })
    fetchOrder({ error, data }) {
        if (data) {
            const fetchAccountId = getFieldValue(data , ACCOUNT_ID) ;
            const fetchedPaymentType = getFieldValue(data, PAYMENT_TYPE_FIELD);
            const fetchedPaymentTerm = getFieldValue(data, PAYMENT_TERM_FIELD);
            const fetchedOrganization = getFieldValue(data, INID_Organization__c);

            const isValidPaymentType = this.paymentTypeOption.some(opt => opt.value === fetchedPaymentType);
            this.paymentTypeValue = isValidPaymentType ? fetchedPaymentType : '';

            const isValidPaymentTerm = this.paymentTermOption.some(opt => opt.value === fetchedPaymentTerm);
            this.paymentTermValue = isValidPaymentTerm ? fetchedPaymentTerm : '';

            const isValidOrganization = this.organizationOption.some(opt => opt.value === fetchedOrganization);
            this.organizationValue = isValidOrganization ? fetchedOrganization : '';
        } else {
            console.log(error);
        }
    }

    @wire(fetchAccountDetail , {accountId: '$accountId'})
    wiredFetchAccountDetail({error , data}) {
        if(data) {
            this.accountDetail = data ;
            this.accountName = this.accountDetail[0]?.Name || '';
            console.log('accountDetail:' + JSON.stringify(this.accountDetail,null,2));
            console.log('account name :' + JSON.stringify(this.accountName , null ,2));
        } else if(error) {
            console.log('have error:' + error) ;
        }
    }
 
    @wire(getProvinces)
    wiredGetProvinces({error , data}) {
        if (data) {
            this.provinceBillToOptions = data.map(item => ({
                label: item.label,
                value: item.value
            }));

            this.provinceShipToOptions = data.map(item => ({
                label: item.label,
                value: item.value
            }));

            console.log('get province:' + JSON.stringify(this.provinceBillToOptions, null , 2)) ;
        } else if(error) {
            console.log('error province :' + JSON.stringify(error , null  ,2));
        }
    }

    handleBillToProvinceChange(event) {
        this.billToProvince = event.detail.value;
    }

    handleShipToProvinceChange(event) {
        this.shipToProvince = event.detail.value;
    }

    
    get billToCodes() {
        return this.addressRecords?.data?.map(addr => addr.INID_Bill_To_Code__c) || [];
    }

    get organizationOption() {
        return [
            { value: '1001-MEDLINE', label: '1001-MEDLINE' },
            { value: '2001-UNISON', label: '2001-UNISON' },
            { value: '3001-F.C.P.', label: '3001-F.C.P.' }
        ];
    }

    get paymentTypeOption() {
        return [
            { value: 'Cash', label: 'Cash' },
            { value: 'Credit', label: 'Credit' }
        ];
    }

    get options() {
        return [
            { value: '1', label: 'Include VAT' },
            { value: '2', label: 'Exclude VAT' }
        ];
    }

    get paymentTermOption() {
        return [
            { value: 'CH40 - CHQ (40% UPON CONFIRMATION ORDER AND 60% 90D)', label: 'CH40 - CHQ (40% UPON CONFIRMATION ORDER AND 60% 90D)' },
            { value: 'CH50 - CHQ (50% UPON CONFIRMATION ORDER AND 50% 90D)', label: 'CH50 - CHQ (50% UPON CONFIRMATION ORDER AND 50% 90D)' },
            { value: 'N000 - Immediately', label: 'N000 - Immediately' },
            { value: 'N001 - Within 1 Day Due Net', label: 'N001 - Within 1 Day Due Net' },
            { value: 'N004 - Within 4 Days Due Net', label: 'N004 - Within 4 Days Due Net' },
            { value: 'N005 - Within 5 Days Due Net', label: 'N005 - Within 5 Days Due Net' },
            { value: 'N007 - Within 7 Days Due Net', label: 'N007 - Within 7 Days Due Net' },
            { value: 'N010 - Within 10 Days Due Net', label: 'N010 - Within 10 Days Due Net' },
            { value: 'N012 - Within 12 Days Due Net', label: 'N012 - Within 12 Days Due Net' },
            { value: 'N015 - Within 15 Days Due Net', label: 'N015 - Within 15 Days Due Net' },
            { value: 'N017 - Within 17 Days Due Net', label: 'N017 - Within 17 Days Due Net' },
            { value: 'N020 - Within 20 Days Due Net', label: 'N020 - Within 20 Days Due Net' },
            { value: 'N021 - Within 21 Days Due Net', label: 'N021 - Within 21 Days Due Net' },
            { value: 'N025 - Within 25 Days Due Net', label: 'N025 - Within 25 Days Due Net' },
            { value: 'N030 - Within 30 Days Due Net', label: 'N030 - Within 30 Days Due Net' },
            { value: 'Within 35 Days Due Net', label: 'N035 - Within 35 Days Due Net' },
            { value: 'N040 - Within 40 Days Due Net', label: 'N040 - Within 40 Days Due Net' },
            { value: 'N045 - Within 45 Days Due Net', label: 'N045 - Within 45 Days Due Net' },
            { value: 'N050 - Within 50 Days Due Net', label: 'N050 - Within 50 Days Due Net' },
            { value: 'N060 - Within 60 Days Due Net', label: 'N060 - Within 60 Days Due Net' },
            { value: 'N063 - Within 63 Days Due Net', label: 'N063 - Within 63 Days Due Net' },
            { value: 'N090 - Within 90 Days Due Net', label: 'N090 - Within 90 Days Due Net' },
            { value: 'N120 - Within 120 Days Due Net', label: 'N120 - Within 120 Days Due Net' },
            { value: 'N180 - Within 180 Days Due Net', label: 'N180 - Within 180 Days Due Net' },
            { value: 'N210 - Within 210 Days Due Net', label: 'N210 - Within 210 Days Due Net' },
            { value: 'V014 - Within 14 days Disc 2%', label: 'V014 - Within 14 days Disc 2%' },
            { value: 'ZB01 - Within 14 days Disc 3%, 30/2% due 45 day', label: 'ZB01 - Within 14 days Disc 3%, 30/2% due 45 day' },
            { value: 'ZB02 - Within 8 days Disc 5%, 14/2% due 21 day', label: 'ZB02 - Within 8 days Disc 5%, 14/2% due 21 day' },
            { value: 'ZB03 - Within 20 days Disc 2% due 30 day', label: 'ZB03 - Within 20 days Disc 2% due 30 day' },
            { value: 'Within 10 days Disc 4%, 20/2% due 30 day', label: 'ZB04 - Within 10 days Disc 4%, 20/2% due 30 day' },
            { value: 'ZB05 - Within 5 days Disc 2% due 10 day', label: 'ZB05 - Within 5 days Disc 2% due 10 day' }
        ];
    }

     handleBillToAddress1Change(event) {
        this.billToAddress1 = event.target.value;
    }

    handleBillToAddress2Change(event) {
        this.billToAddress2 = event.target.value;
    }

    handleBillToStreetChange(event) {
        this.billToStreet = event.target.value;
    }

    handleBillToCityChange(event) {
        this.billToCity = event.target.value;
    }

    handleBillToProvinceChange(event) {
        this.billToProvince = event.target.value;
    }

    handleBillToPostCodeChange(event) {
        this.billToPostCode = event.target.value;
    }

    handleShipToAddress1Change(event) {
        this.shipToAddress1 = event.target.value;
    }

    handleShipToAddress2Change(event) {
        this.shipToAddress2 = event.target.value;
    }

    handleShipToStreetChange(event) {
        this.shipToStreet = event.target.value;
    }

    handleShipToCityChange(event) {
        this.shipToCity = event.target.value;
    }

    handleShipToProvinceChange(event) {
        this.shipToProvince = event.target.value;
    }

    handleShipToPostCodeChange(event) {
        this.shipToPostCode = event.target.value;
    }

    billtoHandleChange(event) {
        this.billto = event.target.value;
    }
    
    handleInput(event) {
        const input = event.target.value;
        const term = input.toLowerCase().trim();
        this.searchTerm = input;
        
        if (term.length > 2) {
            this.filteredCustomerOptions = this.accounts.filter(cust =>
                (cust.Name && cust.Name.toLowerCase().includes(term)) ||
                (cust.INID_Customer_Code__c && cust.INID_Customer_Code__c.toLowerCase().includes(term))
            );
            this.showDropdown = this.filteredCustomerOptions.length > 0;
        } else {
            this.filteredCustomerOptions = [];
            this.showDropdown = false;
        }
    }

    handleSelectCustomer(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name;
        const selectedCode = event.currentTarget.dataset.code; 
        this.customerId = selectedId;
        this.accountId = selectedId;
        this.searchTerm = `${selectedCode} ${selectedName}`;
        this.showDropdown = false;
        this.recordId = selectedId;
        this.fetchBillTo(selectedId);
        this.fetchShipto(selectedId);
    }


    handleInputQuote(event) {
        const input = event.target.value;
        const term = input.toLowerCase().trim();
        this.searchTermQuote = input;

        if (term.length > 2) {
            this.filteredQuotation = this.quotation.filter(q =>
                (q.Name && q.Name.toLowerCase().includes(term)) ||
                (q.QuoteNumber && q.QuoteNumber.toLowerCase().includes(term))
            );
            this.showDropdownQuote = this.filteredQuotation.length > 0;
        } else {
            this.filteredQuotation = [];
            this.showDropdownQuote = false; 
        }
    }

    handleSelectQuote(event) {
        const quoteId = event.currentTarget.dataset.id;
        this.globalQuoteId = quoteId ;
        const selectedQuote = this.quotation.find(q => q.Id === quoteId);

        if (selectedQuote && selectedQuote.Account) {
            this.accountId = selectedQuote.AccountId;
            this.searchTerm = `${selectedQuote.Account.INID_Customer_Code__c} ${selectedQuote.Account.Name}`;
            this.paymentTypeValue = selectedQuote.Account.Payment_type__c || '';
            this.paymentTermValue = selectedQuote.Account.Payment_term__c || '';
            this.organizationValue = selectedQuote.Account.INID_Organization__c || '';
            this.fetchBillTo(selectedQuote.AccountId);
            this.fetchShipto(selectedQuote.AccountId);
        }
        this.searchTermQuote = `${selectedQuote.QuoteNumber} ${selectedQuote.Name}`;
        this.showDropdownQuote = false;
    }

    handleBlurQuote() {
        setTimeout(() => {
            this.showDropdownQuote = false;
        }, 200); 
    }

    handleBlur() {
        setTimeout(() => {
            this.showDropdown = false;
        }, 200); 
    }

    // handleChangeRadioButton(event) {
    //     const selectedRadioValue = event.target.value;
    //     const isChecked = event.target.checked;
    //     this.radioCheckedValue = isChecked ? [...this.radioCheckedValue, selectedRadioValue] : this.value.filter(val => val !== selectedRadioValue);
    // }

    handleChangeRadioButton1(event) {
        const isChecked = event.target.checked;
        isChecked ? this.raidoExclude = true : this.raidoExclude = false ;
    }

    handleChangeRadioButton2(event) {
        const isChecked = event.target.checked;
        isChecked ? this.raidoInclude = true : this.raidoInclude = false ;
    }

    organizationHandleChange(event) {
        this.organizationValue = event.detail.value;
    }

    paymentTypeHandleChange(event) {
        this.paymentTypeValue = event.detail.value;
    }

    paymentTermHandleChange(event) {
        this.paymentTermValue = event.detail.value;
    }

    billtoHandleChange(event) {
        this.billto = event.detail.value ;
    }

    handleShiptoChange(event) {
        this.shipto = event.detail.value ;
    }

    purchaseOrderNumberHandleChange(event) {
        this.purchaseOrderNumber = event.detail.value;
    }

    noteAgentHandleChange(event) {
        this.noteAgent = event.detail.value ;
    }

    noteInternalHandleChange(event) {
        this.noteInternal = event.detail.value;
    }

    shiptoHandleChange(event) {
        this.shipto = event.detail.value;
    }

    validateOrder() {
        const allInputs = this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea');
        let isValid = true;
        let firstInvalid = null;

        allInputs.forEach(input => {
                if (!input.checkValidity()) {
                    input.reportValidity();

                if (!firstInvalid) {
                    firstInvalid = input;
                }

                isValid = false;
            }
        });

        if (!isValid && firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                firstInvalid.focus();
            }, 300);
        }
        
        return isValid;
    }

    backtoOrder() {
        this.isShowAddProduct = false;
        this.isShowOrder = true;
    }

    getAddonLabel(value) {
        const addonValue = {
            '1': 'ของแถม',
            '2': 'ของแถมนอกบิล (FOC)',
            '3': 'ตัวอย่าง',
            '4': 'บริจาค',
            '5': 'ชดเชย',
            '6': 'สมนาคุณ',
        };
        return addonValue[value] || '-';
    }


    handleSelectProduct(event) {
        try {
            const selectedId = event.currentTarget.dataset.id;
            const selected = this.filteredProductOptions.find(
                p => p?.INID_Product_Price_Book__r?.Id === selectedId
            );
            const isDuplicate = this.selectedProducts.some(
                p => p.id === selected.Id
            );

            console.log('selected is : ' + JSON.stringify(selected, null , 2));

            if (!selected) {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'ไม่พบสินค้า',
                    message: 'ไม่พบสินค้าที่เลือก',
                    variant: 'error'
                }));
                return;
            }

            if (isDuplicate) {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'รายการซ้ำ',
                    message: 'สินค้านี้มีอยู่ในตารางแล้ว',
                    variant: 'warning'
                }));
                return;
            }

            const product = this.mapProduct(selected, [], this.hlNumber);
            this.selectedProducts = [...this.selectedProducts, product];

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
                    productCode: product.code
                };

                const isAddonExists = this.selectedProducts.some(p =>
                    p.code === addonProduct.code &&
                    p.unitPrice === 0 &&
                    p.hlItemNumber === product.hlItemNumber
                );

                console.log('is add on exist : ' + JSON.stringify(isAddonExists , null ,) )

                if (!isAddonExists) {
                    this.selectedProducts = [...this.selectedProducts, addonProduct];
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'เพิ่มของแถมอัตโนมัติ',
                        message: `${addonProduct.code} (${addonProduct.quantity} ${addonProduct.unit})`,
                        variant: 'info'
                    }));
                }

               
            }

             console.log('this select product ใน function select product คือ : ' + JSON.stringify(this.selectedProducts , null ,2 ));

            this.searchProductTerm = '';
            this.showProductDropdown = false;

        } catch (error) {
            console.error(' error from handleSelectProduct:', error);
            console.error('error.message:', error.message);
            console.error(' error.stack:', error.stack);
        }
    }

    mapProduct(source, addedAddons = [], hlNumber) {
        const hasAddon = addedAddons.includes(source.INID_Material_Code__c);
        const productPriceBookId = source.INID_Product_Price_Book__r.Id;
        
        let salePrice = source.INID_Product_Price_Book__r.INID_Unit_Price__c || 0;
        const matchedAverage = this.productAverage?.find(avg => avg.INID_Product_Price_Book__c === productPriceBookId);
        if (matchedAverage) {
            salePrice = matchedAverage.INID_Price__c;
        }

        const quantity = 1;
        const total = salePrice * quantity;
        hlNumber += 1;
        this.hlNumber = hlNumber;

        console.log('source in mapProduct function:', JSON.stringify(source, null, 2));
        console.log('editable by BU group:', this.productBuIds?.has(productPriceBookId));

        let editableSalePrice = false;
        if (this.allBU === "true") {
            editableSalePrice = true;
        } else if (this.productBuIds && this.productBuIds.has(productPriceBookId)) {
            editableSalePrice = true;
        }

        return {
            rowKey: source.Id,
            id: source.Id,
            productPriceBookId: productPriceBookId,
            code: source.INID_Product_Price_Book__r.INID_Material_Code__c,
            description: source.INID_Product_Price_Book__r.INID_SKU_Description__c,
            unitPrice:salePrice,
            quantity,
            salePrice: salePrice,
            unit: source.INID_Product_Price_Book__r.INID_Unit__c || '',
            total,
            nameBtn: '+',
            variant: 'brand',
            editableSalePrice,
            addonDisabled: false,
            hlItemNumber: this.hlNumber
        };
    }


    
    handleSaveAddon() {
        if (!this.selectedValue) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'กรุณาเลือกประเภทของแถม',
                variant: 'error'
            }));
            return;
        }


        const matchedMainIndex = this.selectedProducts.findIndex(
            p => p.code === this.currentMaterialCodeForAddOn && p.nameBtn === '+'
        );

        const matchedMain = this.selectedProducts[matchedMainIndex];
        const addonId = matchedMain.id + '_addon_' + this.selectedValue;
        const alreadyExists = this.selectedProducts.some(p => p.id === addonId);
        if (alreadyExists) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Warning',
                message: 'Add-on นี้ถูกเพิ่มไปแล้ว',
                variant: 'warning'
            }));
            return;
        }

        const addonProduct = {
            rowKey: addonId,
            parentRowKey: matchedMain.id ,
            id: addonId, 
            code: matchedMain.code,
            productCode: matchedMain.code,
            description: matchedMain.description,
            unitPrice: matchedMain.unitPrice,
            salePrice: 0,
            quantity: 1,
            unit: matchedMain.unit,
            total: 0,
            nameBtn: this.getAddonLabel(this.selectedValue),
            variant: 'base',
            editableSalePrice: false,
            hlItemNumber: matchedMain.hlItemNumber || matchedMain.code,
            productPriceBookId: matchedMain.productPriceBookId ,
            mainProductId: matchedMain.rowKey //เอาไว้ match Main
            // addonDisabled: true 
        };

        this.addAddonToProduct(addonProduct);
        this.selectedProducts[matchedMainIndex].addonDisabled = true;

        this.dispatchEvent(new ShowToastEvent({
            title: 'เพิ่ม Add-on สำเร็จ',
            message: `คุณเลือกประเภท: ${this.getAddonLabel(this.selectedValue)}`,
            variant: 'success'
        }));

        this.isPopupOpenFreeGood = false;
        this.selectedValue = '';
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        const isAddon = row.unitPrice === 0;
        
        if(row.nameBtn === '+') {
            this.currentMaterialCodeForAddOn = row.code;
            this.isPopupOpenFreeGood = true;
        }
    }

    addAddonToProduct(addonProduct) {
        const index = this.selectedProducts.findIndex(
            p => p.code === this.currentMaterialCodeForAddOn && p.nameBtn === '+'
        );

        if (index === -1) return;
        addonProduct.id = `${this.currentMaterialCodeForAddOn}_${Date.now()}`;
        addonProduct.isAddOn = true; 
        addonProduct.addOnText = addonProduct.displaylabel; 
        const newData = [...this.selectedProducts];
        newData.splice(index + 1, 0, addonProduct);
        this.selectedProducts = newData;
        console.log('select product ตรง add on' + JSON.stringify(this.selectedProducts , null,2));
    }

    //search Product to AddProduct
    handleInputProduct(event) {
        this.searchProductTerm = event.target.value;
        const term = this.searchProductTerm.toLowerCase().trim();
        this.showProductDropdown = term.length > 2;
        this.filteredProductOptions = this.productPriceBook.filter(p => {
            const productId = p.INID_Product_Price_Book__r.Id;
            const nameStr = p.INID_Product_Price_Book__r.INID_SKU_Description__c?.toLowerCase() || '';
            const codeStr = p.INID_Product_Price_Book__r.INID_Material_Code__c?.toLowerCase() || '';
            const matchesSearch = nameStr.includes(term) || codeStr.includes(term);
            const isExcluded = this.productLicenseExclude.includes(productId);
            return matchesSearch && !isExcluded;
        });     
    }


    handleSaveEditedRows(event) {
        const updatedValues = event.detail.draftValues;
        const newSelectedProducts = [...this.selectedProducts]; // clone list
        const matchedAddons = [];

        console.log('เริ่มอัปเดต Products...');

        updatedValues.forEach(updated => {
            const index = newSelectedProducts.findIndex(p => p.rowKey === updated.rowKey);
            if (index === -1) {
                console.warn(`ไม่พบ rowKey: ${updated.rowKey} ใน selectedProducts`);
                return;
            }

            const product = newSelectedProducts[index];
            const qty = Number(updated.quantity ?? product.quantity);
            const price = Number(updated.salePrice ?? product.salePrice);

            const updatedProduct = {
                ...product,
                ...updated,
                quantity: qty,
                salePrice: price,
                total: qty * price
            };

            newSelectedProducts[index] = updatedProduct;

            // console.log(` อัปเดต Product: ${updatedProduct.code} | Qty: ${qty} | Price: ${price}`);
            console.log('this addon product : ' + JSON.stringify(this.addonProductPriceBook , null , 2));
            console.log('update product : ' + JSON.stringify(updatedProduct , null ,2));

            const matchedRule = this.addonProductPriceBook.find(rule =>
                rule.INID_Product_Price_Book__c === updatedProduct.productPriceBookId &&
                rule.INID_Main_Quantity__c === qty && updatedProduct.nameBtn === '+'
            );

            if (matchedRule) {
                console.log(`พบ Add-on สำหรับ ${updatedProduct.code}`);

                // ✅ เช็คว่ามี Add-on สำหรับ Product นี้อยู่แล้วหรือยัง
                const hasAddon = newSelectedProducts.some(p =>
                    p.isAddOn === true && p.parentRowKey === updatedProduct.rowKey
                );

                if (hasAddon) {
                    console.log(`ข้ามการเพิ่ม Add-on เพราะมีอยู่แล้วสำหรับ ${updatedProduct.code}`);
                    return; 
                }

                console.log(`✅ แทรก Add-on ถัดจากแถว ${updatedProduct.code}`);

                // mark main product ว่า addonDisabled = true
                updatedProduct.addonDisabled = true;

                const addonProduct = {
                    rowKey: `addon_${Date.now()}`,
                    code: matchedRule.INID_Product_Price_Book__r.INID_Material_Code__c,
                    productPriceBookId: matchedRule.INID_Product_Price_Book__c,
                    description: matchedRule.INID_Product_Price_Book__r.INID_SKU_Description__c,
                    unitPrice: matchedRule.INID_Product_Price_Book__r.INID_Unit_Price__c,
                    quantity: matchedRule.INID_Add_on_Quantity__c,
                    unit: matchedRule.INID_Product_Price_Book__r.INID_Unit__c ,
                    salePrice: 0,
                    total: 0,
                    isAddOn: true,
                    parentRowKey: updatedProduct.rowKey,
                    nameBtn: matchedRule.INID_Remark__c,
                    variant: 'base',
                    editableSalePrice: false,
                    productCode: updatedProduct.code,
                    // addonDisabled: true
                };

                console.log('➕ Add-on ที่แทรก:', JSON.stringify(addonProduct, null, 2));

                newSelectedProducts[index] = updatedProduct;
                newSelectedProducts.splice(index + 1, 0, addonProduct);
                matchedAddons.push({ product: updatedProduct, addon: addonProduct });
            }

        });

        this.selectedProducts = newSelectedProducts;
        this.draftValues = [];
        console.log(`สรุป: พบ Add-ons ทั้งหมด ${matchedAddons.length} รายการ`);
        matchedAddons.forEach((item, i) => {
            console.log(`[${i + 1}] ${item.addon.code} for ${item.product.code}`);
        });

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Edit field successfully',
                variant: 'success'
            })
        );
    }



    // Handle Row Selection
    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        let newSelectedIds = [];

        selectedRows.forEach(row => {
            const isMain = row.nameBtn === '+';
            newSelectedIds.push(row.rowKey || row.id);

            if (isMain) {
                const relatedAddons = this.selectedProducts.filter(
                    p => p.mainProductId === row.rowKey || 
                        (p.productCode === row.code && p.nameBtn !== '+')
                );
                relatedAddons.forEach(addon => {
                    newSelectedIds.push(addon.rowKey || addon.id);
                });
            }
        });

        this.selectedRowIds = [...new Set(newSelectedIds)];
    }

    
    async handleDeleteSelected() {
        if (this.selectedRowIds.length === 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'แจ้งเตือน',
                    message: 'กรุณาเลือกรายการอย่างน้อย 1 รายการ',
                    variant: 'warning'
                })
            );
            return;
        }

        const result = await LightningConfirm.open({
            message: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการที่เลือก?',
            label: 'ยืนยันการลบรายการ',
            variant: 'destructive'
        });

        if (!result) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'ยกเลิกการลบ',
                message: 'ระบบไม่ได้ลบรายการใด ๆ',
                variant: 'info'
            }));
            return;
        }

        const selectedSet = new Set(this.selectedRowIds);
        console.log('this.selectProduct from handle delete function : ' + JSON.stringify(this.selectedProducts , null ,2))

        console.log('selected product from delete function : ' + JSON.stringify(this.selectedProducts , null ,2));
        // 🔍 Step 1: หาว่า Add-on อะไรจะถูกลบ
        const addonsToDelete = this.selectedProducts.filter(p =>
            selectedSet.has(p.rowKey || p.id) && p.salePrice === 0
        );

        console.log('addonsToDelete: ', JSON.stringify(addonsToDelete, null, 2));

        // 🔁 Step 2: Enable ปุ่ม Add-on ของ Main product ที่ Add-on นั้นเคยผูกไว้
        const updatedProducts = this.selectedProducts.map(product => {
            const isMain = product.salePrice !== 0;
            const isMatchedMain = addonsToDelete.some(addon => addon.parentRowKey === product.rowKey);

            if (isMain && isMatchedMain) {
                console.log(`✅ Enable Add-on button for ${product.code}`);
                return { ...product, addonDisabled: false };
            }

            return product;
        });

        // 🧹 Step 3: ลบรายการที่ถูกเลือก (ทั้ง Add-on และ Main ที่อาจเลือก)
        const filteredProducts = updatedProducts.filter(p =>
            !selectedSet.has(p.rowKey || p.id)
        );

        this.selectedProducts = [...filteredProducts]; // re-assign ใหม่เพื่อให้ LWC detect การเปลี่ยนแปลง
        this.selectedRowIds = [];

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'สำเร็จ',
                message: 'ลบรายการที่เลือกเรียบร้อยแล้ว',
                variant: 'success'
            })
        );
    }


    showProductCode() {
        this.isShowAddfromText = !this.isShowAddfromText;
    }

    enterProductOnchange(event){
        const textareaValue = event.target.value || '';
        this.textareaValue = textareaValue;
        const uniqueCodes = new Set();

        this.enteredProductCodes = textareaValue
            .split('\n')
            .map(code => code.trim())
            .filter(code => {
                if (code.length === 0) return false;
                const normalized = code.toLowerCase();
                if (uniqueCodes.has(normalized)) return false;
                uniqueCodes.add(normalized);
                return true;
            });

        console.log('Unique Product Codes entered:', this.enteredProductCodes);
    }

    addProductToTable() {
        if (!this.enteredProductCodes?.length) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'ไม่มีข้อมูล',
                message: 'กรุณากรอกรหัสสินค้าอย่างน้อย 1 รายการ',
                variant: 'error'
            }));
            return;
        }

        const addedProducts = [];
        const duplicatedCodes = [];
        const failedCodes = [];

        this.enteredProductCodes.forEach(code => {
            const matched = this.productPriceBook.find(p => 
                p.INID_Product_Price_Book__r.INID_Material_Code__c === code
            );

            if (!matched) {
                failedCodes.push(code);
                return;
            }

            const product = matched.INID_Product_Price_Book__r;
            const productId = product.Id;
            const isExcluded = this.productLicenseExclude.includes(productId);

            if (isExcluded) {
                failedCodes.push(code);
                return;
            }

            const alreadyAdded = this.selectedProducts.some(p => p.code === code && p.unitPrice !== 0);
            if (alreadyAdded) {
                duplicatedCodes.push(code);
                return;
            }

            const unitPrice = product.INID_Unit_Price__c || 0;
            const quantity = 1;

            let editableSalePrice = false;
            if (this.allBU === "true") {
                editableSalePrice = true;
            } else if (this.productBuIds && this.productBuIds.has(productPriceBookId)) {
                editableSalePrice = true;
            }

            // const productPriceBookId = product.INID_Product_Price_Book__r.Id;
            let salePrice = product.INID_Unit_Price__c || 0;
            const matchedAverage = this.productAverage?.find(avg => avg.INID_Product_Price_Book__c === productId);
            if (matchedAverage) {
                salePrice = matchedAverage.INID_Price__c;
            }

            addedProducts.push({
                rowKey: productId,
                id: productId,
                productPriceBookId: productId,
                code: product.INID_Material_Code__c,
                Name: matched.Name,
                description: product.INID_SKU_Description__c,
                quantity,
                unitPrice:salePrice,
                salePrice:salePrice,
                unit: product.INID_Unit__c,
                total: unitPrice * quantity,
                editableSalePrice,
                nameBtn: '+',
                variant: 'brand',
                addonDisabled: false
            });
        });

        if (addedProducts.length > 0) {
            this.selectedProducts = [...this.selectedProducts, ...addedProducts];
            this.isShowAddfromText = false;
        }

        if (duplicatedCodes.length > 0) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'รายการซ้ำ',
                message: `สินค้าต่อไปนี้มีอยู่ในตารางแล้ว: ${duplicatedCodes.join(', ')}`,
                variant: 'warning'
            }));
        }

        if (failedCodes.length > 0) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'ไม่สามารถเพิ่มสินค้าได้',
                message: `ขออภัยไม่พบหรือไม่สามารถเพิ่มสินค้า: ${failedCodes.join(', ')}`,
                variant: 'error'
            }));
        }

        this.textareaValue = '';
        this.enteredProductCodes = [];

        const textarea = this.template.querySelector('lightning-textarea');
        if (textarea) {
            textarea.value = '';
        }
    }



    // ---------------------------------------------------------------------------
    // Start: Order Form - Product & Addon
    // ---------------------------------------------------------------------------
        
    isShowApplyPromotion = false ;
    addonButtonBound = false; 

    get options(){
        return [
            { label: 'ของแถม', value: '1' },
            { label: 'ของแถมนอกบิล (FOC)', value: '2' },
            { label: 'ตัวอย่าง', value: '3' },
            { label: 'บริจาค', value: '4' },
            { label: 'ชดเชย', value: '5' },
            { label: 'สมนาคุณ', value: '6' },

        ];
    }

    closePopupFreeGood() {
        this.isPopupOpenFreeGood = false;
        this.selectedValue = '';
        this.selectedLabel = ''; 
        this.searchProductTermAddOn = '';   
    }
    handleRemoveProduct(event) {
        const code = event.currentTarget.dataset.id;
        this.selectedProducts = this.selectedProducts.filter(p => p.materialCode !== code);
    }
    
    handleChangeFreeGoods(event) {
        this.selectedValue = event.detail.value;
        this.selectedLabel = event.detail.label;
    }

    handleSelectProductAddOn(event) {
        const materialCode = event.currentTarget.dataset.id;
        const selected = this.productPriceBook.find(p => p.INID_Material_Code__c === materialCode);
        if (selected) {
            this.selectedAddOnProduct.INID_Material_Code__c
            this.searchProductTermAddOn = `${selected.INID_Material_Code__c} ${selected.INID_SKU_Description__c}`;
            this.showProductDropdownAddOn = false;
        }
    }

    async connectedCallback() {
        loadStyle(this, FONT_AWESOME + '/css/all.min.css');

    }


    renderedCallback() {
        if (this.addonButtonBound) return;
        this.addonButtonBound = true;
        this.template.addEventListener('click', event => {
            const button = event.target.closest('.addon-btn');
            if (button) {
                const materialCode = button.dataset.id;
                const hasAddon = this.selectedProducts.some(
                    p => p.code === materialCode && p.unitPrice === 0
                );

                if (hasAddon) return;

                this.currentMaterialCodeForAddOn = materialCode;
                this.isPopupOpenFreeGood = true;
            }

            const quantityInputs = this.template.querySelectorAll('.quantity-input');
            const salePriceInputs = this.template.querySelectorAll('.sale-price-input');

            quantityInputs.forEach(input => {
                input.addEventListener('change', this.handleQuantityChange.bind(this));
            });

            salePriceInputs.forEach(input => {
                input.addEventListener('change', this.handleSalePriceChange.bind(this));
            });
        });

        console.log('user id : ' + this.userId);
    }

    // ---------------------------------------------------------------------------
    //Apply Promotion
    // ---------------------------------------------------------------------------



    // ---------------------------------------------------------------------------
    // Start: Sumary
    // ---------------------------------------------------------------------------
    backtoProduct(){
        this.isShowAddProduct = true;
        this.isShowApplyPromotion = false ;

    }
    
    // ---------------------------------------------------------------------------
    // Start: Summary 
    // ---------------------------------------------------------------------------

    backToApply() {
        this.isShowOrder = false ;
        this.isShowSummary = false;
        this.isShowApplyPromotion = true ;
        this.promotionData = [] ;
        this.selectedPromotion = [] ;
    }
    // ---------------------------------------------------------------------------
    // End Summary
    // ---------------------------------------------------------------------------

    //Plain Text
    openAddProduct() {
        if(!this.validateOrder()){
            return;
        }
        this.isShowAddProduct = true;
        this.isShowOrder = false;


    }

    benefitTypeOptions = [
        { label: 'Discount Amount', value: 'Discount Amount' },
        { label: 'Discount(%)', value: 'Discount(%)' },
        { label: 'Free Product (Fix Quantity)', value: 'Free Product (Fix Quantity)' },
        { label: 'Free Product (Ratio)', value: 'Free Product (Ratio)' },
        { label: 'Set Price', value: 'Set Price' }
    ];


    @track comboGroups = [];
    @track isShowApplyPromotionData = true

    async showApplyPromotion() {
        this.isShowApplyPromotion = true;
        this.isShowAddProduct = false;
        this.isShowOrder = false;

        try {
            const orderItemList = this.selectedProducts.map((item) => ({
                INID_Quantity__c: item.quantity,
                INID_Sale_Price__c: item.salePrice,
                INID_Product_Price_Book__c: item.productPriceBookId,
                INID_Total__c: item.total,
            }));

            console.log('ส่ง orderItemList เข้า getPromotion:', JSON.stringify(orderItemList, null, 2));

            const getPromotions = await getPromotion({ orderList: orderItemList, accountId: this.accountId });
            console.log('getPromotion', JSON.stringify(getPromotions, null, 2));

            // ตรวจสอบว่ามี promotions หรือไม่
            if (!getPromotions || !Array.isArray(getPromotions.promotions) || getPromotions.promotions.length === 0) {
                this.isShowApplyPromotionData = false;
                console.log('ไม่มี promotions ที่ได้จาก API');
                this.comboGroups = [];
                return;
            } else {
                this.isShowApplyPromotionData = true;
            }
        

            this.comboGroups = getPromotions.promotions.map(promo => {
                // แยก benefits ตาม conditionType
                const benefitGroups = {};

                promo.benefits.forEach(b => {
                    const condType = b.INID_Sale_Promotion_Benefit__r?.INID_Condition_Type__c || 'OR';

                    if (!benefitGroups[condType]) {
                        benefitGroups[condType] = [];
                    }

                    benefitGroups[condType].push({
                        ...b,
                        id: b.Id,
                        Name: b.Name,
                        BenefitProduct: b.INID_Product_Price_Book__c,
                        selected: false,
                        className: 'benefit-box',
                        benefitType: b.INID_Benefit_Type__c,
                        isExpanded: false,

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

                // สร้างกลุ่มที่แยก AND / OR
                const groupedBenefits = Object.keys(benefitGroups).map(type => ({
                    conditionType: type,
                    benefits: benefitGroups[type]
                }));

                return {
                    promotionId: promo.id,
                    promotionName: promo.name,
                    promotionDescript: promo.description,
                    isSelected: false,
                    arrowSymbol: 'fa-solid fa-circle-chevron-down',
                    className: 'promotion-box',
                    groupedBenefits: groupedBenefits
                };
            });

            console.log('combo group : ', JSON.stringify(this.comboGroups, null, 2));

        } catch (error) {
            console.error('❌ Full error detail:', JSON.stringify(error, null, 2));
            alert('error\n' + (error.body?.message || error.message || JSON.stringify(error)));
        }
    }


    handleTogglePromotion(event) {
        console.log('--------------------------------------------------------------------------------');
        console.log('handle toggle promotion');

        try {
            console.log('selected combogroup before : ' + JSON.stringify(this.comboGroups, null, 2));

            const promoId = event.currentTarget.dataset.promoid;

            if (!Array.isArray(this.comboGroups)) {
                console.warn('comboGroups ยังไม่ถูกกำหนด');
                return;
            }

            this.comboGroups = this.comboGroups.map(group => {
                if (group.promotionId === promoId) {
                    // เช็คว่ามี benefit ที่เลือกอยู่มั้ย
                    const hasSelectedBenefit = group.groupedBenefits.some(bg =>
                        bg.benefits.some(b => b.selected)
                    );

                    const newExpanded = !group.isExpanded;

                    const updated = {
                        ...group,
                        isExpanded: newExpanded,
                        isSelected: hasSelectedBenefit, // ✅ sync isSelected กับ benefit จริง
                        className: hasSelectedBenefit ? 'promotion-box selected' : 'promotion-box',
                        arrowIconClass: newExpanded
                            ? 'fa-solid fa-circle-chevron-up'
                            : 'fa-solid fa-circle-chevron-down'
                    };

                    console.log('selected combogroup after : ' + JSON.stringify(updated, null, 2));
                    return updated;
                }
                return group;
            });

            // ✅ เช็คจำนวน promotion ที่เลือก
            console.log('combo group from toggle benefit ' + JSON.stringify(this.comboGroups , null ,2));
            const selectedPromotionsCount = this.comboGroups.filter(g => g.isSelected).length;

            console.log('select promotion count ' + selectedPromotionsCount) ;
            if (selectedPromotionsCount < 1) {
                this.titleSummary = 'ไม่มีการเลือก promotion';
            }


        } catch (error) {
            console.error('❌ handleTogglePromotion เกิด error:', error);
            console.error('❌ handleTogglePromotion เกิด error message:', error.message);
            // this.showToast?.('Error', error.message || 'เกิดข้อผิดพลาดขณะ toggle promotion', 'error');
        }

        console.log('--------------------------------------------------------------------------------');
    }

    handleToggleBenefit(event) {
        console.log('handle toggle Benefit');

        const promoId = event.currentTarget.dataset.promoid;
        const benefitId = event.currentTarget.dataset.benefitid;

        this.comboGroups = this.comboGroups.map(group => {
            if (group.promotionId !== promoId) return group;

            // ค้นหา conditionType ของ benefit ที่ถูกคลิก
            const currentGroupType = group.groupedBenefits.find(bg =>
                bg.benefits.some(b => b.Id === benefitId)
            )?.conditionType;

            const updatedGrouped = group.groupedBenefits.map(bg => {
                const isBenefitInGroup = bg.benefits.some(b => b.Id === benefitId);

                // ✅ ล้างกลุ่มที่มี conditionType คนละฝั่ง (เช่น AND ↔ OR)
                if (bg.conditionType !== currentGroupType) {
                    const cleared = bg.benefits.map(b => ({
                        ...b,
                        selected: false,
                        className: 'benefit-box'
                    }));
                    return { ...bg, benefits: cleared };
                }

                // ✅ กรณีถูกคลิก
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
                    } else {
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

            // ✅ ปรับ UI promotion box (ไฮไลต์ + ไอคอน)
            const hasSelectedBenefit = updatedGrouped.some(bg =>
                bg.benefits.some(b => b.selected)
            );

            return {
                ...group,
                groupedBenefits: updatedGrouped,
                isSelected: hasSelectedBenefit,
                className: hasSelectedBenefit ? 'promotion-box selected' : 'promotion-box',
                arrowIconClass: group.isExpanded
                    ? 'fa-solid fa-circle-chevron-up'
                    : 'fa-solid fa-circle-chevron-down'
            };
        });

        this.updateSelectedBenefits();
        this.updateFreeProductPromotion();  
    }



    //select Benefit
    updateSelectedBenefits() {
        this.selectedBenefits = [];
        this.comboGroups.forEach(group => {
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
        });
        console.log('selectedBenefits: ' + JSON.stringify(this.selectedBenefits , null ,2)) ;

        this.comboGroups = this.comboGroups.map(group => {
            const hasSelectedBenefit = group.groupedBenefits.some(bg =>
                bg.benefits.some(b => b.selected)
            );
            return {
                ...group,
                hasSelectedBenefit
            };
        });
    }

    updateFreeProductPromotion() {
        this.freeProductPromotion = [];

        this.comboGroups.forEach(promoGroup => {
            promoGroup.groupedBenefits.forEach(group => {
                group.benefits.forEach(benefit => {
                    const isSelected = benefit.selected === true;
                    const isFreeProduct =
                        benefit.benefitType === 'Free Product (Fix Quantity)';

                    if (isSelected && isFreeProduct) {
                        const [materialCode = '', skuDescription = ''] =
                            (benefit.freeProductLabelFix || '').split(' - ');

                        this.freeProductPromotion.push({
                            productPriceBookId: benefit.BenefitProduct,
                            materialCode,
                            skuDescription,
                            fixQty: benefit.freeProductQuantityFix || null,
                            promotionId: promoGroup.promotionId,
                            promotionName: promoGroup.promotionName
                        });
                    }
                });
            });
        });

        console.log(' Free Product :', JSON.stringify(this.freeProductPromotion, null, 2));
    }



    handleBenefitTypeChange(event) {
        const id = event.target.dataset.id;
        const value = event.detail.value;

        this.comboGroups = this.comboGroups.map(group => {
            const updatedGrouped = group.groupedBenefits.map(bg => {
                const updatedBenefits = bg.benefits.map(b => {
                    if (b.id !== id) return b;

                    return {
                        ...b,
                        benefitType: value,
                        isDiscountAmount: value === 'Discount Amount',
                        isDiscountPercent: value === 'Discount(%)',
                        isFreeProductFix: value === 'Free Product (Fix Quantity)',
                        isFreeProductRatio: value === 'Free Product (Ratio)',
                        isSetPrice: value === 'Set Price'
                    };
                });
                return { ...bg, benefits: updatedBenefits };
            });
            return { ...group, groupedBenefits: updatedGrouped };
        });
    }

    handleBenefitFieldChange(event) {
        const id = event.target.dataset.id;
        const name = event.target.name;
        const value = event.target.value;

        this.comboGroups = this.comboGroups.map(group => {
            const updatedGrouped = group.groupedBenefits.map(bg => {
                const updatedBenefits = bg.benefits.map(b => {
                    if (b.id !== id) return b;
                    return {
                        ...b,
                        [name]: value
                    };
                });
                return { ...bg, benefits: updatedBenefits };
            });
            return { ...group, groupedBenefits: updatedGrouped };
        });
    }

    handleConditionChange(event) {
        const id = event.target.dataset.id;
        const value = event.detail.value;

        this.comboGroups = this.comboGroups.map(group => {
            const updatedGrouped = group.groupedBenefits.map(bg => {
                const updatedBenefits = bg.benefits.map(b => {
                    if (b.id !== id) return b;
                    return {
                        ...b,
                        condition: value
                    };
                });
                return { ...bg, benefits: updatedBenefits };
            });
            return { ...group, groupedBenefits: updatedGrouped };
        });
    }

    handleFreeProductSearchChange(event) {
        const id = event.target.dataset.id;
        const type = event.target.dataset.type;
        const value = event.target.value;

        const labelField = type === 'fix' ? 'freeProductLabelFix' : 'freeProductLabelRatio';

        this.comboGroups = this.comboGroups.map(group => {
            const updatedGrouped = group.groupedBenefits.map(bg => {
                const updatedBenefits = bg.benefits.map(b => {
                    if (b.id !== id) return b;
                    return {
                        ...b,
                        [labelField]: value
                    };
                });
                return { ...bg, benefits: updatedBenefits };
            });
            return { ...group, groupedBenefits: updatedGrouped };
        });
    }

    handleSetPriceSearchChange(event) {
        const id = event.target.dataset.id;
        const value = event.target.value;

        // สมมุติว่าคุณมี logic ค้นหา product set price แบบ async ใน backend
        this.searchSetPriceProducts(id, value);
    }


    // INID_Sale_Promotion_Benefit__r.INID_Condition_Type__c

    get hasSelectedProducts() {
        return this.selectedProducts && this.selectedProducts.length > 0;
    }

    get displayProducts() {
        if (this.selectedProducts.length === 0) {
            return [{
                id: 'no-data',
                name: 'ไม่มีข้อมูลที่จะแสดง',
                isPlaceholder: true
            }];
        }
        return this.selectedProducts;
    }

    async openOrder() {
        if (!this.validateInputs()) return;

        if (this.typeOrderFirstValue === 'Create New Order' && this.typeOrderSecondValue !== 'One Time Order') {
            this.customerId = '';
            this.searchTerm = '';
            this.paymentTypeValue = '';
            this.paymentTermValue = '';
            this.organizationValue = '';
            this.billto = '';
            this.shipto = '';
            this.shiptoOptions = [];
        }

        if (this.typeOrderSecondValue === 'One Time Order' && this.accounts.length > 0) {
            const oneTimeCustomerId = '0018500000RB6YvAAL';
            const matchedCustomer = this.accounts.find(c => c.Id === oneTimeCustomerId);
            if (matchedCustomer) {
                this.customerId = oneTimeCustomerId;
                this.accountId = oneTimeCustomerId;
                this.searchTerm = `${matchedCustomer.INID_Customer_Code__c} ${matchedCustomer.Name}`;
                this.paymentTypeValue = matchedCustomer.Payment_type__c || '';
                this.paymentTermValue = matchedCustomer.Payment_term__c || '';
                this.organizationValue = matchedCustomer.INID_Organization__c || '';
                this.fetchBillTo(oneTimeCustomerId);
                this.fetchShipto(oneTimeCustomerId);
            }
        }

        this.checkedAlertTypeOfOrder(this.typeOrderFirstValue, this.typeOrderSecondValue, this.searchQuoteValue);

        this.isShowOrder = true;
        this.isShowAddProduct = false;
        this.isShowPickListType = false;
    }


    isShowPickListType =true;
    
    backtoPicList() {
        this.isShowOrder = false ;
        this.isShowPickListType = true ;
    }

    @track typeOrderFirstValue = 'Create New Order';
    @track isShowSecondValue = true ;
    @track typeOrderSecondValue = 'Sales Order' ;
    @track isShowSearchQuote = false;
    @track searchQuoteValue = '' ;
    @track quoteId = [] ;
    @track typeOfOrder = 'Create Order'

    //Check Type Quote
    get typeOrderFirstOption() {
        return [
            {value: 'Create New Order' , label: 'Create New Order'}, 
            {value: 'Create New Order By Quote' , label: 'Create New Order By Quote'}
        ]
    }

    //Check One Time 
    get isOneTime() {
        return this.typeOrderSecondValue === 'One Time Order';
    }


    typeOrderFirstHandleChange(event) {
        this.typeOrderFirstValue = event.detail.value;
        if(this.typeOrderFirstValue === "Create New Order") {
            this.isShowSecondValue = true ;
            this.isShowSearchQuote = false ;
            
        }else {
            this.isShowSecondValue = false;
            this.isShowSearchQuote = true ;
            this.typeOrderSecondValue = 'Sales Order' ;
        }
    }

    get typeOrderSecondOption() {
        return [
            { value: 'Sales Order', label: 'Sales Order' },
            { value: 'Borrow Order', label: 'Borrow Order' },
            { value: 'One Time Order', label: 'One Time Order' },
        ]
    } 

    get isNextDisabled() {
        return !(this.selectedProducts && this.selectedProducts.length > 0);
    }

    typeOrderHandleChange(event) {
        this.typeOrderSecondValue = event.detail.value;
    }

    checkedAlertTypeOfOrder(firstType, secondType, searchQuoteValue) {
        let messageParts = [];

        if (searchQuoteValue !== '') {
            messageParts.push('Quote Id is: ' + searchQuoteValue);
            this.typeOfOrder = 'Create New Order By Quotation';
        } 
        else if (secondType !== '') {
            this.typeOfOrder = `Customer (${this.typeOrderSecondValue})`;
            messageParts.push('Value is: ' + secondType);
        }

        if (firstType !== '') {
            messageParts.push('Type is: ' + firstType);
        }
    }

    
    validateInputs() {
        let isValid = true;
        const inputs = this.template.querySelectorAll(
            'lightning-combobox, lightning-input'
        );
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    get checkDataEnable() {
        return this.handleSelectCustomer.length === 0 ;
    }

    async handleSaveSuccess() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'รายการแจ้งเตือน',
                message: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
                variant: 'success',
            })
        );

        try {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.orderId,
                    objectApiName: 'Order',
                    actionName: 'view'
                }
            },true);

            if (this.isConsoleNavigation?.data === true) {
                const { tabId } = await getFocusedTabInfo();
                setTimeout(async () => {
                    await closeTab(tabId);
                }, 1000);
            }
        } catch (err) {
            console.error('handleSaveSuccess error:', err);
        }
    }


    async insertOrderFoc(orderId) {
        const orderFoc = {
            AccountId: this.accountId ,
            INID_Account_Name__c: this.accountId ,
            INID_Status__c: 'Draft' ,
            INID_Order_Start_Date__c: new Date().toISOString(),
            INID_Order_Type__c: this.typeOrderSecondValue ,
            INID_Payment_Type__c: this.paymentTypeValue,
            INID_Payment_term__c: this.paymentTermValue,
            INID_Bill_To_Code__c: this.billto,	
            INID_Ship_To_Code__c: this.shipto,
            INID_Purchase_Order_Number__c: this.purchaseOrderNumber,
            INID_Organization__c: this.organizationValue	,
            INID_Note_Internal__c: this.noteInternal,
            INID_ExcVAT__c: this.raidoExclude,
            INID_IncVAT__c: this.raidoInclude,
            INID_Note_Agent__c : this.noteAgent ,
            INID_Original_Order__c: orderId,
            INID_Total_Amount__c:  this.totalFocPrice ,
            INID_Address_Bill_To__c: this.billToAddress1 ,
            INID_Address_Ship_To__c: this.shipToAddress2 ,
            INID_Address_Number_Bill_To__c: this.bill,
            INID_ZIP_Code_Bill_To__c: this.billToPostCode,
            INID_ZIP_Code_Ship_To__c: this.shipToPostCode ,
            INID_Street_Bill_To__c: this.billToStreet ,
            INID_Street_Ship_To__c: this.shipToStreet ,
            INID_City_Billto__c: this.billToCity ,
            INID_City_Shipto__c: this.shipToCity ,
            INID_Province_Bill_To__c: this.billToProvince, 
            INID_Province_Ship_To__c: this.shipToProvince 
        };

        console.log('Order Foc :' + JSON.stringify(orderFoc, null, 2))
        try {   
            if (this.focProducts && this.focProducts.length > 0) {
                await insertOrderFocById({ orderFocList: [orderFoc] });
            } else {
                console.log('ไม่มีของแถม FOC → ไม่สร้าง INID_Order_Foc__c');
            }
            } catch (error) {
                console.error('Error:', error);
        }
    }

    async insertOrderDetailFunction() {
        const orderDetail = {
            AccountId: this.accountId ,
            Status: 'Draft' ,
            INID_Status__c : 'Draft' ,
            EffectiveDate: new Date().toISOString(),
            Type: this.typeOrderSecondValue ,
            INID_PaymentType__c: this.paymentTypeValue,
            INID_PaymentTerm__c: this.paymentTermValue,
            INID_Bill_To_Code__c: this.billto,	
            INID_Ship_To_Code__c: this.shipto,
            INID_PurchaseOrderNumber__c: this.purchaseOrderNumber,
            INID_Organization__c: this.organizationValue	,
            INID_NoteInternal__c: this.noteInternal,
            INID_ExcVAT__c: this.radioButtonOrderLabel2,
            INID_IncVAT__c: this.radioButtonOrderLabel1,
            INID_NoteAgent__c : this.noteAgent ,
            INID_NetAmount__c: this.totalNetPrice,
            INID_Address_Billto__c: this.billToAddress1 ,
            INID_Address_Billto2__c: this.billToAddress2 ,
            INID_Street_Billto__c: this.billToStreet ,
            INID_City_Billto__c: this.billToCity ,
            INID_Province_Billto__c: this.billToProvince ,
            INID_PostCode_Billto__c: this.billToPostCode ,

            INID_Address_Shipto__c: this.shipToAddress1 ,
            INID_Address_Shipto2__c: this.shipToAddress2 ,
            INID_Street_Shipto__c: this.shipToStreet ,
            INID_City_Shipto__c: this.shipToCity ,
            INID_Province_Shipto__c: this.shipToProvince ,
            INID_PostCode_Shipto__c: this.shipToPostCode ,
        };

        console.log('order Detail : ' + JSON.stringify(orderDetail, null, 2));

        try {
            const orderId = await insertOrder({ order: orderDetail });
            this.orderId = orderId;
            console.log('Order Id : ' + orderId);
            await this.insertPromotion(this.orderId);
            await this.insertOrderItemListFunction(this.orderId); 
            await this.insertOrderFoc(this.orderId) ;
            const orderFocId = await fetchOrderFocId({orderId: this.orderId});
            console.log('order foc id : ' + orderFocId);
            await this.insertOrderItemFocListFunction(orderFocId);
        } catch (error) {
            this.handleSaveError(error);
        }
    }


    async insertPromotion(orderId) {
        const selectedBenefitItems = [];

        // ensure updated data
        this.updateSelectedBenefits();

        this.selectedBenefits.forEach(benefit => {
            selectedBenefitItems.push({
                INID_Order__c: orderId,
                INID_Sale_Promotion_Benefit_Product__c: benefit.benefitId
            });
        });

        try {
            console.log('selectedBenefitItems', JSON.stringify(selectedBenefitItems, null, 2));
            await insertOrderSalePromotion({ orderSalePromotionList: selectedBenefitItems });
            console.log('promotionData '+ JSON.stringify(selectedBenefitItems,null,2));
        } catch (error) {
            this.handleSaveError(error);
        }
    }



    async insertOrderItemListFunction(orderId) {
        let currentHLNumber = 0;
        let hlItemNumber = 0;

        // กรองออก: ไม่รวม FOC Add-on
        const filteredProducts = this.summaryProducts.filter(item => {
            return !(item.isAddOn && item.addOnText === 'ของแถมนอกบิล (FOC)');
        });

        const orderItemList = filteredProducts.map((item) => {
            if (item.isAddOn) {
                return {
                    INID_Quantity__c: item.quantity,
                    INID_Sale_Price__c: item.salePrice,
                    INID_Product_Price_Book__c: item.productPriceBookId,
                    INID_Type__c: 'FREE',
                    INID_Order__c: orderId,
                    INID_HL_Number__c: hlItemNumber,
                    INID_Item_Number__c: item.itemNumber,
                    INID_Remark__c: item.addOnText || '',
                };
            } else {
                currentHLNumber++;
                hlItemNumber = currentHLNumber;
                return {
                    INID_Quantity__c: item.quantity,
                    INID_Sale_Price__c: item.salePrice,
                    INID_Product_Price_Book__c: item.productPriceBookId,
                    INID_Type__c: 'SALE',
                    INID_Order__c: orderId,
                    INID_HL_Number__c: currentHLNumber,
                    INID_Item_Number__c: item.itemNumber,
                    INID_Remark__c: item.addOnText || '',
                };
            }
        });

        if (Array.isArray(this.freeProductPromotion)) {
            this.freeProductPromotion.forEach(free => {
                orderItemList.push({
                    INID_Quantity__c: free.fixQty || null,
                    INID_Sale_Price__c: 0,
                    INID_Product_Price_Book__c: free.productPriceBookId,
                    INID_Type__c: 'FREE',
                    INID_Order__c: orderId,
                    INID_HL_Number__c: ++currentHLNumber,
                    INID_Item_Number__c: free.itemNumber,
                    INID_Remark__c: 'โปรโมชั่น',
                });
            });
        }

        console.log('Order Item List (excluded FOC Add-ons):', JSON.stringify(orderItemList, null, 2));

        try {
            await insertOrderItem({ orderList: orderItemList, accountId: this.accountId });
            this.handleSaveSuccess();
        } catch (error) {
            this.handleSaveError(error);
        }
    }


    async insertOrderItemFocListFunction(orderFocId) {
        console.log('this.focProduct: ' + JSON.stringify(this.focProducts , null , 2)) ;
        let currentHLNumber = 0;
        const orderItemFocList = this.focProducts.map((foc) => {
            currentHLNumber += 1 ;
            return {
                INID_Quantity__c: foc.focProduct.quantity ,
                INID_Sale_Price__c: foc.focProduct.salePrice ,
                INID_Product_Price_Book__c: foc.focProduct.productPriceBookId ,
                INID_Type__c: 'FREE',
                INID_Remark__c: foc.focProduct.addOnText || '',
                INID_Order_Foc__c: orderFocId ,
                INID_HL_Number__c: currentHLNumber,
                INID_Item_Number__c: foc.itemNumber,
            }
        });
        console.log('order Item foc list: ' + JSON.stringify(orderItemFocList , null , 2)) ;

        try {
            await insertOrderItemFoc({orderFocId: orderFocId , orderItemList: orderItemFocList });
            console.log('FOC Item records inserted successfully');
    
           
        } catch (error) {
            // this.handleSaveError(error);
            console.log('error :' + JSON.stringify(error , null ,2)) ;
        }
    }


    async handleSave(){
        if (!this.accountId) {
            this.handleSaveError({ message: 'AccountId is missing, please wait or reload.' });
            return;
        } 
        const result = await LightningConfirm.open({
            message: 'คุณต้องการบันทึกคำสั่งซื้อนี้ใช่หรือไม่?',
            label: 'ยืนยันการบันทึก',
            variant: 'header', 
        });

        if (result) {
            await this.insertOrderDetailFunction();
        } else {
            this.dispatchEvent(new ShowToastEvent({
                title: 'ยกเลิกการบันทึก',
                message: 'ระบบไม่ได้ทำการบันทึกข้อมูล',
                variant: 'info'
            }));
        }   
    }

    handleSaveError(error) {
        // alert('Save Error:\n' + JSON.stringify(error, null, 2));
        let msg = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล : ' + error ;

        if (error && error.body && error.body.message) {
            msg = error.body.message;
        } else if (error && error.message) {
            msg = error.message;
        }

        // this.dispatchEvent(new ShowToastEvent({
        //     title: 'Error saving data',
        //     message: msg,
        //     variant: 'error',
        // }));

        console.log('error from save error: ' + JSON.stringify(error, null , 2));
    }

    //End Handle Save 
    isShowSummary = false ;
    @track summaryProducts = [];    
    @track selectedPromotion = [] ;
    @track promotionData = [] ;



    summaryColumns = [
        { label: 'Material Code', fieldName: 'code', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 150 },
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
                { label: 'Material Code', fieldName: 'promotionMaterialCode', hideDefaultActions: true },
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
                { label: 'Material Code', fieldName: 'promotionMaterialCode', hideDefaultActions: true },
                { label: 'SKU Description', fieldName: 'promotionDescription', hideDefaultActions: true } ,
                { label: 'Sales Price', fieldName: 'setPrice', hideDefaultActions: true } ,
                { label: 'Unit', fieldName: 'unit', hideDefaultActions: true },
            ];
        } else if (type === 'Free Product (Ratio)') {
            return [
                { label: 'Material Code', fieldName: 'promotionMaterialCode', hideDefaultActions: true },
                { label: 'SKU Description', fieldName: 'promotionDescription', hideDefaultActions: true } ,
                { label: 'Unit', fieldName: 'unit', hideDefaultActions: true },
                { label: 'Numerator', fieldName: 'numerator', hideDefaultActions: true },
                { label: 'Denominator', fieldName: 'denomiator', hideDefaultActions: true },
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

        // 1) สรุปรายการสินค้า + Add-on
        const mainProducts = this.selectedProducts.filter(p => p.nameBtn === '+');
        console.log('selectedProduct' , JSON.stringify(this.selectedProducts, null, 2))

        mainProducts.forEach(main => {
            const relatedAddons = this.selectedProducts.filter(
                p => p.productCode === main.code && p.isAddOn
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
                netPrice: netPrice,
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
        console.log(`➡️ พบ Add-on ที่เป็นของแถมนอกบิล (FOC) จำนวน ${focAddons.length} รายการ`);
        const focMaterialCodes = focAddons.map(p => p.productCode || p.materialCode).filter(code => !!code);
        console.log(`🧾 Material Codes ของ FOC Add-ons: ${focMaterialCodes.join(', ')}`);

        // console.log('show summary product is a : ' + JSON.stringify(this.summaryProducts, null, 2));

        const focList = this.summaryProducts
            .filter(p => p.addOnText === 'ของแถมนอกบิล (FOC)')
            .map(foc => {
                const main = this.summaryProducts.find(
                    mp => !mp.addOnText && mp.code === foc.productCode
                );

                return {
                    focProduct: foc
                };
            });
        
        this.focProducts = focList;

        console.log('FOC Mapping:', JSON.stringify(this.focProducts, null, 2));
        console.log(`พบของแถมนอกบิล (FOC) ทั้งหมด ${focList.length} รายการ`);
        console.log('summary Product : ' + JSON.stringify(this.summaryProducts, null , 2));

        // 2) รวมโปรโมชันแบบไม่ซ้ำ (แยกออกจาก forEach ของ mainProducts)
        console.log('combogroup ในตอนนี้ที่หา error คือ  : ' + JSON.stringify(this.comboGroups, null , 2) );
        const selectedPromotions = this.comboGroups.filter(group => group.isSelected);
        // console.log('select promotion is : ' + selectedPromotions ) ;
        console.log('select promotion is : ' + JSON.stringify(selectedPromotions , null , 2)) ;

        selectedPromotions.forEach(group => {
            const selectedBenefits = group.groupedBenefits
                .flatMap(gb => gb.benefits)
                .filter(b => b.selected);


            const existingPromoGroup = this.promotionData.find(p => p.promotionName === group.promotionName);
            console.log('existing promotion group ' + JSON.stringify(existingPromoGroup , null ,2) );

            if (!existingPromoGroup) {
                this.promotionData.push({
                    id: group.promotionId || group.id,
                    promotionName: group.promotionName,
                    promotionDescription: group.promotionDescript,
                    benefits: []
                });
            }

            const targetGroup = this.promotionData.find(p => p.promotionName === group.promotionName);

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

                    // เพิ่มแถวใหม่ในกลุ่มนั้น
                    existingBenefitGroup.data.push({
                        promotionMaterialCode: b.INID_Product_Price_Book__r?.INID_Material_Code__c || '',
                        promotionDescription: b.INID_Product_Price_Book__r?.INID_SKU_Description__c || '',
                        unit: b.INID_Product_Price_Book__r?.INID_Unit__c || '-',
                        numerator: b.INID_Free_Product_Quantity_Numerator__c,
                        denomiator: b.INID_Free_Product_Quantity_Denominator__c,
                        freeProductQuantity: b.INID_Free_Product_Quantity_Fix__c,
                        discountAmount: b.INID_Discount_Amount__c , 
                        discountType: type ,
                        discountPercent: b.INID_Discount__c ,
                        setPrice: b.INID_SetPrice__c,
                    });
            });
        });

        console.log(" สรุป promotionData:", JSON.stringify(this.promotionData, null, 2));

        const totalNetPrice = this.summaryProducts
            .filter(p => !p.addOnText) // กรองเฉพาะสินค้าหลัก
            .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

        this.totalNetPrice = totalNetPrice ;
        console.log(`ราคารวมเฉลี่ยสุทธิของสินค้าทั้งหมด: ${this.totalNetPrice.toFixed(2)} บาท`);

        const totalFoc = this.summaryProducts
            .filter(p => p.addOnText === 'ของแถมนอกบิล (FOC)') // กรองเฉพาะ Add-On Foc
            .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

        this.totalFocPrice = totalFoc ;
        console.log(`ราคารวมเฉลี่ยสุทธิของ FOC ทั้งหมด: ${this.totalFocPrice.toFixed(2)} บาท`);

       

        const selectedPromotionsCount = this.comboGroups.filter(g => g.isSelected).length;
        if (selectedPromotionsCount < 1) {
            this.titleSummary = '';
        } else {
            this.titleSummary = 'สรุปโปรโมชั่นที่เลือก';
        }
    }

            

    get promoList(){
        console.log('promoList', JSON.stringify(this.promotionData, null, 2));
        return this.promotionData.map(p => ({
            ...p,
            rowWrapper: [{
                id: p.id,
                promotionName: p.promotionName,
                promotionDescription: p.promotionDescription
            }] 
        }));
      
    }
}

