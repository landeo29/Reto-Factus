package com.factus.factus_system.core.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    private String identification;
    private String dv;
    private String company;
    private String tradeName;
    private String names;
    private String address;
    private String email;
    private String phone;
    private String legalOrganizationId;
    private String tributeId;
    private int identificationDocumentId;
    private String municipalityId;
}