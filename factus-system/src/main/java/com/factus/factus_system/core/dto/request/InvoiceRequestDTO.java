package com.factus.factus_system.core.dto.request;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class InvoiceRequestDTO {

    @NotNull(message = "El rango de numeración es obligatorio")
    private Integer numberingRangeId;

    @NotBlank(message = "El código de referencia es obligatorio")
    private String referenceCode;

    private String observation;

    @NotBlank(message = "El método de pago es obligatorio")
    private String paymentMethodCode;

    @Valid
    @NotNull(message = "El cliente es obligatorio")
    private CustomerDTO customer;

    @Valid
    @NotNull(message = "Los items son obligatorios")
    private List<ItemDTO> items;
}