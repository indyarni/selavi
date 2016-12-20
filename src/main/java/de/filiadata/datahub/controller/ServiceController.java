package de.filiadata.datahub.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import de.filiadata.datahub.business.ServicePropertiesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.Map;

@RestController
@RequestMapping("/services")
public class ServiceController {

    private ServicePropertiesService servicePropertiesService;

    @Autowired
    public ServiceController(ServicePropertiesService servicePropertiesService) {
        this.servicePropertiesService = servicePropertiesService;
    }

    @RequestMapping
    public Collection<ObjectNode> readAllServices() {
        return servicePropertiesService.getServicesWithContent();
    }

    @RequestMapping(method = RequestMethod.POST)
    public void addService(@RequestBody ObjectNode dto) {
        servicePropertiesService.createNewServiceInfo(dto);
    }

    /**
     * @deprecated, use {@link #addNewRelation(String, String)} instead
     */
    @RequestMapping(value = "/{serviceName}/relation", method = RequestMethod.PUT)
    public void addRelation(@PathVariable String serviceName, @RequestBody String relatedServiceName) {
        servicePropertiesService.addRelation(serviceName, relatedServiceName);
    }

    @RequestMapping(value = "/{serviceName}/relations/{relatedServiceName}", method = RequestMethod.PUT)
    public void addNewRelation(@PathVariable String serviceName, @PathVariable String relatedServiceName) {
        servicePropertiesService.addRelation(serviceName, relatedServiceName);
    }

    @RequestMapping(value = "/{serviceName}/relations/{relatedServiceName}", method = RequestMethod.DELETE)
    public void deleteRelation(@PathVariable String serviceName, @PathVariable String relatedServiceName) {
        servicePropertiesService.deleteRelation(serviceName, relatedServiceName);
    }

    @RequestMapping(value = "/{serviceName}/properties", method = RequestMethod.PUT)
    public void addProperty(@PathVariable String serviceName, @RequestBody Map<String, String> properties) {
        servicePropertiesService.addProperties(serviceName, properties);
    }

    @RequestMapping(value = "/{serviceName}/properties/{propertyName}", method = RequestMethod.DELETE)
    public void deleteProperty(@PathVariable String serviceName, @PathVariable String propertyName) {
        servicePropertiesService.deleteProperty(serviceName, propertyName);
    }
}
