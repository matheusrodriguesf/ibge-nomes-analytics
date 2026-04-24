package br.com.arcelino.nomebr.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;

public record ResultadoNomeFrequencia(
        String nome,
        String localidade,
        @JsonAlias("res") List<FrequenciaNome> resultados) {

}
