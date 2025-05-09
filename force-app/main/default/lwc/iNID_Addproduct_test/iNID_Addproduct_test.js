import { LightningElement , track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import datatables from '@salesforce/resourceUrl/datatables';
import jquery from '@salesforce/resourceUrl/jquery';

export default class INID_Addproduct_test extends LightningElement {

    // Start Section Search Product
    @track filteredProductOptions = [];
    @track showProductDropdown = false;
    @track searchProductTerm = '';
    @track selectedProducts = [];

    productOption = [
        { materialCode: '1000000002', description: 'AFZOLINE XL 10 MG.TAB.3X10 S', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000003', description: 'ALBER-T OINT.10 GM.', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000004', description: 'ALLORA 5 MG.TAB.1X10 S', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' }
    ];

    handleInputProduct(event) {
        this.searchProductTerm = event.target.value;
        if (this.searchProductTerm.length > 2) {
            const term = this.searchProductTerm.toLowerCase();
            this.filteredProductOptions = this.productOption.filter(
                p => p.description.toLowerCase().includes(term) || p.materialCode.toLowerCase().includes(term)
            );
            this.showProductDropdown = true;
        } else {
            this.showProductDropdown = false;
        }
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
                        `<input type="checkbox" />`,
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
    // End Section Search Product

    // Start Section Create Table Here By DataTables.Net
    renderedCallback() {
        if (this.datatablesInitialized) return;
        this.datatablesInitialized = true;

        Promise.all([
            loadScript(this, jquery + '/jquery.min.js'),
            loadScript(this, datatables + '/jquery.dataTables.min.js'),
            loadStyle(this, datatables + '/jquery.dataTables.min.css'),
        ])
        .then(() => {
            this.initializeDataTable();
        })
        .catch(error => {
            console.error('DataTables Load Error:', error);
        });
    }

    initializeDataTable() {
        const table = this.template.querySelector('.product-table');
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

        $(table).on('click', '.addon-btn', (event) => {
            const materialCode = event.currentTarget.dataset.id;
            this.showPopupFreeGood(materialCode);
        });
    }

    handleSelectAll(event) {
        const isChecked = event.target.checked;
        const checkboxes = this.template.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = isChecked);
        event.preventDefault();
    }
    // End Section Create Table Here

    // Start feature Add On Product
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
        if (!this.dataTableInstance || this.addonSelections.length === 0) return;

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
                        class="addon-btn" data-id="${product.materialCode}">+</button>
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
}
 