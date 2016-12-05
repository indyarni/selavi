package de.filiadata.datahub.business;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.filiadata.datahub.repository.MicroserviceRepository;
import de.filiadata.datahub.repository.ServicePropertiesRepository;
import org.hamcrest.MatcherAssert;
import org.junit.Test;
import org.mockito.Mockito;

import java.util.Collection;
import java.util.HashMap;

import static org.hamcrest.core.Is.is;

public class ServicePropertiesServiceUnitTest {

    private final MicroserviceRepository microserviceRepository = Mockito.mock(MicroserviceRepository.class);
    private final ServicePropertiesRepository servicePropertiesRepository = Mockito.mock(ServicePropertiesRepository.class);
    private final DefaultNodeContentFactory defaultNodeContentFactory = Mockito.mock(DefaultNodeContentFactory.class);
    private final ServicePropertiesHandlerService servicePropertiesHandlerService = Mockito.mock(ServicePropertiesHandlerService.class);
    private final ServicePropertiesService service = new ServicePropertiesService(microserviceRepository,
            servicePropertiesRepository,
            defaultNodeContentFactory,
            servicePropertiesHandlerService);

    @Test
    public void shouldMergeNothinigIfNoDBContentIsAvailable() throws Exception {

        // given
        final HashMap<String, ObjectNode> microservicesMap = new HashMap<>();
        microservicesMap.put("customerconsent", createObjectNode("customerconsent", "https://services-dev.intern.dm-drogeriemarkt.com/customerconsent"));
        microservicesMap.put("kcb-assets", createObjectNode("kcb-assets", "https://services-dev.intern.dm-drogeriemarkt.com/kcb-assets"));
        microservicesMap.put("pir-gui", createObjectNode("pir-gui", "https://services-dev.intern.dm-drogeriemarkt.com/pir-gui"));

        Mockito.when(microserviceRepository.findAllServices()).thenReturn(microservicesMap);

        // when
        Collection<ObjectNode> serviceInfo = service.getServicesWithContent();

        // then
        MatcherAssert.assertThat(serviceInfo.size(), is(3));
    }

    private ObjectNode createObjectNode(String serviceName, String url) {
        ObjectNode objectNode = new ObjectMapper().createObjectNode();
        objectNode.put("id", serviceName);
        objectNode.put("label", serviceName);
        objectNode.put("microservice-url", url);
        return objectNode;
    }
}