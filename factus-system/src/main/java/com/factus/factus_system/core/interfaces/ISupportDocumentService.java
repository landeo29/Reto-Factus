package com.factus.factus_system.core.interfaces;

import java.util.Map;

public interface ISupportDocumentService {
    Map<String, Object> createSupportDocument(Map<String, Object> data);
    Map<String, Object> listSupportDocuments(Map<String, String> filters);
    Map<String, Object> getSupportDocument(String number);
    byte[] downloadPdf(String number);
    byte[] downloadXml(String number);
    Map<String, Object> deleteSupportDocument(String number);
}