package com.factus.factus_system.core.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ItemDTO {

    @NotBlank(message = "El código de referencia es obligatorio")
    private String codeReference;

    @NotBlank(message = "El nombre del producto es obligatorio")
    private String name;

    @Min(value = 1, message = "La cantidad mínima es 1")
    private int quantity;

    private double discountRate;

    @NotNull(message = "El precio es obligatorio")
    @Min(value = 0, message = "El precio no puede ser negativo")
    private Double price;

    @NotBlank(message = "La tasa de impuesto es obligatoria")
    private String taxRate;

    @NotNull(message = "La unidad de medida es obligatoria")
    private Integer unitMeasureId;

    @NotNull(message = "El código estándar es obligatorio")
    private Integer standardCodeId;

    private int isExcluded;

    @NotNull(message = "El tributo es obligatorio")
    private Integer tributeId;
}