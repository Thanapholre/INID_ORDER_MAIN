import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import datatables from '@salesforce/resourceUrl/datatables';
import jquery from '@salesforce/resourceUrl/jquery';

export default class INID_Apply_Promotion extends LightningElement {

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
                    width: '150px' // Set width for the first column
                },
                {
                    targets: 1, // Second column
                    width: '500px' // Set width for the second column
                }
            ]
        });
    }
}
