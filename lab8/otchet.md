# Отчет по практической работе №8.1: Развертывание приложения со списком дел с помощью Kubernetes

## 1. Цель работы
Целью данной работы является освоение процесса развертывания многокомпонентного приложения в локальном кластере Kubernetes, включая создание простого CRUD-приложения, его контейнеризацию, деплой вместе с базой данных MongoDB и настройку CI/CD пайплайна.

## 2. Подготовка окружения

### Установка Minikube и kubectl
Для работы с локальным кластером Kubernetes были установлены необходимые утилиты: `minikube` и `kubectl`.
```bash
sudo pacman -S --noconfirm kubectl minikube
```

### Запуск Minikube
Кластер Minikube был запущен с использованием Docker-драйвера.
```bash
minikube start --driver=docker
```

## 3. Разработка и контейнеризация приложения "Список дел"

### Стек технологий и структура
Приложение "Список дел" (Todo Application) было разработано на Node.js/TypeScript с использованием Express.js и Mongoose для взаимодействия с MongoDB. Структура проекта расположена в `lab8/todo-app`.

### Dockerfile
Для контейнеризации приложения был создан многоэтапный Dockerfile, который компилирует TypeScript и создает легковесный production-образ.

```dockerfile
# Stage 1: Builder
FROM node:20-slim AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-slim
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD [ "npm", "start" ]
```

## 4. Развертывание в Kubernetes

### Манифест Kubernetes (`k8s.yaml`)
Все компоненты (MongoDB и Todo-приложение) были описаны в `k8s.yaml`. Манифест настроен на использование образа, загруженного в Docker Hub.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongo-deployment
  labels:
    app: mongo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      labels:
        app: mongo
    spec:
      containers:
      - name: mongo
        image: mongo:5.0
        ports:
        - containerPort: 27017
---
apiVersion: v1
kind: Service
metadata:
  name: mongo-service
spec:
  selector:
    app: mongo
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-app-deployment
  labels:
    app: todo-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-app
  template:
    metadata:
      labels:
        app: todo-app
    spec:
      containers:
      - name: todo-app
        image: sowwds/todo-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: MONGO_URI
          value: "mongodb://mongo-service:27017/todoapp"
        - name: PORT
          value: "3000"
---
apiVersion: v1
kind: Service
metadata:
  name: todo-app-service
spec:
  selector:
    app: todo-app
  type: NodePort
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
```

### Процесс развертывания
Образ приложения был собран и загружен в Minikube, после чего манифест был применен к кластеру.
```bash
# Загрузка образа в кластер Minikube
minikube image load todo-app:latest
# Применение манифеста
kubectl apply -f k8s.yaml
```

---
**[ПЛЕЙСХОЛДЕР ДЛЯ СКРИНШОТА]**

*Здесь должен быть скриншот вывода команды `kubectl get all` после успешного развертывания, демонстрирующий `Running` статус для подов `mongo-deployment` и `todo-app-deployment`.*

---

## 5. Настройка CI/CD с помощью GitHub Actions

Для автоматизации сборки и публикации Docker-образа был настроен CI/CD пайплайн.

### Workflow-файл (`.github/workflows/ci-cd.yaml`)
Пайплайн настроен на срабатывание при каждом `push` в ветку `main`. Он выполняет следующие шаги:
1.  Выполняет checkout кода.
2.  Осуществляет вход в Docker Hub с использованием секретов `DOCKERHUB_USERNAME` и `DOCKERHUB_TOKEN`.
3.  Собирает Docker-образ и отправляет его в Docker Hub с тегами `latest` и по SHA коммита.

Шаг развертывания (`deploy`) закомментирован, так как для его выполнения из облачного GitHub-раннера требуется прямой доступ к кластеру Kubernetes, что нецелесообразно для локального Minikube.

```yaml
name: Build and Push Docker Image

on:
  push:
    branches:
      - main

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    # The user needs to set these secrets in their GitHub repository settings
    # DOCKERHUB_USERNAME: sowwds
    # DOCKERHUB_TOKEN: <your-token>
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./lab8/todo-app
        push: true
        tags: sowwds/todo-app:latest,sowwds/todo-app:${{ github.sha }}

  deploy:
    # This job is commented out because the target Kubernetes cluster (Minikube)
    # is running on a local machine and is not accessible from the cloud-based
    # GitHub Actions runner. For a real-world scenario, you would use a cloud
    # provider's cluster (GKE, EKS, AKS) or a self-hosted runner.
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    # - name: Set up kubectl
    #   uses: azure/k8s-set-context@v3
    #   with:
    #     method: kubeconfig
    #     kubeconfig: ${{ secrets.KUBE_CONFIG }}

    # - name: Deploy to Kubernetes
    #   run: |
    #     kubectl set image deployment/todo-app-deployment todo-app=sowwds/todo-app:${{ github.sha }}
    #     kubectl rollout status deployment/todo-app-deployment
```

---
**[ПЛЕЙСХОЛДЕР ДЛЯ СКРИНШОТА]**

*Здесь должен быть скриншот страницы Actions на GitHub, показывающий успешное выполнение `build-and-push` job.*

---
**[ПЛЕЙСХОЛДЕР ДЛЯ ССЫЛКИ]**

*Здесь должна быть ссылка на репозиторий GitHub с проектом.*

---
