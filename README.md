<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./hero-dark.png" />
    <img alt="Dream Drugs" src="./hero.png" />
  </picture>
</div>

<div align="center">
  <a style="display: inline-block; margin-right: 4px;" href="https://github.com/eulersson/dreamdrugs/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/eulersson/dreamdrugs/workflows/CI/badge.svg" /></a>
  <a style="display: inline-block" href="https://codecov.io/gh/eulersson/dreamdrugs"><img alt="codecov" src="https://codecov.io/gh/eulersson/dreamdrugs/branch/master/graph/badge.svg" /></a>
</div>

Expose the patterns from your neural network layers to turn your own pictures
(uploaded or webcam) into artistic hallucinations. Extend the existing models by writing your own as a **Python module** (check the
[base model](./backend/dreamdrugs/_base.py) to see how they look like).

![Teaser](dreamdrugs-anim.gif)

## Architecture

The system is built to be **scalable**, using `Kubernetes` and `Helm` for
orchestration and deployment.

The **frontend** is a `React` application served—alongside a lightweight
**frontend API**—by an `Express` server. The **backend** is a `Python` +
`TensorFlow` app, exposed via a `Flask` server running on `Gunicorn`.

For realtime communication, both services interact through a `Redis` cluster
(**PUB-SUB**) deployed as a Helm chart dependency.

To **minimize ingress costs**, I deployed an array of `NGINX` servers as a
`DaemonSet`, with repeated DNS entries pointing to each node. This allows
incoming requests to be load-balanced across the cluster without requiring a
cloud-managed ingress controller.

The system is built to be **extensible**—new models can be plugged in easily to
generate different kinds of hallucinations.

<table class="github-only">
  <tr>
    <td><img src="samples/dante.jpg" /></td>
    <td><img src="samples/michelangelo.jpg" /></td>
  </tr>
  <tr>
    <td><img src="samples/ronda.jpg" /></td>
    <td><img src="samples/shepperd.jpg" /></td>
  </tr>
</table>

## Guides

On the [Wiki](../../wiki) there's detailed documentation on:

| Document                                                                                                                | Explains How To...                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [Local Development](../../wiki/Local-Development)                                                                       | Use Rancher Desktop with Skaffold for local Kubernetes development, with hot-reloading. Also explains how to debug Python.              |
| [Production Setup](../../wiki/Production-Setup)                                                                         | Deploy the project to GKE cheaply using Cloudflare for DNS and SSL, and includes setup steps for GCP, the cluster, and Helm deployment. |
| [Proxying: Ingress (Traefik) or DaemonSet with NGINX](<../../wiki/Proxying:-Ingress-(Traefik)-or-DaemonSet-with-NGINX>) | Customize how to route your requests from the cluster into the pods.                                                                    |
