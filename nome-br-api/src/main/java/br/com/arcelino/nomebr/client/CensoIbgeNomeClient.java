package br.com.arcelino.nomebr.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import br.com.arcelino.nomebr.model.ResultadoRanking;

@FeignClient(name = "censoIbge", url = "${ibge.api.url}")
public interface CensoIbgeNomeClient {

    @GetMapping("/censos/nomes/ranking")
    List<ResultadoRanking> getRankingNome();

}