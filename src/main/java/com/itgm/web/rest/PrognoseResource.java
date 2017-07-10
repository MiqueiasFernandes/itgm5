package com.itgm.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.itgm.domain.ModeloExclusivo;
import com.itgm.domain.Prognose;

import com.itgm.repository.PrognoseRepository;
import com.itgm.service.jriaccess.Itgmrest;
import com.itgm.web.rest.util.HeaderUtil;
import com.itgm.web.rest.util.PaginationUtil;
import io.swagger.annotations.ApiParam;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;
import java.util.function.Predicate;

/**
 * REST controller for managing Prognose.
 */
@RestController
@RequestMapping("/api")
public class PrognoseResource {

    private final Logger log = LoggerFactory.getLogger(PrognoseResource.class);

    private static final String ENTITY_NAME = "prognose";

    private final PrognoseRepository prognoseRepository;

    public PrognoseResource(PrognoseRepository prognoseRepository) {
        this.prognoseRepository = prognoseRepository;
    }

    /**
     * POST  /prognoses : Create a new prognose.
     *
     * @param prognose the prognose to create
     * @return the ResponseEntity with status 201 (Created) and with body the new prognose, or with status 400 (Bad Request) if the prognose has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/prognoses")
    @Timed
    public ResponseEntity<Prognose> createPrognose(@Valid @RequestBody Prognose prognose) throws URISyntaxException {
        log.debug("REST request to save Prognose : {}", prognose);
        if (prognose.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists", "A new prognose cannot already have an ID")).body(null);
        }
        Prognose result = prognoseRepository.save(prognose);

        result.setCaminho(prognose.getCenario().getCaminho() + "prognose" + prognose.getId() + "/");

        result.setToken(
            Itgmrest.executarBatch(
                prognose.getCenario().getProjeto().getUser().getLogin(),
                prognose.getCenario().getProjeto().getNome(),
                prognose.getCenario().getNome(),
                "prognose" + prognose.getId(),
                prognose.getCodigo()
            )
        );

        result.setStatus(2);
        final Prognose prog = result = prognoseRepository.save(result);

        new Thread(new Runnable() {
            @Override
            public void run() {
                Prognose prognose1 = prog;
                try{
                    boolean rodando = true;
                    String usuario =  prognose1.getCenario().getProjeto().getUser().getLogin();
                    String projeto = prognose1.getCenario().getProjeto().getNome();
                    String cenario =  prognose1.getCenario().getNome();
                    String diretorio = "prognose" + prognose.getId();
                    do {
                        try {
                            Thread.sleep(10000);
                        } catch (Exception e) {
                            rodando = false;
                        }

                        String status = Itgmrest.getStatus(prognose1.getToken());
                        if (status.startsWith("{\"error\":\"processo n") && status.endsWith("encontrado\"}")) {
                            prognose1.setStatus(4);
                            String relatorio = Itgmrest.getContent(
                                usuario,
                                projeto,
                                cenario,
                                diretorio,
                                "relatorio.avaliaModeloEspecial.json",
                                null,
                                false,
                                "{}"
                            );

                            String[] modelos =  Itgmrest.getContent(
                                usuario,
                                projeto,
                                cenario,
                                diretorio,
                                "comparativo ( VOLUME ) da VALIDACAO dos modelos - estatistica dos modelos.csv",
                                "resultados/",
                                false,
                                "\n"
                            ).split("\n")[0]
                                .replaceAll("\"", "")
                                .replace(",name,", "")
                                .replaceAll("value_", "")
                                .split(",");

                            StringBuilder sb = new StringBuilder("{");

                            for (ModeloExclusivo me : prognose1.getModeloExclusivos()) {

                                sb.append("{".equals(sb.toString()) ? "" : ",");
                                sb.append("\"" + me.getModelo().getNome() + "\":{");

                                String equivalente = me.getModelo().getNome().replaceAll("\\s", "");
                                if (Arrays.stream(modelos).anyMatch(new Predicate<String>() {
                                    @Override
                                    public boolean test(String s) {
                                        return s.equals(equivalente);
                                    }
                                })){
                                    ///obter grafico principal de ajuste e validacao
                                    sb.append("\"alias\":\"").append(equivalente).append("\"");
                                    sb.append(getResultados(true,usuario,projeto,cenario,diretorio,equivalente));
                                    sb.append(getResultados(false,usuario,projeto,cenario,diretorio,equivalente));
                                } else {
                                    sb.append("\"error\":\"o modelo " + me.getModelo().getNome() +
                                        " (" + equivalente + ") não foi encontrado entre os " +
                                        "modelos {" + Arrays.toString(modelos) + "}, " +
                                        "algum erro crítico ocorreu.\"");
                                }

                                sb.append("}");

                            }
                            sb.append("}");

                            prognose1
                                .setRelatorio("{\"relatorio\":" + relatorio + "," +
                                    "\"resultados\":" + sb.toString() + "}");

                            rodando = false;
                        } else {
                            prognose1.setStatus(3);
                            prognose1.setRelatorio(status);
                        }
                        try {
                            prognoseRepository.save(prognose1);
                        }catch (Exception ex) {
                            prognose1.setRelatorio("{\"relatorio\":{\"error\":\"" +
                                ex.toString()
                                    .replaceAll("\\s", " ")
                                    .replaceAll("\"", "").substring(0, Math.min(200, ex.toString().length())) + "\"}}");
                            prognose1.setStatus(4);
                            prognoseRepository.save(prognose1);
                        }
                    }
                    while (rodando);
                } catch (Exception e) {
                    prognose1.setRelatorio("{\"relatorio\":{\"error\":\"" +
                        e.toString()
                            .replaceAll("\\s", " ")
                            .replaceAll("\"", "").substring(0, Math.min(200, e.toString().length())) + "\"}}");
                    prognose1.setStatus(4);
                    prognoseRepository.save(prognose1);
                }
            }
        }).start();

        return ResponseEntity.created(new URI("/api/prognoses/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /prognoses : Updates an existing prognose.
     *
     * @param prognose the prognose to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated prognose,
     * or with status 400 (Bad Request) if the prognose is not valid,
     * or with status 500 (Internal Server Error) if the prognose couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/prognoses")
    @Timed
    public ResponseEntity<Prognose> updatePrognose(@Valid @RequestBody Prognose prognose) throws URISyntaxException {
        log.debug("REST request to update Prognose : {}", prognose);
        if (prognose.getId() == null) {
            return createPrognose(prognose);
        }
        Prognose result = prognoseRepository.save(prognose);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, prognose.getId().toString()))
            .body(result);
    }

    /**
     * GET  /prognoses : get all the prognoses.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of prognoses in body
     */
    @GetMapping("/prognoses")
    @Timed
    public ResponseEntity<List<Prognose>> getAllPrognoses(@ApiParam Pageable pageable) {
        log.debug("REST request to get a page of Prognoses");
        Page<Prognose> page = prognoseRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/prognoses");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /prognoses/:id : get the "id" prognose.
     *
     * @param id the id of the prognose to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the prognose, or with status 404 (Not Found)
     */
    @GetMapping("/prognoses/{id}")
    @Timed
    public ResponseEntity<Prognose> getPrognose(@PathVariable Long id) {
        log.debug("REST request to get Prognose : {}", id);
        Prognose prognose = prognoseRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(prognose));
    }

