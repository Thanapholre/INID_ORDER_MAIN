public with sharing class TestAccount {
    @AuraEnabled(cacheable=true)
    public static List<Account> testFetchData() {
<<<<<<< HEAD
        return [SELECT Id , INID_Customer_Code__c, Name , Payment_type__c , Payment_term__c FROM Account WHERE Name = 'Auto Field Test'];
=======
        return [SELECT INID_Customer_Code__c , Name FROM Account];
>>>>>>> 129a21240fd2753e3a579c8b66e463b1ed5168d2
    }
}