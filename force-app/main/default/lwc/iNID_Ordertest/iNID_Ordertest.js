import { LightningElement, track, wire , api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import LightningConfirm from 'lightning/confirm';
import { NavigationMixin } from 'lightning/navigation';

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

export default class INID_Ordertest extends NavigationMixin(LightningElement) {

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
            // alert('Fetched accounts: ' + JSON.stringify(data, null, 2));
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

    // handleInput(event) {
    //     const input = event.target.value;
    //     this.searchTerm = input;
        
    //     console.log('Search term:', input);
        
    //     const term = input.toLowerCase().trim();

    //     if (term.length > 2) {
    //         this.filteredCustomerOptions = this.accounts.filter(cust =>
    //             (cust.Name && cust.Name.toLowerCase().includes(term)) ||
    //             (cust.INID_Customer_Code__c && cust.INID_Customer_Code__c.toLowerCase().includes(term))
    //         );

    //         // แสดง dropdown เฉพาะกรณีมีข้อมูล
    //         this.showDropdown = this.filteredCustomerOptions.length > 0;
    //     } else {
    //         this.filteredCustomerOptions = [];
    //         this.showDropdown = false;
    //     }
    // }

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

        getAddonLabel(value) {
            const map = {
                '1': 'ของแถม',
                '2': 'ของแถมนอกบิล (FOC)',
                '3': 'ตัวอย่าง',
                '4': 'บริจาค',
                '5': 'ชดเชย',
                '6': 'สมนาคุณ',
                
            };
            return map[value] || '-';
        }
    
    columns = [
        { label: 'Material Code', fieldName: 'code', type: 'text', hideDefaultActions: true ,  cellAttributes: { alignment: 'right' }, initialWidth: 110},
        { label: 'SKU Description', fieldName: 'description', type: 'text', hideDefaultActions: true , cellAttributes: { alignment: 'right' } , initialWidth: 230}, 
        { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency' , typeAttributes: {minimumFractionDigits: 2}, hideDefaultActions: true, cellAttributes: { alignment: 'right', } , initialWidth: 108},
        { label: 'Quantity', fieldName: 'quantity', type: 'text', editable: true, hideDefaultActions: true , cellAttributes: { alignment: 'right' } , initialWidth: 100 }, 
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency' , typeAttributes: {minimumFractionDigits: 2}, editable: {fieldName : 'editableSalePrice'} , hideDefaultActions: true ,  cellAttributes: { alignment: 'center'} , initialWidth: 155},
        { label: 'Unit', fieldName: 'unit', type: 'text', hideDefaultActions: true ,  cellAttributes: { alignment: 'right' } , initialWidth: 70},
        { label: 'Total', fieldName: 'total', type: 'currency' , typeAttributes: {minimumFractionDigits: 2}, hideDefaultActions: true ,  cellAttributes: { alignment: 'right' } , initialWidth: 116},
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

    mapProduct(source, addedAddons = []) {
        const isMainProduct = source.INID_Unit_Price__c > 0;
        const hasAddon = addedAddons.includes(source.INID_Material_Code__c);

        // const quantity = 1;

        const salePrice = source.INID_Unit_Price__c || 0;
        const quantity = 1;
        const total = salePrice * quantity;

        return {
            id: source.Id,
            code: source.INID_Material_Code__c,
            description: source.INID_SKU_Description__c,
            unitPrice: source.INID_Unit_Price__c || 0,
            quantity: 1,
            salePrice: source.INID_Unit_Price__c || 0,
            unit: source.INID_Unit__c || '',
            total: total,

            addOnButton: isMainProduct ? 'Add On' : null,
            addOnText: !isMainProduct ? 'Add-On Item' : null ,
            addOn: isMainProduct ? 'true' : 'false' ,
            // isAddOn: !isMainProduct ,

            nameBtn: isMainProduct ? '+' : 'Add-On Item' ,
            variant: 'brand' ,
            editableSalePrice : true,

            addonDisabled: isMainProduct && hasAddon
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
            code: matchedMain.code,
            productCode: matchedMain.code,
            description: matchedMain.description,
            unitPrice: 0,
            salePrice: 0,
            quantity: 1,
            unit: matchedMain.unit,   
            total: 0,
            nameBtn: this.getAddonLabel(this.selectedValue),
            variant: 'base' ,
            editableSalePrice: false
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


    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        // ตรวจสอบว่า row นี้เป็น Add-on หรือไม่
        const isAddon = row.unitPrice === 0;

        if (actionName === 'btnAddOn') {
            if (isAddon) {
                return;
            }

            // กรณีเป็นสินค้าหลัก → เปิด popup
            this.currentMaterialCodeForAddOn = row.code;
            this.isPopupOpenFreeGood = true;
        }
    }


    addAddonToProduct(addonProduct) {
        const index = this.selectedProducts.findIndex(
            p => p.code === this.currentMaterialCodeForAddOn && p.unitPrice !== 0
        );

        if (index === -1) return;

        // ใส่รหัสเพื่อไม่ให้ key ซ้ำ
        addonProduct.id = `${this.currentMaterialCodeForAddOn}_${Date.now()}`;
        addonProduct.isAddOn = true; // ปิดปุ่มในแถวนี้
        addonProduct.buttonLabel = ''; // ไม่แสดงปุ่ม
        addonProduct.addOnText = addonProduct.displaylabel; // ใช้ label

        // แทรก Add-on ต่อจากสินค้าหลัก
        const newData = [...this.selectedProducts];
        newData.splice(index + 1, 0, addonProduct);

        this.selectedProducts = newData;
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
            
        } else if(isDuplicate){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'รายการซ้ำ',
                    message: 'สินค้านี้มีอยู่ในตารางแล้ว',
                    variant: 'warning',
                })
            )
        }
        this.searchProductTerm = '';
        this.showProductDropdown = false;
    }

    //Edid Fieled Rows
    @track draftValues = [];

    handleSaveEditedRows(event) {
        const updatedValues = event.detail.draftValues;

        this.selectedProducts = this.selectedProducts.map(product => {
            const updated = updatedValues.find(d => d.id === product.id);
            if (updated) {
                const qty = Number(updated.quantity ?? product.quantity);
                const price = Number(updated.salePrice ?? product.salePrice);
                return {
                    ...product,
                    quantity: qty,
                    salePrice: price,
                    total: qty * price
                };
            }
            return product; 
        });

        this.draftValues = []; // เคลียร์ draft เพื่อซ่อนปุ่ม

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Edit field successfully',
                variant: 'success'
            })
        );
    }

    @track selectedRowIds = [];

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        let newSelectedIds = [];

        selectedRows.forEach(row => {
            const isMain = row.unitPrice !== 0;

            if (isMain) {
                // หาตัว Add-on ที่เกี่ยวข้องกับ main ตัวนี้
                const relatedAddons = this.selectedProducts.filter(
                    p => p.productCode === row.code && p.unitPrice === 0
                );

                // เก็บ id ทั้ง main + add-on
                newSelectedIds.push(row.id);
                relatedAddons.forEach(addon => {
                    newSelectedIds.push(addon.id);
                });
            } else {
                // ถ้าเป็น Add-on เลือกแค่ตัวมันเอง
                newSelectedIds.push(row.id);
            }
        });

        // กำจัด ID ซ้ำด้วย Set แล้วแปลงกลับเป็น array
        this.selectedRowIds = [...new Set(newSelectedIds)];
    }


    async handleDeleteSelected() {
        if (!Array.isArray(this.selectedRowIds) || this.selectedRowIds.length === 0) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'ไม่มีรายการถูกเลือกเลย',
                message: 'กรุณาเลือกอย่างน้อย 1 รายการ',
                variant: 'warning'
            }));
            return;
        }

        // นับจำนวนแถวที่จะถูกลบ (รวม Add-on)
        const selectedIdsSet = new Set(this.selectedRowIds);

        const selectedMainCodes = this.selectedProducts
            .filter(p => selectedIdsSet.has(p.id) && p.unitPrice !== 0)
            .map(p => p.code);

        const toBeDeleted = this.selectedProducts.filter(product => {
            const isSelected = selectedIdsSet.has(product.id);
            const isAddonOfDeletedMain = selectedMainCodes.includes(product.productCode);
            return isSelected || isAddonOfDeletedMain;
        });

        // แสดงกล่องยืนยันก่อนลบ
        const result = await LightningConfirm.open({
            message: `คุณแน่ใจหรือไม่ว่าต้องการลบทั้งหมด ${toBeDeleted.length} รายการ`,
            variant: 'header',
            label: 'ยืนยันการลบ',
            theme: 'warning'
        });

        if (!result) {
            return; // ผู้ใช้กดยกเลิก
        }

        // ดำเนินการลบ
        const deletedAddonProductCodes = toBeDeleted
            .filter(p => p.unitPrice === 0)
            .map(p => p.productCode);

        this.selectedProducts = this.selectedProducts
            .filter(product => !toBeDeleted.includes(product))
            .map(product => {
                if (product.unitPrice !== 0 && deletedAddonProductCodes.includes(product.code)) {
                    return {
                        ...product,
                        addonDisabled: false
                    };
                }
                return product;
            });

        this.selectedRowIds = [];

        this.dispatchEvent(new ShowToastEvent({
            title: 'ลบสำเร็จ',
            message: `ลบรายการทั้งหมด ${toBeDeleted.length} รายการเรียบร้อยแล้ว`,
            variant: 'success'
        }));
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
            { label: 'ของแถมนอกบิล (FOC)', value: '2' },
            { label: 'ตัวอย่าง', value: '3' },
            { label: 'บริจาค', value: '4' },
            { label: 'ชดเชย', value: '5' },
            { label: 'สมนาคุณ', value: '6' },

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
    isLoaded = false;

    isShowOrder = false;

    constructor() {
        super(); // อย่าลืมเรียก super() ก่อน
        this.isShowOrder = true;
        this.isShowAddProduct = false;

    }

    renderedCallback() {
        // ใส่ style modal
        if (!this.template.querySelector('style[data-id="custom-modal-style"]')) {
            const STYLE = document.createElement("style");
            STYLE.dataset.id = "custom-modal-style";
           STYLE.innerText = `
            .uiModal .modal-container {
                width: 1200px !important;
                max-width: 95%;
                min-width: 480px;
                max-height: 95vh;
                overflow: hidden !important;
            }
            .uiModal .modal-container .modal-body {
                overflow-y: hidden !important;
                max-height: 70vh;
            }
        `;
            this.template.appendChild(STYLE);
        }

        // Bind event แค่ครั้งเดียว
        if (!this.addonButtonBound) {
            this.template.addEventListener('click', event => {
                const button = event.target.closest('.addon-btn');
                if (button) {
                    const materialCode = button.dataset.id;
                    const hasAddon = this.selectedProducts.some(
                        p => p.code === materialCode && p.unitPrice === 0
                    );

                    if (!hasAddon) {
                        this.currentMaterialCodeForAddOn = materialCode;
                        this.isPopupOpenFreeGood = true;
                    }
                }

                // optional input bindings
                const quantityInputs = this.template.querySelectorAll('.quantity-input');
                const salePriceInputs = this.template.querySelectorAll('.sale-price-input');

                quantityInputs.forEach(input => {
                    input.addEventListener('change', this.handleQuantityChange.bind(this));
                });

                salePriceInputs.forEach(input => {
                    input.addEventListener('change', this.handleSalePriceChange.bind(this));
                });
            });

            this.addonButtonBound = true;
        }
    }


    isShowApplyPromotion = false ;
    // ---------------------------------------------------------------------------
    // End Order Form - Product & Addon
    // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
    //Apply Promotion
    // ---------------------------------------------------------------------------

    applypromotionColumns = [
        { label: 'Promotion' , fieldName: 'promotion', type: 'text'},
        { label: 'Description' , fieldName: 'description', type: 'text'},
    ]

    // ---------------------------------------------------------------------------
    //End Apply Promotion
    // ---------------------------------------------------------------------------

    // ---------------------------------------------------------------------------
    // Start: Sumary
    // ---------------------------------------------------------------------------

    isShowSummary = false ;
    @track summaryProducts = [];

    summaryColumns = [
        { label: 'Material Code', fieldName: 'code', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 150 },
        { label: 'SKU Description', fieldName: 'description', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 200 },
        { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true , cellAttributes: { alignment: 'right' } , initialWidth: 115 },
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
            // หา Add-on ที่ตรงกับสินค้าหลักนี้
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

            // ดันสินค้าหลักเข้า summary
            this.summaryProducts.push({
                ...main,
                netPrice: netPrice,
                addOnText: null
            });

            // ดัน Add-on ต่อจากสินค้าหลัก
            relatedAddons.forEach(addon => {
                this.summaryProducts.push({
                    ...addon,
                    addOnText: addon.nameBtn || 'Add-On Item'
                });
            });
        });
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
            // ปิดแท็บใน console
            const workspaceAPI = this.template.querySelector("lightning-tabset");

            // ถ้าเป็น Lightning Console App
            const workspace = this.template.querySelector("c__workspaceAPI"); // ใช้ component ที่ wrap workspaceAPI

            if (workspace && workspace.isConsoleNavigation()) {
                workspace.getFocusedTabInfo().then((tabInfo) => {
                    workspace.closeTab({ tabId: tabInfo.tabId });
                });
            }

            // หรือใช้ Navigate ไป URL ที่ต้องการ
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: 'https://bgrimmpharma--dev.sandbox.lightning.force.com/lightning/o/Order/list?filterName=__Recent' // เปลี่ยนเป็น URL ที่คุณต้องการ
                }
            });
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
                    const salePrice = matched.INID_Unit_Price__c || 0;
                    const quantity = 1;
                    const total = salePrice * quantity;

                    const product = {
                        id: matched.Id,
                        code: matched.INID_Material_Code__c,
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



    // handle cancle function
    // handleCancel() {
    //     this.dispatchEvent(new CloseActionScreenEvent());
    // }


    openAddProduct() {
        if(!this.validateOrder()){
            return;
        }
        this.isShowAddProduct = true;
        this.isShowOrder = false;

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


    isShowPickListType = true ;

    openOrder() {
         if (this.validateInputs()){
            this.checkedAlertTypeOfOrder(this.typeOrderFirstValue,this.typeOrderSecondValue,this.searchQuoteValue);
            this.isShowOrder = true ;
            this.isShowAddProduct = false ;
            this.isShowPickListType = false;
         }
    }

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


    get typeOrderFirstOption() {
        return [
            {value: 'Create New Order' , label: 'Create New Order'}, 
            {value: 'Create New Order By Quote' , label: 'Create New Order By Quote'}
        ]
    }

    typeOrderFirstHandleChange(event) {
        this.typeOrderFirstValue = event.detail.value;
        if(this.typeOrderFirstValue === "Create New Order") {
            this.isShowSecondValue = true ;
            this.isShowSearchQuote = false ;
            // this.typeOfOrder = `Customer (${this.typeOrderSecondValue})` ;
            
        }else {
            this.isShowSecondValue = false;
            this.isShowSearchQuote = true ;
            this.typeOrderSecondValue = 'Sales Order' ;
            // messageParts.push('Quote Id is: ' + this.searchQuoteValue);
        }
    }

    get typeOrderSecondOption() {
        return [
            { value: 'Sales Order', label: 'Sales Order' },
            { value: 'Borrow Order', label: 'Borrow Order' },
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
            this.typeOfOrder = `Create New Order By Quotation`;
        } else if (secondType !== '') {
            this.typeOfOrder = `Customer (${this.typeOrderSecondValue})`;
            messageParts.push('Value is: ' + secondType);
        }

        if (firstType !== '') {
            messageParts.push('Type is: ' + firstType);
        }

        // if (messageParts.length > 0) {
        //     const evt = new ShowToastEvent({
        //         title: 'Order Information',
        //         message: messageParts.join('\n'),
        //         variant: 'success'
        //     });
        //     this.dispatchEvent(evt);
        // }
    }

    

    handleInputQuoteId(event) {
        const input = event.target.value;
        this.searchQuoteValue = input;

        const inputQuoteId = input.toLowerCase().trim();

        if (inputQuoteId.length > 2) {
            this.filteredCustomerOptions = this.accounts.filter(cust =>
                (cust.Name && cust.Name.toLowerCase().includes(inputQuoteId)) ||
                (cust.INID_Customer_Code__c && cust.INID_Customer_Code__c.toLowerCase().includes(inputQuoteId))
            );

            // แสดง dropdown เฉพาะกรณีมีข้อมูล
            this.showDropdown = this.filteredCustomerOptions.length > 0;
        } else {
            this.filteredCustomerOptions = [];
            this.showDropdown = false;
        }
    }


    validateInputs() {
        let isValid = true;

        // 1. Validate combobox และ input ทั้งหมดใน card
        const inputs = this.template.querySelectorAll(
            'lightning-combobox, lightning-input'
        );

        inputs.forEach(input => {
            // ถ้า invalid จะ show error ด้วย
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }







}