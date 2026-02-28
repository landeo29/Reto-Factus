package com.factus.factus_system.core.interfaces;

import java.util.Map;

public interface ICustomerService {
    Map<String, Object> getCustomerData(String identification);
}