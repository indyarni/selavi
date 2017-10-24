package de.filiadata.datahub.activedirectory.business;

import de.filiadata.datahub.activedirectory.domain.Person;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ldap.core.AttributesMapper;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.query.LdapQuery;

import javax.naming.directory.Attributes;
import javax.naming.directory.BasicAttributes;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

public class ActiveDirectoryServiceUnitTest {


    private LdapTemplate ldapTemplate = mock(LdapTemplate.class);

    @Test
    public void getAllPersonNames() throws Exception {
        ActiveDirectoryService activeDirectoryService = new ActiveDirectoryService(ldapTemplate);
        activeDirectoryService.findPersonsByName("Alt, foo");

        ArgumentCaptor<LdapQuery> queryArgumentCaptor = ArgumentCaptor.forClass(LdapQuery.class);
        ArgumentCaptor<AttributesMapper> mapperArgumentCaptor = ArgumentCaptor.forClass(AttributesMapper.class);

        verify(ldapTemplate).search(queryArgumentCaptor.capture(), mapperArgumentCaptor.capture());

        assertThat(queryArgumentCaptor.getValue().filter().toString(),
                is("(&(objectclass=user)(!(objectclass=computer))(sAMAccountName=*)(!(sAMAccountName=*Admin*))(mail=*)(name=*Alt,*foo*))"));

        Attributes attributes = new BasicAttributes();
        attributes.put("sAMAccountName", "fbc");
        attributes.put("displayname", "Altmann, Erik");
        attributes.put("mail", "erik.altmann@dm.de");
        byte[] selfie = {};
        attributes.put("thumbnailphoto", selfie);

        Person person = (Person) mapperArgumentCaptor.getValue().mapFromAttributes(attributes);

        assertThat(person.getUid(), is("fbc"));
        assertThat(person.getDisplayName(), is("Altmann, Erik"));
        assertThat(person.getEMail(), is("erik.altmann@dm.de"));
        assertThat(person.getThumbnailPhoto(), is(selfie));
    }

}