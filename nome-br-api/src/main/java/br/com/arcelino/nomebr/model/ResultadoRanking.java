package br.com.arcelino.nomebr.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;

public record ResultadoRanking(
                String localidade,
                @JsonAlias("res") List<RankingNome> resultado) {

}
