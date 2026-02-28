package com.factus.factus_system.core.interfaces;


import java.util.Map;

public interface ICreditNoteService {
    Map<String, Object> createCreditNote(Map<String, Object> data);
    Map<String, Object> listCreditNotes(Map<String, String> filters);
    Map<String, Object> getCreditNote(String number);
    byte[] downloadPdf(String number);
    byte[] downloadXml(String number);
    Map<String, Object> getEmailContent(String number);
    Map<String, Object> sendEmail(String number);
    Map<String, Object> deleteCreditNote(String number);
}