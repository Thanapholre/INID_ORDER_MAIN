import { LightningElement, track, wire , api} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { NavigationMixin } from 'lightning/navigation';
import { IsConsoleNavigation, getFocusedTabInfo, closeTab } from 'lightning/platformWorkspaceApi';
import fetchCustomers from '@salesforce/apex/INID_OrderController.fetchCustomers';
import fetchDataBillto from '@salesforce/apex/INID_OrderController.fetchDataBillto';
import fetchDataShipto from '@salesforce/apex/INID_OrderController.fetchDataShipto';
import fetchProductLicense from '@salesforce/apex/INID_OrderController.fetchProductLicense';
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
// import fetchBuProduct from '@salesforce/apex/INID_OrderController.fetchBuProduct'
// import fetchBuGroupId from '@salesforce/apex/INID_OrderController.fetchBuGroupId'
import fetchOrderFocId from '@salesforce/apex/INID_OrderController.fetchOrderFocId'
import insertOrderFocById from '@salesforce/apex/INID_OrderController.insertOrderFocById'
import fetchUserGroup from '@salesforce/apex/INID_OrderController.fetchUserGroup'
import fetchBuGroupId from '@salesforce/apex/INID_OrderController.fetchBuGroupId'
import fetchProductsByBuGroups from '@salesforce/apex/INID_OrderController.fetchProductsByBuGroups'
import insertOrderItemFoc from '@salesforce/apex/INID_OrderController.insertOrderItemFoc'
import fetchAddonProductPriceBook from '@salesforce/apex/INID_OrderController.fetchAddonProductPriceBook'
import fetchAccountLicense from '@salesforce/apex/INID_OrderController.fetchAccountLicense'
// import fetchOrderFocById from '@salesforce/apex/INID_OrderController.fetchOrderFocById'
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
    @track accountLicenseData = [] ;
    @track accountLicense ;
    @track productLicenseData = [] ;
    @track productLicense ;

  
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

    // @wire(fetchBuProduct , {buGroupId: '$buGroupId'})
    // wiredFetchBuProductList({error , data}) {
    //     if(data) {
    //         this.buGroupbyId = data ;
    //         this.productBuIds = new Set(data.map(item => item.INID_Product_Price_Book__c));
    //         console.log('BU Groups IDs:' + JSON.stringify(this.buGroupbyId, null, 2));
    //     } else {
    //         console.log(error) ;
    //     }
    // }

    @wire(fetchAccountLicense , {accountId: '$accountId'})
    wiredFetchAccountLicense({error , data}) {
        if(data) {
            this.accountLicenseData = data ;
            this.accountLicense = this.accountLicenseData.map(acc => acc.INID_License__c);
            console.log('Account License:' + JSON.stringify(this.accountLicense, null, 2));
        } else {
            console.log(error) ;
        }
    }

    @wire(fetchProductLicense, {licenseList: '$accountLicense'})
    wiredProductLicense({ error, data }) {
        if (data) {
            this.productPriceBook = data;
            // this.productPriceBook = this.productLicenseData.map(productLicense => productLicense.INID_Product_Price_Book__c );
            console.log('Product License' + JSON.stringify(this.productPriceBook, null, 2))
        } else if (error) {
            console.error('Error fetching accounts:', error);
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
            console.error('Error fetching accounts:', error);
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

    // Fetch Data Price Book
    // @wire(fetchDataProductPriceBook)
    // wiredproductPriceBook({ error, data }) {
    //     if (data) {
    //         this.productPriceBook = data;
    //     } else if (error) {
    //         console.error('Error fetching accounts:', error);
    //     }
    // }

    
    // fetchDataQuotation
    @wire(fetchDataQuotation)
    wiredQuotation({ error, data }) {
        if (data) {
            this.quotation = data;
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }

    @wire(fetchAddonProductPriceBook , {accountId: '$accountId'})
    wireaddonProductPriceBook({error, data}) {
        if(data){
            this.addonProductPriceBook = data;
            console.log('this Addon Product Price Books '+ JSON.stringify(this.addonProductPriceBook , null ,2));
        }else if(error){
            console.log(' error fetch addonProductPriceBook : ', error)
        }
            
    }

    // fetch Auto Field Bill To
    @wire(fetchDataBillto)
    fetchBillTo(accountId) {
    fetchDataBillto({ accountId: accountId })
        .then(data => {
            if (data && data.length > 0) {
                this.billto = data[0].Name;
            } else {
                this.billto = '';
            }
        })
        .catch(error => {
            console.error('Error fetching Bill To:', error);
        });
    }
    

    @wire(fetchUserGroup, {userId: '$userId'})
    wiredUserGroup({ error, data }) {
        if (data) {
            this.userGroup = data;
            console.log('user Gruop : ' + JSON.stringify(this.userGroup, null, 2) );
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }

    @wire(fetchBuGroupId, {userGroup: '$userGroup'})
    wiredBuGroupId({ error, data }) {
        if (data) {
            this.buGroupData = data;
            this.buGroupId = this.buGroupData.map(r => r.INID_BU_Group__c);
            console.log('BU Gruop : ' + JSON.stringify(this.buGroupId, null, 2) );
        } else if (error) {
            console.error('Error fetching accounts:', error);
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

    handleChangeRadioButton(event) {
        const selectedRadioValue = event.target.value;
        const isChecked = event.target.checked;
        this.radioCheckedValue = isChecked ? [...this.radioCheckedValue, selectedRadioValue] : this.value.filter(val => val !== selectedRadioValue);
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
            console.error('❌ error from handleSelectProduct:', error);
            console.error('❌ error.message:', error.message);
            console.error('❌ error.stack:', error.stack);
        }
    }

    mapProduct(source, addedAddons = [] , hlNumber) {
        // const isMainProduct = source.INID_Sale_Price__c > 0;
        const hasAddon = addedAddons.includes(source.INID_Material_Code__c);
        const salePrice = source.INID_Product_Price_Book__r.INID_Unit_Price__c || 0;
        const quantity = 1;
        const total = salePrice * quantity;
        hlNumber += 1;
        this.hlNumber = hlNumber ;

        const productPriceBookId = source.Id;
        const editableSalePrice =
            this.productBuIds && this.productBuIds.has(productPriceBookId);

        return {
            rowKey: source.Id,
            id: source.Id,
            productPriceBookId: source.Id,
            code: source.INID_Product_Price_Book__r.INID_Material_Code__c,
            description: source.INID_Product_Price_Book__r.INID_SKU_Description__c ,
            unitPrice: source.INID_Product_Price_Book__r.INID_Unit_Price__c || 0,
            quantity: 1,
            salePrice: source.INID_Product_Price_Book__r.INID_Unit_Price__c || 0,
            unit: source.INID_Unit__c || '',
            total: total,
            // addOnButton: isMainProduct ? 'Add On' : null,
            addOnText: '+',
            // addOn: isMainProduct ? 'true' : 'false',
            nameBtn:  '+' ,
            variant: 'brand',
            editableSalePrice: editableSalePrice,
            addonDisabled: false,
            hlItemNumber: this.hlNumber,

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

        // if (actionName === 'btnAddOn') {
        //     if (isAddon) {
        //         return;
        //     }

        //     this.currentMaterialCodeForAddOn = row.code;
        //     this.isPopupOpenFreeGood = true;
        // }

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
            const nameStr = p.INID_Product_Price_Book__r.INID_Material_Code__c ? p.INID_Product_Price_Book__r.INID_SKU_Description__c .toLowerCase() : '';
            const codeStr = p.INID_Product_Price_Book__r.INID_Material_Code__c ? p.INID_Product_Price_Book__r.INID_Material_Code__c.toLowerCase() : '';
            return nameStr.includes(term) || codeStr.includes(term);
        });
    }

    // handleSaveEditedRows(event) {
    //     try {
    //         const updates = event.detail.draftValues;
    //         const updatedProducts = [...this.selectedProducts];

    //         updates.forEach(update => {
    //             const index = updatedProducts.findIndex(p => p.id === update.id);
    //             if (index === -1) return;

    //             const product = { ...updatedProducts[index], ...update };
    //             product.total = product.salePrice * product.quantity;
    //             updatedProducts[index] = product;

    //             // 🔍 เช็ค rule Add-on
    //             const matchedRule = this.addonProductPriceBook.find(rule =>
    //                 rule.INID_Main_Quantity__c === product.quantity &&
    //                 rule.INID_Product_Price_Book__c === product.productPriceBookId
    //             );

    //             if (matchedRule) {
    //                 const addonId = `${product.rowKey}_addon_auto_${Date.now()}`;
    //                 const addonProduct = {
    //                     rowKey: addonId,
    //                     id: addonId,
    //                     code: matchedRule.INID_Product_Price_Book__r.INID_Material_Code__c,
    //                     description: matchedRule.INID_Product_Price_Book__r.INID_SKU_Description__c,
    //                     unitPrice: 0,
    //                     salePrice: 0,
    //                     quantity: matchedRule.INID_Add_on_Quantity__c,
    //                     unit: matchedRule.INID_Product_Price_Book__r.INID_Unit__c,
    //                     total: 0,
    //                     productPriceBookId: matchedRule.INID_Product_Price_Book__c,
    //                     nameBtn: this.getAddonLabel('1'),
    //                     variant: 'base',
    //                     editableSalePrice: false,
    //                     addOnText: matchedRule.INID_Remark__c || 'ของแถม',
    //                     hlItemNumber: product.hlItemNumber,
    //                     isAddOn: true,
    //                     productCode: product.code
    //                 };

    //                 const isAddonExists = updatedProducts.some(p =>
    //                     p.code === addonProduct.code &&
    //                     p.unitPrice === 0 &&
    //                     p.hlItemNumber === product.hlItemNumber
    //                 );

    //                 if (!isAddonExists) {
    //                     // ✅ แทรก Add-on ถัดจากสินค้าหลัก
    //                     updatedProducts.splice(index + 1, 0, addonProduct);
    //                     this.dispatchEvent(new ShowToastEvent({
    //                         title: 'เพิ่มของแถม',
    //                         message: `${addonProduct.code} (${addonProduct.quantity} ${addonProduct.unit})`,
    //                         variant: 'info'
    //                     }));
    //                 }
    //             }
    //         });

    //         // ✅ อัปเดต selectedProducts
    //         this.selectedProducts = [...updatedProducts]; 
    //         this.draftValues = []; // เคลียร์ draft หลัง save

    //     } catch (error) {
    //         console.log('error from edit row : ' + error.message);
    //     }
    // }


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

            console.log(` อัปเดต Product: ${updatedProduct.code} | Qty: ${qty} | Price: ${price}`);

            const matchedRule = this.addonProductPriceBook.find(rule =>
                rule.INID_Product_Price_Book__c === updatedProduct.productPriceBookId &&
                rule.INID_Main_Quantity__c === qty
            );

            if (matchedRule) {
                console.log(`พบ Add-on สำหรับ ${updatedProduct.code}`);

                // ✅ เช็คว่ามี Add-on สำหรับ Product นี้อยู่แล้วหรือยัง
                const hasAddon = newSelectedProducts.some(p =>
                    p.isAddOn === true && p.parentRowKey === updatedProduct.rowKey
                );

                if (hasAddon) {
                    console.log(`❗️ข้ามการเพิ่ม Add-on เพราะมีอยู่แล้วสำหรับ ${updatedProduct.code}`);
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
        console.log(`✅ สรุป: พบ Add-ons ทั้งหมด ${matchedAddons.length} รายการ`);
        matchedAddons.forEach((item, i) => {
            console.log(`🧩 [${i + 1}] ${item.addon.code} for ${item.product.code}`);
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
            const isMain = row.unitPrice !== 0;
            newSelectedIds.push(row.rowKey || row.id);

            if (isMain) {
                const relatedAddons = this.selectedProducts.filter(
                    p => p.productCode === row.code && p.unitPrice === 0
                );
                relatedAddons.forEach(addon => {
                    newSelectedIds.push(addon.rowKey || addon.id);
                });
            }
        });
        this.selectedRowIds = [...new Set(newSelectedIds)];
    }

    // async handleDeleteSelected() {
    //     if (this.selectedRowIds.length === 0) {
    //          this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'แจ้งเตือน',
    //                 message: 'กรุณาเลือกรายการอย่างน้อย 1 รายการ',
    //                 variant: 'warning'
    //             })
    //         );
    //         return;
    //     }

    //      const result = await LightningConfirm.open({
    //         message: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการที่เลือก?',
    //         label: 'ยืนยันการลบรายการ',
    //         variant: 'destructive' 
    //     });

    //     if (!result) {
    //         this.dispatchEvent(new ShowToastEvent({
    //             title: 'ยกเลิกการลบ',
    //             message: 'ระบบไม่ได้ลบรายการใด ๆ',
    //             variant: 'info'
    //         }));
    //         return;
    //     }   

    //     console.log('this.selectProduct from handle delete function : ' + JSON.stringify(this.selectedProducts , null ,2))

    //     const selectedSet = new Set(this.selectedRowIds);
    //     console.log('selectSet : ' + JSON.stringify(selectedSet , null ,2));
        
    //     const addonsToDelete = this.selectedProducts.filter(p => 
    //         selectedSet.has(p.rowKey || p.id) && p.unitPrice === 0
    //     );

    //     console.log('addonsToDelete: ' + JSON.stringify(addonsToDelete , null ,2));

    //     addonsToDelete.forEach(addon => {
    //         const mainIndex = this.selectedProducts.findIndex(main =>
    //             main.rowKey === addon.parentRowKey
    //         );

    //         console.log('main index : ' + mainIndex) ;

    //         if (mainIndex !== -1) {
    //             this.selectedProducts[mainIndex].addonDisabled = false;
    //         }
    //     });

    //     this.selectedProducts = this.selectedProducts.filter(p => 
    //         !selectedSet.has(p.rowKey || p.id)
    //     );

    //     this.selectedRowIds = [...this.selectedProducts]
    //     this.dispatchEvent(
    //         new ShowToastEvent({
    //             title: 'สำเร็จ',
    //             message: 'ลบรายการที่เลือกเรียบร้อยแล้ว',
    //             variant: 'success',
    //         })
    //     );
    // }
    
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


    // async handleDeleteSelected() {
    //     if (!this.selectedDetailItems || this.selectedDetailItems.length === 0) {
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'แจ้งเตือน',
    //                 message: 'ยังไม่เลือกสักรายการ',
    //                 variant: 'warning',
    //                 mode: 'dismissable'
    //             })
    //         );
    //         return;
    //     }

    //     const deleteKeys = new Set(this.selectedDetailItems.map(item => item.rowKey));

    //     // แยกรายการที่จะลบตามประเภท
    //     const mainItems = this.selectedDetailItems.filter(item => item.type === 'Main');
    //     const addOnItems = this.selectedDetailItems.filter(item => item.type === 'Add-On');

    //     // แสดงรายการที่จะลบ
    //     if (mainItems.length > 0) {
    //         const mainCodes = mainItems.map(m => `• ${m.code} (rowKey: ${m.rowKey})`).join('\n');
    //     }

    //     if (addOnItems.length > 0) {
    //         const addonCodes = addOnItems.map(a => `• ${a.code} (rowKey: ${a.rowKey})`).join('\n');
    //     }

    //     const confirmed = await LightningConfirm.open({
    //         message: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการต่อไปนี้?`,
    //         variant: 'destructive',
    //         label: 'ยืนยันการลบ',
    //     });

    //     if (!confirmed) {
    //         return;
    //     }

    //     // ลบออกจากข้อมูลหลัก
    //     this.selectedProducts = this.selectedProducts.filter(p => !deleteKeys.has(p.rowKey));
    //     addOnItems.forEach(deletedAddon => {
    //         const relatedMain = this.selectedProducts.find(main =>
    //             main.unitPrice !== 0 && main.code === deletedAddon.code
    //         );
    //         if (relatedMain) {
    //             const hasOtherAddon = this.selectedProducts.some(item =>
    //                 item.unitPrice === 0 && item.code === relatedMain.code
    //             );
    //             relatedMain.addonDisabled = hasOtherAddon;
    //         }
    //     });

    //     // ล้าง selection
    //     this.selectedRowIds = [];
    //     this.selectedDetailItems = [];

    //     // เคลียร์ UI datatable
    //     const datatable = this.template.querySelector('lightning-datatable');
    //     if (datatable) {
    //         datatable.selectedRows = [];
    //     }

        
    //     this.dispatchEvent(
    //         new ShowToastEvent({
    //             title: 'สำเร็จ',
    //             message: 'ลบรายการที่เลือกเรียบร้อยแล้ว',
    //             variant: 'success'
    //         })
    //     );

    // }

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
        if (!this.enteredProductCodes || this.enteredProductCodes.length === 0) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'ไม่มีข้อมูล',
                message: 'กรุณากรอกรหัสสินค้าอย่างน้อย 1 รายการ',
                variant: 'error'
            }));
            return;
        }

        const addedProducts = [];
        const duplicatedCodes = [];

        this.enteredProductCodes.forEach(code => {
            const matched = this.productPriceBook.find(p => p.INID_Material_Code__c === code);
            if (matched) {
                const alreadyAdded = this.selectedProducts.some(p => p.code === code && p.unitPrice !== 0);
                if (!alreadyAdded) {
                    // ✅ ใช้ mapProduct แทนการสร้าง object ตรง ๆ
                    const mappedProduct = this.mapProduct(matched, [], this.hlNumber);
                    addedProducts.push(mappedProduct);
                } else {
                    duplicatedCodes.push(code);
                }
            } else {
                duplicatedCodes.push(code);
            }
        });

        if (addedProducts.length > 0) {
            this.selectedProducts = [...this.selectedProducts, ...addedProducts];
            this.isShowAddfromText = false;
        }

        if (duplicatedCodes.length > 0) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'แจ้งเตือนพบข้อผิดพลาด',
                message: `สินค้าต่อไปนี้มีอยู่ในตารางแล้วหรือไม่พบ: ${duplicatedCodes.join(', ')}`,
                variant: 'warning'
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

    async showApplyPromotion() {
        this.isShowApplyPromotion = true ;
        this.isShowAddProduct = false ;
        this.isShowOrder = false ;

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
        
            console.log('get promotion : ' + JSON.stringify(getPromotion , null ,2));

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

                        //Show Input
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

                        // Add these flags for conditional rendering
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
                    groupedBenefits: groupedBenefits // แทนที่ benefits เดิม
                };
            });
   
            console.log('combo group : ' + JSON.stringify(this.comboGroups , null , 2)) ;

        } catch(error) {
            alert('error\n'+ (error.body?.message || error.message || JSON.stringify(error)));
        }   
    }

    handleTogglePromotion(event) {
        const promoId = event.currentTarget.dataset.promoid;
        this.comboGroups = this.comboGroups.map(group => {
            if (group.promotionId === promoId) {
                const updated = {
                    ...group,
                    isSelected: !group.isSelected
                };
                updated.className = updated.isSelected ? 'promotion-box selected' : 'promotion-box';
                updated.arrowIconClass = updated.isSelected
                    ? 'fa-solid fa-circle-chevron-up'
                    : 'fa-solid fa-circle-chevron-down';

                return updated;
            }
            return group;
        });
    }

    handleToggleBenefit(event) {
        const promoId = event.currentTarget.dataset.promoid;
        const benefitId = event.currentTarget.dataset.benefitid;

        this.comboGroups = this.comboGroups.map(group => {
            if (group.promotionId !== promoId) return group;

            const hasSelectedAnd = group.groupedBenefits.some(
                bg => bg.conditionType === 'AND' && bg.benefits.some(b => b.selected)
            );
            const hasSelectedOr = group.groupedBenefits.some(
                bg => bg.conditionType === 'OR' && bg.benefits.some(b => b.selected)
            );

            const updatedGrouped = group.groupedBenefits.map(bg => {
                const isBenefitInGroup = bg.benefits.some(b => b.Id === benefitId);

                if (!isBenefitInGroup) {
                    const isConflict =
                        (bg.conditionType === 'AND') ||
                        (bg.conditionType === 'OR');

                    if (isConflict) {
                        const clearedBenefits = bg.benefits.map(b => ({
                            ...b,
                            selected: false,
                            className: 'benefit-box'
                        }));
                        return { ...bg, benefits: clearedBenefits };
                    }

                    return bg; 
                }
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
            });
            return {
                ...group,
                groupedBenefits: updatedGrouped
            };
        });

        this.updateSelectedBenefits();
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
                isSelected: hasSelectedBenefit
            };
        });
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


        // // about user
        // console.log('user id : ' + this.userId) ;
        // const buGroupResult = await fetchBuGroupId({userId: this.userId});
        // this.buGroupId = buGroupResult ;
        // console.log('BU Product Group ID: ' + this.buGroupId);
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

    // Start Handle Save
    async handleSaveSuccess() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'รายการแจ้งเตือน',
                message: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
                variant: 'success',
            })
        );

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.orderId,
                objectApiName: 'Order',
                actionName: 'view'
            }
        });
    }


    async insertOrderFoc(orderId) {
        const orderFoc = {
            AccountId: this.accountId ,
            Status: 'Draft' ,
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
            INID_Original_Order__c: orderId
        };
        try {   
            if (this.focProducts && this.focProducts.length > 0) {
                await insertOrderFocById({ orderFocList: [orderFoc] });
                // console.log('FOC records inserted successfully');    
                // return focOrderId ;
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
        };
        try {
            // const orderId = await insertOrder({ order: orderDetail });
            // this.orderId = orderId;
            // await this.insertPromotion(this.orderId);
            // await this.insertOrderItemListFunction(this.orderId); 
            // await this.insertOrderFoc(this.orderId) ;
            // const orderFocId = await fetchOrderFocId({orderId: this.orderId});
            // console.log('order foc id : ' + orderFocId);
            // await this.insertOrderItemFocListFunction(orderFocId);
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

    // async insertPromotion(orderId) {
    //     const selectedBenefitItems = [];

    //     // console.log('select benefit from insert promotion function : ' + JSON.stringify())

    //     this.comboGroups.forEach(group => {
    //         const selectedBenefits = group.benefits.filter(b => b.selected);

    //         selectedBenefits.forEach(benefit => {
    //             selectedBenefitItems.push({
    //                 INID_Order__c: orderId,
    //                 INID_Sale_Promotion_Benefit_Product__c: benefit.Id
    //             });
    //         });
    //     });

    //     try {
    //         console.log('selectedBenefitItems', JSON.stringify(selectedBenefitItems, null, 2));
    //         await insertOrderSalePromotion({ orderSalePromotionList: selectedBenefitItems });
    //         console.log('promotionData '+ JSON.stringify(selectedBenefitItems,null,2));
           
    //     } catch (error) {
    //         this.handleSaveError(error);
    //     }
    // }

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
                INID_Type__c: 'Add-on',
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

        this.dispatchEvent(new ShowToastEvent({
            title: 'Error saving data',
            message: msg,
            variant: 'error',
        }));
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

    // columnPromotionsContent = [
    //     { label: 'Material Code', fieldName: 'promotionMaterialCode' ,hideDefaultActions: true },
    //     { label: 'SKU Description', fieldName: 'promotionDescription' ,hideDefaultActions: true },
    //     { label: 'Quantity', fieldName: 'freeProductQuantity'  ,hideDefaultActions: true},
    //     { label: 'Unit', fieldName: 'unit' ,hideDefaultActions: true},
    //     // { label: 'Sale Price', fieldName: 'salePrice' ,hideDefaultActions: true},
    // ];

    columnPromotionsTitle = [
       { label: 'Promotion ', fieldName: 'promotionName' ,hideDefaultActions: true },
       { label: 'Descirption ', fieldName: 'promotionDescirption' ,hideDefaultActions: true },
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
        const selectedPromotions = this.comboGroups.filter(group => group.isSelected);

        selectedPromotions.forEach(group => {
            const selectedBenefits = group.groupedBenefits
                .flatMap(gb => gb.benefits)
                .filter(b => b.selected);


            const existingPromoGroup = this.promotionData.find(p => p.promotionName === group.promotionName);

            if (!existingPromoGroup) {
                this.promotionData.push({
                    id: group.promotionId || group.id,
                    promotionName: group.promotionName,
                    promotionDescirption: group.promotionDescript,
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
            .reduce((sum, p) => sum + parseFloat(p.netPrice || 0), 0);

        console.log(`ราคารวมเฉลี่ยสุทธิของสินค้าทั้งหมด: ${totalNetPrice.toFixed(2)} บาท`);
    }

            

    get promoList(){
        return this.promotionData.map(p => ({
            ...p,
            rowWrapper: [{
                id: p.id,
                promotionName: p.promotionName,
                promotionDescirption: p.promotionDescirption
            }]
        }));
    }




}
