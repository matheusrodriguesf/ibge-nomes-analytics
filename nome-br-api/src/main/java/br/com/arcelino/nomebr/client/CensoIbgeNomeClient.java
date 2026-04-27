package br.com.arcelino.nomebr.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import br.com.arcelino.nomebr.model.ResultadoNomeFrequencia;
import br.com.arcelino.nomebr.model.ResultadoRanking;

@FeignClient(name = "censoIbge", url = "${ibge.api.url}")
public interface CensoIbgeNomeClient {

    @GetMapping("/censos/nomes/ranking")
    List<ResultadoRanking> getRankingNome();

    @GetMapping("/censos/nomes/{nome}")
    List<ResultadoNomeFrequencia> getFrequenciaNome(@PathVariable String nome,
            @RequestParam(required = false) String sexo);

}