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
import insertProductItem from '@salesforce/apex/INID_OrderController.insertProductItem';
import replaceProductItems from '@salesforce/apex/INID_OrderController.replaceProductItems';
import getPromotion from '@salesforce/apex/INID_getPromotionController.getPromotions';


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
    @track currentMaterialCodeForAddOn = '';
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

    @wire(fetchProductOrderItem, { orderId: '$recordId' })
    getDataProductOrderItem({ error, data }) {
        if (data) {
            const mainProducts = [];
            const addonProducts = [];

            data.forEach(item => {
                const isAddon = item.INID_Remark__c !== null && item.INID_Remark__c !== undefined;

                const productObj = {
                    rowKey: item.Id,
                    code: item.INID_Material_Code__c,
                    hlItemNumber: item.INID_HL_Item_Number__c,
                    id: item.INID_Product_Price_Book__r.Id,
                    productCode: item.INID_Material_Code__c || '',
                    description: item.INID_SKU_Decription__c,
                    unitPrice: item.INID_Product_Price_Book__r.INID_Unit_Price__c,
                    quantity: item.INID_Quantity__c,
                    salePrice: item.INID_Sale_Price__c,
                    unit: item.INID_Product_Price_Book__r.INID_Unit__c,
                    total: item.INID_Quantity__c * item.INID_Sale_Price__c,
                    nameBtn: isAddon ? item.INID_Remark__c : '+',
                    variant: isAddon ? 'base' : 'brand',
                    addonDisabled: false,
                    isAddOn: isAddon
                };

                if (isAddon) {
                    addonProducts.push(productObj);
                } else {
                    mainProducts.push(productObj);
                }
            });

            // ปิดปุ่ม Add-on ของ Main ถ้ามี Add-on แล้ว
            mainProducts.forEach(main => {
                const hasAddon = addonProducts.some(addon => addon.hlItemNumber === main.hlItemNumber);
                main.addonDisabled = hasAddon;
            });

            const combined = [];
            mainProducts.forEach(main => {
                combined.push(main);
                const relatedAddons = addonProducts.filter(addon => addon.hlItemNumber === main.hlItemNumber);
                combined.push(...relatedAddons);
            });

            this.selectedProducts = combined;
            this.visibleRows = this.selectedProducts.map(row => ({
                ...row,
                showAddonBtn: !row.isAddOn
            }));

        } else if (error) {
            console.error('Error fetching product order items:', error);
        }
    }

    handleRowAction(event) {
        const addonAction = event.detail.action.name;
        const rowAction = event.detail.row;

        if (rowAction.nameBtn === '+') {
            this.isPopupOpenFreeGood = true;
            this.currentMaterialCodeForAddOn = rowAction.code; 
        }
    }

    getAddonLabel(value) {
        const option = this.options.find(opt => opt.value === value);
        return option ? option.label : '';
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
    mapProduct(source) {
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
            nameBtn: '+',
            variant: 'brand',
            addonDisabled: false  
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
                        editableSalePrice: true,
                        nameBtn: '+',             
                        variant: 'brand',          
                        addonDisabled: false       
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
            const updated = updatedValues.find(d => d.rowKey === product.rowKey || d.rowKey === product.id);
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

    
    handletest (){
        getPromotion({ orderId: this.recordId })
            .then(result => {
                console.log('Promotion Data:', result);
                this.showToast('ข้อมูลโปรโมชั่น', JSON.stringify(result), 'info');
            })
            .catch(error => {
                console.error('Error fetching promotion data:', error);
                this.showToast('Error', 'ไม่สามารถดึงข้อมูลโปรโมชั่นได้', 'error');
            });
    }

    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        let newSelectedIds = [];
        let selectedDetailItems = [];

        selectedRows.forEach(row => {
            const isMain = row.salePrice !== 0;
            const type = isMain ? 'Main' : 'Add-On';

            newSelectedIds.push(row.rowKey);

            selectedDetailItems.push({
                rowKey: row.rowKey,
                code: row.code,
                type: type
            });

            if (isMain) {
                const mainItem = this.selectedProducts.find(p =>
                    p.rowKey === row.rowKey
                );

                if (mainItem) {
                    const addOnItems = this.selectedProducts.filter(p =>
                        p.salePrice === 0 && p.code === mainItem.code
                    );

                    if (addOnItems.length > 0) {
                        const addonList = addOnItems.map(a => `• ${a.rowKey}`).join('\n');
                    } else {
                        alert(`ไม่มี Add-On ที่เชื่อมกับ Main code: ${mainItem.code}`);
                    }

                    addOnItems.forEach(addon => {
                        if (!newSelectedIds.includes(addon.rowKey)) {
                            newSelectedIds.push(addon.rowKey);
                            selectedDetailItems.push({
                                rowKey: addon.rowKey,
                                code: addon.code,
                                type: 'Add-On'
                            });
                        }
                    });
                }

            } else {
                const relatedMain = this.selectedProducts.find(p =>
                    p.salePrice !== 0 && p.code === row.code
                );
            }
        });

        this.selectedRowIds = [...new Set(newSelectedIds)];
        this.selectedDetailItems = selectedDetailItems;

        const datatable = this.template.querySelector('lightning-datatable');
        if (datatable) {
            datatable.selectedRows = this.selectedRowIds;
        }
    }

    handleDeleteSelected() {
        if (!this.selectedDetailItems || this.selectedDetailItems.length === 0) {
            alert('ยังไม่เลือกสักรายการ');
            return;
        }

        const deleteKeys = new Set(this.selectedDetailItems.map(item => item.rowKey));

        // แยกรายการที่จะลบตามประเภท
        const mainItems = this.selectedDetailItems.filter(item => item.type === 'Main');
        const addOnItems = this.selectedDetailItems.filter(item => item.type === 'Add-On');

        // แสดงรายการที่จะลบ
        if (mainItems.length > 0) {
            const mainCodes = mainItems.map(m => `• ${m.code} (rowKey: ${m.rowKey})`).join('\n');
        }

        if (addOnItems.length > 0) {
            const addonCodes = addOnItems.map(a => `• ${a.code} (rowKey: ${a.rowKey})`).join('\n');
        }

        // ลบออกจากข้อมูลหลัก
        this.selectedProducts = this.selectedProducts.filter(p => !deleteKeys.has(p.rowKey));

        // ล้าง selection
        this.selectedRowIds = [];
        this.selectedDetailItems = [];

        // เคลียร์ UI datatable
        const datatable = this.template.querySelector('lightning-datatable');
        if (datatable) {
            datatable.selectedRows = [];
        }

        alert(' ลบรายการที่เลือกเรียบร้อยแล้ว');
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
            this.showToast('Error', 'กรุณาเลือกประเภทของแถม', 'error');
            return;
        }

        const matchedMainIndex = this.selectedProducts.findIndex(
            p => p.code === this.currentMaterialCodeForAddOn && p.unitPrice !== 0
        );

        if (matchedMainIndex < 0) {
            this.showToast('Error', 'ไม่พบสินค้าหลัก', 'error');
            return;
        }

        const matchedMain = this.selectedProducts[matchedMainIndex];
        const addonId = matchedMain.id + '_addon_' + this.selectedValue;
        const alreadyExists = this.selectedProducts.some(p => p.id === addonId);

        if (alreadyExists) {
            this.showToast('Warning', 'Add-on นี้ถูกเพิ่มไปแล้ว', 'warning');
            return;
        }

        const addonProduct = {
            rowKey: addonId,
            id: addonId,
            code: matchedMain.code,
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
            productPriceBookId: matchedMain.id 
        };

        this.addAddonToProduct(addonProduct);
        this.selectedProducts[matchedMainIndex].addonDisabled = true;

        this.showToast('เพิ่ม Add-on สำเร็จ', `คุณเลือกประเภท: ${addonProduct.nameBtn}`, 'success');

        this.isPopupOpenFreeGood = false;
        this.selectedValue = '';
        this.currentMaterialCodeForAddOn = '';
    }


    addAddonToProduct(addonProduct) {
        const mainIndex = this.selectedProducts.findIndex(
            p => p.code === addonProduct.code && p.unitPrice !== 0
        );
        if (mainIndex >= 0) {
            this.selectedProducts.splice(mainIndex + 1, 0, addonProduct);
            this.selectedProducts = [...this.selectedProducts]; 
        }
    }

    // async handleSave() {
    //     if (!this.recordId || !this.orderId) {
    //         this.showToast('Error', 'ไม่พบ Order หรือ Quote Id', 'error');
    //         return;
    //     }

    //     try {
    //         const recordsToInsert = this.selectedProducts.map((prod, index) => {
    //             const isAddon = prod.unitPrice === 0;
    //             const formattedNumber = ((index + 1) * 10).toString().padStart(6, '0');

    //             return {
    //                 INID_Quantity__c: parseFloat(prod.quantity),
    //                 INID_Sale_Price__c: parseFloat(prod.salePrice),
    //                 INID_Quote__c: this.recordId,
    //                 INID_Order__c: this.orderId,
    //                 INID_Product_Price_Book__c: isAddon ? prod.productPriceBookId : prod.id,
    //                 INID_Type__c: isAddon ? 'AddOn' : 'Main',
    //                 INID_Remark__c: isAddon ? prod.nameBtn : null,
    //                 INID_HL_Number__c: index + 1,
    //                 INID_Item_Number__c: formattedNumber
    //             };
    //         });

    //         // ลบของเก่า + insert ใหม่ทั้งหมด
    //         await replaceProductItems({
    //             orderId: this.orderId,
    //             products: recordsToInsert
    //         });

    //         this.showToast('สำเร็จ', 'ลบของเก่าและบันทึกข้อมูลใหม่เรียบร้อยแล้ว', 'success');
    //         this.selectedProducts = [];

    //         setTimeout(() => {
    //             window.location.reload();
    //         }, 1000);

    //     } catch (error) {
    //         console.error('Save Error:', JSON.stringify(error));
    //         this.showToast('เกิดข้อผิดพลาด', error.body?.message || error.message, 'error');
    //     }
    // }

    async handleSave() {
        if (!this.recordId || !this.orderId) {
            this.showToast('Error', 'ไม่พบ Order หรือ Quote Id', 'error');
            return;
        }

        try {
            let hlNumber = 1;
            let recordsToInsert = [];
            let itemIndex = 1;

            this.selectedProducts.forEach((prod, index) => {
                const isAddon = prod.unitPrice === 0;

                // ถ้าเป็น Main จะเริ่ม HL ใหม่
                if (!isAddon) {
                    hlNumber = recordsToInsert.length + 1; // หรือจะใช้ตัวแปร counter hl ก็ได้
                }

                const formattedNumber = (itemIndex * 10).toString().padStart(6, '0');

                recordsToInsert.push({
                    INID_Quantity__c: parseFloat(prod.quantity),
                    INID_Sale_Price__c: parseFloat(prod.salePrice),
                    INID_Quote__c: this.recordId,
                    INID_Order__c: this.orderId,
                    INID_Product_Price_Book__c: isAddon ? prod.productPriceBookId : prod.id,
                    INID_Type__c: isAddon ? 'AddOn' : 'Main',
                    INID_Remark__c: isAddon ? prod.nameBtn : null,
                    INID_HL_Number__c: hlNumber,
                    INID_Item_Number__c: formattedNumber
                });

                itemIndex++;
            });

            await replaceProductItems({
                orderId: this.orderId,
                products: recordsToInsert
            });

            this.showToast('สำเร็จ', 'ลบของเก่าและบันทึกข้อมูลใหม่เรียบร้อยแล้ว', 'success');
            this.selectedProducts = [];

            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Save Error:', JSON.stringify(error));
            this.showToast('เกิดข้อผิดพลาด', error.body?.message || error.message, 'error');
        }
    }

}