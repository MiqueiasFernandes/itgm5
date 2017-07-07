package com.itgm.service.jriaccess;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;

import java.io.*;
import java.net.Socket;
import java.util.Arrays;

/**
 * Created by mfernandes on 23/06/17.
 */
public class Itgmrest {

    private static final Logger log = LoggerFactory.getLogger(Itgmrest.class);

    private static final boolean UPLOAD_ALTERNATIVO = true;

    private static final String HOST = "itgm.mikeias.net";
    private static final String SERVER = "http://"+HOST+":8080/";
    private static final String SERVICE = SERVER + "ITGMRest2/webresources/jriaccess/";
    //    @GET
    private static final String PATH_GET_PROCESSOS = SERVICE + "process/";
    private static final String PATH_GET_COMPARTILHAMENTO = SERVICE + "compartilhamento/";
    private static final String PATH_GET_COMPARTILHADO = SERVICE + "compartilhado/"; ///compartilhado/{usuario}/{token}
    private static final String PATH_GET_STATUS = SERVICE + "status/"; ///status/{token}
    private static final String PATH_GET_LIST = SERVICE + "list/"; ///list/{usuario}/{projeto}/{cenario}/{diretorio}
    private static final String PATH_GET_CONTENT = SERVICE + "content/"; ///"content/{usuario}/{projeto}/{cenario}/{diretorio}/{file}"
    private static final String PATH_GET_FILE = SERVICE + "file/"; ///file/{usuario}/{projeto}/{cenario}/{diretorio}/{file}
    //    @PUT
    private static final String PATH_PUT_SUSPENDER = SERVICE + "suspend/";
    private static final String PATH_PUT_RESUMIR = SERVICE + "resume/";
    private static final String PATH_PUT_PARAR = SERVICE + "stop/";
    //    @POST
    private static final String PATH_POST_PROCESSO = SERVICE + ""; ///{usuario}/{projeto}/{cenario}/{diretorio}
    private static final String PATH_POST_UPDATE = SERVICE + "update/";
    private static final String PATH_POST_DIRETORIO = SERVICE + "diretorio/";
    private static final String PATH_POST_FILE = SERVICE + ""; ///{usuario}/{projeto}/{cenario}/{diretorio}/{file}
    //    @DELETE
    private static final String PATH_DELETE_PROCESSO = SERVICE + "process/"; ///process/{token}
    private static final String PATH_DELETE_USUARIO = SERVICE + "usuario/"; ///usuario/{usuario}
    private static final String PATH_DELETE_PROJETO = SERVICE + "projeto/"; ///projeto/{usuario}/{projeto}
    private static final String PATH_DELETE_CENARIO = SERVICE + "cenario/"; ///cenario/{usuario}/{projeto}/{cenario}
    private static final String PATH_DELETE_DIRETORIO = SERVICE + "diretorio/"; ///diretorio/{usuario}/{projeto}/{cenario}/{diretorio}
    private static final String PATH_DELETE_ARQUIVO = SERVICE + "file/"; ///file/{usuario}/{projeto}/{cenario}/{diretorio}/{file}

