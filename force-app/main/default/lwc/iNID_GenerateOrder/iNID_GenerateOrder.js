import { LightningElement, track, wire , api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getQuoteId from '@salesforce/apex/INID_OrderController.getQuoteId';
import fetchQuoteItemById from '@salesforce/apex/INID_OrderController.fetchQuoteItemById'

export default class INID_Ordertest extends NavigationMixin(LightningElement) {
    
    @api recordId;
    @track summaryProducts = [];
    isShowSummary = false ;
    @track isLoaded = false;
    @track quoteId = '';
    @track quoteOrderItemValue = [] ;
    @track qouteNoRuner = 0;
    
    // get quote id 
    @wire(getQuoteId, { quoteId: '$recordId' })
    wireGetRecordId({error , data}) {
        // alert('recordId Apex : ' + this.recordId );
        if(data) {
            // console.log('data : ' + data) ;
            this.quoteId  = data ;
            alert('quote id : ' + this.quoteId);
        } else {
            console.log(error) ;
        }
    } 

    // get data by qoute id
    @wire(fetchQuoteItemById, {quoteId: '$recordId'})
    getDataByQuoteId({err , data}) {
        if(data) {
            this.quoteOrderItemValue = data ;

            // alert(JSON.stringify(this.quoteOrderItemValue, null,2));
            // console.log(this.quoteOrderItemValue);

            this.summaryProducts = this.quoteOrderItemValue.map((productItem) => {
                return{
                    quoteNo: this.qouteNoRuner += 1  ,
                    materialCode: productItem.INID_Material_Code__c ,
                    skuDescription: productItem.INID_SKU_Description__c ,
                    // unitPrice: 0 ,
                    quantity: productItem.INID_Quantity__c ,
                    salePrice: productItem.INID_Sale_Price__c ,
                    // unit: productItem.INID_Unit__c ,
                    total: productItem.INID_Quantity__c * productItem.INID_Sale_Price__c ,
                    // remark: '-' ,
                    // netPrice: 
                }
            })

        }else {
            alert(JSON.stringify(err));
        }
    }
    

    summaryColumns = [
        { label: 'Quote No.', fieldName: 'quoteNo', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 100 },
        { label: 'Material Code', fieldName: 'materialCode', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 150 },
        { label: 'SKU Description', fieldName: 'skuDescription', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 200 },
        // { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true , cellAttributes: { alignment: 'right' } , initialWidth: 115 },
        { label: 'Quantity', fieldName: 'quantity', type: 'number', hideDefaultActions: true, cellAttributes: { alignment: 'right' } },
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true ,cellAttributes: { alignment: 'right' } , initialWidth: 130},
        // { label: 'Unit', fieldName: 'unit', type: 'text', cellAttributes: { alignment: 'right' } , hideDefaultActions: true  , initialWidth: 100 },
        { label: 'Total', fieldName: 'total', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 120},
        // { label: 'Remark', fieldName: 'addOnText', type: 'text', cellAttributes: { alignment: 'right' } , initialWidth: 150 , hideDefaultActions: true },
        // { label: 'Net Price', fieldName: 'netPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true , initialWidth: 110 }
    ];

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

    // inser data in objects here !


   async closeTab() {
        if (!this.isConsoleNavigation) {
            return;
        }
        const { tabId } = await getFocusedTabInfo();
        await closeTab(tabId);
    }

    handleSaveSuccess() {
        const evt = new ShowToastEvent({
            title: 'บันทึกสำเร็จ',
            message: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว แต่ยังไม่มีข้อมูลนะ หยอกเฉยๆ',
            variant: 'success',
            mode: 'sticky'
        });
        this.dispatchEvent(evt);
    }
}