package br.com.arcelino.nomebr.controller;

import br.com.arcelino.nomebr.model.censo.ResultadoNomeFrequencia;
import br.com.arcelino.nomebr.model.censo.ResultadoRanking;
import br.com.arcelino.nomebr.service.CensoNomeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CensoNomeControllerTest {

    @Mock
    CensoNomeService censoNomeService;

    @InjectMocks
    CensoNomeController censoNomeController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetRankingNome() {
        List<ResultadoRanking> mockRanking = Collections.emptyList();
        when(censoNomeService.getRankingNome("M", 1)).thenReturn(mockRanking);
        var response = censoNomeController.getRankingNome("M", 1);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockRanking, response.getBody());
        verify(censoNomeService).getRankingNome("M", 1);
    }

    @Test
    void testGetFrequenciaNome() {
        List<ResultadoNomeFrequencia> mockFrequencia = Collections.emptyList();
        when(censoNomeService.getFrequenciaNome("Joao", "M", 1)).thenReturn(mockFrequencia);
        var response = censoNomeController.getFrequenciaNome("Joao", "M", 1);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockFrequencia, response.getBody());
        verify(censoNomeService).getFrequenciaNome("Joao", "M", 1);
    }
}
