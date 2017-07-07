package com.itgm.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A ModeloExclusivo.
 */
@Entity
@Table(name = "modelo_exclusivo")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class ModeloExclusivo implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome")
    private String nome;

    @Column(name = "mapeamento")
    private String mapeamento;

    @Column(name = "palpite")
    private String palpite;

    @ManyToOne
    private Modelo modelo;

    @ManyToOne
    private Cenario cenario;

    @ManyToMany(mappedBy = "modeloExclusivos")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Prognose> prognoses = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public ModeloExclusivo nome(String nome) {
        this.nome = nome;
        return this;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getMapeamento() {
        return mapeamento;
    }

    public ModeloExclusivo mapeamento(String mapeamento) {
        this.mapeamento = mapeamento;
        return this;
    }

    public void setMapeamento(String mapeamento) {
        this.mapeamento = mapeamento;
    }

    public String getPalpite() {
        return palpite;
    }

    public ModeloExclusivo palpite(String palpite) {
        this.palpite = palpite;
        return this;
    }

    public void setPalpite(String palpite) {
        this.palpite = palpite;
    }

    public Modelo getModelo() {
        return modelo;
    }

    public ModeloExclusivo modelo(Modelo modelo) {
        this.modelo = modelo;
        return this;
    }

    public void setModelo(Modelo modelo) {
        this.modelo = modelo;
    }

    public Cenario getCenario() {
        return cenario;
    }

    public ModeloExclusivo cenario(Cenario cenario) {
        this.cenario = cenario;
        return this;
    }

    public void setCenario(Cenario cenario) {
        this.cenario = cenario;
    }

    public Set<Prognose> getPrognoses() {
        return prognoses;
    }

    public ModeloExclusivo prognoses(Set<Prognose> prognoses) {
        this.prognoses = prognoses;
        return this;
    }

    public ModeloExclusivo addPrognose(Prognose prognose) {
        this.prognoses.add(prognose);
        prognose.getModeloExclusivos().add(this);
        return this;
    }

    public ModeloExclusivo removePrognose(Prognose prognose) {
        this.prognoses.remove(prognose);
        prognose.getModeloExclusivos().remove(this);
        return this;
    }

    public void setPrognoses(Set<Prognose> prognoses) {
        this.prognoses = prognoses;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        ModeloExclusivo modeloExclusivo = (ModeloExclusivo) o;
        if (modeloExclusivo.id == null || id == null) {
            return false;
        }
        return Objects.equals(id, modeloExclusivo.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ModeloExclusivo{" +
            "id=" + id +
            ", nome='" + nome + "'" +
            ", mapeamento='" + mapeamento + "'" +
            ", palpite='" + palpite + "'" +
            '}';
    }
}
