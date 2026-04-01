# MuLearn CI/CD with GitHub Actions + AWS EC2

This project now includes:
- GitHub workflow: `.github/workflows/deploy-ec2.yml`
- One-time EC2 setup script: `deploy/ec2/setup-ec2.sh`

Use this guide once to complete your production pipeline.

## 1) Launch and prepare EC2

1. Launch an Ubuntu EC2 instance (22.04+ recommended).
2. Security Group inbound rules:
   - `80` from `0.0.0.0/0`
   - `443` from `0.0.0.0/0` (for SSL later)
   - `22` from your trusted source (or temporary wider access during setup)
3. SSH into EC2:

```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

4. On EC2, clone this repo and run one-time bootstrap:

```bash
git clone https://github.com/Adnan-Kakkattil/MuLearn.git
cd MuLearn
sudo bash deploy/ec2/setup-ec2.sh <EC2_PUBLIC_IP_OR_DOMAIN> ubuntu /var/www/mulearn
```

## 2) Create a deploy SSH key for GitHub Actions

On your local machine, create a dedicated key pair for CI deploys:

```bash
ssh-keygen -t ed25519 -C "mulearn-github-actions" -f ./mulearn-actions
```

This creates:
- `mulearn-actions` (private key)
- `mulearn-actions.pub` (public key)

Add public key to EC2:

```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP> "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
cat mulearn-actions.pub | ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP> "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Test it:

```bash
ssh -i ./mulearn-actions ubuntu@<EC2_PUBLIC_IP> "echo ok"
```

## 3) Configure GitHub repo secrets and variables

In GitHub: `Repo -> Settings -> Secrets and variables -> Actions`

Create **Secrets**:
- `EC2_HOST` = your EC2 public IP or domain
- `EC2_USER` = `ubuntu` (or your deploy user)
- `EC2_SSH_PRIVATE_KEY` = contents of `mulearn-actions` (private key file)

Create **Variables** (optional, recommended):
- `EC2_PORT` = `22`
- `EC2_DEPLOY_PATH` = `/var/www/mulearn`

## 4) Trigger deployment

Push to `main` branch:

```bash
git add .
git commit -m "Add CI/CD pipeline for EC2 deployment"
git push origin main
```

Or trigger manually from:
- `GitHub -> Actions -> CI-CD Deploy to EC2 -> Run workflow`

## 5) Verify

Open:
- `http://<EC2_PUBLIC_IP_OR_DOMAIN>/index.html`

The workflow deploys site files with `rsync --delete` to keep EC2 exactly in sync with `main`.

## 6) Recommended next hardening

1. Add domain + Route53 (or your DNS provider).
2. Enable HTTPS:
   - Install Certbot and configure TLS for Nginx.
3. Restrict SSH:
   - Keep key auth only, disable password auth.
   - Narrow port 22 access where possible.