    private static String buidURIforGET_COMPARTILHAMENTO(String origem, String destino) {
        return PATH_GET_COMPARTILHAMENTO + "?origem=" +origem  + "&destino=" + destino;
    }
    private static String buidURIforGET_COMPARTILHADO(String usuario, String token) {
        return PATH_GET_COMPARTILHADO + usuario  + "/" + token;
    }
    private static String buidURIforGET_STATUS(String usuario, String token) {
        return PATH_GET_STATUS + usuario  + "/" + token;
    }
    private static String buidURIforGET_LIST(String usuario, String projeto, String cenario, String diretorio) {
        return PATH_GET_LIST + usuario  + "/" + projeto + "/" + cenario + "/" + diretorio;
    }
    private static String buidURIforGET_CONTENT(String usuario,
                                                String projeto,
                                                String cenario,
                                                String diretorio,
                                                String file,
                                                String subdiretorio,
                                                boolean criptografar) {
        return PATH_GET_CONTENT + usuario  + "/"
            + projeto + "/"
            + cenario + "/"
            + diretorio + "/"
            + file + "?"
            + (subdiretorio != null && !subdiretorio.isEmpty() ? "subdiretorio=" + subdiretorio : "")
            + "&cript=" + criptografar;
    }
    private static String buidURIforGET_FILE(
        String usuario,
        String projeto,
        String cenario,
        String diretorio,
        String subdiretorio,
        String file,
        boolean returnMeta,
        boolean isImage) {
        return PATH_GET_FILE + usuario  + "/" +
            projeto + "/" +
            cenario + "/" +
            diretorio + "/" +
             file + "?"
            + (subdiretorio != null && !subdiretorio.isEmpty() ? "subdiretorio=" + subdiretorio : "")
            + "&meta=" + returnMeta
            + "&image=" + isImage;
    }
    private static String buidURIforPOST_PROCESSO(String usuario,
                                                  String projeto,
                                                  String cenario,
                                                  String diretorio) {
        return PATH_POST_PROCESSO + usuario  + "/" + projeto + "/" + cenario + "/" + diretorio;
    }
    private static String buidURIforDELETE_PROCESSO(String token) {
        return SERVICE + PATH_DELETE_PROCESSO + token;
    }
    private static String buidURIforDELETE_USUARIO(String usuario) {
        return SERVICE + PATH_DELETE_USUARIO + usuario;
    }
    private static String buidURIforDELETE_PROJETO(String usuario, String projeto) {
        return PATH_DELETE_PROJETO + usuario  + "/" + projeto;
    }
    private static String buidURIforDELETE_CENARIO(String usuario, String projeto, String cenario) {
        return PATH_DELETE_CENARIO + usuario  + "/" + projeto + "/" + cenario;
    }
    private static String buidURIforDELETE_DIRETORIO(String usuario, String projeto, String cenario, String diretorio) {
        return PATH_DELETE_DIRETORIO + usuario  + "/" + projeto + "/" + cenario + "/" + diretorio;
    }
    private static String buidURIforDELETE_ARQUIVO(String usuario,
                                                   String projeto,
                                                   String cenario,
                                                   String diretorio,
                                                   String subdiretorio) {
        return PATH_DELETE_ARQUIVO +
            usuario  + "/" +
            projeto + "/" +
            cenario + "/" +
            diretorio + "?"
            + (subdiretorio != null && !subdiretorio.isEmpty() ? "subdiretorio=" + subdiretorio : "");
    }
    private static String buidURIforPOST_FILE(String usuario,
                                              String projeto,
                                              String cenario,
                                              String diretorio,
                                              String file,
                                              String subdiretorio) {
        return PATH_POST_FILE +
            usuario  + "/" +
            projeto + "/" +
            cenario + "/" +
            diretorio + "/" +
            file + "?"
            + (subdiretorio != null && !subdiretorio.isEmpty() ? "subdiretorio=" + subdiretorio : "");
    }

    private static Object getOnTemplate(String path, Class classe, Object retorno) {
        log.info("#######################GET " + path +"############################");
        try {
            return getRestTemplate().getForObject( path,  classe);
        }catch (Exception e) {
            log.error("ERRO AO TENTAR: GET " + path + " EX: " + e);
        }
        return retorno;
    }

    private static Object postOnTemplate(String path, Object enviado, Class classe, Object retorno) {
        log.info("#######################POST " + path +"############################");
        try {
            return getRestTemplate().postForObject(
                path, enviado,  classe);
        }catch (Exception e) {
            log.error("ERRO AO TENTAR: POST " + path + " EX: " + e);
        }
        return retorno;
    }

    private static boolean deleteOnTemplate(String path) {
        log.info("#######################DELETE " + path +"############################");
        try {
            getRestTemplate().delete(path);
            return true;
        }catch (Exception e) {
            log.error("ERRO AO TENTAR: POST " + path + " EX: " + e);
        }
        return false;
    }

