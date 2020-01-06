# dreamdrugs

![CI](https://github.com/docwhite/dreamdrugs/workflows/CI/badge.svg)
[![codecov](https://codecov.io/gh/docwhite/dreamdrugs/branch/master/graph/badge.svg)](https://codecov.io/gh/docwhite/dreamdrugs)

A psychedelic imagery generation playground.

It has in mind a plug-in structure that would allow developers to extend it.

## Development

Two choices: [Docker Compose](https://docs.docker.com/compose/) or
[Skaffold](https://skaffold.dev). The former is recommended as it mirrors better the
production *Kubernetes* infrastructure.

### Docker Compose

*Docker Compose* is a small container orchestrator oriented for local development
which suffices in most of the cases. It is safe to develop on it if you don't want to
install *Minikube* or know no *Kubernetes*.

Change to project root and run the following.

```
docker-compose up
```

Now you can visit [](http://localhost).

### Skaffold

*Skaffold* is used to ease the development *Kubernetes* workflow. It watches for
changes, and judges if those changes require a Docker rebuild of the image or simply
some files can be copied from a local source to a destination container location
(updating all the pods), and not only that, but updates to align with any other
infrastructure change involved (e.g. Kubernetes manifest files).

Change to project root and run the following.

```
minikube start
skaffold dev
```

Figure out the address you need to visit by running `minikube ip` on another shell and
paste it to your browser using `http://`.

## Deployment

This [GitHub Workflow](.github/workflows/deploy.yml) is already setup to handle
deployments on tag pushes.

*Helm* is used for parametrizing the Kubernetes infrastructure and deploy it to *Google
Kubernetes Engine*.

*TODO: Describe steps to deploy to custom GKE cluster.*
