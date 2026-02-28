package com.factus.factus_system.core.interfaces;

import java.util.List;
import java.util.Map;

public interface ICatalogService {
    List<Map<String, Object>> getNumeringRanges();
    Map<String, Object> getNumeringRange(int id);
    Map<String, Object> createNumeringRange(Map<String, Object> data);
    Map<String, Object> deleteNumeringRange(int id);
    Map<String, Object> updateConsecutive(int id, Map<String, Object> data);
    List<Map<String, Object>> getMunicipalities();
    List<Map<String, Object>> getTributes();
    List<Map<String, Object>> getUnitMeasures();
    List<Map<String, Object>> getCountries();
    List<Map<String, Object>> getReferenceTables();
}