    private static RestTemplate getRestTemplate() {
        return new RestTemplate();
    }

    private static boolean postTEXTO(String path, String enviado) {
        return "true".equals(
            postOnTemplate(path, enviado, String.class, "false")
        );
    }


    public static String getContent(String usuario,
                                    String projeto,
                                    String cenario,
                                    String diretorio,
                                    String arquivo,
                                    String subdiretorio,
                                    boolean cript,
                                    String retornar) {
        return (String) getOnTemplate(buidURIforGET_CONTENT(
            usuario,
            projeto,
            cenario,
            diretorio,
            arquivo,
            subdiretorio,
            cript), String.class, retornar);

    }


    private static boolean postBINARIO(String path, MultipartFile file) {
        try {

            if(UPLOAD_ALTERNATIVO){
                path = path.replace(SERVICE, "");
                path = SERVICE + "stream/" + path;
                return uploadAlternativo(path, file.getBytes());
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setAccept(Arrays.asList(new MediaType[]{MediaType.TEXT_PLAIN}));
            HttpEntity<byte[]> entity = null;
            entity = new HttpEntity<byte[]>(
                file.getBytes(),
                headers);
            return "true".equals(
                postOnTemplate(path, entity, String.class, "false")
            );
        }catch (Exception ex){
            log.error("ERRO AO TENTAR SERIALIZAR EX: " + ex);
        }
        return false;
    }

    public static void criarDiretorio(String login,
                                      String projeto,
                                      String cenario,
                                      String diretorio,
                                      String data) {
        postTEXTO(buidURIforPOST_FILE(login,
            projeto,
            cenario,
            diretorio,
            "diretorio.data",
            "desc/"), data);
    }

    public static boolean isServerAlive() {
        String retorno = (String) getOnTemplate(PATH_GET_PROCESSOS, String.class, null);
        log.info("SERVER STATUS: " + retorno);
        return retorno.startsWith("{\"process\":[") && retorno.endsWith("]}");
    }

    public static boolean createNewFile(String user,
                                        String projeto,
                                        String cenario,
                                        String diretorio,
                                        String subdiretorio,
                                        String nomeDoArquivo,
                                        String conteudo) {
        return postTEXTO(
            buidURIforPOST_FILE(user, projeto, cenario, diretorio, nomeDoArquivo, subdiretorio),
            conteudo);
    }

    public static boolean postBinario(String usuario,
                                      String projeto,
                                      String cenario,
                                      String diretorio,
                                      String file,
                                      String subdiretorio,
                                      MultipartFile conteudo) {
        return postBINARIO(
            buidURIforPOST_FILE(usuario, projeto, cenario, diretorio, file, subdiretorio),
            conteudo
        );
    }




    public static String listFiles(String usuario, String projeto, String cenario, String diretorio) {
        return (String) getOnTemplate(
            buidURIforGET_LIST(usuario, projeto, cenario, diretorio),
            String.class,
            ""
        );
    }

    public static void removeDIR(
        String usuario,
        String projeto,
        String cenario,
        String diretorio,
        String file,
        String subdiretorio) {

        String path = usuario;

        if (projeto == null && cenario == null && diretorio == null && file == null) {
            path = "usuario/" + usuario;
        } else if (cenario == null && diretorio == null && file == null) {
            path = "projeto/" + usuario + "/" + projeto;
        } else if (diretorio == null && file == null) {
            path = "cenario/" + usuario + "/" + projeto + "/" + cenario;
        } else if (file == null) {
            path = "diretorio/" + usuario + "/" + projeto + "/" + cenario + "/" + diretorio;
        } else {
            path = "file/" + usuario + "/" + projeto + "/" + cenario + "/" + diretorio + "/" + file;
        }
        deleteOnTemplate(SERVICE + path + "?subdiretorio=" + (subdiretorio != null ? subdiretorio : ""));
    }

    public static void executarBatch(String usuario,
                                     String projeto,
                                     String cenario,
                                     String diretorio,
                                     String codigo){
        String query = "?&parametros=BATCH" +
            "&parametros=log.txt" +
            "&parametros=INFO" +
            "&memoria=500" +
            "&cpu=100" +
            "&disco=500" +
            "&salvar=true";
        try {
            postOnTemplate(
                SERVICE + usuario + "/" +  projeto + "/" +  cenario + "/" +  diretorio + "/" +  query,
                java.net.URLEncoder.encode(codigo, "UTF-8"),
                String.class,
                null
            );
        }catch (Exception ex){

        }
    }


    public static String criarCompartilhamento(String origem, String destino){
        return (String) getOnTemplate(
            buidURIforGET_COMPARTILHAMENTO(origem, destino),
            String.class,
            "");
    }

    public static String receberCompartilhamento(String usuario, String token){
        return (String) getOnTemplate(buidURIforGET_COMPARTILHADO(usuario, token),
            String.class,
            "");
    }

    public static boolean createFileCompartilhamento(
        String user,
        String token,
        String local
    ){
        String conteudo = local + "\n\n";
        return createNewFile(
            user,
            "*",
            "*",
            "*",
            "share/" + token + "/",
            token,
            conteudo);
    }


    public static String getToken(String usuario,
                                  String projeto,
                                  String cenario,
                                  String diretorio,
                                  String[] parametros,
                                  int memoria,
                                  int disco,
                                  int cpu,
                                  boolean salvar,
                                  String codigo) {
        String params = "?parametros=" + String.join("&parametros=", parametros) +
            "&memoria=" + memoria +
            "&cpu=" + cpu +
            "&disco="+  disco +
            "&salvar=" + (salvar ? "true" : "false");
        try {
            return (String) postOnTemplate(
                buidURIforPOST_PROCESSO(usuario, projeto, cenario, diretorio) + params,
                java.net.URLEncoder.encode(codigo, "UTF-8"),
                String.class,
                "");
        }catch (Exception ex){
            log.error("ERRO AO POST PROCESS " + ex);
        }
        return "";
    }

    public static String publicFile(
        String usuario,
        String projeto,
        String cenario,
        String diretorio,
        String subdiretorio,
        String file,
        boolean meta,
        boolean image) {
        String ret = (String) getOnTemplate(
            buidURIforGET_FILE(usuario, projeto, cenario, diretorio, subdiretorio, file, meta, image),
            String.class,
            ""
        ) ;
        return (ret != null && ret.length() > 0 && !ret.isEmpty() && !ret.startsWith("error:")) ? ret : "";
    }


    ///"stream/{usuario}/{projeto}/{cenario}/{diretorio}/{file}"
///http://itgm.mikeias.net:8080/ITGMRest2/webresources/jriaccess/stream/mfernandes/*/*/*/image.jpg?subdiretorio=data/
    public static final boolean uploadAlternativo(final String path, final byte[] data){

        final int porta = Integer.parseInt(((String)
            getOnTemplate(path, String.class, "{\"porta\":-1}"))
            .split(":")[1]
            .replace("}", ""));

        log.info("Porta do server para: " + path + " é " + porta);

        if (porta >= 8880 && porta < 8890){
//            new Thread(new Runnable() {
//                @Override
//                public void run() {
            try {
                log.info("iniciando o envio do arquivo...");

                Socket s = new Socket(HOST, porta);
                BufferedReader input = new BufferedReader(new InputStreamReader(s.getInputStream()));
                String answer = input.readLine();
                log.info("SERVIDOR REMOTO UPLOAD FILE " + answer);

                s.getOutputStream().write(data);
                s.getOutputStream().flush();
                s.getOutputStream().close();
                input.close();
                s.close();

                log.info("o arquivo " + path + " foi enviado com sucesso...");
                return true;
            }catch (Exception ex){
                log.error("Houve um erro no envio do arquivo " + path + " ex: " + ex);
            }
        }
//            }).start();
//            return true;
//        }

        return  false;
    }


}
