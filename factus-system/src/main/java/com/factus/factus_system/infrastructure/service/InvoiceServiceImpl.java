package com.factus.factus_system.infrastructure.service;

import com.factus.factus_system.core.entity.Invoice;
import com.factus.factus_system.core.entity.Item;
import com.factus.factus_system.core.interfaces.IInvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements IInvoiceService {

    private final WebClient webClient;
    private final AuthServiceImpl authService;

    @Override
    public Map<String, Object> createInvoice(Invoice invoice) {
        log.info("Creando factura con referencia: {}", invoice.getReferenceCode());

        Map<String, Object> body = buildInvoiceBody(invoice);

        return webClient.post()
                .uri("/v1/bills/validate")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> getInvoice(String number) {
        log.info("Consultando factura: {}", number);

        return webClient.get()
                .uri("/v1/bills/show/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> listInvoices(Map<String, String> filters) {
        log.info("Listando facturas...");

        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/v1/bills");
                    if (filters != null) {
                        filters.forEach(uriBuilder::queryParam);
                    }
                    return uriBuilder.build();
                })
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public byte[] downloadPdf(String number) {
        log.info("Descargando PDF factura: {}", number);

        return webClient.get()
                .uri("/v1/bills/download-pdf/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    @Override
    public byte[] downloadXml(String number) {
        log.info("Descargando XML factura: {}", number);

        return webClient.get()
                .uri("/v1/bills/download-xml/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    @Override
    public Map<String, Object> getEmailContent(String number) {
        log.info("Obteniendo contenido email factura: {}", number);

        return webClient.get()
                .uri("/v1/bills/email-content/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> sendEmail(String number, String email) {
        log.info("Enviando email factura: {} a {}", number, email);

        Map<String, Object> body = Map.of("email", email);

        return webClient.post()
                .uri("/v1/bills/send-email/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> deleteInvoice(String number) {
        log.info("Eliminando factura: {}", number);

        return webClient.delete()
                .uri("/v1/bills/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private Map<String, Object> buildInvoiceBody(Invoice invoice) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("numbering_range_id", invoice.getNumberingRangeId());
        body.put("reference_code", invoice.getReferenceCode());
        body.put("observation", invoice.getObservation());
        body.put("payment_method_code", invoice.getPaymentMethodCode());

        Map<String, Object> customer = new LinkedHashMap<>();
        customer.put("identification", invoice.getCustomer().getIdentification());
        customer.put("dv", invoice.getCustomer().getDv());
        customer.put("company", invoice.getCustomer().getCompany());
        customer.put("trade_name", invoice.getCustomer().getTradeName());
        customer.put("names", invoice.getCustomer().getNames());
        customer.put("address", invoice.getCustomer().getAddress());
        customer.put("email", invoice.getCustomer().getEmail());
        customer.put("phone", invoice.getCustomer().getPhone());
        customer.put("legal_organization_id", invoice.getCustomer().getLegalOrganizationId());
        customer.put("tribute_id", invoice.getCustomer().getTributeId());
        customer.put("identification_document_id", invoice.getCustomer().getIdentificationDocumentId());
        customer.put("municipality_id", invoice.getCustomer().getMunicipalityId());
        body.put("customer", customer);

        List<Map<String, Object>> items = new ArrayList<>();
        for (Item item : invoice.getItems()) {
            Map<String, Object> itemMap = new LinkedHashMap<>();
            itemMap.put("code_reference", item.getCodeReference());
            itemMap.put("name", item.getName());
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("discount_rate", item.getDiscountRate());
            itemMap.put("price", item.getPrice());
            itemMap.put("tax_rate", item.getTaxRate());
            itemMap.put("unit_measure_id", item.getUnitMeasureId());
            itemMap.put("standard_code_id", item.getStandardCodeId());
            itemMap.put("is_excluded", item.getIsExcluded());
            itemMap.put("tribute_id", item.getTributeId());
            items.add(itemMap);
        }
        body.put("items", items);

        return body;
    }
}