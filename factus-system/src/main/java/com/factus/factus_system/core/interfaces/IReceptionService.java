package com.factus.factus_system.core.interfaces;


import java.util.Map;

public interface IReceptionService {
    Map<String, Object> uploadInvoice(Map<String, Object> data);
    Map<String, Object> listReceivedInvoices(Map<String, String> filters);
    Map<String, Object> emitEvent(Map<String, Object> data);
}