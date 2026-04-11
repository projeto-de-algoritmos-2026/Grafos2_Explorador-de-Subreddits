import os
import sys
import subprocess
import urllib.request

VENV_DIR = "venv"
DATA_DIR = os.path.join("backend", "data")

DATA_URLS = [
    "https://snap.stanford.edu/data/soc-redditHyperlinks-body.tsv",
    "https://snap.stanford.edu/data/soc-redditHyperlinks-title.tsv"
]


def run_command(cmd, cwd=None):
    subprocess.check_call(cmd, cwd=cwd)


def create_venv():
    if not os.path.exists(VENV_DIR):
        print("🐍 Criando ambiente virtual...")
        run_command([sys.executable, "-m", "venv", VENV_DIR])
    else:
        print("✅ Ambiente virtual já existe")


def get_paths():
    venv_abs = os.path.abspath(VENV_DIR)

    if os.name == "nt":
        pip_path = os.path.join(venv_abs, "Scripts", "pip.exe")
        python_path = os.path.join(venv_abs, "Scripts", "python.exe")
    else:
        bin_dir = os.path.join(venv_abs, "bin")

        python_path = os.path.join(bin_dir, "python")
        if not os.path.exists(python_path):
            python_path = os.path.join(bin_dir, "python3")

        pip_path = os.path.join(bin_dir, "pip")
        if not os.path.exists(pip_path):
            pip_path = os.path.join(bin_dir, "pip3")

    return pip_path, python_path


def install_dependencies(pip_path):
    print("📦 Instalando dependências...")
    run_command([pip_path, "install", "-r", "requirements.txt"])


def download_data():
    os.makedirs(DATA_DIR, exist_ok=True)

    for url in DATA_URLS:
        filename = url.split("/")[-1]
        path = os.path.join(DATA_DIR, filename)

        if os.path.exists(path):
            print(f"✅ {filename} já existe, pulando...")
            continue

        print(f"📥 Baixando {filename}...")
        urllib.request.urlretrieve(url, path)

    print("🚀 Dataset pronto!")


def run_backend(python_path):
    print("🚀 Iniciando backend...")

    run_command([
        python_path, "-m", "uvicorn",
        "src.api:app",
        "--reload"
    ], cwd="backend")


def main():
    print("=== Reddit Graph Analyzer Setup ===")

    create_venv()

    pip_path, python_path = get_paths()

    install_dependencies(pip_path)

    download_data()

    run_backend(python_path)


if __name__ == "__main__":
    main()