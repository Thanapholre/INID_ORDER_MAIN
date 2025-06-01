import { LightningElement, track, wire , api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import LightningConfirm from 'lightning/confirm';
import fetchDataProductPriceBook from '@salesforce/apex/INID_OrderTest.fetchDataProductPriceBook'
import insertOrderItem from '@salesforce/apex/INID_OrderController.insertOrderItem';
import getRecordId from '@salesforce/apex/INID_OrderController.getRecordId'
import fetchProductOrderItem from '@salesforce/apex/INID_OrderController.fetchProductOrderItem'
import deleteProductItems from '@salesforce/apex/INID_OrderController.deleteProductItems'
import { refreshApex } from '@salesforce/apex';


export default class INID_OrderLine extends LightningElement {
    @track searchProductTerm = '';
    @track textareaValue = '';
    @track filteredProductOptions = [];
    @track productPriceBook = [];
    @track draftValues = [];
    @track selectedRowIds = [];
    @track selectedProducts = [];
    @track showProductDropdown = false;
    @track productOrderItemValue = [];
    @track itemNumberFormat = 0;
    @track orderId;
    @track isPopupOpenFreeGood = false ;
    @track addonRemark = '' ;
    @track variantBtn = '' ;
    @track selectedValue ;
    @track selectedLabel;
    @api recordId;
    isShowAddfromText = false;
    isLoaded = false;
    hasAlerted = false;

    columns = [
        { label: 'Material Code', fieldName: 'code', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 120 },
        { label: 'SKU Description', fieldName: 'description', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 200 },
        { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 140 },
        { label: 'Quantity', fieldName: 'quantity', type: 'text', editable: true, hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 100 },
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency', editable: true, typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 175 },
        { label: 'Unit', fieldName: 'unit', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 100 },
        { label: 'Total', fieldName: 'total', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' }},
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
        }
    ];

    renderedCallback() {
        if (this.isLoaded) return; 
        const STYLE = document.createElement('style');
        STYLE.innerText = `
            .uiModal .modal-container {
                width: 80vw !important;
                max-width: 95vw;
                min-width: 60vw;
                max-height: 100vh;
                min-height: 55.56vh;
            }
        `;
        const card = this.template.querySelector('lightning-card');
        if (card) card.appendChild(STYLE);
        this.isLoaded = true;
        if (this.quoteItemData) {
            refreshApex(this.quoteItemData); 
        }
    }

    
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
      
    //Apex wire: get record id
    @wire(getRecordId, { orderId: '$recordId' })
    wireGetRecordId({ error, data }) {
        if (data) {
            // console.log('quoteId : ' + data);
            this.orderId = data
        } else {
            console.log(error);
        }
    }

    //Apex wire: fetch product price book
    @wire(fetchDataProductPriceBook)
    wiredproductPriceBook({ error, data }) {
        if (data) {
            this.productPriceBook = data;
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }

    //get data by qoute id
    @wire(fetchProductOrderItem, {orderId: '$recordId'})
    getDataProductOrderItem({ error, data }) {
        if (data) {
            this.productOrderItemValue = data;

            const addonMap = new Map();

            data.forEach(item => {
                if (item.INID_Remark__c !== null && item.INID_Remark__c !== undefined) {
                    const materialCode = item.INID_Material_Code__c;
                    addonMap.set(materialCode, true);
                }
            });

            this.selectedProducts = data.map(productItem => {
                const isAddon = productItem.INID_Remark__c !== null && productItem.INID_Remark__c !== undefined;
                const materialCode = productItem.INID_Material_Code__c;
                const hasAddon = addonMap.has(materialCode);

                return {
                    rowKey: productItem.Id,
                    productOrderItemId: productItem.Id,
                    id: productItem.INID_Product_Price_Book__r.Id,
                    code: materialCode,
                    description: productItem.INID_SKU_Decription__c,
                    unitPrice: productItem.INID_Product_Price_Book__r.INID_Unit_Price__c,
                    quantity: productItem.INID_Quantity__c,
                    salePrice: productItem.INID_Sale_Price__c,
                    unit: productItem.INID_Product_Price_Book__r.INID_Unit__c,
                    total: productItem.INID_Quantity__c * productItem.INID_Sale_Price__c,
                    nameBtn: isAddon ? productItem.INID_Remark__c : '+',
                    variant: isAddon ? 'base' : 'brand',
                    addonDisabled: !isAddon && hasAddon 
                };
            });
        } else {
            console.log(error);
        }
    }



    handleRowAction(event) {
        const addonAction = event.detail.action.name ;
        const rowAction = event.detail.row ;
        
        if(rowAction.nameBtn === '+') {
            // alert('this action is : ' + addonAction) ;
            // alert('this row is :' + JSON.stringify(rowAction , null ,2)) ;
            this.isPopupOpenFreeGood = true ;
            
        } 

    }

    //Product search input handler
    handleInputProduct(event) {
        this.searchProductTerm = event.target.value;
        const term = this.searchProductTerm.toLowerCase().trim();
        this.showProductDropdown = term.length > 2;
        this.filteredProductOptions = this.productPriceBook.filter(product => {
            const description = (product.INID_SKU_Description__c || '').toLowerCase();
            const materialCode = (product.INID_Material_Code__c || '').toLowerCase();
            return description.includes(term) || materialCode.includes(term);
        });
    }

    //Select product to table
    handleSelectProduct(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedProduct = this.productPriceBook.find(p => p.Id === selectedId);

        if (!selectedProduct) return;
        const isAlreadySelected = this.selectedProducts.some(p => p.id === selectedId);
        if (isAlreadySelected) {
            this.showToast('รายการซ้ำ', 'สินค้านี้มีอยู่ในตารางแล้ว', 'warning');
        } else {
            const newProduct = this.mapProduct(selectedProduct);
            this.selectedProducts = [...this.selectedProducts, newProduct];
        }
        
        // Reset search state
        this.searchProductTerm = '';
        this.showProductDropdown = false;
    }

    //Map product for table row
    mapProduct(source = []) {
        const unitPrice = source.INID_Unit_Price__c || 0;
        const quantity = 1;
        return {
            rowKey: source.Id,
            id: source.Id,
            code: source.INID_Material_Code__c,
            description: source.INID_SKU_Description__c,
            unitPrice,
            quantity,
            salePrice: unitPrice,
            unit: source.INID_Unit__c || '',
            total: unitPrice * quantity,
        };
    }

    showProductCode() {
        this.isShowAddfromText = !this.isShowAddfromText;
    }

    //Handle textarea input for product codes
    enterProductOnchange(event) {
        const textareaValue = event.target.value || '';
        const uniqueCodes = new Set();
        this.enteredProductCodes = textareaValue
            .split('\n')
            .map(code => code.trim())
            .filter(code => {
                if (!code) return false;
                const normalized = code.toLowerCase();
                if (uniqueCodes.has(normalized)) return false;
                uniqueCodes.add(normalized);
                return true;
            });
    }

    //Add products from textarea to table
    addProductToTable() {
        if (!this.enteredProductCodes?.length) {
            this.showToast('ไม่มีข้อมูล', 'กรุณากรอกรหัสสินค้าอย่างน้อย 1 รายการ', 'error');
            return;
        }

        const added = [];
        const duplicates = [];
        const invalid = [];
        const isAddon = productItem.INID_Remark__c !== null && productItem.INID_Remark__c !== undefined;
        const materialCode = productItem.INID_Material_Code__c;
        const hasAddon = addonMap.has(materialCode);

        this.enteredProductCodes.forEach(code => {
            const match = this.productPriceBook.find(p => p.INID_Material_Code__c === code);
            if (!match) {
                invalid.push(code);
            } else {
                const alreadyExists = this.selectedProducts.some(p => p.code === code);
                if (alreadyExists) {
                    duplicates.push(code);
                } else {
                    const unitPrice = match.INID_Unit_Price__c || 0;
                    const quantity = 1;
                    added.push({
                        rowKey: match.Id,
                        id: match.Id,
                        code: match.INID_Material_Code__c,
                        Name: match.Name,
                        description: match.INID_SKU_Description__c,
                        quantity,
                        salePrice: unitPrice,
                        unit: match.INID_Unit__c,
                        unitPrice,
                        total: unitPrice * quantity,
                        editableSalePrice: true ,
                        // nameBtn: isAddon ? productItem.INID_Remark__c : '+',
                        // variant: isAddon ? 'base' : 'brand',
                        // addonDisabled: !isAddon && hasAddon 
                    });
                }
            }
    });

    if (added.length) {
        this.selectedProducts = [...this.selectedProducts, ...added];
        this.isShowAddfromText = false;
        }
        if (duplicates.length) this.showToast('รายการซ้ำ', 'สินค้านี้มีอยู่ในตารางแล้ว', 'warning');
        if (invalid.length) this.showToast('ไม่พบ Product Code', `กรุณาตรวจสอบ: ${invalid.join(', ')}`, 'error');

        this.textareaValue = '';
        this.enteredProductCodes = [];
        const textarea = this.template.querySelector('lightning-textarea');
        if (textarea) textarea.value = '';
    }

    get hasSelectedProducts() {
        return this.selectedProducts && this.selectedProducts.length > 0;
    }

    // Save edited rows
    handleSaveEditedRows(event) {
        const updatedValues = event.detail.draftValues;
        this.selectedProducts = this.selectedProducts.map(product => {
            const updated = updatedValues.find(d => d.rowKey === product.rowKey);
            if (updated) {
                const qty = Number(updated.quantity ?? product.quantity);
                const price = Number(updated.salePrice ?? product.salePrice);
                return { ...product, quantity: qty, salePrice: price, total: qty * price };
            }
            return product;
        });
        this.draftValues = [];
        this.showToast('เปลี่ยนแปลงข้อมูล', 'เปลี่ยนแปลงข้อมูลสำเร็จ', 'success');
    }

    // Row selection handler
    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows || [];
        this.selectedRowIds = selectedRows.map(row => row.rowKey);
    }

    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    // Delete selected rows
    async handleDeleteSelected() {
        if (!Array.isArray(this.selectedRowIds) || this.selectedRowIds.length === 0) {
            this.showToast('ไม่มีรายการถูกเลือกเลย', 'กรุณาเลือกอย่างน้อย 1 รายการ', 'warning');
            return;
        }
        const selectedSet = new Set(this.selectedRowIds);
        const toBeDeleted = this.selectedProducts.filter(p => selectedSet.has(p.rowKey));
        this.selectedProducts = [...this.selectedProducts];

        const confirmed = await LightningConfirm.open({
            message: `คุณแน่ใจหรือไม่ว่าต้องการลบทั้งหมด ${toBeDeleted.length} รายการ`,
            variant: 'header',
            label: 'ยืนยันการลบ',
            theme: 'warning'
        });

        if (!confirmed) return;

        const idsToDeleteInDB = toBeDeleted.map(p => p.productOrderItemId);

        const parentProductCodes = new Set(
            toBeDeleted
                .filter(item => item.unitPrice === 0 && item.productCode)
                .map(item => item.productCode)
        );

        try {
            if (idsToDeleteInDB.length > 0) {
                await deleteProductItems({ productOrderItemId: idsToDeleteInDB });
            }

            this.selectedProducts = this.selectedProducts.filter(p => !selectedSet.has(p.rowKey));
            this.selectedProducts = this.selectedProducts.map(p => {
                if (parentProductCodes.has(p.code) && p.unitPrice !== 0) {
                    return {
                        ...p,
                        canAddAddon: true // หรือใช้ชื่อ flag ที่คุณใช้จริง
                    };
                }
                return p;
            });

            this.selectedProducts = [...this.selectedProducts]; // force UI update
            this.selectedRowIds = [];
                
            await refreshApex(this.quoteItemData);
            this.showToast('ลบข้อมูลแล้ว', 'ลบรายการจากระบบสำเร็จ', 'success');

        } catch (error) {
            this.handleSaveError(error);
        }
    }
    
    async handleSaveSuccess() {
        this.showToast('รายการแจ้งเตือน', 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว', 'success');
        
        // Reload หน้า หลังจาก delay 2 วินาที
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    get isNextDisabled() {
        return !(this.selectedProducts && this.selectedProducts.length > 0);
    }

    // Save all selected products
    async handleSave() {
        if (!this.recordId) {
            this.showToast('Error', 'ไม่พบ Quote Id', 'error');
            return;
        }

        let itemNumber = 0 ;
        let hlNumber = 0 ;
        const recordsToInsert = this.selectedProducts.map((prod) => {
            itemNumber += 1 ;
            hlNumber += 1 ;
            const formattedNumber = (itemNumber * 10).toString().padStart(6, '0');

            return {
                Id: prod.productOrderItemId,
                INID_Quantity__c: parseFloat(prod.quantity),
                INID_Sale_Price__c: parseFloat(prod.salePrice),
                INID_Quote__c: this.recordId,
                INID_Product_Price_Book__c: prod.id,
                INID_Order__c: this.orderId,
                INID_Type__c: 'Main' ,
                INID_HL_Number__c: hlNumber ,
                INID_Item_Number__c: formattedNumber,
            };
        });

        try {
            await insertOrderItem({ orderList: recordsToInsert });
            this.selectedProducts = [];
            await refreshApex(this.quoteItemData);
            this.handleSaveSuccess()

            setTimeout(() => {
                this.dispatchEvent(new CloseActionScreenEvent());
            }, 1000);

        } catch (error) {
            this.handleSaveError(error);
        }
    }

    handleSaveError(error) {
        console.error('Save Error:', JSON.stringify(error));
        let msg = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล : ' + error;
        alert('Error JSON:\n' + JSON.stringify(error, null, 2));
        if (error && error.body && error.body.message) {
            msg = error.body.message;
        } else if (error && error.message) {
            msg = error.message;
        }
        this.showToast('Error saving data', msg, 'error');
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    get checkDataEnable() {
        return this.selectedProducts.length === 0;
    }

    handleChangeFreeGoods(event) {
        this.selectedValue = event.detail.value;
        this.selectedLabel = event.detail.label;
    }

    closePopupFreeGood() {
        this.isPopupOpenFreeGood = false;
        this.selectedValue = '';
        this.selectedLabel = ''; 
        this.searchProductTermAddOn = '';   
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

        alert('nameBtn is a : ' + JSON.stringify(addonProduct.nameBtn , null , 2)) ;

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
}