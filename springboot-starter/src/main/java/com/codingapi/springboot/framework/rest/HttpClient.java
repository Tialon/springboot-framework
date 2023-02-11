package com.codingapi.springboot.framework.rest;

import com.alibaba.fastjson.JSON;
import com.codingapi.springboot.framework.rest.properties.HttpProxyProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.URI;
import java.util.Objects;

@Slf4j
public class HttpClient {

    public interface IHttpResponseHandler{
        String toResponse(HttpClient client,String uri,ResponseEntity<String> response);
    }

    private final RestTemplate restTemplate;

    private final IHttpResponseHandler responseHandler;

    private static final IHttpResponseHandler defaultResponseHandler =  new IHttpResponseHandler() {

        public HttpHeaders copyHeaders(HttpHeaders headers){
            HttpHeaders httpHeaders = new HttpHeaders();
            for (String key:headers.keySet()){
                httpHeaders.set(key, String.join(";", Objects.requireNonNull(headers.get(key))));
            }
            return httpHeaders;
        }

        @Override
        public String toResponse(HttpClient client, String url, ResponseEntity<String> response) {
            if(response.getStatusCode().equals(HttpStatus.OK)){
                return response.getBody();
            }

            if(response.getStatusCode().equals(HttpStatus.NOT_FOUND)){
                return response.getBody();
            }

            if(response.getStatusCode().equals(HttpStatus.FOUND)){
                URI uri = URI.create(url);
                HttpHeaders headers = response.getHeaders();
                String location = Objects.requireNonNull(headers.getLocation()).toString();
                String baseUrl = uri.getScheme() + "://" + uri.getHost()+":"+uri.getPort();
                String locationUrl = baseUrl+location;
                return client.get(locationUrl,copyHeaders(headers),null);
            }
            return response.getBody();
        }
    };

    private static final ResponseErrorHandler defaultErrorHandler = new DefaultResponseErrorHandler() {
        @Override
        public boolean hasError(ClientHttpResponse response) throws IOException {
            if(response.getStatusCode()==HttpStatus.NOT_FOUND){
                return false;
            }
            return super.hasError(response);
        }
    };

    public HttpClient() {
        this(null,defaultResponseHandler);
    }

    public HttpClient(IHttpResponseHandler responseHandler) {
        this(null,responseHandler);
    }

    public HttpClient(HttpProxyProperties properties) {
        this(properties,defaultResponseHandler);
    }

    public HttpClient(HttpProxyProperties properties,IHttpResponseHandler responseHandler) {
        this.responseHandler = responseHandler;
        this.restTemplate = RestTemplateContext.getInstance().getRestTemplate();
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(3000);
        if (properties != null) {
            if (properties.isEnableProxy()) {
                log.info("enable proxy {}//:{}:{}", properties.getProxyType(), properties.getProxyHost(), properties.getProxyPort());
                requestFactory.setProxy(new Proxy(properties.getProxyType(),
                        new InetSocketAddress(properties.getProxyHost(), properties.getProxyPort())));
            }
        }
        this.restTemplate.setErrorHandler(defaultErrorHandler);
        this.restTemplate.setRequestFactory(requestFactory);
        DefaultUriBuilderFactory uriBuilderFactory = new DefaultUriBuilderFactory();
        uriBuilderFactory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);
        this.restTemplate.setUriTemplateHandler(uriBuilderFactory);
    }

    public String post(String url, HttpHeaders headers, JSON jsonObject) {
        HttpEntity<String> httpEntity = new HttpEntity<>(jsonObject.toString(), headers);
        ResponseEntity<String> httpResponse = restTemplate.exchange(url, HttpMethod.POST, httpEntity, String.class);
        return responseHandler.toResponse(this,url,httpResponse);
    }

    public String post(String url, HttpHeaders headers, MultiValueMap<String, String> formData) {
        HttpEntity<MultiValueMap<String, String>> httpEntity = new HttpEntity<>(formData, headers);
        ResponseEntity<String> httpResponse = restTemplate.exchange(url, HttpMethod.POST, httpEntity, String.class);
        return responseHandler.toResponse(this,url,httpResponse);
    }

    public String get(String url, HttpHeaders headers, MultiValueMap<String, String> uriVariables) {
        HttpEntity<String> httpEntity = new HttpEntity<>(headers);
        ResponseEntity<String> httpResponse;
        if(uriVariables!=null&&!uriVariables.isEmpty()) {
            URI uri = UriComponentsBuilder.fromHttpUrl(url)
                    .queryParams(uriVariables)
                    .build(true).toUri();
            httpResponse = restTemplate.exchange(uri, HttpMethod.GET, httpEntity, String.class);
        }else{
            httpResponse = restTemplate.exchange(url, HttpMethod.GET, httpEntity, String.class);
        }
        return responseHandler.toResponse(this, url, httpResponse);
    }


}
