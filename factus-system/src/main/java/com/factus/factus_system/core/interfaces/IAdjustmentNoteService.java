package com.factus.factus_system.core.interfaces;

import java.util.Map;

public interface IAdjustmentNoteService {
    Map<String, Object> createAdjustmentNote(Map<String, Object> data);
    Map<String, Object> listAdjustmentNotes(Map<String, String> filters);
    Map<String, Object> getAdjustmentNote(String number);
    byte[] downloadPdf(String number);
    byte[] downloadXml(String number);
    Map<String, Object> deleteAdjustmentNote(String number);
}