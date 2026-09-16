# Deploy na AWS (EC2) — passo a passo manual

Objetivo: uma instância EC2 gratuita (free tier), com Docker instalado,
recebendo deploys automáticos do GitHub Actions a cada push na `main`.

Esse provisionamento inicial é manual (feito uma única vez, pelo console da
AWS) porque envolve credenciais/pagamento da sua conta pessoal. Depois de
pronto, as atualizações do sistema passam a ser automáticas via CD.

## 1. Criar a instância EC2

1. Acesse o [Console AWS](https://console.aws.amazon.com/ec2/) → **EC2** →
   **Launch instance**.
2. **Name**: `todo-api`.
3. **AMI**: `Amazon Linux 2023` (free tier eligible).
4. **Instance type**: `t2.micro` ou `t3.micro` (ambas free tier — a região
   define qual está disponível).
5. **Key pair**: crie um novo par (`todo-api-key`), formato `.pem`, e baixe o
   arquivo — **é a única vez que a AWS mostra a chave privada**. Guarde-a,
   você vai precisar dela no passo 3.
6. **Network settings** → **Edit**:
   - Crie um novo Security Group `todo-api-sg`.
   - Regra 1: SSH (porta 22), origem **"My IP"** (não "Anywhere" — evita
     exposição desnecessária).
   - Regra 2: Custom TCP, porta `3000`, origem `Anywhere (0.0.0.0/0)` — é a
     porta da API.
7. **Launch instance**.
8. Anote o **Public IPv4 address** da instância (aparece na lista de
   instâncias após ~1 minuto).

## 2. Instalar o Docker na instância

```bash
chmod 400 ~/Downloads/todo-api-key.pem
ssh -i ~/Downloads/todo-api-key.pem ec2-user@<PUBLIC_IP>
```

Já conectado via SSH, na instância:

```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
exit
```

Reconecte (`ssh ...` de novo) para o grupo `docker` valer, e confirme:

```bash
docker ps
```

## 3. Cadastrar os segredos no GitHub

No repositório GitHub → **Settings** → **Secrets and variables** → **Actions**
→ **New repository secret**, cadastre três segredos:

| Nome | Valor |
|---|---|
| `EC2_HOST` | o Public IPv4 address anotado no passo 1.8 |
| `EC2_USER` | `ec2-user` |
| `EC2_SSH_KEY` | conteúdo completo do arquivo `todo-api-key.pem` (abra com um editor de texto e copie tudo, incluindo as linhas `-----BEGIN...` e `-----END...`) |

A partir daqui, todo push na `main` (depois que os testes passarem) vai
conectar nessa instância via SSH e atualizar o container automaticamente —
ver `05-architecture.md` para o que o workflow `cd.yml` faz exatamente.

## 4. Primeiro deploy (manual, só a primeira vez)

Antes do CD rodar pela primeira vez é preciso que a imagem já exista no
GitHub Container Registry — isso acontece sozinho no primeiro push na `main`
depois que o workflow estiver no repositório. Depois desse primeiro push,
confira em **Actions** no GitHub se o job `deploy` concluiu com sucesso, e
teste:

```bash
curl http://<PUBLIC_IP>:3000/health
```

Resposta esperada: `{"status":"ok"}`.

## Custos

`t2.micro`/`t3.micro` fazem parte do **AWS Free Tier** (750h/mês grátis no
primeiro ano da conta). Fora da elegibilidade do free tier, o custo é da
ordem de poucos centavos de dólar por hora — desligue a instância
(**Stop**, não precisa **Terminate**) quando não estiver usando para
demonstração, para não gerar cobrança acumulada.
