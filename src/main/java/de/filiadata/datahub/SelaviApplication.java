package de.filiadata.datahub;

import com.google.common.cache.CacheBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.guava.GuavaCacheManager;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.ldap.core.ContextSource;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.web.client.RestTemplate;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.concurrent.TimeUnit;

@SpringBootApplication
@EnableCaching
@EnableSwagger2
@EnableDiscoveryClient
public class SelaviApplication extends SpringBootServletInitializer {

    @Value("${cache.expireAfterWriteInMinutes}")
    private Integer expireAfterWriteInMinutes;

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(SelaviApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(SelaviApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

    @Bean
    public CacheManager cacheManager() {
        final CacheBuilder<Object, Object> cacheBuilder = CacheBuilder.newBuilder().expireAfterWrite(expireAfterWriteInMinutes, TimeUnit.MINUTES);
        final GuavaCacheManager guavaCacheManager = new GuavaCacheManager();
        guavaCacheManager.setAllowNullValues(false);
        guavaCacheManager.setCacheBuilder(cacheBuilder);

        return guavaCacheManager;
    }

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.basePackage("de.filiadata.datahub"))
                .paths(PathSelectors.any())
                .build()
                .pathMapping("/");
    }
// Dn: cn=DE-ServiceUser\, Selavi-AD - D0A02843,ou=ServiceUsers,ou=Users,ou=DE,ou=dm,dc=dm,dc=int; Username: D0A02843; Password: [PROTECTED]
    @Bean
    public ContextSource ldapContextSource() {
        // TODO: 29.03.17 configure
        LdapContextSource ldapContextSource = new LdapContextSource();
        ldapContextSource.setUrl("ldaps://kaspiaddc0011.dm.int:636");
        ldapContextSource.setUserDn("cn=DE-ServiceUser\\, Selavi-AD - D0A02843,ou=ServiceUsers,ou=Users,ou=DE,ou=dm,dc=dm,dc=int");
        ldapContextSource.setPassword("insert_ablaufuser_password_here");
        ldapContextSource.setBase("dc=dm,dc=int");
        return ldapContextSource;
    }

    @Bean
    public LdapTemplate ldapTemplate(ContextSource contextSource) {
        return new LdapTemplate(contextSource);
    }
}
