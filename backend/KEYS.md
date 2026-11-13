# Generar claves para JWT

## Clave privada

Generar con OpenSSL

```
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
```

Codificar en Base64

```
base64 -w 0 private.pem
```

---

## Clave pública

Generar con OpenSSL

```
openssl rsa -pubout -in private.pem -out public.pem
```

Codificar en Base64

```
base64 -w 0 public.pem
```
