import { LightningElement, track, wire , api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getQuoteId from '@salesforce/apex/INID_OrderController.getQuoteId';
import fetchQuoteItemById from '@salesforce/apex/INID_OrderController.fetchQuoteItemById'
import insertOrderItemByQuote from '@salesforce/apex/INID_OrderController.insertOrderItemByQuote'
import insertOrder from '@salesforce/apex/INID_OrderController.insertOrder' ;
import fetchAccountIdByQuote from '@salesforce/apex/INID_OrderController.fetchAccountIdByQuote' 

export default class INID_Ordertest extends NavigationMixin(LightningElement) {
    
    @api recordId;
    @track summaryProducts = [];
    @track quoteId = '';
    @track quoteOrderItemValue = [] ;
    @track qouteNoRuner = 0;
    @track orderId = '' ;
    @track accountId = '' ;
    @track lastHLNumber ;

    summaryColumns = [
        { label: 'Quote No.', fieldName: 'quoteNo', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 100 },
        { label: 'Material Code', fieldName: 'materialCode', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 150 },
        { label: 'SKU Description', fieldName: 'skuDescription', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 200 },
        { label: 'Quantity', fieldName: 'quantity', type: 'number', hideDefaultActions: true, cellAttributes: { alignment: 'right' } },
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true ,cellAttributes: { alignment: 'right' } , initialWidth: 130},
        { label: 'Total', fieldName: 'total', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 120},
        { label: 'Net Price', fieldName: 'netPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true , initialWidth: 110 }
    ];

    handleNavToOrderPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.orderId,
                objectApiName: 'Order',
                actionName: 'view'
            }
        });
    }

    renderedCallback() {
        if(this.isLoaded) return;
        const STYLE = document.createElement("style");
        STYLE.innerText = `
        .slds-modal__container {
            max-width: 70vw !important;
            width: 90vw !important;
        }`; 
        this.template.appendChild(STYLE);
    }
    
    // get quote id 
    @wire(getQuoteId, )
    wireGetRecordId({error , data}) {
        if(data) {
            this.quoteId  = data ;
        } else {
            console.log(error) ;
        }
    } 
    
    // get data by qoute id
    @wire(fetchQuoteItemById, {quoteId: '$recordId'})
    getDataByQuoteId({error , data}) {
        if(data) {
            this.quoteOrderItemValue = data ;
            this.summaryProducts = this.quoteOrderItemValue.map((productItem) => {
                return{
                    quoteNo: this.qouteNoRuner += 1  ,
                    itemNumber: productItem.INID_Item_Number__c ,
                    materialCode: productItem.INID_Material_Code__c ,
                    skuDescription: productItem.INID_SKU_Description__c ,
                    quantity: productItem.INID_Quantity__c ,
                    salePrice: productItem.INID_Sale_Price__c ,
                    total: productItem.INID_Quantity__c * productItem.INID_Sale_Price__c ,
                    netPrice: (productItem.INID_Quantity__c * productItem.INID_Sale_Price__c) / (productItem.INID_Quantity__c) ,
                    productPriceBookId: productItem.INID_Product_Price_Book__c,
                }
            })
        }else {
            console.log(error);
        }
    }

    @wire(fetchAccountIdByQuote , {quoteId: '$recordId' })
    getAccountId({error, data}) {
        if(data) {
            this.accountId = data ;
        }else {
            console.log(error);
        }
    }
    
    // insert order
    async insertOrderDetailFunction() {
        const orderDetail = {
            AccountId: this.accountId,
            Status: 'Draft',
            EffectiveDate: new Date().toISOString(),
        };
        try {
            const orderId = await insertOrder({ order: orderDetail });
            this.orderId = orderId;
            await this.insertOrderItemListFunction(this.orderId); 
        } catch (error) {
            this.handleSaveError(error);
        }
    }

    
    async insertOrderItemListFunction(orderId) {
        let currentHLNumber = 0;
        const orderItemList = this.summaryProducts.map((item) => {
            currentHLNumber++;
            return {
                INID_Quantity__c: item.quantity,
                INID_Sale_Price__c: item.salePrice,
                INID_Product_Price_Book__c: item.productPriceBookId,
                INID_Type__c: 'Main',
                INID_Order__c: orderId,
                INID_HL_Number__c: currentHLNumber,
                INID_Item_Number__c: item.itemNumber,
            };
        });
        console.log('Order Item List:', JSON.stringify(orderItemList, null, 2));
        try {
            await insertOrderItemByQuote({ OrderList: orderItemList });
            this.handleSaveSuccess();
            setTimeout(() => {
                this.dispatchEvent(new CloseActionScreenEvent());
            }, 500);
        } catch (error) {
            this.handleSaveError(error);
        }
    }

    // insert data in objects 
    async handleSave(){
        if (!this.accountId) {
            this.handleSaveError({ message: 'AccountId is missing, please wait or reload.' });
            return;
        } 
        await this.insertOrderDetailFunction();   
    }
    
    handleSaveSuccess() {
        const evt = new ShowToastEvent({
            title: 'บันทึกสำเร็จ',
            message: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
            variant: 'success',
        });
        this.dispatchEvent(evt);
        setTimeout(() => {
            this.handleNavToOrderPage();
        }, 1000);
    }

    handleSaveError(error) {
        console.log('Save Error: ' + JSON.stringify(error, null, 2));
        let msg = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล : ' + error ;

        if (error && error.body && error.body.message) {
            msg = error.body.message;
        } else if (error && error.message) {
            msg = error.message;
        }

        this.dispatchEvent(new ShowToastEvent({
            title: 'Error saving data',
            message: msg,
            variant: 'error',
        }));
    }

    async closeTab() {
        if (!this.isConsoleNavigation) {
            return;
        }
        const { tabId } = await getFocusedTabInfo();
        await closeTab(tabId);
    }
}