package br.com.arcelino.nomebr.service;



import br.com.arcelino.nomebr.client.ibge.censo.CensoIbgeNomeClient;
import br.com.arcelino.nomebr.model.censo.ResultadoNomeFrequencia;
import br.com.arcelino.nomebr.model.censo.ResultadoRanking;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

class CensoNomeServiceTest {

    @Mock
    CensoIbgeNomeClient censoIbgeNomeClient;

    @InjectMocks
    CensoNomeService censoNomeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetRankingNome() {
        List<ResultadoRanking> mockRanking = Collections.emptyList();
        when(censoIbgeNomeClient.getRankingNome("M", 1)).thenReturn(mockRanking);
        var result = censoNomeService.getRankingNome("M", 1);
        assertEquals(mockRanking, result);
        verify(censoIbgeNomeClient).getRankingNome("M", 1);
    }

    @Test
    void testGetFrequenciaNome() {
        List<ResultadoNomeFrequencia> mockFrequencia = Collections.emptyList();
        when(censoIbgeNomeClient.getFrequenciaNome("Joao", "M", 1)).thenReturn(mockFrequencia);
        var result = censoNomeService.getFrequenciaNome("Joao", "M", 1);
        assertEquals(mockFrequencia, result);
        verify(censoIbgeNomeClient).getFrequenciaNome("Joao", "M", 1);
    }
}
