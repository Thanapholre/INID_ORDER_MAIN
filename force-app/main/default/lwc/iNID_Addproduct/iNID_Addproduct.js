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

    // โหลด DataTable
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

    // ค้นหาสินค้าแบบ live Search
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

    // handleSelectProduct เก็บข้อมูลที่เลือก และแสดงใน DataTable
    handleSelectProduct(event) {
        const materialCode = event.currentTarget.dataset.id; // get materialCode from data-id
        const existing = this.selectedProducts.find(p => p.materialCode === materialCode); // เช็คว่ามีอยู่แล้วหรือไม่ป้องกันซ้ำ
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
                        `<button class="addon-btn" data-id="${newProduct.materialCode}">
                            <span class="plus-icon">+</span>
                        </button>` // Button column Add On
                    ]).draw();
                }
            }
        }

        this.searchProductTerm = '';
        this.showProductDropdown = false;
    }

    //ใช้งาน DataTable ใน LWC  Disable ส่วนต่างๆของ DataTable ในฟังก์ชันนี้
    initializeDataTable() {
        const table = this.template.querySelector('.product-table');
        //ใช้ JQuery เพื่อให้ DataTable ทำงานได้
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

            alert("Hello WOrld");
              
        });
    }

    // Checkbox Select All
    handleSelectAll(event) {
        const isChecked = event.target.checked; //get the checked status of the checkbox
        const checkboxes = this.template.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => { // loop ผ่าน checkbox ทั้งหมดเพื่อเช็คว่าเป็น checked หรือไม่
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
  
        // ฟังก์ชั่นในการยกเลิกการเลือกสินค้า
      handleRemoveProduct(event) {
          const code = event.currentTarget.dataset.id; //ดึงรหัสสินค้าจาก data-id
          this.selectedProducts = this.selectedProducts.filter(p => p.materialCode !== code);//สร้างอาเรย์ใหม่ที่ไม่มีรหัสสินค้าที่เลือก
      }
     
      // ฟังก์ชั่นในการแสดง Popup FreeGood
      showPopupFreeGood(materialCode) {
            this.currentMaterialCodeForAddOn = materialCode;
            this.isPopupOpenFreeGood = true;
      }
        // ฟังก์ชั่นในการปิด Popup FreeGood
      closePopupFreeGood() {
          this.isPopupOpenFreeGood = false;
      }
      // ฟังก์ชั่นในการแก้ไขค่าใน Select
      handleChangeFreeGoods(event) {
          this.selectedValue = event.detail.value; // 
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
   
    // save function Add On
    handleSave() {
        const matchedProduct = this.productOption.find( //เช็คว่า materialCode ไหนตรงกับ currentMaterialCodeForAddOn
            p => p.materialCode === this.currentMaterialCodeForAddOn
        );

     //ถ้าไม่พบสินค้า ที่ตรงกันให้ return ออกจากฟังก์ชัน
        if (!matchedProduct) {
            return;
        }
        
        const selectedOption = this.options.find(opt => opt.value === this.selectedValue);
        const addonLabel = selectedOption ? selectedOption.label : 'ของแถม';
    
        let addonProduct;

        // ถ้าเป็นส่วนลด ให้คำนวณส่วนลด 10% ของราคาสินค้า
        if (addonLabel === 'ส่วนลด') {
            // คำนวณส่วนลด 10% ของราคาสินค้า
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
        
        // เช็คว่า mainIndex มีอยู่ใน selectedProducts หรือไม่
        // ถ้ามีให้หาตำแหน่งที่ต้องการแทรก Add-on
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



    // Delete Product Functio Here !

    handleDeleteSelected() {
        // 1. หา checkbox ที่เลือกไว้ใน DataTable
        const table = this.template.querySelector('.product-table');
        const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]:checked');
    
        // 2. ดึง materialCode ที่ checkbox ถูกเลือก (ตาม row index ของ DataTables)
        const selectedIds = [];
    
        checkboxes.forEach((checkbox, index) => {
            // ค้นหา materialCode จริงจาก selectedProducts โดยใช้ index เดิม
            const row = this.dataTableInstance.row(checkbox.closest('tr')).index();
            const rowData = this.selectedProducts[row];
    
            if (rowData && rowData.materialCode) {
                selectedIds.push(rowData.materialCode);
            }
        });
    
        // ถ้าไม่มีเลือกเลย
        if (selectedIds.length === 0) {
            alert('กรุณาเลือกแถวที่ต้องการลบ');
            return;
        }
    
        // แสดง Confirm
        const confirmMsg = `คุณแน่ใจว่าต้องการลบรายการต่อไปนี้?\n${selectedIds.join(', ')}`;
        if (!confirm(confirmMsg)) {
            return;
        }
    
        // ลบจาก selectedProducts
        this.selectedProducts = this.selectedProducts.filter(
            p => !selectedIds.includes(p.materialCode) //  
        );
    
        //  อัปเดตตาราง
        this.updateDataTable();
    
        // แจ้งเตือนสำเร็จ
        alert(`ลบ ${selectedIds.length} รายการเรียบร้อยแล้ว`);
    }
    
}

