package br.com.arcelino.nomebr.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.arcelino.nomebr.model.ResultadoNomeFrequencia;
import br.com.arcelino.nomebr.model.ResultadoRanking;
import br.com.arcelino.nomebr.service.CensoNomeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/censos")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CensoNomeController {

    CensoNomeService censoIbgeNomeService;

    @GetMapping("/nomes/ranking")
    public ResponseEntity<List<ResultadoRanking>> getRankingNome() {
        return ResponseEntity.ok(censoIbgeNomeService.getRankingNome());
    }

    @GetMapping("/nomes/{nome}")
    public ResponseEntity<List<ResultadoNomeFrequencia>> getFrequenciaNome(@PathVariable String nome) {
        return ResponseEntity.ok(censoIbgeNomeService.getFrequenciaNome(nome));
    }

}
