package com.itgm.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.itgm.domain.Prognose;

import com.itgm.repository.PrognoseRepository;
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
import java.util.List;
import java.util.Optional;

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
        prognoseRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

}
