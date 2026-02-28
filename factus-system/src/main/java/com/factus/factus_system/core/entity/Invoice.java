package com.factus.factus_system.core.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    private int numberingRangeId;
    private String referenceCode;
    private String observation;
    private String paymentMethodCode;
    private Customer customer;
    private List<Item> items;
}