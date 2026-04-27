package br.com.arcelino.nomebr.service;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.arcelino.nomebr.client.ibge.localidade.LocalidadeIbgeClient;
import br.com.arcelino.nomebr.model.localidade.EstadoResumo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class LocalidadeEstadoService {

    LocalidadeIbgeClient localidadeIbgeClient;

    public List<EstadoResumo> getEstados() {
        log.info("Buscando lista de estados");
        var estados = localidadeIbgeClient.getEstados();
        log.info("Encontrados {} estados", estados.size());
        estados.sort((e1, e2) -> e1.nome().compareToIgnoreCase(e2.nome()));
        return estados;
    }

}
