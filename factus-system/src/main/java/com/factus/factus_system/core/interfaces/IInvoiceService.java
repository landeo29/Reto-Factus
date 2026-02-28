package com.factus.factus_system.core.interfaces;

import com.factus.factus_system.core.entity.Invoice;

import java.util.Map;

public interface IInvoiceService {
    Map<String, Object> createInvoice(Invoice invoice);
    Map<String, Object> getInvoice(String number);
    Map<String, Object> listInvoices(Map<String, String> filters);
    byte[] downloadPdf(String number);
    byte[] downloadXml(String number);
    Map<String, Object> getEmailContent(String number);
    Map<String, Object> sendEmail(String number, String email);
    Map<String, Object> deleteInvoice(String number);
}