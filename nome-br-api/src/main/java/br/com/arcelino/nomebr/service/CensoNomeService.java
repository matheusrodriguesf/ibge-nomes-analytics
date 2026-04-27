package br.com.arcelino.nomebr.service;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.arcelino.nomebr.client.ibge.censo.CensoIbgeNomeClient;
import br.com.arcelino.nomebr.model.censo.ResultadoNomeFrequencia;
import br.com.arcelino.nomebr.model.censo.ResultadoRanking;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class CensoNomeService {

    CensoIbgeNomeClient censoIbgeNomeClient;

    public List<ResultadoRanking> getRankingNome() {
        log.info("Buscando ranking de nomes no Censo IBGE");
        return censoIbgeNomeClient.getRankingNome();
    }

    public List<ResultadoNomeFrequencia> getFrequenciaNome(String nome, String sexo, Integer localidade) {
        log.info("Buscando frequência do nome '{}' com sexo '{}' e localidade '{}' no Censo IBGE", nome, sexo,
                localidade);
        return censoIbgeNomeClient.getFrequenciaNome(nome, sexo, localidade);
    }
}