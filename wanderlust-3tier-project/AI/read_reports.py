import os
from pathlib import Path


def read_trivy_reports():

    # If Jenkins sets WORKSPACE, use it.
    workspace = os.getenv("WORKSPACE")

    # Otherwise use the current project directory.
    if workspace:
        trivy_folder = Path(workspace) / "trivy-reports"
    else:
        project_root = Path(__file__).resolve().parent.parent
        trivy_folder = project_root / "trivy-reports"

    print(f"\nTrivy Folder: {trivy_folder}")

    if not trivy_folder.exists():
        print("❌ Folder does not exist!")
        return ""

    files = list(trivy_folder.glob("*.txt"))

    print(f"Found {len(files)} txt files")

    report = ""

    for file in files:
        print(f"Reading {file.name}")

        with open(file, "r", encoding="utf-8", errors="ignore") as f:
            data = f.read()
            print(f"Characters read: {len(data)}")

            report += f"\n\n===== {file.name} =====\n"
            report += data

    print(f"\nTotal characters collected: {len(report)}")

    return report
