import { LightningElement, track, wire , api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import LightningConfirm from 'lightning/confirm';
import getRecordId from '@salesforce/apex/INID_OrderController.getRecordId'
import fetchProductOrderItem from '@salesforce/apex/INID_OrderController.fetchProductOrderItem'
import { refreshApex } from '@salesforce/apex';
import fetchOrderFocId from '@salesforce/apex/INID_OrderController.fetchOrderFocId';
import deleteFocFromOrder from '@salesforce/apex/INID_OrderController.deleteFocFromOrder';
import replaceProductItems from '@salesforce/apex/INID_OrderController.replaceProductItems';
import fetchProductOrderItemFoc from '@salesforce/apex/INID_OrderController.fetchProductOrderItemFoc';
import getPromotion from '@salesforce/apex/INID_getPromotionController.getPromotions';
import fetchAccountLicense from '@salesforce/apex/INID_OrderController.fetchAccountLicense';
import fetchProductLicenseExclude from '@salesforce/apex/INID_OrderController.fetchProductLicenseExclude';
import fetchProductLicense from '@salesforce/apex/INID_OrderController.fetchProductLicense';
import insertOrderSalePromotion from '@salesforce/apex/INID_OrderController.insertOrderSalePromotion'
import insertOrderItemFoc from '@salesforce/apex/INID_OrderController.insertOrderItemFoc'
import fetchOrderToOrderFoc from '@salesforce/apex/INID_OrderController.fetchOrderToOrderFoc';
import fetchUserGroup from '@salesforce/apex/INID_OrderController.fetchUserGroup';
import insertOrderFocById from '@salesforce/apex/INID_OrderController.insertOrderFocById'
import fetchBuGroupId from '@salesforce/apex/INID_OrderController.fetchBuGroupId'
import getAccountId from '@salesforce/apex/INID_OrderController.getAccountId' ;
import fetchProductsByBuGroups from '@salesforce/apex/INID_OrderController.fetchProductsByBuGroups'
import fetchAddonProductPriceBook from '@salesforce/apex/INID_OrderController.fetchAddonProductPriceBook'
import FONT_AWESOME from '@salesforce/resourceUrl/fontawesome';
import fetchOrderSalePromotion from '@salesforce/apex/INID_OrderController.fetchOrderSalePromotion';
import fetchSalePromotionTier from '@salesforce/apex/INID_OrderController.fetchSalePromotionTier'
import fetchSalePromotionBenefitProduct from '@salesforce/apex/INID_OrderController.fetchSalePromotionBenefitProduct';
import fetchSalePromotionId from '@salesforce/apex/INID_OrderController.fetchSalePromotionId' ;
import fetchSalePromotionData from '@salesforce/apex/INID_OrderController.fetchSalePromotionData';
import { loadStyle } from 'lightning/platformResourceLoader';
import USER_ID from '@salesforce/user/Id';

export default class INID_OrderLine extends LightningElement {
    @api recordId;
    @track searchProductTerm = '';
    @track textareaValue = '';
    @track itemNumberFormat = 0;
    @track addonRemark = '' ;
    @track variantBtn = '' ;
    @track currentMaterialCodeForAddOn = '';

    @track orderId;
    @track selectedValue ;
    @track selectedLabel;
    @track accountId ;
    @track userGroup;
    @track buGroupData;
    @track buGroupId;
    @track productsByBuGroups;
    @track productBuGroupId ;
    @track productBuIds ;
    @track userId = USER_ID;
    
    @track showProductDropdown = false;
    @track isPopupOpenFreeGood = false ;
    isShowAddfromText = false;
    isShowSummary = false ;
    isLoaded = false;
    hasAlerted = false;
    @track isShowApplyPromotion = false ;
    @track isShowOrderLineItem = true ;

    @track filteredProductOptions = [];
    @track productPriceBook = [];
    @track draftValues = [];
    @track selectedRowIds = [];
    @track selectedProducts = [];
    @track productOrderItemValue = [];
    @track comboGroups = [];
    @track selectedPromotion = [] ;
    @track promotionData = [] ;
    @track orderFocId ;
    @track orderFocItem = [] ;
    @track orderFocDetail = [];
    @track accountLicenseId = [] ;
    @track accountLicenseData = [] ;
    @track accountLicense = [] ;
    @track productLicenseExclude = [] ;
    @track orderSalePromotionData = [] ;
    @track orderSalePromotionId ;
    @track salePromotionBenefitProduct = [] ;
    @track salePromotionBenefitProductId ;
    @track salePromotionTier = [];
    @track salePromotionData = [] ;
    @track salePromotionId ;
    @track fetchAllSalePromotionData = [] ;
    
     

    columns = [
        { label: 'Material Code', fieldName: 'code', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 120 },
        { label: 'SKU Description', fieldName: 'description', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 200 },
        { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 140 },
        { label: 'Quantity', fieldName: 'quantity', type: 'text', editable: true, hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 100 },
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency',     editable: { fieldName: 'editableSalePrice' }, typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 175 },
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
        const card = this.template.querySelector('lightning-quick-action-panel');
        if (card) card.appendChild(STYLE);
        this.isLoaded = true;
        if (this.quoteItemData) {
            refreshApex(this.quoteItemData); 
        }

        console.log('userId : ' + this.userId) ;
    }

    connectedCallback() {
        loadStyle(this, FONT_AWESOME + '/css/all.min.css');
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

    @wire(fetchAddonProductPriceBook , {accountId: '$accountId'})
    wireaddonProductPriceBook({error, data}) {
        if(data){
            this.addonProductPriceBook = data;
            // console.log('this Addon Product Price Books '+ JSON.stringify(this.addonProductPriceBook , null ,2));
        }else if(error){
            console.log(' error fetch addonProductPriceBook : ', error)
        }
            
    }

    @wire(fetchUserGroup, { userId: '$userId' })
    wireUserGroup({ error, data }) {
        if (data) {
            this.userGroup = data
            // console.log('userGroup' + JSON.stringify(this.userGroup, null, 2))
        } else {
            console.log(error);
        }
    }


    @wire(fetchBuGroupId, {userGroup: '$userGroup'})
    wiredBuGroupId({ error, data }) {
        if (data) {
            this.buGroupData = data;
            this.buGroupId = this.buGroupData.map(r => r.INID_BU_Group__c);
            // console.log('BU Gruop : ' + JSON.stringify(this.buGroupId, null, 2) );
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }
    
    @wire(fetchProductsByBuGroups, {buGroupIds: '$buGroupId'})
    wiredproductsByBuGroups({ error, data }) {
        if (data) {
            this.productsByBuGroups = data;
            this.productBuGroupId = this.productsByBuGroups.map(r => r.INID_Product_Price_Book__c);
            this.productBuIds = new Set(this.productBuGroupId); 
            // console.log('product price book by BU Group : ' + JSON.stringify(this.productBuGroupId, null, 2) );
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }


    @wire(fetchAccountLicense , {accountId: '$accountId'})
    wiredFetchAccountLicense({error , data}) {
        if(data) {
            this.accountLicenseData = data ;
            this.accountLicenseId = this.accountLicenseData.map(accLicenseId => accLicenseId.Id) ;
            this.accountLicense = this.accountLicenseData.map(acc => acc.INID_License__c);
            // console.log('Account License Id : ' + JSON.stringify(this.accountLicenseId , null , 2) );
            // console.log('License:' + JSON.stringify(this.accountLicense, null, 2));
        } else {
            console.log(error) ;
        }
    }

    @wire(fetchProductLicenseExclude , {accountLicenseId: '$accountLicenseId'})
    wirefetchProductLicenseExclude({error , data}) {
        if(data) {

            this.licenseExcludeData = data ;
            this.productLicenseExclude = this.licenseExcludeData.map(prodId => prodId.INID_Product_Price_Book__c);
            // console.log('product license exclude มี ' + JSON.stringify(this.licenseExcludeData , null , 2));
            // console.log('product price book ที่มี license exclude คือ product : ' + JSON.stringify(this.productLicenseExclude , null ,))

        } else if(error) {
            console.log('message error from fetch product license exclude is : ' + JSON.stringify(error , null ,2)) ;
        }
    }

    @wire(fetchProductLicense, {licenseList: '$accountLicense' , productPriceBookIdList: '$productLicenseExclude'})
    wiredProductLicense({ error, data }) {
        if (data) {
            this.productPriceBook = data;
            // console.log('Product License' + JSON.stringify(this.productPriceBook, null, 2))
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
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

    @wire(getAccountId,{ orderId: '$recordId' })
     wiredAccountIdByQuote({error, data}){
        if (data) {
            this.accountId = data;
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }
    
 
    @wire(fetchOrderFocId, { orderId: '$recordId' })
    wiredFocId({ error, data }) {
        if (data) {
            // console.log('ได้ FOC Id:' +  JSON.stringify(data , null ,2));
            this.orderFocId = data;
        } else if (error) {
            console.error(' เกิดข้อผิดพลาดในการดึง FOC ID:', error);
        }
    }

    @wire(fetchOrderSalePromotion , {orderId: '$orderId'})
    wiredfetchOrderSalePromotion({error , data}) {
        if(data) {
            this.orderSalePromotionData = data ;
            this.orderSalePromotionId = this.orderSalePromotionData.map(promo => promo.INID_Sale_Promotion_Benefit_Product__c)

            console.log('fetchOrderSalePromotion function ' + JSON.stringify(this.orderSalePromotionId , null ,2))
        } else if(error) {
            console.log('error from fetchOrderSalePromotion function ' + JSON.stringify(error , null ,2)) ;
        }
    }

    @wire(fetchSalePromotionBenefitProduct , {salePromotionBenefitProduct: '$orderSalePromotionId'})
    wiredfetchSalePromotionBenefitProduct({error , data}) {
        if(data) {
            this.salePromotionBenefitProduct = data ;
            this.salePromotionBenefitProductId = this.salePromotionBenefitProduct.map(saleBenefitProd => saleBenefitProd.INID_Sale_Promotion_Benefit__c);
            console.log('order sale promotion benefit product Id : ' + JSON.stringify(this.salePromotionBenefitProductId , null , 2));
            
        } else if(error) {
            console.log('error from fetchOrderSalePromotion function ' + JSON.stringify(error , null ,2)) ;
        }
    }

    @wire(fetchSalePromotionTier , {salePromotionBenefitId: '$salePromotionBenefitProductId'})
    wiredfetchSalePromotionTier({error , data}) {
        if(data) {
            this.salePromotionTier = data ;
             this.salePromotionTierId = this.salePromotionTier.map(tier => tier.INID_Sale_Promotion_Tier__c);
            console.log('order sale promotion Tier Id : ' + JSON.stringify(this.salePromotionTierId , null , 2));
            
        } else if(error) {
            console.log('error from fetchOrderSalePromotion function ' + JSON.stringify(error , null ,2)) ;
        }
    }

    @wire(fetchSalePromotionId , {salePromotionTierId: '$salePromotionTierId'})
    wiredfetchSalePromotion({error , data}) {
        if(data) {
            this.salePromotionData = data ;
             this.salePromotionId = this.salePromotionData.map(tier => tier.INID_Sale_Promotion__c);
            console.log('order sale promotion Id : ' + JSON.stringify(this.salePromotionId , null , 2));
            
        } else if(error) {
            console.log('error from fetchOrderSalePromotion function ' + JSON.stringify(error , null ,2)) ;
        }
    }

    @wire(fetchSalePromotionData , {salePromotionId: '$salePromotionId'})
    wiredfetchSalePromotionData({error , data}) {
        if(data) {
            this.fetchAllSalePromotionData = data ;
            console.log('order All sale promotion Data : ' + JSON.stringify(this.fetchAllSalePromotionData , null , 2));
            
        } else if(error) {
            console.log('error from fetchOrderSalePromotion function ' + JSON.stringify(error , null ,2)) ;
        }
    }




    @wire(fetchProductOrderItem, { orderId: '$recordId' })
    getDataProductOrderItem({ error, data }) {
        if (data) {
            // console.log('✅ ดึงข้อมูล Product Order Item สำเร็จ:', JSON.stringify(data, null, 2));

            const mainProducts = [];
            const addonProducts = [];

            data.forEach(row => {
                const isAddon = row.INID_Remark__c != null ;
                
                const quantity = Number(row.INID_Quantity__c) || 0;
                const salePrice = Number(row.INID_Sale_Price__c) || 0;
                const total = parseFloat((quantity * salePrice).toFixed(2));

                const productObj = {
                    rowKey: row.Id,
                    code: row.INID_Material_Code__c,
                    hlItemNumber: row.INID_HL_Item_Number__c,
                    id: row.INID_Product_Price_Book__r?.Id,
                    productCode: row.INID_Material_Code__c || '' ,
                    description: row.INID_SKU_Decription__c,
                    unitPrice: row.INID_Product_Price_Book__r?.INID_Unit_Price__c || 0,
                    quantity,
                    salePrice,
                    unit: row.INID_Product_Price_Book__r?.INID_Unit__c || '',
                    total,
                    nameBtn: isAddon ? row.INID_Remark__c : '+',
                    variant: isAddon ? 'base' : 'brand',
                    addonDisabled: false,
                    isAddOn: isAddon,
                    productPriceBookId: row.INID_Product_Price_Book__r?.Id,
                    // editableSalePrice: this.productBuIds.has(row.INID_Product_Price_Book__r?.Id)

                };

                if (isAddon) {
                    addonProducts.push(productObj);
                } else {
                    mainProducts.push(productObj);
                }
            });

            // console.log(' Main Products:', JSON.stringify(mainProducts, null, 2));
            // console.log(' Add-on Products (Before FOC):', JSON.stringify(addonProducts, null, 2));

            // ดึง FOC ID ก่อน
            fetchOrderFocId({ orderId: this.orderId })
                .then(focId => {
                    if (!focId) {
                        console.warn('ไม่พบ FOC ID: ข้ามการดึง FOC ไปเลย');

                        // ทำการรวมและ map ปกติเลย
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

                        // console.log('Combined Products (Main + Add-ons, No FOC):', JSON.stringify(this.selectedProducts, null, 2));

                        return null; // ไม่ต้องไป .then(focItems) แล้ว
                    }

                    // console.log('FOC ID ที่ได้:', focId);
                    return fetchProductOrderItemFoc({ orderFocId: focId });
                })
                .then(focItems => {
                    if (!focItems) return;

                    // console.log('ข้อมูล FOC Add-ons:', JSON.stringify(focItems, null, 2));

                    focItems.forEach(foc => {
                        const quantity = Number(foc.INID_Quantity__c) || 0;
                        const salePrice = Number(foc.INID_Sale_Price__c) || 0;
                        const total = parseFloat((quantity * salePrice).toFixed(2));
                        const materialCode = foc.INID_Product_Price_Book__r?.INID_Material_Code__c;

                        const matchedMain = mainProducts.find(main => main.code === materialCode);
                        const hlItemNumber = matchedMain?.hlItemNumber || null;

                        const addonObj = {
                            rowKey: 'FOC-' + Math.random(),
                            code: materialCode,
                            hlItemNumber: hlItemNumber,
                            id: null,
                            productCode: materialCode,
                            description: foc.INID_Product_Price_Book__r?.INID_SKU_Description__c,
                            unitPrice: foc.INID_Product_Price_Book__r?.INID_Unit_Price__c || 0,
                            quantity,
                            salePrice,
                            unit: foc.INID_Product_Price_Book__r?.INID_Unit__c || '',
                            total,
                            nameBtn: foc.INID_Remark__c,
                            variant: 'base',
                            addonDisabled: false,
                            isAddOn: true,
                            productPriceBookId: foc.INID_Product_Price_Book__c
                        };

                        if (hlItemNumber) {
                            const isDuplicate = addonProducts.some(existing =>
                                existing.code === addonObj.code &&
                                existing.hlItemNumber === addonObj.hlItemNumber &&
                                existing.nameBtn === addonObj.nameBtn
                            );

                            if (!isDuplicate) {
                                addonProducts.push(addonObj);
                            } else {
                                console.warn(`Add-on ซ้ำ: ${addonObj.code} (${addonObj.nameBtn})`);
                            }
                        } else {
                            console.warn(`ไม่พบ Main Product ที่ตรงกับ Material Code: ${materialCode}`);
                        }
                    });

                    // console.log('🧩 Add-on Products (After FOC):', JSON.stringify(addonProducts, null, 2));

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

                    // console.log('Combined Products (Main + Add-ons):', JSON.stringify(this.selectedProducts, null, 2));
                })
                .catch(err => {
                    console.error('ดึงข้อมูล FOC ไม่สำเร็จ:', err);
                });

        } else if (error) {
            console.error('ดึงข้อมูล Product Order Item ไม่สำเร็จ:', error);
        }
    }

    @wire(fetchOrderToOrderFoc , {orderId: '$orderId'})
    getOrderToOrderFoc({error , data}) {
        if(data) {
            this.orderFocDetail = data ;
            // console.log('order Foc Detail From order Id : ' + JSON.stringify(this.orderFocDetail , null ,2));
        } else {
            console.log('error is : ' + error) ;
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
            const description = (product.INID_Product_Price_Book__r.INID_SKU_Description__c || '').toLowerCase();
            const materialCode = (product.INID_Product_Price_Book__r.INID_Material_Code__c || '').toLowerCase();
            return description.includes(term) || materialCode.includes(term);
        });
    }

    //Select product to table
    handleSelectProduct(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedProduct = this.productPriceBook.find(p => p.INID_Product_Price_Book__r.Id === selectedId);


        if (!selectedProduct) return;
        const isAlreadySelected = this.selectedProducts.some(p => p.id === selectedId);
        if (isAlreadySelected) {
            this.showToast('รายการซ้ำ', 'สินค้านี้มีอยู่ในตารางแล้ว', 'warning');
        } else {
            const newProduct = this.mapProduct(selectedProduct);
            this.selectedProducts = [...this.selectedProducts, newProduct];

            // console.log('this select product from handleSelectProduct Function : ' + JSON.stringify(this.selectedProducts , null ,2));
        }

           // ตรวจสอบ Add-on
        const matchedAddon = this.addonProductPriceBook.find(rule =>
            rule.INID_Main_Quantity__c === 1 &&
            rule.INID_Product_Price_Book__c === product.productPriceBookId
        );

        if (matchedAddon) {
                const addonId = `${product.rowKey}_addon_auto_${Date.now()}`;
                const addonProduct = {
                    rowKey: addonId,
                    id: addonId,
                    code: matchedAddon.INID_Product_Price_Book__r.INID_Material_Code__c,
                    description: matchedAddon.INID_Product_Price_Book__r.INID_SKU_Description__c,
                    unitPrice: 0,
                    salePrice: 0,
                    quantity: matchedAddon.INID_Add_on_Quantity__c,
                    unit: matchedAddon.INID_Product_Price_Book__r.INID_Unit__c,
                    total: 0,
                    productPriceBookId: matchedAddon.INID_Product_Price_Book__c,
                    nameBtn: this.getAddonLabel('1'),
                    variant: 'base',
                    editableSalePrice: false,
                    addOnText: matchedAddon.INID_Remark__c || 'ของแถม',
                    hlItemNumber: product.hlItemNumber,
                    isAddOn: true,
                    productCode: product.code,
                    parentRowKey: matchedMain.rowKey, 
                };

                const isAddonExists = this.selectedProducts.some(p =>
                    p.code === addonProduct.code &&
                    p.unitPrice === 0 &&
                    p.hlItemNumber === product.hlItemNumber
                );

                // console.log('is add on exist : ' + JSON.stringify(isAddonExists , null ,) )

                if (!isAddonExists) {
                    this.selectedProducts = [...this.selectedProducts, addonProduct];
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'เพิ่มของแถมอัตโนมัติ',
                        message: `${addonProduct.code} (${addonProduct.quantity} ${addonProduct.unit})`,
                        variant: 'info'
                    }));
                }

               
            }

        // console.log('this select product ใน function select product คือ : ' + JSON.stringify(this.selectedProducts , null ,2 ));
        
        // Reset search state
        this.searchProductTerm = '';
        this.showProductDropdown = false;
    }
    //Map product for table row
    mapProduct(source) {
        const unitPrice = source.INID_Product_Price_Book__r.INID_Unit_Price__c || 0;
        const quantity = 1;
        const productPriceBookId = source.INID_Product_Price_Book__r.Id;
        const editableSalePrice = this.productBuIds && this.productBuIds.has(productPriceBookId);

        

        return {
            rowKey: source.INID_Product_Price_Book__r.Id,
            id: source.INID_Product_Price_Book__r.Id,
            productPriceBookId: source.INID_Product_Price_Book__r.Id, 
            code: source.INID_Product_Price_Book__r.INID_Material_Code__c,
            description: source.INID_Product_Price_Book__r.INID_SKU_Description__c,
            unitPrice,
            quantity,
            salePrice: unitPrice,
            unit: source.INID_Product_Price_Book__r.INID_Unit__c || '',
            total: unitPrice * quantity,
            nameBtn: '+',
            variant: 'brand',
            addonDisabled: false, 
            editableSalePrice: editableSalePrice
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
            const match = this.productPriceBook.find(p => p.INID_Product_Price_Book__r.INID_Material_Code__c === code);
            if (!match) {
                invalid.push(code);
            } else {
                const alreadyExists = this.selectedProducts.some(p => p.code === code);
                if (alreadyExists) {
                    duplicates.push(code);
                } else {
                    const unitPrice = match.INID_Product_Price_Book__r.INID_Unit_Price__c || 0;
                    const quantity = 1;

                    added.push({
                        rowKey: match.INID_Product_Price_Book__r.Id,
                        id: match.INID_Product_Price_Book__r.Id,
                        productPriceBookId: match.INID_Product_Price_Book__r.Id,
                        code: match.INID_Product_Price_Book__r.INID_Material_Code__c,
                        Name: match.Name,
                        description: match.INID_Product_Price_Book__r.INID_SKU_Description__c,
                        quantity,
                        salePrice: unitPrice,
                        unit: match.INID_Product_Price_Book__r.INID_Unit__c,
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
    // handleSaveEditedRows(event) {
    //     const updatedValues = event.detail.draftValues;

    //     this.selectedProducts = this.selectedProducts.map(product => {
    //         const updated = updatedValues.find(d => d.rowKey === product.rowKey);            
    //         if (updated) {
    //             const qty = Number(updated.quantity ?? product.quantity);

    //             let rawPrice = updated.salePrice ?? product.salePrice;

    //             // ล้างสัญลักษณ์ ฿ และ comma
    //             if (typeof rawPrice === 'string') {
    //                 rawPrice = rawPrice.replace(/[฿,]/g, '');
    //             }

    //             const price = Number(parseFloat(rawPrice).toFixed(2));
    //             const total = Number((qty * price).toFixed(2));

    //             return {
    //                 ...product,
    //                 ...updated,
    //                 quantity: qty,
    //                 salePrice: price,
    //                 total: total  
    //             };
    //         }
    //         return product; 
    //     });

    //     this.draftValues = []; 
    //     this.dispatchEvent(
    //         new ShowToastEvent({
    //             title: 'Success',
    //             message: 'Edit field successfully',
    //             variant: 'success'
    //         })
    //     );
    // }

    handleSaveEditedRows(event) {
        const updatedValues = event.detail.draftValues;
        const newSelectedProducts = [...this.selectedProducts]; // clone list
        const matchedAddons = [];

        // console.log('เริ่มอัปเดต Products...');
        // console.log('update value : ' + JSON.stringify(updatedValues , null ,2));

        updatedValues.forEach(updated => {
            const index = newSelectedProducts.findIndex(p => p.rowKey === updated.rowKey);
            if (index === -1) {
                console.warn(`ไม่พบ rowKey: ${updated.rowKey} ใน selectedProducts`);
                return;
            }

            const product = newSelectedProducts[index];
            const qty = Number(updated.quantity ?? product.quantity);
            const price = Number(updated.salePrice ?? product.salePrice);

            const updatedProduct = {
                ...product,
                ...updated,
                quantity: qty,
                salePrice: price,
                total: qty * price
            };

            newSelectedProducts[index] = updatedProduct;

            // console.log(` อัปเดต Product: ${updatedProduct.code} | Qty: ${qty} | Price: ${price}`);

            const matchedRule = this.addonProductPriceBook.find(rule =>
                rule.INID_Product_Price_Book__c === updatedProduct.productPriceBookId &&
                rule.INID_Main_Quantity__c === qty && updatedProduct.nameBtn === '+'
            );

            if (matchedRule) {
                // console.log(`พบ Add-on สำหรับ ${updatedProduct.code}`);

                // ✅ เช็คว่ามี Add-on สำหรับ Product นี้อยู่แล้วหรือยัง (ระบุ parentRowKey ให้ชัด)
                const hasAddon = newSelectedProducts.some(p =>
                    p.isAddOn === true &&
                    p.parentRowKey === updatedProduct.rowKey &&
                    p.productPriceBookId === matchedRule.INID_Product_Price_Book__c
                );

                // console.log('hasAddon variable : ' + JSON.stringify(hasAddon));

                if (hasAddon) {
                    // console.log(`❗️ข้ามการเพิ่ม Add-on เพราะมีอยู่แล้วสำหรับ ${updatedProduct.code}`);
                    return; 
                }

                // console.log(`✅ แทรก Add-on ถัดจากแถว ${updatedProduct.code}`);

                // mark main product ว่า addonDisabled = true
                updatedProduct.addonDisabled = true;

                const addonProduct = {
                    rowKey: `addon_${Date.now()}`,
                    code: matchedRule.INID_Product_Price_Book__r.INID_Material_Code__c,
                    productPriceBookId: matchedRule.INID_Product_Price_Book__c,
                    description: matchedRule.INID_Product_Price_Book__r.INID_SKU_Description__c,
                    unitPrice: matchedRule.INID_Product_Price_Book__r.INID_Unit_Price__c,
                    quantity: matchedRule.INID_Add_on_Quantity__c,
                    salePrice: 0,
                    total: 0,
                    isAddOn: true,
                    parentRowKey: updatedProduct.rowKey,
                    nameBtn: matchedRule.INID_Remark__c,
                    variant: 'base',
                    editableSalePrice: false,
                    productCode: updatedProduct.code
                };

                // console.log('➕ Add-on ที่แทรก:', JSON.stringify(addonProduct, null, 2));

                newSelectedProducts[index] = updatedProduct;
                newSelectedProducts.splice(index + 1, 0, addonProduct);
                matchedAddons.push({ product: updatedProduct, addon: addonProduct });
            }

        });

        this.selectedProducts = newSelectedProducts;
        this.draftValues = [];
        // console.log(`✅ สรุป: พบ Add-ons ทั้งหมด ${matchedAddons.length} รายการ`);
        matchedAddons.forEach((item, i) => {
            // console.log(`🧩 [${i + 1}] ${item.addon.code} for ${item.product.code}`);
        });

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Edit field successfully',
                variant: 'success'
            })
        );
    }

    

    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        let newSelectedIds = [];
        let selectedDetailItems = [];

        selectedRows.forEach(row => {
            const isMain = row.nameBtn === '+';
            const type = isMain ? 'SALE' : 'FREE';

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
                        p.nameBtn !== '+' && p.code === mainItem.code
                    );

                    if (addOnItems.length > 0) {
                        const addonList = addOnItems.map(a => `• ${a.rowKey}`).join('\n');
                    } 

                    addOnItems.forEach(addon => {
                        if (!newSelectedIds.includes(addon.rowKey)) {
                            newSelectedIds.push(addon.rowKey);
                            selectedDetailItems.push({
                                rowKey: addon.rowKey,
                                code: addon.code,
                                type: 'FREE'
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

    async handleDeleteSelected() {
        if (!this.selectedDetailItems || this.selectedDetailItems.length === 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'แจ้งเตือน',
                    message: 'ยังไม่เลือกสักรายการ',
                    variant: 'warning',
                    mode: 'dismissable'
                })
            );
            return;
        }

        // console.log('select detail item : ' + JSON.stringify(this.selectedDetailItems , null ,2));

        const deleteKeys = new Set(this.selectedDetailItems.map(item => item.rowKey));

        // แยกรายการที่จะลบตามประเภท
        const mainItems = this.selectedDetailItems.filter(item => item.type === 'SALE');
        const addOnItems = this.selectedDetailItems.filter(item => item.type === 'FREE');

        // แสดงรายการที่จะลบ
        if (mainItems.length > 0) {
            const mainCodes = mainItems.map(m => `• ${m.code} (rowKey: ${m.rowKey})`).join('\n');
        }

        if (addOnItems.length > 0) {
            const addonCodes = addOnItems.map(a => `• ${a.code} (rowKey: ${a.rowKey})`).join('\n');
        }

        const confirmed = await LightningConfirm.open({
            message: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการต่อไปนี้?`,
            variant: 'destructive',
            label: 'ยืนยันการลบ',
        });

        if (!confirmed) {
            return;
        }

        // ลบออกจากข้อมูลหลัก
        // console.log('select product from delete function (Before) : ' + JSON.stringify(this.selectedProducts , null , 2)); 
        this.selectedProducts = this.selectedProducts.filter(p => !deleteKeys.has(p.rowKey));
        // console.log('select product from delete function (After) : ' + JSON.stringify(this.selectedProducts , null , 2)); 

        addOnItems.forEach(deletedAddon => {
            const relatedMain = this.selectedProducts.find(main =>
                !main.isAddOn && main.code === deletedAddon.code
            );

            // console.log('relate Main : ' + JSON.stringify(relatedMain ,  null , 2));

            if (relatedMain) {
                const hasOtherAddon = this.selectedProducts.some(item =>
                    item.isAddOn && item.code === relatedMain.code
                );

                relatedMain.addonDisabled = hasOtherAddon;
            }
        });

        // ล้าง selection
        this.selectedRowIds = [];
        this.selectedDetailItems = [];

        // เคลียร์ UI datatable
        const datatable = this.template.querySelector('lightning-datatable');
        if (datatable) {
            datatable.selectedRows = [];
        }

        
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'สำเร็จ',
                message: 'ลบรายการที่เลือกเรียบร้อยแล้ว',
                variant: 'success'
            })
        );

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
            p => p.code === this.currentMaterialCodeForAddOn && p.nameBtn === '+'
        );

        if (matchedMainIndex < 0) {
            this.showToast('Error', 'ไม่พบสินค้าหลัก', 'error');
            return;
        }

        const matchedMain = this.selectedProducts[matchedMainIndex];
        const addonId = matchedMain.id + '_addon_' + this.selectedValue;
        const alreadyExists = this.selectedProducts.some(p =>
            p.isAddOn === true &&
            p.parentRowKey === matchedMain.rowKey &&
            p.nameBtn === this.getAddonLabel(this.selectedValue)
            );

        if (alreadyExists) {
            this.showToast('Warning', 'Add-on นี้ถูกเพิ่มไปแล้ว', 'warning');
            return;
        }

        const addonProduct = {
            rowKey: addonId,
            parentRowKey: matchedMain.rowKey,
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
            productPriceBookId: matchedMain.id,
            isAddOn: true
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
            p => p.code === addonProduct.code &&  p.nameBtn === '+'
        );

        if (mainIndex >= 0) {
            this.selectedProducts.splice(mainIndex + 1, 0, addonProduct);
            this.selectedProducts = [...this.selectedProducts]; 
        }
    }



    async handleSave() {
        try {
            const confirmed = await LightningConfirm.open({
                message: 'คุณแน่ใจหรือไม่ว่าต้องการบันทึกรายการ?',
                variant: 'header',
                label: 'ยืนยันการบันทึก',
            });

            if (!confirmed) return;

            let hlNumber = 1;
            let recordsToInsert = [];
            let itemIndex = 1;

            // console.log('this.selectedProducts:', JSON.stringify(this.selectedProducts, null, 2));

            const focProducts = this.selectedProducts.filter(
                p => p.salePrice === 0 && p.nameBtn === 'ของแถมนอกบิล (FOC)'
            );

            const addonFocProducts = this.selectedProducts.filter(
                p => p.salePrice === 0 && p.nameBtn !== 'ของแถมนอกบิล (FOC)'
            );

            // console.log(`พบของแถมนอกบิล (FOC) ทั้งหมด: ${focProducts.length} รายการ`);
            focProducts.forEach((item, index) => {
                // console.log(`FOC #${index + 1}:`, JSON.stringify(item, null, 2));
            });

            // รวมยอด quantity ของ FOC ที่ซ้ำกันโดย productPriceBookId + nameBtn
            const focMap = new Map();
            focProducts.forEach(prod => {
                const key = prod.productPriceBookId + '-' + prod.nameBtn;
                if (focMap.has(key)) {
                    const exist = focMap.get(key);
                    exist.quantity += parseFloat(prod.quantity);
                } else {
                    // clone object พร้อมแปลง quantity เป็น number
                    focMap.set(key, { ...prod, quantity: parseFloat(prod.quantity) });
                }
            });
            const uniqueFocProducts = Array.from(focMap.values());

            // สร้าง focRecordsToInsert จาก uniqueFocProducts
            const focRecordsToInsert = uniqueFocProducts.map((prod, index) => {
                const formattedNumber = ((index + 1) * 10).toString().padStart(6, '0');
                return {
                    INID_Quantity__c: prod.quantity,
                    INID_Sale_Price__c: parseFloat(prod.salePrice),
                    INID_Quote__c: this.recordId,
                    INID_Order_Foc__c: this.orderFocId, // จะอัพเดตใหม่ถ้าสร้าง Order FOC
                    INID_Product_Price_Book__c: prod.productPriceBookId,
                    INID_Type__c: 'FREE',
                    INID_Remark__c: prod.nameBtn,
                    INID_HL_Number__c: index + 1,
                    INID_Item_Number__c: formattedNumber,
                };
            });

            this.selectedProducts.forEach((prod) => {

                // console.log('this product selected from save function : ' + JSON.stringify(this.selectedProducts , null ,2));

                const isFoc = prod.nameBtn === 'ของแถมนอกบิล (FOC)';
                const isAddon = prod.nameBtn !== '+';

                if (!isAddon && !isFoc) {
                    hlNumber = recordsToInsert.length + 1;
                }

                const formattedNumber = (itemIndex * 10).toString().padStart(6, '0');

                recordsToInsert.push({
                    INID_Quantity__c: parseFloat(prod.quantity),
                    INID_Sale_Price__c: parseFloat(prod.salePrice),
                    INID_Quote__c: this.recordId,
                    INID_Order__c: this.orderId,
                    INID_Product_Price_Book__c: (isFoc || isAddon) ? prod.productPriceBookId : prod.id,
                    INID_Type__c: isFoc ? 'FREE' : isAddon ? 'FREE' : 'SALE',
                    INID_Remark__c: (isFoc || isAddon) ? prod.nameBtn : null,
                    INID_HL_Number__c: hlNumber,
                    INID_Item_Number__c: formattedNumber,
                });

                // console.log('record to insert data , ' + JSON.stringify(recordsToInsert ,null ,2));

                itemIndex++;
            });

            // ถ้าไม่มี FOC แล้วเคยมี orderFocId ก็ลบ FOC เดิมทิ้ง
            if (uniqueFocProducts.length === 0 && this.orderFocId) {
                // console.log('foc product ไม่มีแล้ว จะลบที่ id = ' + this.orderFocId);
                await this.deleteFocItemsOnly(this.orderFocId);
            }

            // ถ้ายังไม่มี orderFocId และมีรายการ FOC ที่จะ insert
            if (!this.orderFocId && focRecordsToInsert.length > 0) {
                const newOrderFocDetail = this.orderFocDetail.map(item => {
                    const { Id, ...rest } = item;
                    return {
                        ...rest,
                        INID_Original_Order__c: Id,
                        INID_Order_Foc__c: this.orderFocId // จะอัพเดตหลังสร้าง orderFocId
                    };
                });

                try {
                    // 1. สร้าง Order FOC
                    const createdOrderFoc = await insertOrderFocById({ orderFocList: newOrderFocDetail });
                    // console.log('create order foc : ' + JSON.stringify(createdOrderFoc, null , 2));

                    if (createdOrderFoc && Array.isArray(createdOrderFoc) && createdOrderFoc.length > 0) {
                        this.orderFocId = createdOrderFoc[0].Id;
                        // console.log(' สร้าง Order FOC สำเร็จ, orderFocId:', this.orderFocId);

                        // 2. อัพเดต focRecordsToInsert ด้วย orderFocId ใหม่
                        const focItemsWithOrderFocId = focRecordsToInsert.map(item => ({
                            ...item,
                            INID_Order_Foc__c: this.orderFocId
                        }));

                        // 3. Insert FOC Items
                        await insertOrderItemFoc({
                            orderFocId: this.orderFocId,
                            orderItemList: focItemsWithOrderFocId
                        });

                        // console.log('Insert FOC items สำเร็จ');
                    } else {
                        console.warn('insertOrderFocById คืนค่าผิดปกติ:', createdOrderFoc);
                        this.orderFocId = null;
                    }
                } catch (error) {
                    console.error('Error insertOrderFocById หรือ insertOrderItemFoc:', error);
                    this.showToast('ผิดพลาด', 'ไม่สามารถสร้าง Order FOC หรือเพิ่มรายการ FOC ได้', 'error');
                    return; // หยุดถ้า insert ไม่สำเร็จ
                }
            } else if (this.orderFocId && focRecordsToInsert.length > 0) {
                // ถ้ามี orderFocId แล้ว insert FOC items ปกติ
                await insertOrderItemFoc({
                    orderFocId: this.orderFocId,
                    orderItemList: focRecordsToInsert
                });
                // console.log('insert order item foc success');
            }

            // Insert รายการ Main + Add-on
            // กรองเอาเฉพาะรายการที่ไม่ใช่ของแถมนอกบิล (FOC)
            // const recordsToInsertFiltered = recordsToInsert.filter(
            //     item => item.INID_Type__c !== 'Foc'
            // );

            const recordsToInsertFiltered = recordsToInsert.filter(
                item => !(item.INID_Type__c === 'FREE' && item.INID_Remark__c === 'ของแถมนอกบิล (FOC)')
            );

            await replaceProductItems({
                orderId: this.orderId,
                products: recordsToInsertFiltered
            });

            // 🔸 บันทึก Promotion ที่เลือก
            const selectedBenefitItems = [];

            this.comboGroups.forEach(group => {
                const selectedBenefits = group.groupedBenefits
                    .flatMap(bg => bg.benefits)
                    .filter(b => b.selected);

                selectedBenefits.forEach(benefit => {
                    selectedBenefitItems.push({
                        INID_Order__c: this.orderId,
                        INID_Sale_Promotion_Benefit_Product__c: benefit.Id
                    });
                });
            });

            if (selectedBenefitItems.length > 0) {
                try {
                    await insertOrderSalePromotion({ orderSalePromotionList: selectedBenefitItems });
                    // console.log('✔️ Insert Promotion สำเร็จ');
                } catch (error) {
                    console.error('❌ Insert Promotion Error:', error);
                    this.showToast('ผิดพลาด', 'ไม่สามารถบันทึก Promotion ได้', 'error');
                }
            }


            this.showToast('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย', 'success');
            this.selectedProducts = [];
            
            setTimeout(() => {
                window.location.reload();
            }, 200);

        } catch (error) {
            console.error('Save Error:', JSON.stringify(error.message));
            // this.showToast('ผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
        }
    }



    async deleteFocItemsOnly(orderFocId) {
        try {
            await deleteFocFromOrder({ orderFocId });
            // console.log('FOC items deleted successfully');
        } catch (error) {
            console.error('Error deleting FOC items:', error);
        }
    }


    @track comboGroups = [];

    async handleNext() {
        this.isShowApplyPromotion = true;
        this.isShowOrderLineItem = false;
        this.isLoaded = false;

        const orderItemList = this.selectedProducts.map((item) => {

            return {
                INID_Quantity__c: item.quantity,
                INID_Sale_Price__c: item.salePrice,
                INID_Product_Price_Book__c: item.productPriceBookId, 
                INID_Total__c: item.total,
                };
            });

        // console.log('ส่ง orderItemList เข้า getPromotion:', JSON.stringify(orderItemList, null, 2));
        try {
            const getPromotions = await getPromotion({ orderList: orderItemList, accountId: this.accountId })
            console.log('getPromotion'+ JSON.stringify(getPromotions,null,2));
    
            this.comboGroups = getPromotions.promotions.map(promo => {
                // แยก benefits ตาม conditionType
                const benefitGroups = {};

                promo.benefits.forEach(b => {
                    const condType = b.INID_Sale_Promotion_Benefit__r?.INID_Condition_Type__c || 'OR';
                    const isSelectPromotionBenefit = this.orderSalePromotionId?.includes(b.Id);

                    if (!benefitGroups[condType]) {
                        benefitGroups[condType] = [];
                    }

                    benefitGroups[condType].push({
                        ...b,
                        id: b.Id,
                        Name: b.Name,
                        BenefitProduct: b.INID_Product_Price_Book__c,
                        benefitType: b.INID_Benefit_Type__c,
                        isExpanded: false  ,


                        //set select Promotion Benefit
                        selected: isSelectPromotionBenefit,
                        className: isSelectPromotionBenefit ? 'benefit-box selected' : 'benefit-box',

                        //Show Input
                        discountAmount: b.INID_Discount_Amount__c || null,
                        discountPercent: b.INID_Discount__c || null,
                        freeProductQuantityFix: b.INID_Free_Product_Quantity_Fix__c || null,
                        freeProductQuantityRatioNumerator: b.INID_Free_Product_Quantity_Numerator__c || null,
                        freeProductQuantityRatioDenominator: b.INID_Free_Product_Quantity_Denominator__c || null,
                        batch: b.INID_Batch_Lot_No__c || null,
                        setPrice: b.INID_SetPrice__c || null,
                        remark: b.INID_Remark__c || '',
                        freeProductLabelFix: b.INID_Product_Price_Book__r
                            ? `${b.INID_Product_Price_Book__r.INID_Material_Code__c || ''} - ${b.INID_Product_Price_Book__r.INID_SKU_Description__c || ''}`.trim()
                            : '',

                        // Add these flags for conditional rendering
                        isDiscountAmount: b.INID_Benefit_Type__c === 'Discount Amount',
                        isDiscountPercent: b.INID_Benefit_Type__c === 'Discount(%)',
                        isFreeProductFix: b.INID_Benefit_Type__c === 'Free Product (Fix Quantity)',
                        isFreeProductRatio: b.INID_Benefit_Type__c === 'Free Product (Ratio)',
                        isSetPrice: b.INID_Benefit_Type__c === 'Set Price',

                        displayBenefit:
                            b.INID_Benefit_Type__c === 'Free Product (Ratio)'
                                ? b.INID_Benefit_Type__c + ' ' + b.INID_Free_Product_Quantity_Numerator__c + ' : ' + b.INID_Free_Product_Quantity_Denominator__c
                                : b.INID_Benefit_Type__c === 'Free Product (Fix Quantity)'
                                ? b.INID_Benefit_Type__c + ' : ' + b.INID_Free_Product_Quantity_Fix__c
                                : b.INID_Benefit_Type__c === 'Set Price'
                                ? b.INID_Benefit_Type__c + ' ' + b.INID_SetPrice__c
                                : b.INID_Benefit_Type__c === 'Discount Amount'
                                ? b.INID_Benefit_Type__c + ' ' + b.INID_Discount_Amount__c + ' THB '
                                : b.INID_Benefit_Type__c === 'Discount(%)'
                                ? b.INID_Benefit_Type__c + ' : ' + b.INID_Discount__c + ' % '
                                : 'N/A'
                    });
                });

                // สร้างกลุ่มที่แยก AND / OR
                const groupedBenefits = Object.keys(benefitGroups).map(type => ({
                    conditionType: type,
                    benefits: benefitGroups[type]
                }));

                return {
                    promotionId: promo.id,
                    promotionName: promo.name,
                    promotionDescript: promo.description,
                    isSelected: false, // ✅ เริ่มต้นไม่เลือก
                    arrowSymbol: 'fa-solid fa-circle-chevron-down',
                    className: 'promotion-box',
                    groupedBenefits: groupedBenefits // แทนที่ benefits เดิม
                };
            });
   
            // console.log('combo group : ' + JSON.stringify(this.comboGroups , null , 2)) ;

        } catch(error) {
            console.error('❌ Full error detail:', JSON.stringify(error, null, 2));
            alert('error\n'+ (error.body?.message || error.message || JSON.stringify(error)));
        }   
    }

    handleTogglePromotion(event) {
        const promoId = event.currentTarget.dataset.promoid;
        this.comboGroups = this.comboGroups.map(group => {
            if (group.promotionId === promoId) {
                const updated = {
                    ...group,
                    isSelected: !group.isSelected,
                    isExpanded: !group.isExpanded
                };
                updated.className = updated.isSelected ? 'promotion-box selected' : 'promotion-box';
                updated.arrowIconClass = updated.isSelected
                    ? 'fa-solid fa-circle-chevron-up'
                    : 'fa-solid fa-circle-chevron-down';

                return updated;
            }
            return group;
        });
    }

    handleToggleBenefit(event) {
        // console.log('handle toggle Benefit');
        const promoId = event.currentTarget.dataset.promoid;
        const benefitId = event.currentTarget.dataset.benefitid;

        this.comboGroups = this.comboGroups.map(group => {
            if (group.promotionId !== promoId) return group;

            const updatedGrouped = group.groupedBenefits.map(bg => {
                // console.log('bg.benefits is : ' + JSON.stringify(group.groupedBenefits , null ,2));
                const isBenefitInGroup = bg.benefits.some(b => b.Id === benefitId);
                // console.log('benefit in group  ' + JSON.stringify(isBenefitInGroup , null ,2));

                if (!isBenefitInGroup) {
                    const isConflict =
                        (bg.conditionType === 'AND') ||
                        (bg.conditionType === 'OR');

                    if (isConflict) {
                        const clearedBenefits = bg.benefits.map(b => ({
                            ...b,
                            selected: false,
                            className: 'benefit-box'
                        }));
                        return { ...bg, benefits: clearedBenefits };
                    }

                    return bg; 
                }
                if (bg.conditionType === 'AND') {
                    const isAllSelected = bg.benefits.every(b => b.selected);
                    const newSelected = !isAllSelected;

                    // console.log('is all selected : ' + JSON.stringify(isAllSelected, null ,2)) ;

                    const updatedBenefits = bg.benefits.map(b => ({
                        ...b,
                        selected: newSelected,
                        className: newSelected ? 'benefit-box selected' : 'benefit-box'
                    }));

                    return { ...bg, benefits: updatedBenefits };
                } else {
                    const isAlreadySelected = bg.benefits.find(b => b.Id === benefitId)?.selected;

                    const updatedBenefits = bg.benefits.map(b => {
                        if (b.Id === benefitId) {
                            const newSelected = !isAlreadySelected;
                            return {
                                ...b,
                                selected: newSelected,
                                className: newSelected ? 'benefit-box selected' : 'benefit-box'
                            };
                        }
                        return {
                            ...b,
                            selected: false,
                            className: 'benefit-box'
                        };
                    });

                    return { ...bg, benefits: updatedBenefits };
                }
            });
            return {
                ...group,
                groupedBenefits: updatedGrouped
            };
        });

        this.updateSelectedBenefits();
    }

    updateSelectedBenefits() {
        this.selectedBenefits = [];
        

        this.comboGroups.forEach(group => {
            group.groupedBenefits.forEach(bg => {
                bg.benefits.forEach(b => {
                    if (b.selected) {
                        this.selectedBenefits.push({
                            productPriceBook: b.INID_Product_Price_Book__c,
                            promotionId: group.promotionId,
                            benefitId: b.Id,
                            benefitType: b.benefitType,
                            value: {
                                discountAmount: b.discountAmount,
                                discountPercent: b.discountPercent,
                                freeProductQuantityFix: b.freeProductQuantityFix,
                                freeProductQuantityRatioNumerator: b.freeProductQuantityRatioNumerator,
                                freeProductQuantityRatioDenominator: b.freeProductQuantityRatioDenominator,
                                setPrice: b.setPrice,
                                batch: b.batch
                            }
                        });
                    }
                });
            });
        });
        // console.log('selectedBenefits: ' + JSON.stringify(this.selectedBenefits , null ,2)) ;

        //เช็คจาก is select
        this.comboGroups = this.comboGroups.map(group => {
            const isSelected = group.groupedBenefits?.some(bg =>
                bg.benefits?.some(b => b.selected)
            );

            return {
                ...group,
                isSelected,
                isExpanded: isSelected,
                arrowSymbol: isSelected
                    ? 'fa-solid fa-circle-chevron-up'
                    : 'fa-solid fa-circle-chevron-down',
                arrowIconClass: isSelected
                    ? 'fa-solid fa-circle-chevron-up'
                    : 'fa-solid fa-circle-chevron-down',
                className: isSelected ? 'promotion-box selected' : 'promotion-box'
            };
        });
    }
    
    handleBack() {
        this.isShowApplyPromotion = false ;
        this.isShowOrderLineItem = true ;
        this.isLoaded = false ;
    }

    backtoProduct() {
        this.isShowApplyPromotion = false;
        this.isShowOrderLineItem = true;
        this.isLoaded = false ;
    }



    backToApply() {
        this.isShowApplyPromotion = true;
        this.isShowSummary = false;
        this.isShowOrderLineItem = false;
        this.isLoaded = false;
    }


    // start summary

    summaryColumns = [
        { label: 'Material Code', fieldName: 'code', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 150 },
        { label: 'SKU Description', fieldName: 'description', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 200 },
        { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true , cellAttributes: { alignment: 'right' } , initialWidth: 300 },
        { label: 'Quantity', fieldName: 'quantity', type: 'number', hideDefaultActions: true, cellAttributes: { alignment: 'right' } },
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true ,cellAttributes: { alignment: 'right' } , initialWidth: 130},
        { label: 'Unit', fieldName: 'unit', type: 'text', cellAttributes: { alignment: 'right' } , hideDefaultActions: true  , initialWidth: 100 },
        { label: 'Total', fieldName: 'total', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 120},
        { label: 'Remark', fieldName: 'addOnText', type: 'text', cellAttributes: { alignment: 'right' } , initialWidth: 150 , hideDefaultActions: true },
        { label: 'Net Price', fieldName: 'netPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true , initialWidth: 110 }
    ];

    columnPromotionsTitle = [
       { label: 'Promotion ', fieldName: 'promotionName' ,hideDefaultActions: true },
       { label: 'Descirption ', fieldName: 'promotionDescription' ,hideDefaultActions: true },
    ];

    getColumnsByType(type) {
        if (type === 'Free Product (Fix Quantity)') {
            return [
                { label: 'Material Code', fieldName: 'promotionMaterialCode', hideDefaultActions: true },
                { label: 'SKU Description', fieldName: 'promotionDescription', hideDefaultActions: true },
                { label: 'Unit', fieldName: 'unit', hideDefaultActions: true },
                { label: 'Quantity', fieldName: 'freeProductQuantity', hideDefaultActions: true },
            ];
        } else if (type === 'Discount Amount') {
            return [
                { label: 'Discount Type', fieldName: 'discountType', hideDefaultActions: true },
                { label: 'Total(AMOUNT/PERCENT)', fieldName: 'discountAmount', hideDefaultActions: true }
            ];
        } else if (type === 'Set Price') {
            return [
                { label: 'Material Code', fieldName: 'promotionMaterialCode', hideDefaultActions: true },
                { label: 'SKU Description', fieldName: 'promotionDescription', hideDefaultActions: true } ,
                { label: 'Sales Price', fieldName: 'setPrice', hideDefaultActions: true } ,
                { label: 'Unit', fieldName: 'unit', hideDefaultActions: true },
            ];
        } else if (type === 'Free Product (Ratio)') {
            return [
                { label: 'Material Code', fieldName: 'promotionMaterialCode', hideDefaultActions: true },
                { label: 'SKU Description', fieldName: 'promotionDescription', hideDefaultActions: true } ,
                { label: 'Unit', fieldName: 'unit', hideDefaultActions: true },
                { label: 'Numerator', fieldName: 'numerator', hideDefaultActions: true },
                { label: 'Denominator', fieldName: 'denomiator', hideDefaultActions: true },
            ];
        } else {
            return [
                { label: 'Discount Type', fieldName: 'discountType', hideDefaultActions: true },
                { label: 'Total(AMOUNT/PERCENT)', fieldName: 'discountPercent', hideDefaultActions: true }
            ];
        }
    }


    showSummary() {
        this.isShowOrder = false;
        this.isShowSummary = true;
        this.isShowApplyPromotion = false;
        this.summaryProducts = [];
        this.promotionData = []; 
        this.selectedPromotion = []; 
        this.isLoaded = false;

        // 1) สรุปรายการสินค้า + Add-on
        const mainProducts = this.selectedProducts.filter(p => p.nameBtn === '+');
        // console.log('selectedProduct', JSON.stringify(this.selectedProducts, null, 2));

        mainProducts.forEach(main => {
            const relatedAddons = this.selectedProducts.filter(
                p => p.code === main.code && p.isAddOn
            );

            const mainQty = Number(main.quantity || 0);
            const mainTotal = Number(main.total || (main.unitPrice * mainQty) || 0);
            const addonQtySum = relatedAddons.reduce((sum, a) => sum + Number(a.quantity || 0), 0);
            const addonTotalSum = relatedAddons.reduce((sum, a) => sum + Number(a.total || 0), 0);
            const totalQty = mainQty + addonQtySum;
            const totalSum = mainTotal + addonTotalSum;
            const netPrice = totalQty > 0 ? (totalSum / totalQty).toFixed(2) : '0.00';

            this.summaryProducts.push({
                ...main,
                netPrice,
                addOnText: null
            });

            if (!this.selectedPromotion.some(p => p.id === main.id)) {
                this.selectedPromotion.push({ ...main });
            }

            relatedAddons.forEach(addon => {
                this.summaryProducts.push({
                    ...addon,
                    addOnText: addon.nameBtn
                });
            });
        });

        // 2) ตรวจของแถมนอกบิล (FOC)
        const focAddons = this.summaryProducts.filter(p => p.addOnText === 'ของแถมนอกบิล (FOC)');
        const focList = focAddons.map(foc => {
            const main = this.summaryProducts.find(mp => !mp.addOnText && mp.code === foc.productCode);
            return { focProduct: foc };
        });
        this.focProducts = focList;
        // console.log('FOC Mapping:', JSON.stringify(this.focProducts, null, 2));

        // 3) รวมโปรโมชันแบบไม่ซ้ำ (แม้ไม่มี benefit ที่เลือกก็ใส่ได้)
        // console.log('selectedPromotions:', JSON.stringify(selectedPromotions, null, 2));
        // const selectedPromotions = this.comboGroups.filter(group => !group.isSelected);
        const selectedPromotions = this.comboGroups.filter(group => group.isSelected);

        // console.log('comboGroups summary:', JSON.stringify(this.comboGroups, null, 2));
        // console.log('selectedPromotions summary:', JSON.stringify(selectedPromotions, null, 2));
        

        selectedPromotions.forEach(group => {
            const selectedBenefits = group.groupedBenefits
                .flatMap(gb => gb.benefits)
                .filter(b => b.selected);

            let targetGroup = this.promotionData.find(p => p.promotionName === group.promotionName);
            if (!targetGroup) {
                targetGroup = {
                    id: group.promotionId || group.id,
                    promotionName: group.promotionName,
                    promotionDescription: group.promotionDescript,
                    benefits: []
                };
                this.promotionData.push(targetGroup);
            }

            selectedBenefits.forEach(b => {
                const type = b.INID_Benefit_Type__c;
                const columnKey = JSON.stringify(this.getColumnsByType(type));

                let existingBenefitGroup = targetGroup.benefits.find(bg =>
                    JSON.stringify(bg.columns) === columnKey
                );

                if (!existingBenefitGroup) {
                    existingBenefitGroup = {
                        id: b.Id,
                        columns: this.getColumnsByType(type),
                        data: []
                    };
                    targetGroup.benefits.push(existingBenefitGroup);
                }

                existingBenefitGroup.data.push({
                    promotionMaterialCode: b.INID_Product_Price_Book__r?.INID_Material_Code__c || '',
                    promotionDescription: b.INID_Product_Price_Book__r?.INID_SKU_Description__c || '',
                    unit: b.INID_Product_Price_Book__r?.INID_Unit__c || '-',
                    numerator: b.INID_Free_Product_Quantity_Numerator__c,
                    denomiator: b.INID_Free_Product_Quantity_Denominator__c,
                    freeProductQuantity: b.INID_Free_Product_Quantity_Fix__c,
                    discountAmount: b.INID_Discount_Amount__c, 
                    discountType: type,
                    discountPercent: b.INID_Discount__c,
                    setPrice: b.INID_SetPrice__c,
                });
            });
        });

        // console.log("✅ promotionData สรุป:", JSON.stringify(this.promotionData, null, 2));

        const totalNetPrice = this.summaryProducts
            .filter(p => !p.addOnText)
            .reduce((sum, p) => sum + parseFloat(p.netPrice || 0), 0);

        // console.log(`💰 Net Price รวมทั้งหมด: ${totalNetPrice.toFixed(2)} บาท`);
    }


    get promoList() {
        const result = this.promotionData.map(p => ({
            ...p,
            rowWrapper: [{
                id: p.id,
                promotionName: p.promotionName,
                promotionDescription: p.promotionDescription
            }]
        }));
        // console.log('📦 promoList full:', JSON.stringify(result, null, 2));
        return result;
    }



}