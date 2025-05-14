public with sharing class TestAccount {
    @AuraEnabled(cacheable=true)
    public static List<Account> testFetchData() {
        return [SELECT AccountNumber, Name FROM Account LIMIT 10];
    }
}