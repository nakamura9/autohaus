import os
import subprocess
import shutil
import re

PATH = os.path.dirname(os.path.abspath(__file__))
VITE_PROJECT_PATH = os.path.join(PATH, "frontend", "vite", "autohaus")
VITE_DIST_PATH = os.path.join(VITE_PROJECT_PATH, "dist")
VITE_ASSETS_PATH = os.path.join(VITE_DIST_PATH, "assets")
ASSETS_PATH = os.path.join(PATH, "auto_app", "static", "auto_app", "assets")
TEMPLATE_PATH = os.path.join(PATH, "auto_app", "templates", "index.html")


def run_build():
    """Run npm run build in the Vite project directory."""
    print("Running npm run build...")
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=VITE_PROJECT_PATH,
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        print(f"Build failed: {result.stderr}")
        raise RuntimeError("npm run build failed")
    print("Build completed successfully")


def copy_assets():
    """Copy built assets to Django static directory."""
    if os.path.exists(ASSETS_PATH):
        shutil.rmtree(ASSETS_PATH)
    os.mkdir(ASSETS_PATH)
    shutil.copytree(VITE_ASSETS_PATH, ASSETS_PATH, dirs_exist_ok=True)
    print("Assets copied to Django static directory")


def extract_bundle_names():
    """Extract JS and CSS bundle filenames from the built index.html."""
    dist_index_path = os.path.join(VITE_DIST_PATH, "index.html")
    with open(dist_index_path, "r") as f:
        content = f.read()

    js_match = re.search(r'/assets/(index-[^"]+\.js)', content)
    css_match = re.search(r'/assets/(index-[^"]+\.css)', content)

    if not js_match or not css_match:
        raise RuntimeError("Could not find bundle filenames in dist/index.html")

    return js_match.group(1), css_match.group(1)


def update_template(js_filename, css_filename):
    """Update Django template with new bundle filenames."""
    with open(TEMPLATE_PATH, "r") as f:
        content = f.read()

    # Update JS filename
    content = re.sub(
        r"({% static 'auto_app/assets/)index-[^']+\.js(' %})",
        rf"\g<1>{js_filename}\g<2>",
        content
    )

    # Update CSS filename
    content = re.sub(
        r"({% static 'auto_app/assets/)index-[^']+\.css(' %})",
        rf"\g<1>{css_filename}\g<2>",
        content
    )

    with open(TEMPLATE_PATH, "w") as f:
        f.write(content)

    print(f"Updated template with: {js_filename}, {css_filename}")


def main():
    #run_build()
    copy_assets()
    js_filename, css_filename = extract_bundle_names()
    update_template(js_filename, css_filename)
    print("Bundle complete! Run 'python manage.py collectstatic' to finalize.")


if __name__ == "__main__":
    main()