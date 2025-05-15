public with sharing class TestAccount {
    @AuraEnabled(cacheable=true)
    public static List<Account> testFetchData() {
        return [SELECT Id , INID_Customer_Code__c, Name , Payment_type__c , Payment_term__c FROM Account WHERE Name = 'Auto Field Test'];
    }
}