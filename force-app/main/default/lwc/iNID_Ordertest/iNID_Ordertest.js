import { LightningElement, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import datatables from '@salesforce/resourceUrl/datatables';
import jquery from '@salesforce/resourceUrl/jquery';

export default class INID_Ordertest extends LightningElement {

    // ---------------------------------------------------------------------------
    // Start: Order Form - Customer & Payment Info
    // ---------------------------------------------------------------------------

    @track billto = '';
    @track shipto = '';
    @track purchaseOrderNumber = '';
    @track noteAgent = '';
    @track noteInternal = '';

    @track organizationValue = '';
    @track paymentTypeValue = '';
    @track paymentTermValue = '';

    @track searchTerm = '';
    @track selectedCustomerId = '';
    @track customerSelected = '';
    @track showDropdown = false;
    @track filteredCustomerOptions = [];

    checkboxLabel1 = 'Include VAT';
    checkboxLabel2 = 'Exclude VAT';
    @track value = [];

    customers = [
        { Id: '1000002', Name: 'โรงพยาบาลกลาง' },
        { Id: '1000036', Name: 'บริษัท เดอะซีนเนียร์ เฮลท์แคร์ จำกัด' },
        { Id: '1000100', Name: 'บริษัท โรงพยาบาลมิชชั่น จำกัด' }
    ];

    get organizationOption() {
        return [
            { value: '1001', label: '1001-MEDLINE' },
            { value: '2001', label: '2001-UNISON' },
            { value: '3001', label: '3001-F.C.P.' }
        ];
    }

    get paymentTypeOption() {
        return [
            { value: '1', label: 'Cash' },
            { value: '2', label: 'Credit' }
        ];
    }

    get paymentTermOption() {
        return [
            { value: 'N000', label: 'N000-Immediately' },
            { value: 'N030', label: 'N030-Within 30 Days Due Net' },
            { value: 'N045', label: 'N045-Within 45 Days Due Net' }
        ];
    }

    get options() {
        return [
            { value: '1', label: 'Include VAT' },
            { value: '2', label: 'Exclude VAT' }
        ];
    }

    isShowAddProduct = false;
    isShowOrder = true;

    handleInput(event) {
        this.searchTerm = event.target.value;
        this.showDropdown = this.searchTerm.length > 2;
        this.filteredCustomerOptions = this.customers.filter(cust =>
            cust.Name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            cust.Id.includes(this.searchTerm)
        );
    }

    handleSelectCustomer(event) {
        const id = event.currentTarget.dataset.id;
        const name = event.currentTarget.dataset.name;
        this.searchTerm = `${id} ${name}`;
        this.selectedCustomerId = id;
        this.showDropdown = false;
    }

    handleBlur() {
        setTimeout(() => this.showDropdown = false, 200);
    }

    handleChange(event) {
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

    openAddProduct() {
        this.isShowAddProduct = true;
        this.isShowOrder = false;
    
        setTimeout(() => {
            const table = this.template.querySelector('.product-table');
            if (!this.datatableInitialized && table) {
                Promise.all([
                    loadScript(this, jquery + '/jquery.min.js'),
                    loadScript(this, datatables + '/jquery.dataTables.min.js'),
                    loadStyle(this, datatables + '/jquery.dataTables.min.css')
                ])
                .then(() => {
                    this.initializeDataTable();
                    this.datatableInitialized = true;
                    this.updateDataTable();
                })
                .catch(error => console.error('DataTables Load Error:', error));
            } else if (this.dataTableInstance) {
                this.dataTableInstance.clear().draw();
                this.updateDataTable();
            }
        }, 50); // wait for DOM to be visible
    }

    backtoOrder() {
        this.isShowAddProduct = false;
        this.isShowOrder = true;
    }

    // ---------------------------------------------------------------------------
    // Start JS Add Product ------------------------------------------------------
    // ---------------------------------------------------------------------------

    //loadScript, loadStyle, jquery, datatables
    datatableInitialized = false; // Flag ใหม่เพื่อไม่ให้ initialize ซ้ำ

    //initializeDataTable method
    initializeDataTable() {
        const table = this.template.querySelector('.product-table');
        if (table) {
            this.dataTableInstance = $(table).DataTable({
                searching: false,
                paging: false,
                ordering: false,
                info: false,
                responsive: true,
                scrollX: false,
                columnDefs: [
                    { targets: 0, width: '120px' },
                    { targets: 1, width: '200px' }
                ]
            });
        }
    }

    @track selectedProducts = [];
    @track filteredProductOptions = [];
    @track showProductDropdown = false;
    @track searchProductTerm = '';

    dataTableInstance;
    datatableInitialized = false;

    productOption = [
        { materialCode: '1000000002', description: 'AFZOLINE XL 10 MG.TAB.3X10 S', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000003', description: 'ALBER-T OINT.10 GM.', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000004', description: 'ALLORA 5 MG.TAB.1X10 S', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' }
    ];

    initializeDataTable() {
        const table = this.template.querySelector('.product-table');
        if (table) {
            this.dataTableInstance = $(table).DataTable({
                searching: false,
                paging: false,
                ordering: false,
                info: false
            });
        }
    }

    // กรองจากการ search input
    handleInputProduct(event) {
        this.searchProductTerm = event.target.value;
        const term = this.searchProductTerm.toLowerCase();
        this.showProductDropdown = term.length > 2;
        this.filteredProductOptions = this.productOption.filter(p =>
            p.description.toLowerCase().includes(term) || p.materialCode.includes(term)
        );
    }

    handleSelectProduct(event) {
        const materialCode = event.currentTarget.dataset.id;
        const existing = this.selectedProducts.find(p => p.materialCode === materialCode && p.salePrice !== 0);
        if (!existing) {
            const selected = this.productOption.find(p => p.materialCode === materialCode);
            if (selected) {
                const total = selected.salePrice * selected.quantity;
                const newProduct = { ...selected, total };
                this.selectedProducts = [...this.selectedProducts, newProduct];

                const relatedAddons = this.addonSelections.filter(
                    a => a.productCode === materialCode
                ).map(a => ({
                    materialCode: a.addonMaterialCode,
                    description: a.addonDescription,
                    salePrice: 0,
                    quantity: 0,
                    unit: '-',
                    total: Number(a.discountValue || 0),
                    addonLabel: a.addonLabel
                }));

                this.selectedProducts = [...this.selectedProducts, ...relatedAddons];

                this.dataTableInstance.clear();

                this.selectedProducts.forEach(product => {
                    this.dataTableInstance.row.add([
                        `<input style="text-align: center;" type="checkbox" />`,
                        product.materialCode,
                        product.description,
                        product.salePrice === 0 ? '-' : product.unitPrice.toFixed(2),
                        product.salePrice.toFixed(2),
                        product.quantity,
                        product.unit,
                        product.total.toFixed(2),
                        product.salePrice === 0 ? product.addonLabel : `
                            <button 
                                style="width:40px;
                                height:40px;
                                border-radius:50%;
                                border:1px solid #ccc;
                                background-color:white;
                                color:#007bff;
                                font-size:24px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                margin:auto;
                                cursor:pointer;"
                                class="addon-btn" data-id="${product.materialCode}">+</button>
                        `
                    ]);
                });

                this.dataTableInstance.draw();
            }
        }

        this.searchProductTerm = '';
        this.showProductDropdown = false;
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

    showPopupFreeGood(materialCode) {
        this.currentMaterialCodeForAddOn = materialCode;
        this.isPopupOpenFreeGood = true;
    }

    closePopupFreeGood() {
        this.isPopupOpenFreeGood = false;
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
    selectedAddOnProduct = null;

    handleInputProductAddOn(event) {
        this.searchProductTermAddOn = event.target.value;
        if (this.searchProductTermAddOn.length > 2) {
            const term = this.searchProductTermAddOn.toLowerCase();
            this.filteredProductOptionsAddOn = this.productOption.filter(
                p => p.description.toLowerCase().includes(term) || p.materialCode.toLowerCase().includes(term)
            );
            this.showProductDropdownAddOn = true;
        } else {
            this.showProductDropdownAddOn = false;
        }
    }

    handleSelectProductAddOn(event) {
        const materialCode = event.currentTarget.dataset.id;
        const description  = event.currentTarget.dataset.name;

        this.selectedAddOnProduct = this.productOption.find(p => p.materialCode === materialCode);
        this.searchProductTermAddOn = `${materialCode} ${description}`;
        this.showProductDropdownAddOn = false;
    }

    handleSave() {
        if (!this.selectedAddOnProduct) return;

        const matchedMainProduct = this.productOption.find(
            p => p.materialCode === this.currentMaterialCodeForAddOn
        );

        const selectedOption = this.options.find(opt => opt.value === this.selectedValue);
        const addonLabel = selectedOption ? selectedOption.label : 'ของแถม';

        const isAlreadyUsed = this.addonSelections.some(
            a => a.productCode === this.currentMaterialCodeForAddOn &&
                 a.addonType === this.selectedValue &&
                 a.addonMaterialCode === this.selectedAddOnProduct.materialCode
        );

        if (isAlreadyUsed) {
            console.warn('Add-on นี้ถูกเลือกไปแล้ว');
            return;
        }

        let addonProduct;

        if (addonLabel === 'ส่วนลด') {
            const discountPercent = 10;
            const mainTotal = matchedMainProduct.salePrice * matchedMainProduct.quantity;
            const discountValue = (mainTotal * discountPercent / 100).toFixed(2);

            addonProduct = {
                ...this.selectedAddOnProduct,
                salePrice: 0.00,
                quantity: 0,
                unit: '-',
                total: Number(discountValue),
                addonLabel: addonLabel,
                isDiscount: true,
                discountPercent: `${discountPercent}%`,
                discountValue: discountValue
            };
        } else {
            addonProduct = {
                ...this.selectedAddOnProduct,
                salePrice: 0.00,
                quantity: 2,
                total: 0.00,
                addonLabel: addonLabel,
                isDiscount: false
            };
        }

        const mainIndex = this.selectedProducts.findIndex(
            p => p.materialCode === this.currentMaterialCodeForAddOn && p.salePrice !== 0
        );

        // Check if the main product is already in the selected products
        if (mainIndex !== -1) {
            let insertIndex = mainIndex + 1;
            while (
                insertIndex < this.selectedProducts.length &&
                this.selectedProducts[insertIndex].salePrice === 0
            ) {
                insertIndex++;
            }

            const before = this.selectedProducts.slice(0, insertIndex);
            const after = this.selectedProducts.slice(insertIndex);
            this.selectedProducts = [...before, addonProduct, ...after];
        } else {
            this.selectedProducts = [...this.selectedProducts, addonProduct];
        }

        const record = {
            productCode: this.currentMaterialCodeForAddOn,
            productDescription: matchedMainProduct.description,
            addonType: this.selectedValue,
            addonLabel: addonLabel,
            addonMaterialCode: this.selectedAddOnProduct.materialCode,
            addonDescription: this.selectedAddOnProduct.description
        };

        this.addonSelections = [...this.addonSelections, record];
        this.searchProductTermAddOn = `${this.selectedAddOnProduct.materialCode} ${this.selectedAddOnProduct.description}`;
        this.updateDataTable();
        this.closePopupFreeGood();

        this.currentMaterialCodeForAddOn = null;
        this.selectedValue = '';
        this.selectedAddOnProduct = null;
        this.searchProductTermAddOn = '';
    }

    //Update Data Table
    updateDataTable() {
        if (!this.dataTableInstance) return;
        this.dataTableInstance.clear();

        this.selectedProducts.forEach(product => {
            this.dataTableInstance.row.add([
                `<input style="text-align: center;" type="checkbox" />`,
                `<div style="text-align: left;">${product.materialCode}</div>`,
                `<div style="text-align: left;">${ product.description}</div>`,
                `<div style="text-align: right;">${product.salePrice === 0 ? 0 : product.unitPrice.toFixed(2)}</div>`,
                `<div style="text-align: right;">${product.salePrice.toFixed(2)}</div>`,
                `<div style="text-align: right;">${product.quantity}</div>`,
                `<div style="text-align: center;">${product.unit}</div>`,
                `<div style="text-align: right;">${product.total.toFixed(2)}</div>`,
                product.salePrice === 0 ? `<div style="text-align: center;">${product.addonLabel}</div>` : `
                    <button 
                        style="width:40px;height:40px;border-radius:50%;border:1px solid #ccc;
                        background-color:white;color:#007bff;font-size:24px;display:flex;
                        align-items:center;justify-content:center;margin:auto;cursor:pointer;"
                        class="addon-btn" data-id="${product.materialCode}" >+</button>
                `
            ]);
        });
        this.dataTableInstance.draw();
    }
    // End Add On Section


    //handleDeleteSelected
    handleDeleteSelected(){
        const table = this.template.querySelector('.product-table');
        const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]:checked');

        const selectedIds = [];

        checkboxes.forEach((checkbox, index ) => {
            const row = this.dataTableInstance.row(checkbox.closest('tr'));
            const rowData = this.selectedProducts[row];
        
        if (rowData && rowData.materialCode) {
            selectedIds.push(rowData.materialCode);
        }
    });

    if (selectedIds.length === 0) {
        alert('กรุณาเลือกรายการที่ต้องการลบ');
        return;
    }
    const confirmDelete = confirm('คุณต้องการลบรายการที่เลือกหรือไม่?');
}
    //Ckeckbox Select All
    handleSelectAll(event) {
        const isChecked = event.target.checked;
        const checkboxes = this.template.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = isChecked);
        event.preventDefault();
    }


    addonButtonBound = false; // เพิ่มไว้ข้างบนใน class เพื่อป้องกัน bind ซ้ำ

    renderedCallback() {
        if (this.addonButtonBound) return;
        this.addonButtonBound = true;

        this.template.addEventListener('click', event => {
            if (event.target.classList.contains('addon-btn')) {
                const materialCode = event.target.dataset.id;
                this.showPopupFreeGood(materialCode);
            }
        });
    }

} 
// ---------------------------------------------------------------------------
// End Order Form - Product & Addon
// ---------------------------------------------------------------------------
