import pandas as pd


def parse_csv(file):
    df = pd.read_csv(file)

    return {
        "columns": list(df.columns),
        "rows": df.fillna("").to_dict(orient="records"),
        "total_rows": len(df)
    }