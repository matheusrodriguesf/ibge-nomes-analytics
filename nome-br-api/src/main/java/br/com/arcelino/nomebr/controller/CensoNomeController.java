package br.com.arcelino.nomebr.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.arcelino.nomebr.model.censo.ResultadoNomeFrequencia;
import br.com.arcelino.nomebr.model.censo.ResultadoRanking;
import br.com.arcelino.nomebr.service.CensoNomeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/censos")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CensoNomeController {

    CensoNomeService censoIbgeNomeService;

    @GetMapping("/ranking-nomes")
    public ResponseEntity<List<ResultadoRanking>> getRankingNome(
            @RequestParam(required = false) String sexo,
            @RequestParam(required = false) Integer localidade

    ) {
        return ResponseEntity.ok(censoIbgeNomeService.getRankingNome(sexo, localidade));
    }

    @GetMapping("/frequencia-nomes/{nome}")
    public ResponseEntity<List<ResultadoNomeFrequencia>> getFrequenciaNome(
            @PathVariable String nome,
            @RequestParam(required = false) String sexo,
            @RequestParam(required = false) Integer localidade) {
        return ResponseEntity.ok(censoIbgeNomeService.getFrequenciaNome(nome, sexo, localidade));
    }

}
