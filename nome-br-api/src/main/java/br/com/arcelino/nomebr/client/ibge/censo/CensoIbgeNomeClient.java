package br.com.arcelino.nomebr.client.ibge.censo;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import br.com.arcelino.nomebr.model.censo.ResultadoNomeFrequencia;
import br.com.arcelino.nomebr.model.censo.ResultadoRanking;

@FeignClient(name = "censoIbge", url = "${ibge.api.url}", path = "/v2/censos/nomes")
public interface CensoIbgeNomeClient {

    @GetMapping("/ranking")
    List<ResultadoRanking> getRankingNome();

    @GetMapping("/{nome}")
    List<ResultadoNomeFrequencia> getFrequenciaNome(@PathVariable String nome,
            @RequestParam(required = false) String sexo);

}