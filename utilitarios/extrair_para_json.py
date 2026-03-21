import pandas as pd
import json
from datetime import datetime

# Caminho do arquivo Excel
file_path = "Cezar_updated (version 1).xlsm"
sheet_name = "Planilha2"

# Função para serializar objetos datetime
def custom_json_encoder(obj):
    if isinstance(obj, (datetime, pd.Timestamp)):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

# Função para limpar e exportar os dados
def export_cleaned_sheet_to_json(file_path, sheet_name, output_path):
    try:
        # Ler a planilha específica
        df = pd.read_excel(file_path, sheet_name=sheet_name, engine='openpyxl')

        # Remover colunas completamente vazias
        df = df.dropna(how='all', axis=1)

        # Remover linhas completamente vazias
        df = df.dropna(how='all', axis=0)

        # Remover colunas com nome "Unnamed"
        df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

        # Limpar espaços em branco nos nomes das colunas
        df.columns = df.columns.str.strip()

        # Remover linhas que contêm "Total" na coluna DATA
        if 'DATA' in df.columns:
            df = df[~df['DATA'].astype(str).str.contains('Total', case=False, na=False)]

        # Converter coluna DATA para datetime se não estiver
        if 'DATA' in df.columns:
            df['DATA'] = pd.to_datetime(df['DATA'], errors='coerce')
            # Remover linhas onde a data não pôde ser convertida
            df = df.dropna(subset=['DATA'])

        # Converter para o formato desejado
        data_as_json = df.to_dict(orient='records')

        # Salvar o JSON limpado
        with open(output_path, 'w', encoding='utf-8') as json_file:
            json.dump(data_as_json, json_file, ensure_ascii=False, indent=4, default=custom_json_encoder)

        print(f"✓ Exportação concluída! Dados salvos em: {output_path}")
        print(f"✓ Total de registros: {len(data_as_json)}")
    except Exception as e:
        print(f"✗ Erro ao processar a planilha: {e}")

# Definir o caminho de saída para o arquivo JSON
output_json_path = "dados_transacoes_2.json"

# Executar a função
export_cleaned_sheet_to_json(file_path, sheet_name, output_json_path)
