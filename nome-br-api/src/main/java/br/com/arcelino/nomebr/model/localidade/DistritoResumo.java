package br.com.arcelino.nomebr.model.localidade;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DistritoResumo(Integer ibge, String nome) {

    @JsonCreator
    public static DistritoResumo of(
            @JsonProperty("nome") String nome,
            @JsonProperty("municipio") MunicipioRef municipio) {
        return new DistritoResumo(municipio.id(), nome);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record MunicipioRef(Integer id) {}

}
