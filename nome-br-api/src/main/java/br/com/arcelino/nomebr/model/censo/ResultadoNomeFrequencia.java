package br.com.arcelino.nomebr.model.censo;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;

public record ResultadoNomeFrequencia(
        String nome,
        String sexo,
        String localidade,
        @JsonAlias("res") List<FrequenciaNome> resultados) {

}
