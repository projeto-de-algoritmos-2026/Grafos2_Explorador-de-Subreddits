# G2_Grafos_PA-26.1

## Requisitos e Execução do Backend

### Requisitos

Antes de executar o projeto, certifique-se de ter instalado:

* Python **3.8 ou superior**
* Conexão com a internet (para download automático do dataset)

---

### Executando o backend

Na raiz do projeto, execute:

```bash
python setup.py
```

Este comando irá automaticamente:

* Baixar o dataset necessário
* Criar um ambiente virtual (`venv`)
* Instalar todas as dependências do projeto
* Iniciar o servidor backend

---

### Acessando a API

Após a execução, o backend estará disponível em:

```
http://127.0.0.1:8000
```

Interface interativa (Swagger):

```
http://127.0.0.1:8000/docs
```

---

### Testando um endpoint

Exemplo de requisição:

```
GET /subreddit/{name}
```

Exemplo prático:

```
http://127.0.0.1:8000/subreddit/python
```

---

### Observações

* Na primeira execução, o processo pode demorar alguns minutos devido ao download do dataset e instalação das dependências.
* Execuções posteriores serão mais rápidas, pois o ambiente e os dados já estarão configurados.
* Caso o dataset já exista na pasta `backend/data/`, o download será automaticamente ignorado.
