package br.com.arcelino.nomebr.service;



import br.com.arcelino.nomebr.client.ibge.localidade.LocalidadeIbgeClient;
import br.com.arcelino.nomebr.model.localidade.DistritoResumo;
import br.com.arcelino.nomebr.model.localidade.EstadoResumo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;

class LocalidadeEstadoServiceTest {

    @Mock
    LocalidadeIbgeClient localidadeIbgeClient;

    @InjectMocks
    LocalidadeEstadoService localidadeEstadoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetEstados() {
        var estado1 = mock(EstadoResumo.class);
        when(estado1.nome()).thenReturn("Acre");
        var estado2 = mock(EstadoResumo.class);
        when(estado2.nome()).thenReturn("Bahia");
        var mockEstados = Arrays.asList(estado2, estado1);
        when(localidadeIbgeClient.getEstados()).thenReturn(mockEstados);
        var result = localidadeEstadoService.getEstados();
        assertEquals(2, result.size());
        assertEquals("Acre", result.get(0).nome());
        assertEquals("Bahia", result.get(1).nome());
        verify(localidadeIbgeClient).getEstados();
    }

    @Test
    void testGetDistritosByEstado() {
        var distrito1 = mock(DistritoResumo.class);
        when(distrito1.nome()).thenReturn("Centro");
        var distrito2 = mock(DistritoResumo.class);
        when(distrito2.nome()).thenReturn("Alvorada");
        var mockDistritos = Arrays.asList(distrito1, distrito2);
        when(localidadeIbgeClient.getDistritosByEstado(1)).thenReturn(mockDistritos);
        var result = localidadeEstadoService.getDistritosByEstado(1);
        assertEquals(2, result.size());
        assertEquals("Alvorada", result.get(0).nome());
        assertEquals("Centro", result.get(1).nome());
        verify(localidadeIbgeClient).getDistritosByEstado(1);
    }
}
