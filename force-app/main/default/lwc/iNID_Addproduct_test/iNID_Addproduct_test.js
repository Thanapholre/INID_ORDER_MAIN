import { LightningElement , track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import datatables from '@salesforce/resourceUrl/datatables';
import jquery from '@salesforce/resourceUrl/jquery';

export default class INID_Addproduct_test extends LightningElement {

    // section ของ input type search เพื่อหา List Product
    
    @track showAddProductCard = true; // set ค่า showAddProductCard เป็น true
    @track searchProductTerm = ''; // ให้ค่า searchProductTeam เป็นค่า Strign ว่าง
    @track showProductDropdown = false; // set ค่า showProductDropdown เป็น false
    @track filteredProductOptions = []; // กำหนดค่า fifilteredProductOptions ให้เป็น Array ว่าง
    @track selectedProducts = []; // ค่าที่เลือกจาก List

    // สร้าง List productOption เพื่อเป็นสินค้าจำลอง
    @track productOption = [
        { materialCode: '1000000002', description: 'AFZOLINE XL 10 MG.TAB.3X10 S', unitPrice:150.00 , salePrice:150.00 , quantity:10 , unit:'Box' },
        { materialCode: '1000000003', description: 'ALBER-T OINT.10 GM.' , unitPrice:150.00 , salePrice:150.00 , quantity:10 , unit:'Box' },
        { materialCode: '1000000004', description: 'ALLORA 5 MG.TAB.1X10 S', unitPrice:150.00 , salePrice:150.00 , quantity:10 , unit:'Box' },  
    ];

    // โดนเรียกใช้เมื่อ input type search มีการเปลี่ยนแปลง
    handleInputProduct(event) { // รับค่า event มา
        this.searchProductTerm = event.target.value; // กำหนดให้ searchProductTerm จากค่าที่ว่างเป็นค่าที่พิมพ์เข้าไปใน input type search
        if (this.searchProductTerm.length > 2) { // ถ้าค่าที่พิมพ์ไปมีมากกว่า 2 ตัวค่อยให้ทำโค้ดของ if แต่ถ้าไม่ใช่ทำ else
            const term = this.searchProductTerm.toLowerCase(); // ให้ตัวแปล term มีค่าเท่ากับ สิ่งที่เราพิมพ์เข้า input type search แต่เป็นตัวพิมพ์เล็ก (ใช้กับภาษาอังกฤษจะเห็นผล)
            this.filteredProductOptions = this.productOption
                .filter(prod => prod.description.toLowerCase().includes(term) || prod.materialCode.toLowerCase().includes(term)
            ); // ให้ค่า filteredProductOptions เก็บค่าที่มันไป filter เจอของ productOption โดยให้ filter ตรวจสอบค่า term ว่าอยู่ใน description หรือ materialCode ไหม
            this.showProductDropdown = true; // ให้ค่า showProductDropdown มีค่าเป็น true
        } else {
            this.showProductDropdown = false;  // ให้ค่า showProductDropdown มีค่าเป็น false
        }
    }

    // ฟังชั่นจะถูกใช้เมื่อมีการกดค่าใน List
    handleSelectProduct(event) { // function นี้รับค่า event มา
        const materialCode = event.currentTarget.dataset.id; // เก็บค่า id จาก list li ที่อยู่หน้า html ใน attribute data-id ที่ส่งค่า materialCode มาเก็บไว้ในตัวแปล materialCode
        const existing = this.selectedProducts.find(p => p.materialCode === materialCode); // ค้นหาค่า materialCode ที่อยู่ใน selectProduct ถ้ามีให้เก็บการค้นหาไว้ในตัวแปร existing
        if (this.dataTableInstance) {
            this.dataTableInstance.row.add([
                '', // สำหรับ checkbox หรือไอคอน
                newProduct.materialCode,
                newProduct.description,
                newProduct.unitPrice,
                newProduct.salePrice,
                newProduct.quantity,
                newProduct.unit,
                newProduct.total,
                '<button class="slds-button slds-button_icon" onclick="alert(\'Add On Clicked\')"><lightning-icon icon-name="utility:add" size="x-small"></lightning-icon></button>'
            ]).draw(false);
        }
        this.searchProductTerm = ''; // ให้ค่า text box type search ว่าง
        this.showProductDropdown = false; // ให้ showProductDropdown เป้น false
    }



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


    handleRemoveProduct(event) {
        const code = event.currentTarget.dataset.id;
        this.selectedProducts = this.selectedProducts.filter(p => p.materialCode !== code);
    }

    showPopupFreeGood() {
        this.isPopupOpenFreeGood = true;
    }

    closePopupFreeGood() {
        this.isPopupOpenFreeGood = false;
    }

    handleChangeFreeGoods(event) {
        this.selectedValue = event.detail.value;
    }

    // placeholder for other events
    handleAddProductClick() {
        // handle save/cancel/delete
        console.log('Action clicked');
    }
    // end add on FreeGood

    //PopUp AddProduct -------------------------------------------
    @track showAddonproduct = false; 
    @track searchAddProduct = '';
    @track popUpAddproduct = false; 
    @track filteredPopupaddproduct = [];
    @track selectedAddonProduct = []; 
    @track isPopupOpen = false;


    
    showpopupProduct() {
        this.isPopupOpen = true;
    }

    closePopup(){
        this.isPopupOpen = false;
        // this.isPopupOpenFreeGood = false;
    }


    @track addProductOption = [
        { materialCode: '1000000002', description: 'AFZOLINE XL 10 MG.TAB.3X10 S', unitPrice:150.00 , salePrice:0.00 , quantity:2 , unit:'Box' },
        { materialCode: '1000000003', description: 'ALBER-T OINT.10 GM.' , unitPrice:150.00 , salePrice:0.00 , quantity:2 , unit:'Box' },
        { materialCode: '1000000004', description: 'ALLORA 5 MG.TAB.1X10 S', unitPrice:150.00 , salePrice:0.00 , quantity:2 , unit:'Box' },  
    ];

    // โดนเรียกใช้เมื่อ input type search มีการเปลี่ยนแปลง
    handleInputAddOnProduct(event) { // รับค่า event มา
        this.searchAddProduct = event.target.value; // กำหนดให้ searchProductTerm จากค่าที่ว่างเป็นค่าที่พิมพ์เข้าไปใน input type search
        if (this.searchAddProduct.length > 2) { // ถ้าค่าที่พิมพ์ไปมีมากกว่า 2 ตัวค่อยให้ทำโค้ดของ if แต่ถ้าไม่ใช่ทำ else
            const term = this.searchAddProduct.toLowerCase(); // ให้ตัวแปล term มีค่าเท่ากับ สิ่งที่เราพิมพ์เข้า input type search แต่เป็นตัวพิมพ์เล็ก (ใช้กับภาษาอังกฤษจะเห็นผล)
            this.filteredPopupaddproduct = this.addProductOption
                .filter(item => item.description.toLowerCase().includes(term) || item.materialCode.toLowerCase().includes(term)
            ); // ให้ค่า filteredaddProductOptions เก็บค่าที่มันไป filter เจอของ productOption โดยให้ filter ตรวจสอบค่า term ว่าอยู่ใน description หรือ materialCode ไหม
            this.showAddonproduct = true; // ให้ค่า showProductDropdown มีค่าเป็น true
        } else {
            this.showAddonproduct = false;  // ให้ค่า showProductDropdown มีค่าเป็น false
        }
    }

    handleSelectProductAddOn(event) {
        const code = event.currentTarget.dataset.id;
        const selected = this.addProductOption.find(item => item.materialCode === code);
        if (selected) {
            const total = selected.salePrice * selected.quantity;
            this.selectedAddonProduct = [...this.selectedAddonProduct, { ...selected, total }];
        }
        this.searchAddProduct = '';
        this.showAddonproduct = false;
    }
    

    handleProductAddOn(event) {
        const code = event.currentTarget.dataset.id;
        const description = event.currentTarget.dataset.name;
        this.searchAddProduct = `${code} ${description}`;
        this.showAddonproduct = false;
    }

    
    // save button controller
    handleSave() {
        alert(this.searchAddProduct);
    }


    // Start DataTables
    
    datatablesInitialized = false; // กำหนดค่าเริ่มต้น = fales

    // หลังหน้าเว็ป Render เสร็จให้ทำในส่วนนี้
    renderedCallback() {
    if (this.datatablesInitialized) return;
    this.datatablesInitialized = true;  

    Promise.all([
        loadScript(this, jquery + '/jquery.min.js'),
        loadScript(this, datatables + '/jquery.dataTables.min.js'),
        loadStyle(this, datatables + '/jquery.dataTables.min.css')
    ])
    .then(() => {
        const table = this.template.querySelector('table');
        this.dataTableInstance = $(table).DataTable(); // เก็บไว้ใช้ใน add row
    })
    .catch(error => {
        console.error('Failed to load DataTables:', error);
    });
}


}