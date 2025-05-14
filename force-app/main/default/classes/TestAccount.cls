public with sharing class TestAccount {
    @AuraEnabled(cacheable=true)
    public static List<Account> testFetchData() {
        return [SELECT INID_Customer_Code__c , Name FROM Account];
    }
}