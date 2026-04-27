package br.com.arcelino.nomebr.client.ibge.localidade;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import br.com.arcelino.nomebr.model.localidade.EstadoResumo;

@FeignClient(name = "localidadeIbge", url = "${ibge.api.url}", path = "/v1/localidades/estados")
public interface LocalidadeIbgeClient {

	@GetMapping
	List<EstadoResumo> getEstados();

}
