import { LightningElement, track, wire , api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getQuoteId from '@salesforce/apex/INID_OrderController.getQuoteId';
import fetchQuoteItemById from '@salesforce/apex/INID_OrderController.fetchQuoteItemById'
import insertOrderItem from '@salesforce/apex/INID_OrderController.insertOrderItem'
import insertOrder from '@salesforce/apex/INID_OrderController.insertOrder' ;
import fetchAccountIdByQuote from '@salesforce/apex/INID_OrderController.fetchAccountIdByQuote' 
import fetchCustomersByGenerate from '@salesforce/apex/INID_OrderController.fetchCustomersByGenerate' 
import fetchDataBillto from '@salesforce/apex/INID_OrderController.fetchDataBillto';
import fetchDataShipto from '@salesforce/apex/INID_OrderController.fetchDataShipto';
import getPaymentType from '@salesforce/apex/INID_OrderController.getPaymentType';
import getPaymentTerm from '@salesforce/apex/INID_OrderController.getPaymentTerm';
import PAYMENT_TYPE_FIELD from '@salesforce/schema/Account.Payment_type__c';
import PAYMENT_TERM_FIELD from '@salesforce/schema/Account.Payment_term__c';
import INID_Organization__c from '@salesforce/schema/Account.INID_Organization__c';
import ACCOUNT_ID from '@salesforce/schema/Account.Id';
import fetchAccountAddressDetail from '@salesforce/apex/INID_OrderController.fetchAccountAddressDetail' ;
import fetchAccountAddressDetailShipTo from '@salesforce/apex/INID_OrderController.fetchAccountAddressDetailShipTo' ;
// import { IsConsoleNavigation, getFocusedTabInfo, closeTab } from 'lightning/platformWorkspaceApi';
import { CloseActionScreenEvent } from 'lightning/actions';


export default class INID_Ordertest extends NavigationMixin(LightningElement) {
    
    @api recordId;
    @track summaryProducts = [];
    @track quoteId = '';
    @track quoteOrderItemValue = [] ;
    @track qouteNoRuner = 0;
    @track orderId = '' ;
    @track accountId = '' ;
    @track lastHLNumber ;
    @track isShowSummaryProduct = false ;
    @track isShowOrder = true ;
    @track accounts = [] ;
    @track searchTerm = '' ;
    @track billto = '' ;
    @track shipto = '' ;
    @track organizationValue = '' ;
    @track shiptoOptions = []; 
    @track billtoOptions = []; 
    @track paymentTypeValue = '' ;
    @track paymentTermValue = '' ;
    @track paymentTypeOption = [] ;
    @track paymentTermOption = [] ;
    @track radioCheckedValue = [];
    @track raidoExclude = false ;
    @track raidoInclude = false ;
    @track radioButtonOrderLabel1 ='Exclude Vat'
    @track radioButtonOrderLabel2 ='Include Vat'
    @track purchaseOrderNumber = '';
    @track noteAgent = '';
    @track noteInternal = '';
    @track addressShipto2 = '';
    @track provinceShipto = '';
    @track cityShipto = '';
    @track streetShipto = '';
    @track zipCodeShipto = '';
    @track shipToCode = '';
    @track addressBillto2 = '';
    @track provinceBillto = '';
    @track cityBillto = '';
    @track streetBillto = '';
    @track zipCodeBillto = '';
    @track billToCode = '';
    @track totalSummaryAmount = 0 ;



    summaryColumns = [
        { label: 'Quote No.', fieldName: 'quoteNo', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 100 },
        // { label: 'Material Code', fieldName: 'materialCode', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 150 },
        { label: 'Name', fieldName: 'name', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 150 },
        { label: 'SKU Description', fieldName: 'skuDescription', type: 'text', hideDefaultActions: true, cellAttributes: { alignment: 'right' } , initialWidth: 200 },
        { label: 'Quantity', fieldName: 'quantity', type: 'number', hideDefaultActions: true, cellAttributes: { alignment: 'right' }, initialWidth: 150} ,
        { label: 'Sale Price', fieldName: 'salePrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true ,cellAttributes: { alignment: 'right' }},
        { label: 'Total', fieldName: 'total', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true, cellAttributes: { alignment: 'right' }},
        { label: 'Net Price', fieldName: 'netPrice', type: 'currency', typeAttributes: { minimumFractionDigits: 2 }, hideDefaultActions: true }
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

        @wire(getPaymentType)
            wiredGetPaymentType({ error, data }) {
            if (data) {
                this.paymentTypeOption = data.map(item => ({
                    label: item.label,
                    value: item.value
                }));
                console.log('paymentTypeOption:' + JSON.stringify(this.paymentTypeOption , null ,2));
            } else if (error) {
                console.error('Error loading picklist:', error);
            }
        }
    
        @wire(getPaymentTerm)
        wiredGetPaymentTerm({ error, data }) {
            if (data) {
                this.paymentTermOption = data.map(item => ({
                    label: item.label,
                    value: item.value
                }));
                console.log('paymentTermOption:', JSON.stringify(this.paymentTermOption, null, 2));
            } else if (error) {
                console.error('Error loading picklist:', error);
            }
        }

    @wire(getRecord, {
    recordId: "$accountId",
    fields: [ACCOUNT_ID, PAYMENT_TYPE_FIELD, PAYMENT_TERM_FIELD, INID_Organization__c]
    })
    fetchOrder({ error, data }) {
        // 👉 ตรวจสอบว่า paymentTermOption โหลดเสร็จหรือยัง
        if (!this.paymentTermOption || this.paymentTermOption.length === 0) {
            console.log('⏳ paymentTermOption not ready, retrying fetchOrder...');
            setTimeout(() => this.fetchOrder({ error: null, data }), 100);
            return;
        }

        if (data) {
            const fetchedPaymentType = getFieldValue(data, PAYMENT_TYPE_FIELD);
            const fetchedOrganization = getFieldValue(data, INID_Organization__c);
            const fetchedPaymentTerm = getFieldValue(data, PAYMENT_TERM_FIELD);

            const isValidPaymentType = this.paymentTypeOption?.some(opt => opt.value === fetchedPaymentType);
            this.paymentTypeValue = isValidPaymentType ? fetchedPaymentType : '';

            // const isValidOrganization = this.organizationOption?.some(opt => opt.value === fetchedOrganization);
            // this.organizationValue = isValidOrganization ? fetchedOrganization : '';

            const isValidPaymentTerm = this.paymentTermOption?.find(opt => opt.label === fetchedPaymentTerm);
            console.log('isValidPaymentTerm: ' + JSON.stringify(isValidPaymentTerm , null ,2));

            if (isValidPaymentTerm) {
                this.paymentTermValue = isValidPaymentTerm.value; // ถ้าตรงกับ label ให้ใช้ค่า value
            } else {
                // ถ้าไม่ match label, ลองเช็คว่า fetchedPaymentTerm เป็น value ที่มีใน options อยู่แล้ว
                const isValidPaymentTermValue = this.paymentTermOption?.some(opt => opt.value === fetchedPaymentTerm);
                this.paymentTermValue = isValidPaymentTermValue ? fetchedPaymentTerm : '';
            }

            console.log('fetch payment term : ' + fetchedPaymentTerm );
            // this.paymentTermValue = isValidPaymentTerm ? fetchedPaymentTerm : '';
            this.paymentTermValue = fetchedPaymentTerm ;

            console.log('📌 paymentTermValue (after retry): ' + JSON.stringify(this.paymentTermValue, null, 2));
        } else {
            console.log(error);
        }
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


    @wire(fetchDataShipto, { accountId: '$accountId' })
    wiredFetchDataShipto({ error, data }) {
        if (data) {
            this.shipto = data;
            this.shiptoOptions = data.map(ship => ({
                label: ship.Name,
                value: ship.Name
            }));

            if(this.shiptoOptions.length > 0) {
                this.shipto = this.shiptoOptions[0].value ;
            } else {
                this.shipto = '' ;
            }

            console.log('ShipTo Options:', JSON.stringify(this.shiptoOptions , null ,2));
        } else if (error) {
            console.error('Error fetching ShipTo:', error);
        }
    }


    @wire(fetchDataBillto, { accountId: '$accountId' }) 
    fetchBillTo({ error, data }) {
        if (data) {
            this.billto = data;
            console.log('billto:' + JSON.stringify(this.billto , null ,2));
             this.billtoOptions = data.map(bill => ({
                label: bill.Name,
                value: bill.Name
            }));

            if(this.billtoOptions.length > 0) {
                this.billto = this.billtoOptions[0].value ;
            } else {
                this.billto = '' ;
            }

            // // เอาเฉพาะ Name แล้ว join เป็น string
            // this.billto = this.billto.map(billto => billto.Name).join(', ');

            console.log('Bill to:', this.billto);
        } else if (error) {
            console.error('Error Bill to', error);
        }
    }


        //fetch Customer
    @wire(fetchCustomersByGenerate, { accountId: '$accountId' })
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data;

           
            const customerCode = this.accounts.map(code => code.INID_Customer_Code__c);
            const name = this.accounts.map(name => name.Name) ;
            const organization = this.accounts.map(organize => organize.INID_Organization__c);
            console.log('organization:', JSON.stringify(organization, null, 2));

            this.searchTerm = customerCode + ' ' + name ;
            this.organizationValue = organization.join(', ')
           

            console.log('accounts data :' + JSON.stringify(this.accounts , null ,2)) ;
        } else if (error) {
            console.error('Error fetching Customer:', error);
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
                    name: productItem.INID_Product_Price_Book__r.Name ,
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

     @wire(fetchAccountAddressDetail , {accountId: '$accountId' , billtoName: '$billto'})
        wiredAccountAddressDetail({ error, data }) {
            if (data) {
                this.accountAddressDetailData = data;
                console.log('Account Billto Detail: ' + JSON.stringify(this.accountAddressDetailData, null, 2));
    
                this.addressBillto2 = data.map(item => item.INID_Address2__c).join(', ');
                this.provinceBillto = data.map(item => item.INID_Province__c).join(', ');
                this.cityBillto = data.map(item => item.INID_City__c).join(', ');
                this.zipCodeBillto = data.map(item => item.INID_ZIP_Code__c).join(', ');
                this.streetBillto = data.map(address => address.INID_Street__c).join(', ');
                this.billToCode = data.map(address => address.INID_Bill_To_Code__c).join(', ');
    
                console.log('addressBillTo2:', this.addressBillto2);
                console.log('provinceBillto:', this.provinceBillto);
                console.log('cityBillto:', this.cityBillto);
                console.log('zipCodeBillto:', this.zipCodeBillto); // ✅ ตรงนี้แก้แล้ว
                console.log('billtoCode:', this.billToCode);
            } else if (error) {
                console.error('❌ Error fetching account address detail:', error);
            }
    }
        
    @wire(fetchAccountAddressDetailShipTo, { accountId: '$accountId', shiptoName: '$shipto' })
    wiredAccountAddressDetailShipTo({ error, data }) {
    if (data) {
            this.accountAddressDetailShipToData = data;
            console.log('Account Detail Ship To (raw data):', JSON.stringify(this.accountAddressDetailShipToData , null, 2));

            this.addressShipto2 = data.map(address => address.INID_Address2__c).join(', ');
            this.provinceShipto = data.map(address => address.INID_Province__c).join(', ');
            this.cityShipto = data.map(address => address.INID_City__c).join(', ');
            this.streetShipto = data.map(address => address. INID_Street__c).join(', ');
            this.zipCodeShipto = data.map(address => address.INID_ZIP_Code__c).join(', ');
            this.shipToCode = data.map(address => address.INID_Ship_To_Code__c).join(', ');
            
            console.log('AddressShipto2:', this.addressShipto2);
            console.log('ProvinceShipto:', this.provinceShipto);
            console.log('CityShipto:', this.cityShipto);
            console.log('streetShipto:', this.streetShipto);
            console.log('ZipCodeShipto:', this.zipCodeShipto);

        } else if (error) {
            console.error('❌ Error fetching AccountAddressDetailShipTo:', error);
        }
     }

    // @wire(IsConsoleNavigation) isConsoleNavigation;
    // async closeTab() {
    //     if (!this.isConsoleNavigation) {
    //         return;
    //     }
    //     const { tabId } = await getFocusedTabInfo();
    //     await closeTab(tabId);

    //     // try {
    //     //     this[NavigationMixin.Navigate]({
    //     //         type: 'standard__recordPage',
    //     //         attributes: {
    //     //             // recordId: this.orderId,
    //     //             objectApiName: 'Order',
    //     //             actionName: 'list'
    //     //         }
    //     //     },true);

    //     //     if (this.isConsoleNavigation?.data === true) {
    //     //         const { tabId } = await getFocusedTabInfo();
    //     //         setTimeout(async () => {
    //     //             await closeTab(tabId);
    //     //         }, 1000);
    //     //     }
    //     // } catch (err) {
    //     //     console.error('handleSaveSuccess error:', err);
    //     // }
    // }

    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    handleBack() {
        this.isShowSummaryProduct = false ;
        this.isShowOrder = true ;
    }


    handleChangeRadioButton1(event) {
        const isChecked = event.target.checked;
        this.raidoExclude = isChecked;
        this.raidoInclude = !isChecked;
    }

    handleChangeRadioButton2(event) {
        const isChecked = event.target.checked;
        this.raidoInclude = isChecked;
        this.raidoExclude = !isChecked; 
    }

    handleShiptoChange(event) {
        this.shipto = event.detail.value ;
    }


    billtoHandleChange(event) {
        this.billto = event.target.value;
    }

    purchaseOrderNumberHandleChange(event) {
        this.purchaseOrderNumber = event.detail.value;
    }

    noteAgentHandleChange(event) {
        this.noteAgent = event.detail.value ;
    }

    noteInternalHandleChange(event) {
        this.noteInternal = event.detail.value;
    }
    
    
    // insert order
    async insertOrderDetailFunction() {
        const orderDetail = {
            AccountId: this.accountId,
            Status: 'Draft',
            INID_Status__c: 'Draft' ,
            EffectiveDate: new Date().toISOString(),
            Type: 'Sales Order' , 
            INID_PurchaseOrderNumber__c: this.purchaseOrderNumber,
            INID_Organization__c: this.organizationValue,
            INID_PaymentType__c: this.paymentTypeValue,
            INID_PaymentTerm__c: this.paymentTermValue,
            INID_NoteAgent__c : this.noteAgent ,   
            INID_ExcVAT__c: this.raidoExclude,
            INID_IncVAT__c: this.raidoInclude,
            INID_PostCode_Billto__c:  this.zipCodeBillto,
            INID_PostCode_Shipto__c: this.zipCodeShipto,
            INID_Street_Billto__c: this.streetBillto, 
            INID_Street_Shipto__c: this.streetShipto, 
            INID_City_Billto__c: this.cityBillto,
            INID_City_Shipto__c: this.cityShipto,
            INID_Province_Billto__c: this.provinceBillto , 
            INID_Province_Shipto__c: this.provinceShipto ,
            INID_Address_Billto__c: this.billto,	
            INID_Address_Shipto__c: this.shipto ,
            INID_Address_Billto2__c: this.addressBillto2 ,
            INID_Address_Shipto2__c: this.addressShipto2 ,
            INID_NetAmount__c: this.totalSummaryAmount ,
            INID_Bill_To_Code__c: this.billToCode,
            INID_Ship_To_Code__c: this.shipToCode,
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
            await insertOrderItem({ orderList: orderItemList });
            this.handleSaveSuccess();

            if (this.orderId) {
                this.handleNavToOrderPage();
            } else {
                console.error('orderId is missing, cannot navigate to Order page.');
            }
            
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

    handleNext() {
        this.isShowSummaryProduct = true;
        this.isShowOrder = false;

        // รวม total ทั้งหมดจาก summaryProducts
        if (this.summaryProducts && this.summaryProducts.length > 0) {
            this.totalSummaryAmount = this.summaryProducts.reduce((sum, item) => {
                return sum + (item.total || 0);
            }, 0);
        } else {
            this.totalSummaryAmount = 0;
        }

        console.log('รวม Total ทั้งหมด:', this.totalSummaryAmount);
    }

}