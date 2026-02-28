package com.factus.factus_system.core.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Item {
    private String codeReference;
    private String name;
    private int quantity;
    private double discountRate;
    private double price;
    private String taxRate;
    private int unitMeasureId;
    private int standardCodeId;
    private int isExcluded;
    private int tributeId;
}