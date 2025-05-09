import { LightningElement , track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import datatables from '@salesforce/resourceUrl/datatables';
import jquery from '@salesforce/resourceUrl/jquery';

export default class INID_Addproduct_test extends LightningElement {

    // Start Section Search Product

    // ตัวแปรของ section การ search product
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

    //
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
                        `<input style="text-align: center;" type="checkbox" />`, // Checkbox column
                        newProduct.materialCode,
                        newProduct.description,
                        newProduct.unitPrice.toFixed(2),
                        newProduct.salePrice.toFixed(2),
                        newProduct.quantity,
                        newProduct.unit,
                        newProduct.total.toFixed(2),
                        `<button 
                                style="
                                width:40px;
                                height:40px;
                                border-radius:50%;
                                border:1px solid #ccc;
                                background-color:white;
                                color:#007bff;
                                font-size:24px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                margin: auto;
                                cursor:pointer;"
                class="addon-btn" data-id="${newProduct.materialCode}">+</button>` // Button column Add On
                    ]).draw();
                }
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
        //ใช้ JQuery เพื่อให้ DataTable ทำงานได้
        this.dataTableInstance = $(table).DataTable({
            searching: false, // Disable search
            paging: false,    // Disable pagination
            ordering: false,  // Disable column ordering
            info: false ,      // Disable table info
            responsive: true , // Enable responsive design
            scrollX: false , //Disable horizontal scroll
            columnDefs: [
                {
                    targets: 0, // First column
                    width: '120px' // Set width for the first column
                },
                {
                    targets: 1, // Second column
                    width: '300px' // Set width for the second column
                }
            ]
        });

        // Add delegated click handler for .addon-btn
        $(table).on('click', '.addon-btn', (event) => {
            const materialCode = event.currentTarget.dataset.id;
            this.showPopupFreeGood(materialCode);
            // log data

            // alert("Hello WOrld");
              
        });
    }
    
    

    //handle click event for checkbox
    handleSelectAll(event) {
        const isChecked = event.target.checked; //get the checked status of the checkbox
        const checkboxes = this.template.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => { // loop ผ่าน checkbox ทั้งหมดเพื่อเช็คว่าเป็น checked หรือไม่
            checkbox.checked = isChecked;
        });
        event.preventDefault()

    }


    // End Section Create Table Here By DataTables.Net



    // Start feature Add On Product

    @track isPopupOpenFreeGood = false; // ตอนแรกให้ค่า iPopupOpen เป็น false เพื่อซ่อนการแสดงผล
        selectedValue = '';
        selectedLabel = '';
        @track currentMaterialCodeForAddOn = '';

    get options(){
        return [
          { label: 'ของแถม', value: '1' },
          { label: 'ส่วนลด', value: '2' },
          { label: 'ตัวอย่าง', value: '3' },
          { label: 'บริจาค', value: '4' },
          { label: 'ชดเชย', value: '5' },
          { label: 'สมนาคุณ', value: '6' },
      ]};

    // ฟังก์ชั่นในการยกเลิกการเลือกสินค้า
      handleRemoveProduct(event) {
          const code = event.currentTarget.dataset.id; //ดึงรหัสสินค้าจาก data-id
          this.selectedProducts = this.selectedProducts.filter(p => p.materialCode !== code);//สร้างอาเรย์ใหม่ที่ไม่มีรหัสสินค้าที่เลือก
      }

      showPopupFreeGood(materialCode) {
        this.currentMaterialCodeForAddOn = materialCode;  // เก็บ materialCode ที่กดปุ่ม Add On
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

        @track addonSelections = [];

        // Ad On Menu Free Good
        @track filteredProductOptionsAddOn = [];
        @track showProductDropdownAddOn = false;
        @track searchProductTermAddOn = '';
        @track selectedProductsAddOn = [];

        handleInputProductAddOn(event) {
            this.searchProductTermAddOn = event.target.value;
            console.log('searchProductTermAddOn', this.searchProductTermAddOn);
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
            const materialCode = event.currentTarget.dataset.id; // get materialCode from data-id
            const description  = event.currentTarget.dataset.name ;
            // const existing = this.selectedProductsAddOn.find(p => p.materialCode === materialCode); // เช็คว่ามีอยู่แล้วหรือไม่ป้องกันซ้ำ
            
            this.searchProductTermAddOn =` ${materialCode} ${description}`;
            this.showProductDropdownAddOn = false;
        }

        handleSave() {
            const matchedProduct = this.productOption.find(
                p => p.materialCode === this.currentMaterialCodeForAddOn
            );
        
            if (!matchedProduct) {
                return;
            }
        
            const selectedOption = this.options.find(opt => opt.value === this.selectedValue);
            const addonLabel = selectedOption ? selectedOption.label : 'ของแถม';
        
            // ป้องกันการเลือกซ้ำ
            const isAlreadyUsed = this.addonSelections.some(
                a => a.productCode === this.currentMaterialCodeForAddOn && a.addonType === this.selectedValue
            );
        
            if (isAlreadyUsed) {
                console.warn('Add-on นี้ถูกเลือกไปแล้ว');
                return;
            }
        
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
        
            // หา index ของสินค้าหลัก เพื่อแทรก Add-on ข้างล่าง
            const mainIndex = this.selectedProducts.findIndex(
                p => p.materialCode === this.currentMaterialCodeForAddOn
            );
        
            if (mainIndex !== -1) {
                // เพิ่ม Add-on ข้างล่างของสินค้าหลัก
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
        
            // เพิ่ม record ประวัติการเลือก Add-on
            const record = {
                productCode: this.currentMaterialCodeForAddOn,
                productDescription: matchedProduct.description,
                addonType: this.selectedValue,
                addonLabel: addonLabel,
                addonMaterialCode: matchedProduct.materialCode,
                addonDescription: matchedProduct.description
            };
        
            this.addonSelections = [...this.addonSelections, record];
        
            // แสดงชื่อที่เลือกใน input
            this.searchProductTermAddOn = `${matchedProduct.materialCode} ${matchedProduct.description}`;
        
            // อัปเดตตาราง (DataTable)
            this.updateDataTable();
        
            // ปิด popup
            this.closePopupFreeGood();
        }
        

        updateDataTable() {
            if (!this.dataTableInstance || this.addonSelections.length === 0) return;
        
            const table = this.template.querySelector('.product-table');
            const lastAddon = this.addonSelections[this.addonSelections.length - 1];
        
            // ✅ หาว่า materialCode หลักอยู่ในแถวไหน
            const data = this.dataTableInstance.rows().data();
            let targetRowIndex = -1;
        
            for (let i = 0; i < data.length; i++) {
                if (data[i][1] === lastAddon.productCode) { // Column 1 = materialCode
                    targetRowIndex = i;
                    break;
                }
            }
        
            // สร้างแถว HTML สำหรับ Add-on (ใช้ colspan ได้ถ้า UI-only)
            const addonRowHtml = `
                <tr class="discount-row">
                    <td><input type="checkbox" /></td>
                    <td colspan="1">${lastAddon.productCode}</td>
                    <td colspan="1">${lastAddon.productDescription}</td>
                    <td colspan="1">-</td>
                    <td colspan="1">0</td>
                    <td colspan="1">-</td>
                    <td colspan="1"></td>
                    <td colspan="1"></td>
                    <td colspan="1">${lastAddon.addonLabel}</td>
                </tr>
            `;
        
            // ✅ หา DOM ของแถวหลัก แล้วแทรก HTML แถวใหม่หลังจากนั้น
            const mainRowNode = this.dataTableInstance.row(targetRowIndex).node();
            $(addonRowHtml).insertAfter(mainRowNode);
        }
        
        
        

    //   End feature Add On Product

    
      
}