import pandas as pd

EXCEL_PATH = "app/data/smarthome_enrichi.xlsx"
SHEET_NAME = "Dataset"

def get_data() -> pd.DataFrame:
    """Lit le fichier Excel tel quel, sans modifier les colonnes existantes."""
    df = pd.read_excel(EXCEL_PATH, sheet_name=SHEET_NAME)
    return df