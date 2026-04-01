# Beginner Guide: GitHub Actions CI/CD to AWS EC2

This is a classroom-friendly flow for static websites.

## What students learn

1. Push code to GitHub.
2. GitHub Actions runs automatically.
3. Site is copied to EC2.
4. Nginx serves the updated website.

---

## Step 1: Create EC2 (Ubuntu)

Launch an Ubuntu EC2 instance and set Security Group inbound rules:
- `22` (SSH) from your IP
- `80` (HTTP) from Anywhere

SSH into EC2:

```bash
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Install Nginx and set folder permissions once:

```bash
sudo apt update
sudo apt install -y nginx
sudo mkdir -p /var/www/html
sudo chown -R ubuntu:ubuntu /var/www/html
sudo systemctl enable nginx
sudo systemctl restart nginx
```

---

## Step 2: Add GitHub secrets

Go to:
`Repo -> Settings -> Secrets and variables -> Actions`

Add these **Secrets**:
- `EC2_HOST` = EC2 public IP
- `EC2_USER` = `ubuntu`
- `EC2_KEY_B64` = base64 of your private key file

Add this **Variable** (optional):
- `EC2_PORT` = `22`
- `EC2_DEPLOY_PATH` = `/var/www/html`

### How to generate `EC2_KEY_B64`

PowerShell (Windows):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\your-key.pem"))
```

macOS/Linux:

```bash
base64 -w 0 /path/to/your-key.pem
```

Copy output and paste as `EC2_KEY_B64`.

---

## Step 3: Use workflow in this repo

Workflow file is already added:
`.github/workflows/deploy-ec2.yml`

It deploys:
- `index.html`, `about.html`, `career.html`, `contact.html`
- `styles/`, `scripts/`
- `logo31.png`, `logo.webp`

---

## Step 4: Trigger deployment

Push to `main`:

```bash
git add .
git commit -m "Enable beginner CI/CD pipeline"
git push origin main
```

Then check:
`GitHub -> Actions -> CI-CD Deploy to EC2`

---

## Step 5: Demo result to students

Open in browser:

```text
http://<EC2_PUBLIC_IP>/
```

Every new push to `main` auto-deploys.

---

## Common beginner errors

1. `Permission denied (publickey)`:
   - wrong `EC2_USER` or wrong key.
2. `error in libcrypto`:
   - key formatting issue; use `EC2_KEY_B64` method.
3. Workflow succeeds but old page shows:
   - hard refresh browser (`Ctrl+F5`).
