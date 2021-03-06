package com.itgm.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A Prognose.
 */
@Entity
@Table(name = "prognose")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Prognose implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome")
    private String nome;

    @Column(name = "caminho")
    private String caminho;

    @Column(name = "mapeamento")
    private String mapeamento;

    @Column(name = "salvar")
    private String salvar;

    @Column(name = "graficos")
    private String graficos;

    @Column(name = "estatisticas")
    private String estatisticas;

    @Column(name = "forcepredict")
    private Boolean forcepredict;

    @Column(name = "dividir")
    private String dividir;

    @Column(name = "agrupar")
    private String agrupar;

    @Column(name = "treino")
    private Float treino;

    @Column(name = "fncalculavolume")
    private String fncalculavolume;

    @Column(name = "status")
    private Integer status;

    @Size(max = 40000)
    @Column(name = "codigo", length = 40000)
    private String codigo;

    @Column(name = "resultado")
    private String resultado;

    @Column(name = "token")
    private String token;

    @Size(max = 20000)
    @Column(name = "relatorio", length = 20000)
    private String relatorio;

    @ManyToOne
    private Base ajuste;

    @ManyToOne
    private Base validacao;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "prognose_modelo_exclusivo",
               joinColumns = @JoinColumn(name="prognoses_id", referencedColumnName="id"),
               inverseJoinColumns = @JoinColumn(name="modelo_exclusivos_id", referencedColumnName="id"))
    private Set<ModeloExclusivo> modeloExclusivos = new HashSet<>();

    @ManyToOne
    private Cenario cenario;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public Prognose nome(String nome) {
        this.nome = nome;
        return this;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCaminho() {
        return caminho;
    }

    public Prognose caminho(String caminho) {
        this.caminho = caminho;
        return this;
    }

    public void setCaminho(String caminho) {
        this.caminho = caminho;
    }

    public String getMapeamento() {
        return mapeamento;
    }

    public Prognose mapeamento(String mapeamento) {
        this.mapeamento = mapeamento;
        return this;
    }

    public void setMapeamento(String mapeamento) {
        this.mapeamento = mapeamento;
    }

    public String getSalvar() {
        return salvar;
    }

    public Prognose salvar(String salvar) {
        this.salvar = salvar;
        return this;
    }

    public void setSalvar(String salvar) {
        this.salvar = salvar;
    }

    public String getGraficos() {
        return graficos;
    }

    public Prognose graficos(String graficos) {
        this.graficos = graficos;
        return this;
    }

    public void setGraficos(String graficos) {
        this.graficos = graficos;
    }

    public String getEstatisticas() {
        return estatisticas;
    }

    public Prognose estatisticas(String estatisticas) {
        this.estatisticas = estatisticas;
        return this;
    }

    public void setEstatisticas(String estatisticas) {
        this.estatisticas = estatisticas;
    }

    public Boolean isForcepredict() {
        return forcepredict;
    }

    public Prognose forcepredict(Boolean forcepredict) {
        this.forcepredict = forcepredict;
        return this;
    }

    public void setForcepredict(Boolean forcepredict) {
        this.forcepredict = forcepredict;
    }

    public String getDividir() {
        return dividir;
    }

    public Prognose dividir(String dividir) {
        this.dividir = dividir;
        return this;
    }

    public void setDividir(String dividir) {
        this.dividir = dividir;
    }

    public String getAgrupar() {
        return agrupar;
    }

    public Prognose agrupar(String agrupar) {
        this.agrupar = agrupar;
        return this;
    }

    public void setAgrupar(String agrupar) {
        this.agrupar = agrupar;
    }

    public Float getTreino() {
        return treino;
    }

    public Prognose treino(Float treino) {
        this.treino = treino;
        return this;
    }

    public void setTreino(Float treino) {
        this.treino = treino;
    }

    public String getFncalculavolume() {
        return fncalculavolume;
    }

    public Prognose fncalculavolume(String fncalculavolume) {
        this.fncalculavolume = fncalculavolume;
        return this;
    }

    public void setFncalculavolume(String fncalculavolume) {
        this.fncalculavolume = fncalculavolume;
    }

    public Integer getStatus() {
        return status;
    }

    public Prognose status(Integer status) {
        this.status = status;
        return this;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getCodigo() {
        return codigo;
    }

    public Prognose codigo(String codigo) {
        this.codigo = codigo;
        return this;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getResultado() {
        return resultado;
    }

    public Prognose resultado(String resultado) {
        this.resultado = resultado;
        return this;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public String getToken() {
        return token;
    }

    public Prognose token(String token) {
        this.token = token;
        return this;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRelatorio() {
        return relatorio;
    }

    public Prognose relatorio(String relatorio) {
        this.relatorio = relatorio;
        return this;
    }

    public void setRelatorio(String relatorio) {
        this.relatorio = relatorio;
    }

    public Base getAjuste() {
        return ajuste;
    }

    public Prognose ajuste(Base base) {
        this.ajuste = base;
        return this;
    }

    public void setAjuste(Base base) {
        this.ajuste = base;
    }

    public Base getValidacao() {
        return validacao;
    }

    public Prognose validacao(Base base) {
        this.validacao = base;
        return this;
    }

    public void setValidacao(Base base) {
        this.validacao = base;
    }

    public Set<ModeloExclusivo> getModeloExclusivos() {
        return modeloExclusivos;
    }

    public Prognose modeloExclusivos(Set<ModeloExclusivo> modeloExclusivos) {
        this.modeloExclusivos = modeloExclusivos;
        return this;
    }

    public Prognose addModeloExclusivo(ModeloExclusivo modeloExclusivo) {
        this.modeloExclusivos.add(modeloExclusivo);
        modeloExclusivo.getPrognoses().add(this);
        return this;
    }

    public Prognose removeModeloExclusivo(ModeloExclusivo modeloExclusivo) {
        this.modeloExclusivos.remove(modeloExclusivo);
        modeloExclusivo.getPrognoses().remove(this);
        return this;
    }

    public void setModeloExclusivos(Set<ModeloExclusivo> modeloExclusivos) {
        this.modeloExclusivos = modeloExclusivos;
    }

    public Cenario getCenario() {
        return cenario;
    }

    public Prognose cenario(Cenario cenario) {
        this.cenario = cenario;
        return this;
    }

    public void setCenario(Cenario cenario) {
        this.cenario = cenario;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Prognose prognose = (Prognose) o;
        if (prognose.id == null || id == null) {
            return false;
        }
        return Objects.equals(id, prognose.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Prognose{" +
            "id=" + id +
            ", nome='" + nome + "'" +
            ", caminho='" + caminho + "'" +
            ", mapeamento='" + mapeamento + "'" +
            ", salvar='" + salvar + "'" +
            ", graficos='" + graficos + "'" +
            ", estatisticas='" + estatisticas + "'" +
            ", forcepredict='" + forcepredict + "'" +
            ", dividir='" + dividir + "'" +
            ", agrupar='" + agrupar + "'" +
            ", treino='" + treino + "'" +
            ", fncalculavolume='" + fncalculavolume + "'" +
            ", status='" + status + "'" +
            ", codigo='" + codigo + "'" +
            ", resultado='" + resultado + "'" +
            ", token='" + token + "'" +
            ", relatorio='" + relatorio + "'" +
            '}';
    }
}
