import { LightningElement, track } from 'lwc';

export default class INID_Ordertest extends LightningElement {

       

    @track billto = '';
    @track shipto = '';
    @track purchaseOrderNumber = '';
    @track noteAgent = '';
    @track noteInternal = '';
    
    @track organizationValue = '';
    @track paymentTypeValue = '';
    @track paymentTermValue = '';


    @track searchTerm = ''; //เก็บข้อความที่กรอกใน input
    @track selectedCustomerId = ''; //ID ของลูกค้าที่เลือก
    @track customerSelected = ''; //เก็บชื่อของลูกค้าที่เลือก
    @track showDropdown = false; //บอกว่า dropdown แสดงหรือไม่
    @track filteredCustomerOptions = [];//กรองแล้วรายการค้นหาแล้วเก็บไว้ใน filteredCustomerOptions



    checkboxLabel1 = 'Include VAT';
    checkboxLabel2 = 'Exclude VAT';


    handleChange(event) {
        const selected = event.target.value;
        const isChecked = event.target.checked;

        if (isChecked) {
            this.value = [...this.value, selected];
        } else {
            this.value = this.value.filter(val => val !== selected);
        }

        console.log(event.target.value);
    }

    customers = [
        { Id: '1000002', Name: 'โรงพยาบาลกลาง' },
        { Id: '1000036', Name: 'บริษัท เดอะซีนเนียร์ เฮลท์แคร์ จำกัด' },
        { Id: '1000100', Name: 'บริษัท โรงพยาบาลมิชชั่น จำกัด' },
    ];

    handleInput(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length > 2) {
            this.filteredCustomerOptions = this.customers.filter(cust =>
                cust.Name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                cust.Id.includes(this.searchTerm)
            );
            this.showDropdown = true;
        } else {
            this.showDropdown = false;
        }
    }

    //จะเรียกใช้เมื่อมีการคลิกที่รายการใน dropdown
    //จะทำการเก็บ id และ name ของลูกค้าที่เลือกไว้ใน selectedCustomerId และ customerSelected
    handleSelectCustomer(event) {
        const id = event.currentTarget.dataset.id;
        const name = event.currentTarget.dataset.name;
        this.searchTerm = `${id} ${name}`;
        this.selectedCustomerId = id;
        this.showDropdown = false;
    }

    handleBlur() {
        setTimeout(() => {
            this.showDropdown = false;
        }, 200);
    }
    

    // get method option of Organization Combobox
    get organizationOption() {
        return [
            { value: '1001', label: '1001-MEDLINE' },
            { value: '2001', label: '2001-UNISON' },
            { value: '3001', label: '3001-F.C.P.' }
        ];
    }

    // organization handle
    organizationHandleChange(event) {
        this.organizationValue = event.detail.value;
    }

    // get method option of payment type
    get paymentTypeOption() {
        return [
            { value: '1', label: 'Cash' },
            { value: '2', label: 'Credit' }
        ];
    }

    // payment type handle
    paymentTypeHandleChange(event) {
        this.paymentTypeValue = event.detail.value;
    }

    // get method option of payment term
    get paymentTermOption() {
        return [
            { value: 'N000', label: 'N000-Immediately' },
            { value: 'N030', label: 'N030-Within 30 Days Due Net' },
            { value: 'N045', label: 'N045-Within 45 Days Due Net' }
        ];
    }

    // payment term handle
    paymentTermHandleChange(event) {
        this.paymentTermValue = event.detail.value;
    }

    // get method option of check box
    @track value = [];
    
    get options() {
        return [
            { value: '1' , label: 'Include VAT' },
            { value: '2' , label: 'Exclude VAT'}  
        ]
    } 

    handleKeyUp(evt) {
        const isEnterKey = evt.keyCode === 13;
        if (isEnterKey) {
            this.customers = evt.target.value;
        }
    } 

    

    
   
}
