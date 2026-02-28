package com.factus.factus_system.core.interfaces;

import java.util.Map;

public interface ICompanyService {
    Map<String, Object> getCompany();
    Map<String, Object> updateCompany(Map<String, Object> data);
    Map<String, Object> updateLogo(byte[] logo);
}