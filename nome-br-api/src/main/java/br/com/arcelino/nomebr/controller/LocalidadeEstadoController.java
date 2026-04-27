package br.com.arcelino.nomebr.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.arcelino.nomebr.model.localidade.EstadoResumo;
import br.com.arcelino.nomebr.service.LocalidadeEstadoService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/estados")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class LocalidadeEstadoController {

    LocalidadeEstadoService localidadeEstadoService;

    @GetMapping
    public ResponseEntity<List<EstadoResumo>> getAllEstados() {
        return ResponseEntity.ok(localidadeEstadoService.getEstados());
    }

}
