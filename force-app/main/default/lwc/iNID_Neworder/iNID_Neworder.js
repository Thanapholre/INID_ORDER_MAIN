import { LightningElement, track, wire , api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import jquery from '@salesforce/resourceUrl/jquery';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FONT_AWESOME from '@salesforce/resourceUrl/fontawesome';
import { CloseActionScreenEvent } from 'lightning/actions';

// import class
import fetchCustomers from '@salesforce/apex/INID_OrderTest.fetchCustomers';
import fetchDataBillto from '@salesforce/apex/INID_OrderTest.fetchDataBillto';
import fetchDataShipto from '@salesforce/apex/INID_OrderTest.fetchDataShipto';
import fetchDataProductPriceBook from '@salesforce/apex/INID_OrderTest.fetchDataProductPriceBook'
// import fetchDataProduct from '@salesforce/apex/Test'


// import getRecord API
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import PAYMENT_TYPE_FIELD from '@salesforce/schema/Account.Payment_type__c';
import PAYMENT_TERM_FIELD from '@salesforce/schema/Account.Payment_term__c';
import INID_Organization__c from '@salesforce/schema/Account.INID_Organization__c';

export default class INID_Ordertest extends LightningElement {

    @track filteredCustomerOptions = [];
    @track searchTerm = '';
    @track showDropdown = false;
    @track customerId = ''

    @track paymentTypeValue = '';
    @track paymentTermValue = '';
    @track organizationValue = '';
    @track billto = '';
    @track shipto = '';

    @api recordId;

    // Call Apex Method HERE
    // fetch Customer
    @track accounts = [];

    @wire(fetchCustomers)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data;
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
                const record = data[0];
                this.billto = `${record.Name} `;
                // this.shipto = record.Name;
            } else {
                this.billto = '';
                this.shipto = '';
            }
        })
        .catch(error => {
            console.error('Error fetching BillTo/ShipTo:', error);
        });
    }


    // fetch Auto Field Ship To 
    @track shipto = ''; 
    @track shiptoOptions = []; 

    @wire(fetchDataShipto)
    fetchShipto(accountId) {
        fetchDataShipto({ accountId: accountId })
        .then(data => {
             if (data && data.length > 0) {
                this.shiptoOptions = data.map(addr => ({
                    label: addr.Name,
                    value: addr.Id
                }));

                // ตั้งค่า default เป็นตัวแรก
                this.shipto = data[0].Id;
            } else {
                this.shiptoOptions = [];
                this.shipto = '';
            }
        })
        .catch(error => {
            console.error('Error fetching ShipTo options:', error);
        });
    }

    // Fetch Data Price Book
    @track productPriceBook = [] ;

    @wire(fetchDataProductPriceBook)
    wiredproductPriceBook({ error, data }) {
        if (data) {
            this.productPriceBook = data;
            //  alert('Fetched Products:\n' + JSON.stringify(this.productPriceBook, null, 2));
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }


    get billToCodes() {
        return this.addressRecords?.data?.map(addr => addr.INID_Bill_To_Code__c) || [];
    }

    handleInput(event) {
        const input = event.target.value;
        this.searchTerm = input;
        
        console.log('Search term:', input);
        
        const term = input.toLowerCase().trim();

        if (term.length > 2) {
            this.filteredCustomerOptions = this.accounts.filter(cust =>
                (cust.Name && cust.Name.toLowerCase().includes(term)) ||
                (cust.INID_Customer_Code__c && cust.INID_Customer_Code__c.toLowerCase().includes(term))
            );

            // แสดง dropdown เฉพาะกรณีมีข้อมูล
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
        this.searchTerm = `${selectedCode} ${selectedName}`;
        this.showDropdown = false;

        this.recordId = selectedId;
        this.fetchBillTo(selectedId);
        this.fetchShipto(selectedId);
    }

    handleBlur() {
        setTimeout(() => {
            this.showDropdown = false;
        }, 200); 
    }

    //End get Apex Class

    // --------------------------------------------------------------------------------
    
    //getRecord 
    @wire(getRecord, {
        recordId: "$recordId",
        fields: [PAYMENT_TYPE_FIELD, PAYMENT_TERM_FIELD, INID_Organization__c]
    })
    fetchOrder({ error, data }) {
        if (data) {
            const fetchedPaymentType = getFieldValue(data, PAYMENT_TYPE_FIELD);
            const fetchedPaymentTerm = getFieldValue(data, PAYMENT_TERM_FIELD);
            const fetchedOrganization = getFieldValue(data, INID_Organization__c);

            // ตรวจสอบว่า paymentType ที่ได้มาอยู่ในตัวเลือกหรือไม่
            const isValidPaymentType = this.paymentTypeOption.some(opt => opt.value === fetchedPaymentType);
            this.paymentTypeValue = isValidPaymentType ? fetchedPaymentType : '';

            // ตรวจสอบว่า paymentTerm ที่ได้มาอยู่ในตัวเลือกหรือไม่
            const isValidPaymentTerm = this.paymentTermOption.some(opt => opt.value === fetchedPaymentTerm);
            this.paymentTermValue = isValidPaymentTerm ? fetchedPaymentTerm : '';

            const isValidOrganization = this.organizationOption.some(opt => opt.value === fetchedOrganization);
            this.organizationValue = isValidOrganization ? fetchedOrganization : '';

        }

    if (error) {
        
    }
}
    // End Get Record

    // Call Font Awesome
    connectedCallback() {
        loadStyle(this, FONT_AWESOME + '/css/all.min.css');
    }

    // ---------------------------------------------------------------------------
    // Start: Order Form - Customer & Payment Info
    // ---------------------------------------------------------------------------

    @track billto = '';
    @track shipto = '';
    @track purchaseOrderNumber = '';
    @track noteAgent = '';
    @track noteInternal = '';
    @track organizationValue = '';
    radioButtonOrderLabel1 = 'Include VAT';
    radioButtonOrderLabel2 = 'Exclude VAT';

    @track paymentTypeOptions = [];
    @track paymentTermOptions = [];
    @track value = [];


    // Global Piclists
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

    // Global Piclists


    get options() {
        return [
            { value: '1', label: 'Include VAT' },
            { value: '2', label: 'Exclude VAT' }
        ];
    }

    isShowAddProduct = false;
    isShowOrder = true;

    handleChangeRadioButton(event) {
        const selected = event.target.value;
        const isChecked = event.target.checked;
        this.value = isChecked ? [...this.value, selected] : this.value.filter(val => val !== selected);
    }

    handleKeyUp(evt) {
        if (evt.keyCode === 13) {
            this.customers = evt.target.value;
        }
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

    shiptoHandleChange(event) {
        this.shipto = event.detail.value;
    }

    //Validate
    validateOrder() {
    const allInputs = this.template.querySelectorAll(
        'lightning-input, lightning-combobox, lightning-textarea'
    );

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
        // เลื่อนไปและ focus เข้าไปที่ช่องแรกที่ error
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // ใส่ delay focus เพื่อให้ scroll เสร็จก่อน
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


    // ---------------------------------------------------------------------------
    // Start JS Add Product ------------------------------------------------------
    // ---------------------------------------------------------------------------

    @track selectedProducts = [];
    @track filteredProductOptions = [];
    @track showProductDropdown = false;
    @track searchProductTerm = '';


    @track productPriceBook = [];
    
    columns = [
        { label: 'Material Code', fieldName: 'code', type: 'text' },
        { label: 'SKU Description', fieldName: 'description', type: 'text' },
        { label: 'Unit Price', fieldName: 'unitPrice', type: 'number' },
        { label: 'Quantity', fieldName: 'quantity', type: 'text', editable: true },
        { label: 'Sale Price', fieldName: 'salePrice', type: 'number', editable: true },
        { label: 'Unit', fieldName: 'unit', type: 'text' },
        { label: 'Total', fieldName: 'total', type: 'number' },

        // ปุ่มสำหรับสินค้าหลักเท่านั้น
       {
            label: 'Add On',
            type: 'button',
            fieldName: 'displayaddon', // ใช้ field เดียว
            typeAttributes: {
                label: { fieldName: 'addonLabel' },
                name: 'open_addon_popup',
                iconName: { fieldName: 'addonIcon' },
                iconPosition: 'center',
                variant: 'bare',
                title: 'เพิ่ม Add-on',
                disabled: { fieldName: 'addonDisabled' }
            },
            cellAttributes: {
                class: { fieldName: 'addonClass' } // ควบคุมด้วยคลาส
            },
            hideDefaultActions: true
        }

    ];

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        // ตรวจสอบว่า row นี้เป็น Add-on หรือไม่
        const isAddon = row.unitPrice === 0;

        if (actionName === 'open_addon_popup') {
            if (isAddon) {
                return;
            }

            // กรณีเป็นสินค้าหลัก → เปิด popup
            this.currentMaterialCodeForAddOn = row.code;
            this.isPopupOpenFreeGood = true;
        }
    }


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

    handleSelectProduct(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selected = this.productPriceBook.find(p => p.Id === selectedId);

        const isDuplicate = this.selectedProducts.some(p => p.id === selectedId);
        if (!isDuplicate && selected) {
            const product = this.mapProduct(selected);
            this.selectedProducts = [...this.selectedProducts, product];
            console.log('selectedProducts:', JSON.stringify(this.selectedProducts));
        }
        this.searchProductTerm = '';
        this.showProductDropdown = false;
    }

    mapProduct(source) {
        const isMainProduct = (source.INID_Unit_Price__c || 0) > 0;

        return {
            id: source.Id,
            code: source.INID_Material_Code__c,
            description: source.INID_SKU_Description__c,
            unitPrice: source.INID_Unit_Price__c || 0,
            quantity: 1,
            salePrice: source.INID_Unit_Price__c || 0,
            unit: source.INID_Unit__c || '',
            total: (source.INID_Unit_Price__c || 0) * 1,

            addonLabel: isMainProduct ? isMainProduct : 'hello',
            addonIcon: isMainProduct ? 'utility:add' : '',
            addonDisabled: !isMainProduct,
            addonClass: isMainProduct ? 'show-as-button' : 'show-as-text'
        };
    }


    addAddonToProduct(addonProduct) {
        const mainIndex = this.selectedProducts.findIndex(
            p => p.code === addonProduct.productCode && p.unitPrice !== 0
        );

        if (mainIndex !== -1) {
            let insertIndex = mainIndex + 1;
            while (
                insertIndex < this.selectedProducts.length &&
                this.selectedProducts[insertIndex].unitPrice === 0 &&
                this.selectedProducts[insertIndex].productCode === addonProduct.productCode
            ) {
                insertIndex++;
            }

            const before = this.selectedProducts.slice(0, insertIndex);
            const after = this.selectedProducts.slice(insertIndex);
            this.selectedProducts = [...before, addonProduct, ...after];
        } else {
            this.selectedProducts = [...this.selectedProducts, addonProduct];
        }
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

        if (matchedMainIndex === -1) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'ไม่พบสินค้าหลักสำหรับ Add-on นี้',
                variant: 'error'
            }));
            return;
        }

        const addonCode = this.currentMaterialCodeForAddOn + '_addon_' + this.selectedValue;

        const alreadyExists = this.selectedProducts.some(p => p.code === addonCode);
        if (alreadyExists) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Warning',
                message: 'Add-on นี้ถูกเพิ่มไปแล้ว',
                variant: 'warning'
            }));
            return;
        }

        const matchedMain = this.selectedProducts[matchedMainIndex];

        const addonProduct = {
            code: addonCode,
            productCode: matchedMain.code,
            description: matchedMain.description,
            unitPrice: 0,
            salePrice: 0,
            quantity: 1,
            unit: '',
            total: 0,

            // ✅ ดึงค่าที่เลือกจาก dropdown หรือ radio
            displaylabel: this.getAddonLabel(this.selectedValue),
            addonDisabled: true,
            addonIcon: this.displaylabel,
            addonClass: 'show-as-text' // ✅ ใช้ class เพื่อแสดงเป็นข้อความเฉยๆ
        };



        // Insert Add-on ใต้สินค้าหลัก
        this.addAddonToProduct(addonProduct);

        // Disable ปุ่มเพิ่ม Add-on บนสินค้าหลัก
        this.selectedProducts[matchedMainIndex].addonDisabled = true;

        this.dispatchEvent(new ShowToastEvent({
            title: 'เพิ่ม Add-on สำเร็จ',
            message: `คุณเลือกประเภท: ${this.getAddonLabel(this.selectedValue)}`,
            variant: 'success'
        }));

        this.isPopupOpenFreeGood = false;
        this.currentMaterialCodeForAddOn = '';
        this.selectedValue = '';
    }

    

    getAddonLabel(value) {
    const map = {
            '1': 'ของแถม',
            '2': 'ตัวอย่าง',
            '3': 'บริจาค',
            '4': 'ชดเชย',
            '5': 'สมนาคุณ',
            '6': 'ของแถมนอกบิล (FOC)'
        };
        return map[value] || '-';
    }
  
    // ---------------------------------------------------------------------------
    // End JS Add Product --------------------------------------------------------
    // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
    // Start: Order Form - Product & Addon
    // ---------------------------------------------------------------------------

    @track isPopupOpenFreeGood = false;
    selectedValue = '';
    selectedLabel = '';
    @track currentMaterialCodeForAddOn = '';

    get options(){
        return [
            { label: 'ของแถม', value: '1' },
            { label: 'ตัวอย่าง', value: '2' },
            { label: 'บริจาค', value: '3' },
            { label: 'ชดเชย', value: '4' },
            { label: 'สมนาคุณ', value: '5' },
        ];
    }

    handleRemoveProduct(event) {
        const code = event.currentTarget.dataset.id;
        this.selectedProducts = this.selectedProducts.filter(p => p.materialCode !== code);
    }

    closePopupFreeGood() {
        this.isPopupOpenFreeGood = false;
        this.selectedValue = '';
        this.selectedLabel = ''; 
        this.searchProductTermAddOn = '';   
    }

    handleChangeFreeGoods(event) {
        this.selectedValue = event.detail.value;
        this.selectedLabel = event.detail.label;
    }

    @track addonSelections = [];
    @track filteredProductOptionsAddOn = [];
    @track showProductDropdownAddOn = false;
    @track searchProductTermAddOn = '';
    @track selectedProductsAddOn = [];
    @track selectedAddOnProduct;


    handleSelectProductAddOn(event) {
        const materialCode = event.currentTarget.dataset.id;
        const selected = this.productPriceBook.find(p => p.INID_Material_Code__c === materialCode);
        if (selected) {
            this.selectedAddOnProduct.INID_Material_Code__c
            this.searchProductTermAddOn = `${selected.INID_Material_Code__c} ${selected.INID_SKU_Description__c}`;
            this.showProductDropdownAddOn = false;
        }
    }


    addonButtonBound = false; 

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

            // ❗ ใส่ handler สำหรับ quantity และ salePrice
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


    isShowApplyPromotion = false ;
    // ---------------------------------------------------------------------------
    // End Order Form - Product & Addon
    // ---------------------------------------------------------------------------



    // ---------------------------------------------------------------------------
    // Start: Apply Promotion
    // ---------------------------------------------------------------------------

    isShowSummary = false ;

    showSummary() {
        this.isShowOrder = false ;
        this.isShowSummary = true ;
        this.isShowApplyPromotion = false ;

    }

    backtoProduct(){
        this.isShowAddProduct = true;
        this.isShowApplyPromotion = false ;

    }
    // ---------------------------------------------------------------------------
    // End Apply Promotion
    // ---------------------------------------------------------------------------

    
    // ---------------------------------------------------------------------------
    // Start: Summary 
    // ---------------------------------------------------------------------------

    backToApply() {
        this.isShowOrder = false ;
        this.isShowSummary = false;
        this.isShowApplyPromotion = true ;
    }

    handleCancel() {
        this.isShowOrder = true;
        this.isShowAddProduct = false;
        this.isShowSummary = false;
        this.isShowApplyPromotion = false ; 

    }

    handleSaveSuccess() {
        const evt = new ShowToastEvent({
            title: 'Save Successfully',
            message: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
            variant: 'success',
            mode: 'sticky'
        });
        this.dispatchEvent(evt);
    }
    // ---------------------------------------------------------------------------
    // End Summary
    // ---------------------------------------------------------------------------

    // handle Sale Price and Quantity function


    // add Product to Table section

    isShowAddfromText = false ;
    @track enteredProductCodes = [];
    @track textareaValue = '';


    //Plain Text
    showProductCode() {
        this.isShowAddfromText = !this.isShowAddfromText;
    }

    enterProductOnchange(event){
        const textareaValue = event.target.value || '';
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
            return; // ❗ หยุดทำงานทันที
        }

        const addedProducts = [];
        const duplicatedCodes = [];

        this.enteredProductCodes.forEach(code => {
            const matched = this.productPriceBook.find(p => p.INID_Material_Code__c === code);
            if (matched) {
                const alreadyAdded = this.selectedProducts.some(p => p.code === code && p.unitPrice !== 0);
                if (!alreadyAdded) {
                    const unitPrice = matched.INID_Unit_Price__c || 0;
                    const quantity = 1;
                    const total = unitPrice * quantity;

                    const product = {
                        id: matched.Id,
                        code: matched.INID_Material_Code__c,
                        Name: matched.Name,
                        description: matched.INID_SKU_Description__c,
                        quantity: quantity,
                        salePrice: unitPrice,
                        unit: matched.INID_Unit__c,
                        unitPrice: unitPrice,
                        total: total
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
                title: 'รายการซ้ำ',
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



    // handle cancle function
    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }


    openAddProduct() {
        this.isShowAddProduct = true ;
        this.isShowOrder = false ;
    }


    showApplyPromotion() {
        this.isShowApplyPromotion = true ;
        this.isShowAddProduct = false ;
        this.isShowOrder = false ;
        
    }



}