import  pyodbc

Conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=CODEASSIT\\SQLEXPRESS;"
    "DATABASE=PharmacyDb;"
    "Trusted_Connection=yes;"
    "TrustServerCertificate=yes;"
)

def get_connection():
    return pyodbc.connect(Conn_str)

def check_connection() -> bool:
    try:
        conn = get_connection()
        conn.close()
        return True
    except Exception:
        return False
    
def fetch_all (query, params = None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query,params  or [])
    
    if cursor.description:
        columns = [column[0] for column in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
    else:
        rows = []
        
    cursor.close()
    conn.close()
    return rows

def fetch_one(query, params=None):
    rows = fetch_all(query, params)
    return rows[0] if rows else None