package br.com.arcelino.nomebr.controller;

import br.com.arcelino.nomebr.model.localidade.DistritoResumo;
import br.com.arcelino.nomebr.model.localidade.EstadoResumo;
import br.com.arcelino.nomebr.service.LocalidadeEstadoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


class LocalidadeEstadoControllerTest {

    @Mock
    LocalidadeEstadoService localidadeEstadoService;

    @InjectMocks
    LocalidadeEstadoController localidadeEstadoController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllEstados() {
        var estado1 = mock(EstadoResumo.class);
        var estado2 = mock(EstadoResumo.class);
        var mockEstados = Arrays.asList(estado1, estado2);
        when(localidadeEstadoService.getEstados()).thenReturn(mockEstados);
        var response = localidadeEstadoController.getAllEstados();
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockEstados, response.getBody());
        verify(localidadeEstadoService).getEstados();
    }

    @Test
    void testGetDistritosByEstado() {
        var distrito1 = mock(DistritoResumo.class);
        var distrito2 = mock(DistritoResumo.class);
        var mockDistritos = Arrays.asList(distrito1, distrito2);
        when(localidadeEstadoService.getDistritosByEstado(1)).thenReturn(mockDistritos);
        var response = localidadeEstadoController.getDistritosByEstado(1);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockDistritos, response.getBody());
        verify(localidadeEstadoService).getDistritosByEstado(1);
    }
}
