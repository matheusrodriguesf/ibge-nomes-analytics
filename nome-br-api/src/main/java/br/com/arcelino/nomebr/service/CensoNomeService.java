package br.com.arcelino.nomebr.service;

import java.util.List;
import org.springframework.stereotype.Service;

import br.com.arcelino.nomebr.client.CensoIbgeNomeClient;
import br.com.arcelino.nomebr.model.ResultadoNomeFrequencia;
import br.com.arcelino.nomebr.model.ResultadoRanking;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CensoNomeService {

    CensoIbgeNomeClient censoIbgeNomeClient;

    public List<ResultadoRanking> getRankingNome() {
        return censoIbgeNomeClient.getRankingNome();
    }

    public List<ResultadoNomeFrequencia> getFrequenciaNome(String nome) {
        return censoIbgeNomeClient.getFrequenciaNome(nome);
    }
}