package br.com.arcelino.nomebr.client.ibge.localidade;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import br.com.arcelino.nomebr.model.localidade.EstadoResumo;
import br.com.arcelino.nomebr.model.localidade.DistritoResumo;

@FeignClient(name = "localidadeIbge", url = "${ibge.api.url}", path = "/v1/localidades/estados")
public interface LocalidadeIbgeClient {

	@GetMapping
	List<EstadoResumo> getEstados();

    @GetMapping("/{estadoId}/distritos")
    List<DistritoResumo> getDistritosByEstado(@PathVariable Integer estadoId);

}
