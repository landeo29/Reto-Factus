package com.factus.factus_system.core.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CustomerDTO {

    @NotBlank(message = "La identificación es obligatoria")
    private String identification;

    private String dv;
    private String company;
    private String tradeName;

    @NotBlank(message = "El nombre es obligatorio")
    private String names;

    @NotBlank(message = "La dirección es obligatoria")
    private String address;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    private String phone;

    @NotNull(message = "El tipo de organización es obligatorio")
    private String legalOrganizationId;

    @NotNull(message = "El tributo es obligatorio")
    private String tributeId;

    @NotNull(message = "El tipo de documento es obligatorio")
    private Integer identificationDocumentId;

    @NotNull(message = "El municipio es obligatorio")
    private String municipalityId;
}