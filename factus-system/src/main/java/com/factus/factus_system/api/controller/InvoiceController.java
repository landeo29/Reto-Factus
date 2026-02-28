package com.factus.factus_system.api.controller;

import com.factus.factus_system.core.dto.request.InvoiceRequestDTO;
import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.Customer;
import com.factus.factus_system.core.entity.Invoice;
import com.factus.factus_system.core.entity.Item;
import com.factus.factus_system.core.interfaces.IInvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final IInvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> create(
            @Valid @RequestBody InvoiceRequestDTO request) {

        Invoice invoice = mapToInvoice(request);
        Map<String, Object> result = invoiceService.createInvoice(invoice);
        return ResponseEntity.ok(ApiResponseDTO.ok("Factura creada exitosamente", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> list(
            @RequestParam(required = false) Map<String, String> filters) {

        Map<String, Object> result = invoiceService.listInvoices(filters);
        return ResponseEntity.ok(ApiResponseDTO.ok("Facturas listadas", result));
    }

    @GetMapping("/{number}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getByNumber(
            @PathVariable String number) {

        Map<String, Object> result = invoiceService.getInvoice(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Factura encontrada", result));
    }

    @GetMapping("/{number}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String number) {

        byte[] pdf = invoiceService.downloadPdf(number);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=factura-" + number + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{number}/xml")
    public ResponseEntity<byte[]> downloadXml(@PathVariable String number) {

        byte[] xml = invoiceService.downloadXml(number);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=factura-" + number + ".xml")
                .contentType(MediaType.APPLICATION_XML)
                .body(xml);
    }

    @GetMapping("/{number}/email-content")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getEmailContent(
            @PathVariable String number) {

        Map<String, Object> result = invoiceService.getEmailContent(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Contenido email obtenido", result));
    }

    @PostMapping("/{number}/send-email")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> sendEmail(
            @PathVariable String number,
            @RequestParam String email) {

        Map<String, Object> result = invoiceService.sendEmail(number, email);
        return ResponseEntity.ok(ApiResponseDTO.ok("Email enviado", result));
    }

    @DeleteMapping("/{number}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> delete(
            @PathVariable String number) {

        Map<String, Object> result = invoiceService.deleteInvoice(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Factura eliminada", result));
    }

    private Invoice mapToInvoice(InvoiceRequestDTO dto) {
        Customer customer = Customer.builder()
                .identification(dto.getCustomer().getIdentification())
                .dv(dto.getCustomer().getDv())
                .company(dto.getCustomer().getCompany())
                .tradeName(dto.getCustomer().getTradeName())
                .names(dto.getCustomer().getNames())
                .address(dto.getCustomer().getAddress())
                .email(dto.getCustomer().getEmail())
                .phone(dto.getCustomer().getPhone())
                .legalOrganizationId(dto.getCustomer().getLegalOrganizationId())
                .tributeId(dto.getCustomer().getTributeId())
                .identificationDocumentId(dto.getCustomer().getIdentificationDocumentId())
                .municipalityId(dto.getCustomer().getMunicipalityId())
                .build();

        List<Item> items = dto.getItems().stream()
                .map(itemDto -> Item.builder()
                        .codeReference(itemDto.getCodeReference())
                        .name(itemDto.getName())
                        .quantity(itemDto.getQuantity())
                        .discountRate(itemDto.getDiscountRate())
                        .price(itemDto.getPrice())
                        .taxRate(itemDto.getTaxRate())
                        .unitMeasureId(itemDto.getUnitMeasureId())
                        .standardCodeId(itemDto.getStandardCodeId())
                        .isExcluded(itemDto.getIsExcluded())
                        .tributeId(itemDto.getTributeId())
                        .build())
                .collect(Collectors.toList());

        return Invoice.builder()
                .numberingRangeId(dto.getNumberingRangeId())
                .referenceCode(dto.getReferenceCode())
                .observation(dto.getObservation())
                .paymentMethodCode(dto.getPaymentMethodCode())
                .customer(customer)
                .items(items)
                .build();
    }
}