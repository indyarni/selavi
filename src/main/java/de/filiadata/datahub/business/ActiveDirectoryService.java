package de.filiadata.datahub.business;

import org.springframework.ldap.NamingException;
import org.springframework.ldap.core.AttributesMapper;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.stereotype.Service;

import javax.naming.directory.Attributes;
import java.util.List;

import static org.springframework.ldap.query.LdapQueryBuilder.query;

@Service
public class ActiveDirectoryService {

    private LdapTemplate ldapTemplate;

    public ActiveDirectoryService(LdapTemplate ldapTemplate) {
        this.ldapTemplate = ldapTemplate;
    }

    public List<String> getAllPersonNames() {
        String query = "altmann";

        return ldapTemplate.search(
                query().where("objectclass").is("person")
                        .and("uid").not().like("*Admin*")
                        .and(query().where("sn").like(query).or("givenName").like(query)),
                new AttributesMapper<String>() {
                    public String mapFromAttributes(Attributes attrs)
                            throws NamingException, javax.naming.NamingException {
                        return (String) attrs.get("cn").get();
                    }
                });
    }
}
