import { LightningElement, track, wire , api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import datatables from '@salesforce/resourceUrl/datatables';
import jquery from '@salesforce/resourceUrl/jquery';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FONT_AWESOME from '@salesforce/resourceUrl/fontawesome';

import searchAccounts from '@salesforce/apex/TestAccount.testFetchData';
import { refreshApex } from '@salesforce/apex';

export default class INID_Ordertest extends LightningElement {
  
    //Start get Apex Class
    // @track accounts = [];
    // wiredAccountsResult;

    // @wire(testFetchData)
    // wiredAccounts(result) {
    //     this.wiredAccountsResult = result; // ใช้เก็บไว้สำหรับ refresh
    //     if (result.data) {
    //         this.accounts = result.data;
    //     } else if (result.error) {
    //         console.error('Error loading accounts:', result.error);
    //     }
    // }

    //  handleRefresh() {
    //     refreshApex(this.wiredAccountsResult)
    //     .then(() => {
    //         // Optionally แสดงข้อความหรือ debug log
    //         alert('Data refreshed');
    //     })
    //     .catch(error => {
    //         alert('Error refreshing data:', error);
    //     });
    // }

    
    // @wire(testFetchData) accounts ;
    // wiredAccounts({ error, data }) {
    //     if (data) {
    //         this.accounts = data;
    //         alert('Fetched accounts:', data);
    //     } else if (error) {
    //         console.error('Error fetching accounts:', error);
    //     }
    // }


    @track filteredCustomerOptions = [];

    handleInput(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length > 2) {
            searchAccounts({ keyword: this.searchTerm })
                .then(result => {
                    this.filteredCustomerOptions = result;
                    this.showDropdown = true;
                })
                .catch(error => {
                    console.error('Error searching accounts:', error);
                });
        } else {
            this.showDropdown = false;
            this.filteredCustomerOptions = [];
        }
    }

    handleSelectCustomer(event) {
    const id = event.currentTarget.dataset.id;
    const name = event.currentTarget.dataset.name;
    const code = event.currentTarget.dataset.code;

    this.searchTerm = `${code} - ${name}`;
    this.selectedCustomerId = id;
    this.showDropdown = false;
}




    
    //End get Apex Class


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

    // customers = [
    //     { Id: '1000002', Name: 'โรงพยาบาลกลาง' },
    //     { Id: '1000036', Name: 'บริษัท เดอะซีนเนียร์ เฮลท์แคร์ จำกัด' },
    //     { Id: '1000100', Name: 'บริษัท โรงพยาบาลมิชชั่น จำกัด' }
    // ];

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

    //test 
    // เรียก Apex ทันทีตอนโหลด component
   
    //end test
    
    
    // handleInput ของ test ธรรมดา
    // handleInput(event) {
    //     this.searchTerm = event.target.value;
    //     this.showDropdown = this.searchTerm.length > 2;
    //     this.filteredCustomerOptions = this.customers.filter(cust =>
    //         cust.Name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
    //         cust.Id.includes(this.searchTerm)
    //     );
    // }

   


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

    billtoHandleChange(event) {
        this.billto = event.detail.value ;
    }

    purchaseOrderNumberHandleChange(event) {
        this.purchaseOrderNumber = event.detail.value;
    }

    shiptoHandleChange(event) {
        this.shipto = event.detail.value;
    }

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
                this.dataTableInstanceAddProduct.clear().draw();
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

    @track selectedProducts = [];
    @track filteredProductOptions = [];
    @track showProductDropdown = false;
    @track searchProductTerm = '';

    dataTableInstance;
    datatableInitialized = false;

    productOption = [
        { materialCode: '1000000002', description: 'AFZOLINE XL 10 MG.TAB.3X10 S', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000003', description: 'ALBER-T OINT.10 GM.', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000004', description: 'ALLORA 5 MG.TAB.1X10 S', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000005', description: 'AMOXICILLIN 500 MG.CAP.', unitPrice: 120.00, salePrice: 120.00, quantity: 5, unit: 'Box' },
        { materialCode: '1000000006', description: 'PARACETAMOL 650 MG.TAB.', unitPrice: 90.00, salePrice: 90.00, quantity: 20, unit: 'Box' },
        { materialCode: '1000000007', description: 'CETIRIZINE 10 MG.TAB.', unitPrice: 110.00, salePrice: 110.00, quantity: 15, unit: 'Box' },
        { materialCode: '1000000008', description: 'IBUPROFEN 400 MG.TAB.', unitPrice: 100.00, salePrice: 100.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000009', description: 'VITAMIN C 1000 MG.TAB.', unitPrice: 80.00, salePrice: 80.00, quantity: 30, unit: 'Bottle' },
        { materialCode: '1000000010', description: 'FOLIC ACID 5 MG.TAB.', unitPrice: 60.00, salePrice: 60.00, quantity: 25, unit: 'Box' },
        { materialCode: '1000000011', description: 'LORATADINE 10 MG.TAB.', unitPrice: 95.00, salePrice: 95.00, quantity: 12, unit: 'Box' },
        { materialCode: '1000000012', description: 'RANITIDINE 150 MG.TAB.', unitPrice: 105.00, salePrice: 105.00, quantity: 8, unit: 'Box' },
        { materialCode: '1000000013', description: 'METFORMIN 500 MG.TAB.', unitPrice: 140.00, salePrice: 140.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000014', description: 'ATORVASTATIN 20 MG.TAB.', unitPrice: 160.00, salePrice: 160.00, quantity: 10, unit: 'Box' }
    ];
    

  //initializeDataTable method
    initializeDataTable() {
        const table = this.template.querySelector('.product-table');
        if (table) {
            this.dataTableInstance = $(table).DataTable({
                searching: false,
                paging: false,
                ordering: false,
                info: false,
                responsive: false,
                // scrollX: true,
                // scrollY: true,
                columnDefs: [
                    { targets: 0, width: '120px' },
                    { targets: 1, width: '200px' }
                ]
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
                            `<div style="text-align: left;">${product.materialCode}</div>`,
                            `<div style="text-align: left;">${product.description}</div>`,
                            product.salePrice === 0 ? '-' : product.unitPrice.toFixed(2),
                            product.salePrice.toFixed(2),
                            product.quantity,
                            `<div style="text-align: center;">${product.unit}</div>`,
                            product.total.toFixed(2),
                            product.salePrice === 0 ? product.addonLabel : 
                            `
                                <div style="display: flex; justify-content: center; align-items: center;">
                                    
                                    <i class="fa-solid fa-plus addon-btn"
                                        style=" 
                                            width:35px;
                                            height:35px;
                                            border-radius:50%;
                                            border:1px solid #ccc;
                                            background-color:white;
                                            color:#007bff;
                                            font-size:20px;
                                            display:flex;
                                            align-items:center;
                                            justify-content:center;
                                            cursor:pointer;"
                                            data-id="${product.materialCode}">
                                    </i>
                                </div>
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

        const errorCombobox = this.template.querySelector('[data-id="error-combobox"]');
        const errorProduct = this.template.querySelector('[data-id="error-product"]');

        // เคลียร์ข้อความเก่าก่อน
        if (errorCombobox) errorCombobox.textContent = '';
        if (errorProduct) errorProduct.textContent = '';

        let hasError = false;

        if (!this.selectedValue) {
            if (errorCombobox) errorCombobox.textContent = 'โปรดระบุประเภทการ Add-on';
            hasError = true;
        }

        if (!this.selectedAddOnProduct) {
            if (errorProduct) errorProduct.textContent = 'โปรดระบุสินค้าที่จะ Add-on ';
            hasError = true;
        }

        if (hasError) {
            return;
        }

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
            alert('Add-on นี้ถูกเลือกไปแล้ว');
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

    if (this.isShowSummary) {
        this.selectedProducts.forEach(product => {
            const netPrice = product.total / (product.quantity + 2); // สูตรการคำนวณ Net Price
            this.dataTableInstance.row.add([
                `<div style="text-align: left;">${product.materialCode}</div>`,
                `<div style="text-align: left;">${product.description}</div>`,
                `<div style="text-align: right;">${product.unitPrice.toFixed(2)}</div>`,
                `<div style="text-align: right;">${product.salePrice.toFixed(2)}</div>`,
                `<div style="text-align: right;">${product.quantity}</div>`,
                `<div style="text-align: center;">${product.unit}</div>`,
                `<div style="text-align: right;">${product.total.toFixed(2)}</div>`,
                `<div style="text-align: center;">${product.addonLabel || ''}</div>`,
                `<div style="text-align: right;">${netPrice != 0 ? netPrice.toFixed(2) : ''}</div>`
            ]);
        });
    } else {
        this.selectedProducts.forEach(product => {
            this.dataTableInstance.row.add([
                `<input style="text-align: center;" type="checkbox" />`,
                `<div style="text-align: left;">${product.materialCode}</div>`,
                `<div style="text-align: left;">${product.description}</div>`,
                `<div style="text-align: right;">${product.unitPrice.toFixed(2)}</div>`,
                `<div style="text-align: right;">${product.salePrice.toFixed(2)}</div>`,
                `<div style="text-align: right;">${product.quantity}</div>`,
                `<div style="text-align: center;">${product.unit}</div>`,
                `<div style="text-align: right;">${product.total.toFixed(2)}</div>`,
                product.salePrice === 0 
                    ? `<div style="text-align: center;">${product.addonLabel}</div>`
                    : `<div style="display: flex; justify-content: center; align-items: center;">
                            <i class="fa-solid fa-plus addon-btn"
                                    style="
                                        width:35px;
                                        height:35px;
                                        border-radius:50%;
                                        border:1px solid #ccc;
                                        background-color:white;
                                        color:#007bff;
                                        font-size:20px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        cursor:pointer;"
                                        data-id="${product.materialCode}">
                            </i>
                        `
            ]);
        });
    }

    this.dataTableInstance.draw();
}

    // End Add On Section


    //handleDeleteSelected
    handleDeleteSelected() {
        const table = this.template.querySelector('.product-table');
        const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]:checked');
    
        const selectedIds = [];
    
        checkboxes.forEach(checkbox => {
            const row = this.dataTableInstance.row(checkbox.closest('tr'));
            const rowData = row.data();
            const materialCodeCell = rowData[1];
            const codeMatch = materialCodeCell.match(/>(.*?)</);
            const materialCode = codeMatch ? codeMatch[1].trim() : null;
    
            if (materialCode) {
                selectedIds.push(materialCode);
            }
        });
    
        if (selectedIds.length === 0) {
            alert('กรุณาเลือกรายการที่ต้องการลบ');
            return;
        }
    
        const confirmDelete = confirm('คุณต้องการลบรายการที่เลือกหรือไม่?');
        if (!confirmDelete) return;
    
        // ลบตัวแม่ + Add-on ที่ผูกกับแม่
        this.selectedProducts = this.selectedProducts.filter(p => {
            if (selectedIds.includes(p.materialCode)) return false;
            if (p.salePrice === 0 && this.addonSelections.some(addon =>
                selectedIds.includes(addon.productCode) &&
                addon.addonMaterialCode === p.materialCode
            )) return false;
            return true;
        });
    
        // ลบรายการ Add-on ที่เกี่ยวข้องจากฐาน addonSelections ด้วย
        this.addonSelections = this.addonSelections.filter(a => !selectedIds.includes(a.productCode));
    
        this.updateDataTable();
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

    isShowApplyPromotion = false ;

    showApplyPromotion() {
        this.isShowApplyPromotion = true ;
        this.isShowAddProduct = false ;
        this.datatableInitialized = false;

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
                    // this.updateDataTable();
                })
                .catch(error => console.error('DataTables Load Error:', error));
            } else if (this.dataTableInstance) {
                this.dataTableInstance.clear().draw();
                this.updateDataTable();
            }
        }, 50);
    }
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
        this.datatableInitialized = false;

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
        }, 50);
    }

    backtoProduct(){
        this.isShowAddProduct = true;
        this.isShowApplyPromotion = false ;
        this.datatableInitialized = false;

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
        }, 50);
    }


    // ---------------------------------------------------------------------------
    // End Apply Promotion
    // ---------------------------------------------------------------------------




    // ---------------------------------------------------------------------------
    // Start: Summary 
    // ---------------------------------------------------------------------------

    dataTableInstanceAddProduct;
    dataTableInstanceSummary;

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

    // ---------------------------------------------------------------------------
     // validate
    // ---------------------------------------------------------------------------



   

} 