    /**
     * DELETE  /prognoses/:id : delete the "id" prognose.
     *
     * @param id the id of the prognose to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/prognoses/{id}")
    @Timed
    public ResponseEntity<Void> deletePrognose(@PathVariable Long id) {
        log.debug("REST request to delete Prognose : {}", id);
        Prognose prognose = prognoseRepository.findOneWithEagerRelationships(id);
        Itgmrest.removeDIR(
            prognose.getCenario().getProjeto().getUser().getLogin(),
            prognose.getCenario().getProjeto().getNome(),
            prognose.getCenario().getNome(),
            "prognose" + prognose.getId(),
            null,
            null);
        prognoseRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    String getResultados(boolean metodo,
                         String usuario,
                         String projeto,
                         String cenario,
                         String diretorio,
                         String equivalente) {
        StringBuilder sb = new StringBuilder(",\"" + (metodo ? "ajuste" : "validacao") + "\":{");
        sb.append("\"grafico\":\"")
            .append( Itgmrest.publicFile(
                usuario,
                projeto,
                cenario,
                diretorio,
                "resultados/" + equivalente + "/"  + (metodo ? "" : "validacao/"),
                equivalente + " Volume " + (metodo ? "Ajuste" : "Validacao") + ".png",
                false,
                true))
            .append("\"");
        String arquivo = Itgmrest.getContent(
            usuario,
            projeto,
            cenario,
            diretorio,
            (metodo ? "ajuste" : "validacao") + " Volume " + equivalente + " - estatisticas do modelo.csv",
            "resultados/" + equivalente + "/"  + (metodo ? "" : "validacao/"),
            false,
            "");
        if (arquivo != null && !arquivo.isEmpty() && (arquivo.length() > 10)){
            sb.append(",\"estatisticas\":{");
            arquivo = arquivo.replace("\"name\",\"value\"\n", "");
            arquivo = arquivo.replaceAll(",", ":");
            arquivo = arquivo.replaceAll("\n", ",");
            arquivo = arquivo.substring(0, arquivo.length()-1);
            sb.append(arquivo).append("}");
        }

        sb.append(",\"estatisticas2\":\"")
            .append(Itgmrest.publicFile(
                usuario,
                projeto,
                cenario,
                diretorio,
                "resultados/" + equivalente + "/"  + (metodo ? "" : "validacao/"),
                (metodo ? "ajuste" : "validacao") + " Volume " + equivalente + " - estatisticas.csv",
                false,
                false))
            .append("\"");

        sb.append(",\"coeficientes\":\"")
            .append(Itgmrest.publicFile(
                usuario,
                projeto,
                cenario,
                diretorio,
                "resultados/" + equivalente + "/"  + (metodo ? "" : "validacao/"),
                (metodo ? "ajuste" : "validacao") + " Volume " + equivalente + " - coeficientes.csv",
                false,
                false))
            .append("\"");
        sb.append("}");
        return sb.toString();
    }


}
