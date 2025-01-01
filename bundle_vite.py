import os
import subprocess
import shutil

PATH = os.path.dirname(os.path.abspath(__file__))
VITE_PATH = os.path.join(PATH, "frontend", "vite", "autohaus", "dist", "assets")
ASSETS_PATH = os.path.join(PATH, "auto_app", "static", "auto_app", "assets")

def main():
    # clear dirs 
    shutil.rmtree(ASSETS_PATH)
    os.mkdir((ASSETS_PATH))

    shutil.copytree(VITE_PATH, ASSETS_PATH, dirs_exist_ok=True)
    print("Files copied, collect static files with python manage.py collectstatic")


if __name__ == "__main__":
    main()