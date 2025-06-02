import { LightningElement, track, wire , api} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { NavigationMixin } from 'lightning/navigation';
import { IsConsoleNavigation, getFocusedTabInfo, closeTab } from 'lightning/platformWorkspaceApi';
import fetchCustomers from '@salesforce/apex/INID_OrderController.fetchCustomers';
import fetchDataBillto from '@salesforce/apex/INID_OrderController.fetchDataBillto';
import fetchDataShipto from '@salesforce/apex/INID_OrderController.fetchDataShipto';
import fetchDataProductPriceBook from '@salesforce/apex/INID_OrderController.fetchDataProductPriceBook';
import fetchQuoteItemById from '@salesforce/apex/INID_OrderController.fetchQuoteItemById'
import fetchDataQuotation from '@salesforce/apex/INID_OrderController.fetchDataQuotation' ;
import insertOrder from '@salesforce/apex/INID_OrderController.insertOrder';
import insertOrderItem from '@salesforce/apex/INID_OrderController.insertOrderItem'
import PAYMENT_TYPE_FIELD from '@salesforce/schema/Account.Payment_type__c';
import PAYMENT_TERM_FIELD from '@salesforce/schema/Account.Payment_term__c';
import INID_Organization__c from '@salesforce/schema/Account.INID_Organization__c';
import ACCOUNT_ID from '@salesforce/schema/Account.Id';


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
  
    columns = [
        { label: 'Material Code', fieldName: 'code', type: 'text', hideDefaultActions: true ,  cellAttributes: { alignment: 'right' }},
        { label: 'SKU Description', fieldName: 'description', type: 'text', hideDefaultActions: true , cellAttributes: { alignment: 'right' }}, 
        { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency' , typeAttributes: {minimumFractionDigits: 2}, hideDefaultActions: true, cellAttributes: { alignment: 'right', } , initialWidth: 110},
        { label: 'Quantity', fieldName: 'quantity', type: 'text', editable: true, hideDefaultActions: true , cellAttributes: { alignment: 'right' } , initialWidth: 150 }, 
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency' , typeAttributes: {minimumFractionDigits: 2}, editable: {fieldName : 'editableSalePrice'} , hideDefaultActions: true ,  cellAttributes: { alignment: 'center'} , initialWidth: 175},
        { label: 'Unit', fieldName: 'unit', type: 'text', hideDefaultActions: true ,  cellAttributes: { alignment: 'right' } , initialWidth: 70},
        { label: 'Total', fieldName: 'total', type: 'currency' , typeAttributes: {minimumFractionDigits: 2}, hideDefaultActions: true ,  cellAttributes: { alignment: 'right' } , initialWidth: 140},
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
            initialWidth: 170
        }
    ];

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
        // alert('record Id is : ' + this.recordId);
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
    @wire(fetchDataProductPriceBook)
    wiredproductPriceBook({ error, data }) {
        if (data) {
            this.productPriceBook = data;
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }
    
    // fetchDataQuotation
    @wire(fetchDataQuotation)
    wiredQuotation({ error, data }) {
        if (data) {
            this.quotation = data;
        } else if (error) {
            console.error('Error fetching accounts:', error);
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

            // alert("account Id : " + fetchAccountId) ;
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
        // alert('globalQuote : ' + this.globalQuoteId); 
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
            // this.showDropdown = false; 
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
        const selectedId = event.currentTarget.dataset.id;
        const selected = this.productPriceBook.find(p => p.Id === selectedId);
        const isDuplicate = this.selectedProducts.some(p => p.id === selectedId);

        if (!this.accountId && this.customerId) {
            this.accountId = this.customerId;
        }

        if (isDuplicate) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'รายการซ้ำ',
                    message: 'สินค้านี้มีอยู่ในตารางแล้ว',
                    variant: 'warning'
                })
            );
        } else if (selected) {
            // const hlItemNumber = selected.INID_Material_Code__c;
            const product = this.mapProduct(selected, [] , this.hlNumber);
            this.selectedProducts = [...this.selectedProducts, product];

            console.log('selectedProducts:', JSON.stringify(this.selectedProducts, null, 2));
        }

        this.searchProductTerm = '';
        this.showProductDropdown = false;
    }

    mapProduct(source, addedAddons = [] , hlNumber) {
        const isMainProduct = source.INID_Unit_Price__c > 0;
        const hasAddon = addedAddons.includes(source.INID_Material_Code__c);
        const salePrice = source.INID_Unit_Price__c || 0;
        const quantity = 1;
        const total = salePrice * quantity;
        hlNumber += 1;
        this.hlNumber = hlNumber ;

        return {
            rowKey: source.Id,
            id: source.Id,
            productPriceBookId: source.Id,
            code: source.INID_Material_Code__c,
            description: source.INID_SKU_Description__c,
            unitPrice: source.INID_Unit_Price__c || 0,
            quantity: 1,
            salePrice: source.INID_Unit_Price__c || 0,
            unit: source.INID_Unit__c || '',
            total: total,
            addOnButton: isMainProduct ? 'Add On' : null,
            addOnText: !isMainProduct ? 'Add-On Item' : null,
            addOn: isMainProduct ? 'true' : 'false',
            nameBtn: isMainProduct ? '+' : 'Add-On Item',
            variant: 'brand',
            editableSalePrice: true,
            addonDisabled: isMainProduct && hasAddon,
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
            p => p.code === this.currentMaterialCodeForAddOn && p.unitPrice !== 0
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
            id: addonId, 
            code: matchedMain.code,
            productCode: matchedMain.code,
            description: matchedMain.description,
            unitPrice: 0,
            salePrice: 0,
            quantity: 1,
            unit: matchedMain.unit,
            total: 0,
            nameBtn: this.getAddonLabel(this.selectedValue),
            variant: 'base',
            editableSalePrice: false,
            hlItemNumber: matchedMain.hlItemNumber || matchedMain.code,
            productPriceBookId: matchedMain.productPriceBookId
        };

        // alert('nameBtn is a : ' + JSON.stringify(addonProduct.nameBtn , null , 2)) ;

        // แทรก Add-on ใต้สินค้าหลัก
        this.addAddonToProduct(addonProduct);

        // ปิดปุ่ม Add-on บนสินค้าหลัก
        this.selectedProducts[matchedMainIndex].addonDisabled = true;

        this.dispatchEvent(new ShowToastEvent({
            title: 'เพิ่ม Add-on สำเร็จ',
            message: `คุณเลือกประเภท: ${this.getAddonLabel(this.selectedValue)}`,
            variant: 'success'
        }));

        this.isPopupOpenFreeGood = false;
        // this.currentMaterialCodeForAddOn = '';
        this.selectedValue = '';
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        const isAddon = row.unitPrice === 0;

        if (actionName === 'btnAddOn') {
            if (isAddon) {
                return;
            }

            this.currentMaterialCodeForAddOn = row.code;
            this.isPopupOpenFreeGood = true;
        }
    }

    addAddonToProduct(addonProduct) {
        const index = this.selectedProducts.findIndex(
            p => p.code === this.currentMaterialCodeForAddOn && p.unitPrice !== 0
        );

        if (index === -1) return;
        addonProduct.id = `${this.currentMaterialCodeForAddOn}_${Date.now()}`;
        addonProduct.isAddOn = true; 
        // addonProduct.recordId = this.recordId
        // addonProduct.buttonLabel = ''; 
        addonProduct.addOnText = addonProduct.displaylabel; 
        const newData = [...this.selectedProducts];
        newData.splice(index + 1, 0, addonProduct);
        this.selectedProducts = newData;
    }

    //search Product to AddProduct
    handleInputProduct(event) {
        this.searchProductTerm = event.target.value;
        const term = this.searchProductTerm.toLowerCase().trim();
        this.showProductDropdown = term.length > 2;
        this.filteredProductOptions = this.productPriceBook.filter(p => {
            const nameStr = p.INID_SKU_Description__c ? p.INID_SKU_Description__c.toLowerCase() : '';
            const codeStr = p.INID_Material_Code__c ? p.INID_Material_Code__c.toLowerCase() : '';
            return nameStr.includes(term) || codeStr.includes(term);
        });
    }

    handleSaveEditedRows(event) {
        const updatedValues = event.detail.draftValues;
        // alert(JSON.stringify(updatedValues, null, 2));


        this.selectedProducts = this.selectedProducts.map(product => {
            const updated = updatedValues.find(d => d.rowKey === product.rowKey);
            // alert(JSON.stringify(updated, null, 2));

            
            if (updated) {
                // alert('update this data successfully');
                const qty = Number(updated.quantity ?? product.quantity);
                const price = Number(updated.salePrice ?? product.salePrice);
                return {
                    ...product,
                    ...updated,
                    quantity: qty,
                    salePrice: price,
                    total: qty * price
                };
            }
            return product; 
        });
        this.draftValues = []; 
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

    async handleDeleteSelected() {
        if (this.selectedRowIds.length === 0) {
            alert('ไม่ได้เลือกสักรายการ');
            return;
        }

        const selectedSet = new Set(this.selectedRowIds);
        const addonsToDelete = this.selectedProducts.filter(p => 
            selectedSet.has(p.rowKey || p.id) && p.unitPrice === 0
        );

        addonsToDelete.forEach(addon => {
            const mainIndex = this.selectedProducts.findIndex(main =>
                main.code === addon.productCode && main.unitPrice !== 0
            );
            if (mainIndex !== -1) {
                this.selectedProducts[mainIndex].addonDisabled = false;
            }
        });

        this.selectedProducts = this.selectedProducts.filter(p => 
            !selectedSet.has(p.rowKey || p.id)
        );

        this.selectedRowIds = [];
        alert('ลบรายการจาก UI สำเร็จแล้ว');
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
        if (!this.enteredProductCodes || this.enteredProductCodes.length === 0) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'ไม่มีข้อมูล',
                message: 'กรุณากรอกรหัสสินค้าอย่างน้อย 1 รายการ',
                variant: 'error'
            }));
            return; // หยุดทำงานทันที
        }

        const addedProducts = [];
        const duplicatedCodes = [];

        this.enteredProductCodes.forEach(code => {
            const matched = this.productPriceBook.find(p => p.INID_Material_Code__c === code);
            if (matched) {
                const alreadyAdded = this.selectedProducts.some(p => p.code === code && p.unitPrice !== 0);
                if (!alreadyAdded) {
                    const salePrice = matched.INID_Unit_Price__c || 0;
                    const quantity = 1;
                    const total = salePrice * quantity;

                    const product = {
                        rowKey: matched.Id,
                        id: matched.Id,
                        code: matched.INID_Material_Code__c,
                        productPriceBookId: matched.Id, 
                        Name: matched.Name,
                        description: matched.INID_SKU_Description__c,
                        quantity: quantity,
                        salePrice,
                        unit: matched.INID_Unit__c,
                        unitPrice: matched.INID_Unit_Price__c,
                        total: total,
                        nameBtn: '+' ,
                        variant: 'brand' ,
                        editableSalePrice : true 
                        
                    };

                    addedProducts.push(product);
                } else {
                    duplicatedCodes.push(code);
                }
            } else {
                duplicatedCodes.push(code);
            }
        });

        if (addedProducts.length > 0) {
            this.selectedProducts = [...this.selectedProducts, ...addedProducts];
            this.isShowAddfromText = false ;

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

    applypromotionColumns = [
        { label: 'Promotion' , fieldName: 'promotion', type: 'text'},
        { label: 'Description' , fieldName: 'description', type: 'text'},
    ]

    // ---------------------------------------------------------------------------
    // Start: Sumary
    // ---------------------------------------------------------------------------

    isShowSummary = false ;
    @track summaryProducts = [];

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

    showSummary() {
        this.isShowOrder = false;
        this.isShowSummary = true;
        this.isShowApplyPromotion = false;
        this.summaryProducts = [];
        const mainProducts = this.selectedProducts.filter(p => p.unitPrice !== 0);

        mainProducts.forEach(main => {
            const relatedAddons = this.selectedProducts.filter(
                p => p.productCode === main.code && p.unitPrice === 0
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

            relatedAddons.forEach(addon => {
                this.summaryProducts.push({
                    ...addon,
                    addOnText: addon.nameBtn
                });
            });
        });
    }

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
    
        setTimeout(() => {
            const table = this.template.querySelector('.product-table');
            if (!this.dataTableInstanceAddProduct && table) {
                Promise.all([
                    loadScript(this, jquery + '/jquery.min.js'),
                    loadScript(this, datatables + '/jquery.dataTables.min.js'),
                    loadStyle(this, datatables + '/jquery.dataTables.min.css')
                ])
                .then(() => {
                    this.initializeDataTable();
                    this.dataTableInstanceAddProduct = true;
                    this.updateDataTable();
                })
                .catch(error => console.error('DataTables Load Error:', error));
            } else if (this.dataTableInstance) {
                // this.dataTableInstanceAddProduct.clear().draw();
                this.updateDataTable();
            }
        }, 50); // wait for DOM to be visible
    }


    showApplyPromotion() {
        this.isShowApplyPromotion = true ;
        this.isShowAddProduct = false ;
        this.isShowOrder = false ;
        
    }

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

    openOrder() {
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

    // Start Handle Save
      handleSaveSuccess() {
        const evt = new ShowToastEvent({
            title: 'รายการแจ้งเตือน',
            message: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
            variant: 'success',
        });
        this.dispatchEvent(evt);
        
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
            const orderId = await insertOrder({ order: orderDetail });
            this.orderId = orderId;
            alert('this order id : ' + this.orderId)
            await this.insertOrderItemListFunction(this.orderId); 
        } catch (error) {
            this.handleSaveError(error);
        }
    }

    async insertOrderItemListFunction(orderId) {
        let currentHLNumber = 0;
        let hlItemNumber = 0;

        const orderItemList = this.summaryProducts.map((item) => {
            if (item.isAddOn){
                    return {
                    INID_Quantity__c: item.quantity,
                    INID_Sale_Price__c: item.salePrice,
                    INID_Product_Price_Book__c: item.productPriceBookId,
                    INID_Type__c: 'Add-on',
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
                    INID_Type__c: 'Main',
                    INID_Order__c: orderId,
                    INID_HL_Number__c: currentHLNumber,
                    INID_Item_Number__c: item.itemNumber,
                    INID_Remark__c: item.addOnText || '',
                };
            }
        });
        console.log('Order Item List:', JSON.stringify(orderItemList, null, 2));
        try {
            await insertOrderItem({ orderList: orderItemList });
            this.handleSaveSuccess();
            setTimeout(() => {
                this.dispatchEvent(new CloseActionScreenEvent());
            }, 500);
        } catch (error) {
            this.handleSaveError(error);
        }
    }

    async handleSave(){
        if (!this.accountId) {
            this.handleSaveError({ message: 'AccountId is missing, please wait or reload.' });
            return;
        } 
        await this.insertOrderDetailFunction();   
    }

    handleSaveError(error) {
        alert('Save Error:\n' + JSON.stringify(error, null, 2));
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
}