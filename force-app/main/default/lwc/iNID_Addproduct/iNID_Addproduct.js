import { LightningElement, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';

import jquery from '@salesforce/resourceUrl/jquery';
import datatables from '@salesforce/resourceUrl/datatables';

export default class ProductTable extends LightningElement {
    @track searchProductTerm = '';
    @track showProductDropdown = false;
    @track filteredProductOptions = [];
    @track selectedProducts = [];

    datatablesInitialized = false;
    dataTableInstance;

    productOption = [
        { materialCode: '1000000002', description: 'AFZOLINE XL 10 MG.TAB.3X10 S', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000003', description: 'ALBER-T OINT.10 GM.', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' },
        { materialCode: '1000000004', description: 'ALLORA 5 MG.TAB.1X10 S', unitPrice: 150.00, salePrice: 150.00, quantity: 10, unit: 'Box' }
    ];

    renderedCallback() {
        if (this.datatablesInitialized) return;
        this.datatablesInitialized = true;

        Promise.all([
            loadScript(this, jquery + '/jquery.min.js'),
            loadScript(this, datatables + '/jquery.dataTables.min.js'),
            loadStyle(this, datatables + '/jquery.dataTables.min.css')
        ])
        .then(() => {
            this.initializeDataTable();
        })
        .catch(error => {
            console.error('DataTables Load Error:', error);
        });
    }

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
        const existing = this.selectedProducts.find(p => p.materialCode === materialCode);
        if (!existing) {
            const selected = this.productOption.find(p => p.materialCode === materialCode);
            if (selected) {
                const total = selected.salePrice * selected.quantity;
                const newProduct = { ...selected, total };

                this.selectedProducts = [...this.selectedProducts, newProduct];

                // Use DataTables API to add row
                if (this.dataTableInstance) {
                    this.dataTableInstance.row.add([
                        `<input type="checkbox" />`, // Checkbox column
                        newProduct.materialCode,
                        newProduct.description,
                        newProduct.unitPrice.toFixed(2),
                        newProduct.salePrice.toFixed(2),
                        newProduct.quantity,
                        newProduct.unit,
                        newProduct.total.toFixed(2),
                        `<button class="addon-btn" data-id="${newProduct.materialCode}">Add</button>` // Add button with onclick
                    ]).draw();
                }
            }
        }

        this.searchProductTerm = '';
        this.showProductDropdown = false;
    }

    initializeDataTable() {
        const table = this.template.querySelector('.product-table');
        // eslint-disable-next-line no-undef
        this.dataTableInstance = $(table).DataTable({
            searching: false, // Disable search
            paging: false,    // Disable pagination
            ordering: false,  // Disable column ordering
            info: false       // Disable table info
        });

        // Add delegated click handler for .addon-btn
        $(table).on('click', '.addon-btn', (event) => {
            const materialCode = event.currentTarget.dataset.id;
            this.showPopupFreeGood(materialCode);
            // log data
              
        });
    }

    handleSelectAll(event) {
        const isChecked = event.target.checked;
        const checkboxes = this.template.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        event.preventDefault()
        
    }


    // Add On Free Good
    // Ad On Section
    get options(){
        return [
          { label: 'ของแถม', value: '1' },
          { label: 'ส่วนลด', value: '2' },
          { label: 'ตัวอย่าง', value: '3' },
          { label: 'บริจาค', value: '4' },
          { label: 'ชดเชย', value: '5' },
          { label: 'สมนาคุณ', value: '6' },
      ]};
  
      // popup FreeGood ---------------------------------------
      @track isPopupOpenFreeGood = false; // ตอนแรกให้ค่า iPopupOpen เป็น false เพื่อซ่อนการแสดงผล
      selectedValue = '';
      selectedLabel = '';

      @track currentMaterialCodeForAddOn = ''; // เก็บรหัสสินค้าที่กด Add On
  
  
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
          this.selectedLabel = event.detail.label ;
      }
  
      // placeholder for other events
      handleAddProductClick() {
          // handle save/cancel/delete
          console.log('Action clicked');
      }
      // end add on FreeGood

    // บันทึกค่า
    @track addonSelections = []; // เก็บรายการ Add-on ที่ถูกกด Save
   
    //   show pop up product
    handleSave() {
        const matchedProduct = this.productOption.find(
            p => p.materialCode === this.currentMaterialCodeForAddOn
        );
    
        if (!matchedProduct) {
            return;
        }
    
        const selectedOption = this.options.find(opt => opt.value === this.selectedValue);
        const addonLabel = selectedOption ? selectedOption.label : 'ของแถม';
    
        let addonProduct;
    
        if (addonLabel === 'ส่วนลด') {
            const discountPercent = 10;
            const mainTotal = matchedProduct.salePrice * matchedProduct.quantity;
            const discountValue = (mainTotal * discountPercent / 100).toFixed(2);
    
            addonProduct = {
                ...matchedProduct,
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
                ...matchedProduct,
                salePrice: 0.00,
                quantity: 2,
                total: 0.00,
                addonLabel: addonLabel,
                isDiscount: false
            };
        }
    
        const mainIndex = this.selectedProducts.findIndex(
            p => p.materialCode === this.currentMaterialCodeForAddOn
        );
    
        if (mainIndex !== -1) {
            let insertIndex = mainIndex + 1;
            while (
                insertIndex < this.selectedProducts.length &&
                this.selectedProducts[insertIndex].materialCode === this.currentMaterialCodeForAddOn &&
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
    
        // ใช้ DataTable API เพื่อเพิ่มแถวใหม่ (ถ้าจำเป็น)
        this.updateDataTable();
    
        const record = {
            productCode: this.currentMaterialCodeForAddOn,
            addonType: this.selectedValue,
            addLabel: addonLabel
        };
        this.addonSelections = [...this.addonSelections, record];

    
        this.closePopupFreeGood();
    }
    
    updateDataTable() {
        const table = this.template.querySelector('.product-table');
    
        if (!this.dataTableInstance) return;
    
        this.dataTableInstance.clear(); // ✅ ล้างแถวแบบปลอดภัยผ่าน DataTables
    
        this.selectedProducts.forEach(product => {
            const addonLabel = product.addonLabel || '';
            const isDiscount = addonLabel === 'ส่วนลด' && product.isDiscount;
    
            const hasNormalAddon = this.selectedProducts.some(p =>
                p.materialCode === product.materialCode &&
                p.salePrice === 0 &&
                !p.isDiscount
            );
    
            const hasDiscountAddon = this.selectedProducts.some(p =>
                p.materialCode === product.materialCode &&
                p.isDiscount
            );
    
            const disableAdd = hasNormalAddon || hasDiscountAddon || product.salePrice === 0;
    
            const addButton = addonLabel === '' && !disableAdd
                ? `<button class="addon-btn" data-id="${product.materialCode}">Add</button>`
                : `<button class="addon-btn" data-id="${product.materialCode}" disabled>Add</button>`;
    
            let rowData;
    
            if (isDiscount) {
                rowData = [
                    `<input type="checkbox" />`,
                    '', '', '', // skip materialCode/desc/unitPrice
                    'ส่วนลด (%)',
                    product.discountPercent,
                    '-',
                    product.discountValue,
                    'ส่วนลด'
                ];
            } else {
                rowData = [
                    `<input type="checkbox" />`,
                    product.materialCode,
                    product.description,
                    product.unitPrice.toFixed(2),
                    product.salePrice.toFixed(2),
                    product.quantity,
                    product.unit,
                    product.total ? product.total.toFixed(2) : '0.00',
                    addonLabel || addButton
                ];
            }
    
            this.dataTableInstance.row.add(rowData);
        });
    
        this.dataTableInstance.draw(); // ✅ วาดตารางใหม่
    } 
}

